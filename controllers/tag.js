// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var ElasticSearch       = require('elasticsearch');

// Shared Core
var Core                = require('tinynews-common');

// Models
var Tag                 = Core.Models.Tag;

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
     * Create a Tag
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        // Security Check
        if (!req.token.user.permissions['tag.edit']) {
            return Client.NotAuthorized(req, res, next);
        }

        try {
            var errors = new Validate()
                /** Name **/
                .AssertTrue('isLength', [req.params.name, 1, 32],            'Body parameter :name must be between 1 and 1024 characters.')
                .AssertFalse('isNull',  [req.params.name],                   'Body parameter :name may not be null.')
                .GetErrors();
        }
        catch(e) {
            console.log(e);
            return Client.ServerError(req, res, next);
        }

        // Purge any defined stuff, just in case!
        delete req.params['@rid'];
        delete req.params.slug;
        if (!errors.length) {
            Tag.Create(req.params, function(e, tag) {
                if (e || !tag) {
                    console.log(e, tag, req.params);
                    return Client.ServerError(req, res, next);
                } else {
                    return Client.Success(req, res, next, tag);
                }
            });
        } else {
            return Client.InvalidRequest(req, res, next, errors);
        }
    },

    /**
     * Return a Tag
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['tag.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                /** Tag ID **/
                .AssertFalse('isNull',  [req.params.tag_id],                  'Path parameter :tag_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.tag_id)],      'Path parameter :tag_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Tag.Find({ where: { '@rid': RID.Decode(req.params.tag_id) }}, function(e, tag) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!tag) {
                        return Client.NotFound(req, res, next);
                    } else {
                        return Client.Success(req, res, next, tag);
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
     * Update a Tag
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['tag.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** Name **/
            if (typeof req.params.name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.name, 1, 32],     'Body parameter :name must be between 1 and 1024 characters.');
                validate.AssertFalse('isNull',  [req.params.name],              'Body parameter :name may not be null.');
            }
            var errors = validate.GetErrors();

            if (!errors.length) {
                Tag.Find({ where: { '@rid': RID.Decode(req.params.tag_id) }}, function(e, tag) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!tag) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.name != 'undefined') {
                            tag.name = req.params.name;
                        }

                        tag.save(function(e, tag) {
                            if (e || !tag) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, tag);
                            }
                        });
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
     * Delete an Tag
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['tag.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                /** Tag ID **/
                .AssertFalse('isNull',  [req.params.tag_id],                  'Path parameter :tag_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.tag_id)],      'Path parameter :tag_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Tag.Find({ where: { '@rid': RID.Decode(req.params.tag_id) }}, function(e, tag) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!tag) {
                        return Client.NotFound(req, res, next);
                    } else {
                        tag.delete(function(e) {
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
     * Return multiple Articles data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    List: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['tag.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            //var errors = new Validate()
            //    .GetErrors();
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Tag.FindAll({}, function(e, tags) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (tags.length == 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, tags);
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
            //errors.AssertFalse('isNull',  [req.params.query],               'Body parameter :query may not be null.');
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

            ES.search({
                index: Core.Config.elastic.index + '--tag',
                from: (pageNum - 1) * perPage,
                size: perPage,
                //q: '*' + req.params.query + '*',
                analyzeWildcard: true,
                body: {
                    query: {
                        wildcard: {
                            name: '*' + req.params.query + '*'
                        }
                    }
                }
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