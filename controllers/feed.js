// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var Util                = require('util');
var Request             = require('request');
var Async               = require('async');
var Core                = require('tinynews-common');

var Config              = require('../config.json');

// Models
var Publisher           = Core.Models.Publisher;
var SourceFeed          = Core.Models.SourceFeed;

// ----------------
//   Definition
// ----------------

var Feed = {}

// --------------------------
//   Controller Definition
// --------------------------

/**
 * Subscribe to the given feed url
 *
 * @param   Obj   req       Request Object
 * @param   Obj   res       Response Object
 * @param   Func  next      Restify next()
 * @param   Obj   body      Request Body
 */
Feed.Subscribe = function(req, res, next, body) {
    try {
        var errors = new Validate()
            .AssertFalse('isNull',  [req.params.url],                       'Body Parameter :url may not be null.')
            .AssertTrue('isURL',    [req.params.url],                       'Body Parameter :url must be a valid URL.')
            .AssertFalse('isNull',  [req.params.title],                     'Body Parameter :title may not be null.')
            .AssertTrue('isLength', [req.params.title, 1, 255],             'Body Parameter :title must be between 1 and 255 characters.')
            .AssertFalse('isNull',  [req.params.publisher_id],              'Body Parameter :publisher_id must not be null.')
            .AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)],  'Body Parameter :publisher_id must be a valid identifier.')
            .GetErrors();

    } catch(e) {
        Util.log(e, req.params);
        return Client.ServerError(req, res, next);
    }

    if (!errors.length){
        var hub = Config.superfeedr.hub;

        // Send subscription Request to Superfeedr
        var params = {
            method: 'POST',
            uri: hub,
            auth: {
                'user': Config.superfeedr.user,
                'pass': Config.superfeedr.pass
            },
            headers: {
                accept: 'application/json'
            },
            form: Config.superfeedr.form || {}
        };

        params.form['hub.mode'] = 'subscribe';
        params.form['hub.topic'] = req.params.url;
        params.form['hub.verify'] = Config.superfeedr.verify;
        params.form['hub.callback'] = Config.superfeedr.base + '?topic=' + encodeURIComponent(req.params.url);

        Request(params, function (error, response, body) {
            try {
                if (error) {
                    throw error;
                }
                if (response.statusCode === 204) {
                    // Subscription Success

                    Async.parallel({
                        publisher: function(done) {
                            Publisher.Find({
                                where: { '@rid': RID.Decode(req.params.publisher_id) }
                            }, done);
                        },
                        feed: function(done) {
                            SourceFeed.Create({
                                "url": req.params.url,
                                "title": req.params.title,
                                "endpoint": params.form['hub.callback']
                            }, done);
                        }
                    }, function(errors, results) {
                        if (errors) {
                            Util.log(errors);
                            Client.ServerError(req, res, next);
                        } else {
                            results.feed.set_publisher(results.publisher, function(e) {
                                if (e) {
                                    Util.log(e);
                                    Client.ServerError(req, res, next);
                                } else {
                                    results.feed.publisher = results.publisher;
                                    Client.Success(req, res, next, results.feed);
                                }
                            });
                        }
                    });

                } else if (response.statusCode === 202) {
                    throw new Error("Verification is in progress.");
                } else if (response.statusCode === 422) {
                    // Body contains error message
                    throw new Error(body);
                } else {
                    throw new Error("Unknown error (statusCode:" + response.statusCode + ")");
                }
            } catch (e) {
                Util.log(e, req.params);
                return Client.ServerError(req, res, next);
            }
        });
    } else {
        return Client.InvalidRequest(req, res, next, errors);
    }
}

/**
 * Cancel subscription to the given feed url
 *
 * @param   Obj   req       Request Object
 * @param   Obj   res       Response Object
 * @param   Func  next      Restify next()
 * @param   Obj   body      Request Body
 */
Feed.Unsubscribe = function (req, res, next, body) {
    try {
        var errors = new Validate()
            .AssertFalse('isNull',  [req.params.feed_id],                       'Path parameter :feed_id may not be null.')
            .AssertTrue('isRID',    [RID.Decode(req.params.feed_id)],           'Path parameter :feed_id must be a valid identifier.')
            .GetErrors();

    } catch(e) {
        Util.log(e);
        return Client.ServerError(req, res, next);
    }

    if (!errors.length){

        SourceFeed.Find({ where: { '@rid': RID.Decode(req.params.feed_id) }}, function(e, sourcefeed) {
            if (e || !sourcefeed) {
                return Client.ServerError(req, res, next);
            }

            var hub = Config.superfeedr.hub;
            // Send subscription cancel Request to Superfeedr
            var params = {
                method: 'POST',
                uri: hub,
                auth: {
                    'user': Config.superfeedr.user,
                    'pass': Config.superfeedr.pass
                },
                headers: {
                    accept: 'application/json'
                },
                form: Config.superfeedr.form || {}
            }
            params.form['hub.mode'] = 'unsubscribe';
            params.form['hub.topic'] = sourcefeed.url;

            if (sourcefeed.endpoint) {
                params.form['hub.callback'] = sourcefeed.endpoint;
                //params.form['hub.verify'] = Config.superfeedr.verify;
            }

            Request(params, function (error, response, body) {
                try {
                    if (error){
                        throw error;
                    }
                    if (response.statusCode === 204) {                  // Cancel subscription Success

                        sourcefeed.delete(function(deleteerror) {
                            if (deleteerror) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next);
                            }
                        });
                    }
                    else if (response.statusCode === 202) {
                        throw new Error("Verification is in progress.");
                    }
                    else if (response.statusCode === 422){              // Body contains error message
                        throw new Error(body);
                    }
                    else {
                        throw new Error("Unknown error (statusCode:" + response.statusCode + ")");
                    }
                } catch (e) {
                    Util.log(e);
                    return Client.ServerError(req, res, next, e.toString());
                }
            });
        })

    } else {
        return Client.InvalidRequest(req, res, next, errors);
    }
}

/**
 * retrieve the list of recent feed items
 *
 * @param   Obj   req       Request Object
 * @param   Obj   res       Response Object
 * @param   Func  next      Restify next()
 * @param   Obj   body      Request Body
 */
Feed.GetFeedItems = function(req, res, next, body) {
    try {
        var errors = new Validate()
            .AssertFalse('isNull',  [req.params.feed_id],                       'Path parameter :feed_id may not be null.')
            .AssertTrue('isRID',    [RID.Decode(req.params.feed_id)],           'Path parameter :feed_id must be a valid identifier.')
            .GetErrors();

    } catch(e) {
        Util.log(e);
        return Client.ServerError(req, res, next);
    }

    if (!errors.length){

        SourceFeed.Find({ where: { '@rid': RID.Decode(req.params.feed_id) }}, function(e, sourcefeed) {

            if (e || !sourcefeed) {
                return Client.ServerError(req, res, next);
            }

            var hub = Config.superfeedr.hub;
            // Send retrieve Request to Superfeedr
            var params = {
                method: 'GET',
                uri: hub,
                auth: {
                    'user': Config.superfeedr.user,
                    'pass': Config.superfeedr.pass
                },
                headers: {
                    accept: 'application/json'
                },
                form: Config.superfeedr.form || {}
            }
            params.form['hub.mode'] = 'retrieve';
            params.form['hub.topic'] = sourcefeed.url;

            Request(params, function (error, response, body) {
                try {
                    if (error) {
                        throw error;
                    }
                    if (response.statusCode === 200) {                  // retrieve feed items success
                        return Client.Success(req, res, next, JSON.parse(body));
                    } else if (response.statusCode === 404) {
                        throw new Error("This feed is not managed.");
                    } else if (response.statusCode === 422){              // Body contains error message
                        throw new Error(body);
                    } else {
                        throw new Error("Unknown error (statusCode:" + response.statusCode + ")");
                    }
                } catch (e) {
                    Util.log(e);
                    return Client.ServerError(req, res, next, e.toString());
                }
            });

        });

    } else {
        return Client.InvalidRequest(req, res, next, errors);
    }
}

/**
 * retrieve subscriptions
 *
 * @param   Obj   req       Request Object
 * @param   Obj   res       Response Object
 * @param   Func  next      Restify next()
 * @param   Obj   body      Request Body
 */
Feed.List = function (req, res, next, body) {
    try {
        var errors = [];
        if (!errors.length) {
            SourceFeed.FindAll({}, function(e, feeds) {
                if (e) {
                    return Client.ServerError(req, res, next);
                } else if (!feeds.length > 0) {
                    return Client.NoContent(req, res, next);
                } else {
                    return Client.Success(req, res, next, feeds);
                }
            });
        } else {
            return Client.InvalidRequest(req, res, next, errors);
        }
    } catch (e) {
        console.trace(e);
        return Client.ServerError(req, res, next);
    }        
}

/**
 * Return a sourcefeed data
 *
 * @param   Obj   req       Request Object
 * @param   Obj   res       Response Object
 * @param   Func  next      Restify next()
 * @param   Obj   body      Request Body
 */
Feed.Retrieve = function(req, res, next, body) {
    // Validate
    try {
        var errors = new Validate()
            .AssertFalse('isNull',  [req.params.feed_id],                       'Path parameter :feed_id may not be null.')
            .AssertTrue('isRID',    [RID.Decode(req.params.feed_id)],           'Path parameter :feed_id must be a valid identifier.')
            .GetErrors();

    } catch(e) {
        Util.log(e);
        return Client.ServerError(req, res, next);
    }

    // Fetch and return
    if (!errors.length) {
        SourceFeed.Find({ where: { '@rid': RID.Decode(req.params.feed_id) }}, function(e, sourcefeed) {
            if (e) {
                return Client.ServerError(req, res, next);
            } else if (!sourcefeed) {
                return Client.NotFound(req, res, next);
            } else {
                return Client.Success(req, res, next, sourcefeed);
            }
        });
    } else {
        return Client.InvalidRequest(req, res, next, errors);
    }
}

module.exports = Feed;