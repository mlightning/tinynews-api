// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var Request             = require('request');
var Async               = require('async');
var ElasticSearch       = require('elasticsearch');

// Shared Core
var Core                = require('tinynews-common');

// Models
var Publisher           = Core.Models.Publisher;
var User                = Core.Models.User;

// Connect to ElasticSearch
var ES = ElasticSearch.Client({
    host: Core.Config.elastic.host + ':' + Core.Config.elastic.port,
    sniffOnStart: Core.Config.elastic.startup_sniff,
    sniffInterval: Core.Config.elastic.sniff_frequency
});

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Create a Publisher
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['publisher.admin']) {
                return Client.NotAuthorized(req, res, next);
            }

            var validate = new Validate();

            /** Name **/
            validate.AssertTrue('isLength', [req.params.name, 1, 64],            'Body parameter :name must be between 1 and 64 characters.');
            validate.AssertFalse('isNull',  [req.params.name],                   'Body parameter :name may not be null.');

            if (typeof req.params.url != 'undefined') {
                /** Publisher URL **/
                validate.AssertFalse('isNull',  [req.params.url],                'Body parameter :url may not be null.');
                validate.AssertTrue('isLength', [req.params.url, 1, 256],        'Body parameter :url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.url],                'Body parameter :url must be a valid URL.');
            }

            if (typeof req.params.imageUrl != 'undefined') {
                /** Image URL **/
                validate.AssertFalse('isNull',  [req.params.imageUrl],           'Body parameter :imageUrl may not be null.');
                validate.AssertTrue('isLength', [req.params.imageUrl, 1, 256],   'Body parameter :imageUrl must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.imageUrl],           'Body parameter :imageUrl must be a valid URL.');
            }

            if (typeof req.params.summary != 'undefined') {
                /** Summary **/
                validate.AssertFalse('isNull',  [req.params.summary],            'Body parameter :summary may not be null.');
                validate.AssertTrue('isLength', [req.params.summary, 1, 1024],   'Body parameter :summary must be between 1 and 1024 characters.');
            }

            if (typeof req.params.about != 'undefined') {
                /** About **/
                validate.AssertFalse('isNull',  [req.params.about],              'Body parameter :about may not be null.');
                validate.AssertTrue('isLength', [req.params.about, 1, 1024],     'Body parameter :about must be between 1 and 1024 characters.');
            }

            if (typeof req.params.specialty != 'undefined') {
                /** Specialty **/
                validate.AssertFalse('isNull',  [req.params.specialty],          'Body parameter :specialty may not be null.');
                validate.AssertTrue('isLength', [req.params.specialty, 1, 1024], 'Body parameter :specialty must be between 1 and 1024 characters.');
            }

            if (typeof req.params.owner != 'undefined') {
                /** Owner **/
                validate.AssertFalse('isNull',  [req.params.owner],              'Body parameter :owner may not be null.');
                validate.AssertTrue('isLength', [req.params.owner, 1, 64],       'Body parameter :owner must be between 1 and 64 characters.');
            }

            if (typeof req.params.owner_url != 'undefined') {
                /** Owner URL **/
                validate.AssertFalse('isNull',  [req.params.owner_url],          'Body parameter :owner_url may not be null.');
                validate.AssertTrue('isLength', [req.params.owner_url, 1, 256],  'Body parameter :owner_url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.owner_url],          'Body parameter :owner_url must be a valid URL.');
            }

            if (typeof req.params.facebook != 'undefined') {
                /** Facebook **/
                validate.AssertFalse('isNull',  [req.params.facebook],           'Body parameter :facebook may not be null.');
                validate.AssertTrue('isLength', [req.params.facebook, 1, 64],    'Body parameter :facebook must be between 1 and 64 characters.');
            }

            if (typeof req.params.twitter != 'undefined') {
                /** Twitter **/
                validate.AssertFalse('isNull',  [req.params.twitter],            'Body parameter :twitter may not be null.');
                validate.AssertTrue('isLength', [req.params.twitter, 1, 64],     'Body parameter :twitter must be between 1 and 64 characters.');
            }

            var errors = validate.GetErrors();

            // Purge any defined slug, let the system manage this
            delete req.params.slug;

            // Purge any defined id, just in case!
            delete req.params['@rid'];

            if (!errors.length) {
                Publisher.Create(req.params, function(e, pub) {
                    if (e || !pub) {
                        return Client.ServerError(req, res, next);
                    } else {
                        return Client.Success(req, res, next, pub);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return a Publishers data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['publisher.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.publisher_id],               'Path parameter :publisher_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)],   'Path parameter :publisher_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Publisher.Find({ where: { '@rid': RID.Decode(req.params.publisher_id) }}, function(e, pub) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!pub) {
                        return Client.NotFound(req, res, next);
                    } else {
                        return Client.Success(req, res, next, pub);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Update a Publishers data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['publisher.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.publisher_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.publisher_id],               'Body parameter :publisher_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)],   'Body parameter :publisher_id must be a valid identifier.')
            }
            /** Name **/
            if (typeof req.params.name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.name, 1, 64],        'Body parameter :name must be between 1 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.name],               'Body parameter :name may not be null.');
            }
            /** Image URL **/
            if (typeof req.params.imageUrl != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.imageUrl],           'Body parameter :imageUrl may not be null.')
                validate.AssertTrue('isLength', [req.params.imageUrl, 1, 256],   'Body parameter :imageUrl must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.imageUrl],           'Body parameter :imageUrl must be a valid URL.')
            }
            /** URL **/
            if (typeof req.params.url != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.url],                'Body parameter :url may not be null.')
                validate.AssertTrue('isLength', [req.params.url, 1, 256],        'Body parameter :url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.url],                'Body parameter :url must be a valid URL.')
            }
            if (typeof req.params.summary != 'undefined') {
                /** Summary **/
                validate.AssertFalse('isNull',  [req.params.summary],            'Body parameter :summary may not be null.');
                validate.AssertTrue('isLength', [req.params.summary, 1, 1024],   'Body parameter :summary must be between 1 and 1024 characters.');
            }

            if (typeof req.params.about != 'undefined') {
                /** About **/
                validate.AssertFalse('isNull',  [req.params.about],              'Body parameter :about may not be null.');
                validate.AssertTrue('isLength', [req.params.about, 1, 1024],     'Body parameter :about must be between 1 and 1024 characters.');
            }

            if (typeof req.params.specialty != 'undefined') {
                /** Specialty **/
                validate.AssertFalse('isNull',  [req.params.specialty],          'Body parameter :specialty may not be null.');
                validate.AssertTrue('isLength', [req.params.specialty, 1, 1024], 'Body parameter :specialty must be between 1 and 1024 characters.');
            }

            if (typeof req.params.owner != 'undefined') {
                /** Owner **/
                validate.AssertFalse('isNull',  [req.params.owner],              'Body parameter :owner may not be null.');
                validate.AssertTrue('isLength', [req.params.owner, 1, 64],       'Body parameter :owner must be between 1 and 64 characters.');
            }

            if (typeof req.params.owner_url != 'undefined') {
                /** Owner URL **/
                validate.AssertFalse('isNull',  [req.params.owner_url],          'Body parameter :owner_url may not be null.');
                validate.AssertTrue('isLength', [req.params.owner_url, 1, 256],  'Body parameter :owner_url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.owner_url],          'Body parameter :owner_url must be a valid URL.');
            }

            if (typeof req.params.facebook != 'undefined') {
                /** Facebook **/
                validate.AssertFalse('isNull',  [req.params.facebook],           'Body parameter :facebook may not be null.');
                validate.AssertTrue('isLength', [req.params.facebook, 1, 64],    'Body parameter :facebook must be between 1 and 64 characters.');
            }

            if (typeof req.params.twitter != 'undefined') {
                /** Twitter **/
                validate.AssertFalse('isNull',  [req.params.twitter],            'Body parameter :twitter may not be null.');
                validate.AssertTrue('isLength', [req.params.twitter, 1, 64],     'Body parameter :twitter must be between 1 and 64 characters.');
            }
            var errors = validate.GetErrors();

            if (!errors.length) {
                Publisher.Find({ where: { '@rid': RID.Decode(req.params.publisher_id) }}, function(e, pub) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!pub) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.name != 'undefined') {
                            pub.name = req.params.name;
                        }
                        if (typeof req.params.imageUrl != 'undefined') {
                            pub.imageUrl = req.params.imageUrl;
                        }
                        if (typeof req.params.url != 'undefined') {
                            pub.url = req.params.url;
                        }
                        if (typeof req.params.summary != 'undefined') {
                            pub.summary = req.params.summary;
                        }
                        if (typeof req.params.about != 'undefined') {
                            pub.about = req.params.about;
                        }
                        if (typeof req.params.specialty != 'undefined') {
                            pub.specialty = req.params.specialty;
                        }
                        if (typeof req.params.owner != 'undefined') {
                            pub.owner = req.params.owner;
                        }
                        if (typeof req.params.owner_url != 'undefined') {
                            pub.owner_url = req.params.owner_url;
                        }
                        if (typeof req.params.facebook != 'undefined') {
                            pub.facebook = req.params.facebook;
                        }
                        if (typeof req.params.twitter != 'undefined') {
                            pub.twitter = req.params.twitter;
                        }

                        pub.save(function(e, user) {
                            if (e || !pub) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, pub);
                            }
                        });
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        }catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Delete a Publisher
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['publisher.delete']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.publisher_id],               'Path parameter :publisher_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)],   'Path parameter :publisher_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Publisher.Find({ where: { '@rid': RID.Decode(req.params.publisher_id) }}, function(e, pub) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!pub) {
                        return Client.NotFound(req, res, next);
                    } else {
                        pub.delete(function(e, pub) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next);
                            }
                        });
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return multiple Publishers data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    List: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['publisher.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            // TODO: Add validation once filtering features are added
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Publisher.FindAll({}, function(e, pubs) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!pubs.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, pubs);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return list of my publisher
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    MyPublishers: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['publisher.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];
        
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.token.user['@rid']) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Filter sensitive data
                        delete user.password;
                        delete user.permissions;
                        user.get_feed_settings(function(e, feedSettings){
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!feedSettings) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.Success(req, res, next, feedSettings.publishers);
                            }
                        })
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return recently rated publishers
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    RecentlyRated: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['publisher.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Publisher.FindAll_RecentlyRated({where : {'@rid' : req.token.user['@rid']}}, function(e, publishers) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!publishers > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, publishers);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return publishers recently rated  by friends
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    RecentlyRatedFriends: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['publisher.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }
            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Publisher.FindAll_RecentlyRatedByFriends({ where: { '@rid': req.token.user['@rid'] }}, function(e, publishers) {
                    if (e) {
                        console.log('1', e);
                        return Client.ServerError(req, res, next);
                    } else if (!publishers > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, publishers);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.log('2', e);
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return top publishers by rating on their articles
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    TopRated: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['publisher.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Publisher.FindAll_TopRated({}, function(e, publishers) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!publishers > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, publishers);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    Search: function(req, res, next, body) {
        var pageNum = 1;
        var perPage = 20;

        try {
            var errors = new Validate();
            /** Query String **/
            errors.AssertTrue('isLength', [req.params.query, 0, 256],       'Body parameter :query must be between 1 and 256 characters.');
            /** Per Page **/
            if (req.params.perpage) {
                errors.AssertTrue('isInt', [req.params.perpage],            'Body parameter :perpage must be an integer.');
                errors.AssertTrue('InRange', [req.params.perpage, [5, 50]], 'Body parameter :perpage must be an integer between 5 and 50.');
            }
            /** Current Page **/
            if (req.params.page) {
                errors.AssertTrue('isInt', [req.params.page],               'Body parameter :page must be an integer.');
                errors.AssertTrue('InRange', [req.params.page, [1, 10]],    'Body parameter :page must be an integer between 1 and 10.');
            }
            errors = errors.GetErrors();
        }
        catch(e) {
            console.log(e, e.stack);
            return Client.ServerError(req, res, next);
        }

        if (!errors.length) {
            if (req.params.perpage) {
                perPage = req.params.perpage;
            }
            if (req.params.page) {
                pageNum = req.params.page;
            }
            if (!req.params.query) {
                req.params.query = '*';
            }

            ES.search({
                index: Core.Config.elastic.index,
                from: (pageNum - 1) * perPage,
                size: perPage,
                type: ['Publisher'],
                q: req.params.query
            }, function (error, response) {
                if (error) {
                    console.log(error, error.stack);
                    return Client.ServerError(req, res, next);
                }

                return Client.Success(req, res, next, {
                    results: response.hits.hits,
                    page: pageNum,
                    pages: Math.ceil(response.hits.total / perPage)
                });
            });
        } else {
            return Client.InvalidRequest(req, res, next, errors);
        }
    }
}