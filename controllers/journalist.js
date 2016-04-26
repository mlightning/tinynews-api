// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var crypto              = require('crypto');
var Async               = require('async');
var ElasticSearch       = require('elasticsearch');

// Shared Core
var Core                = require('tinynews-common');

// Models
var Journalist          = Core.Models.Journalist;
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
     * Create a Journalist
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['journalist.admin']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** First Name **/
                validate.AssertTrue('isLength', [req.params.first_name, 1, 64],         'Body parameter :first_name must be between 2 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.first_name],                'Body parameter :first_name may not be null.');
            /** Last Name **/
                validate.AssertTrue('isLength', [req.params.last_name, 1, 64],          'Body parameter :last_name must be between 2 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.last_name],                 'Body parameter :last_name may not be null.');
            /** Email Address **/
                validate.AssertTrue('isLength', [req.params.email, 5, 128],             'Body parameter :email must be between 5 and 128 characters.');
                validate.AssertTrue('isEmail',  [req.params.email],                     'Body parameter :email must be a valid email address.');
                validate.AssertFalse('isNull',  [req.params.email],                     'Body parameter :email may not be null.');
            /** status **/
                validate.AssertTrue('isIn',     [req.params.status, ['0','1']],         'Body parameter :status must be 0 or 1.');
            /** Publisher URL **/
            if (typeof req.params.url != 'undefined') {
                validate.AssertTrue('isLength', [req.params.url, 1, 256],               'Body parameter :url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.url],                       'Body parameter :url must be a valid URL.');
            }
            /** Publisher Image URL **/
            if (typeof req.params.imageUrl != 'undefined') {
                validate.AssertTrue('isLength', [req.params.imageUrl, 1, 256],          'Body parameter :imageUrl must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.imageUrl],                  'Body parameter :imageUrl must be a valid URL.');
            }
            /** summary **/
                validate.AssertTrue('isLength', [req.params.summary, 0, 1024],          'Body parameter :summary must be between 1 and 256 characters.');
            /** interest **/
                validate.AssertTrue('isLength', [req.params.interest, 0, 1024],         'Body parameter :interest must be between 1 and 256 characters.');
            /** contact_url **/
            if (typeof req.params.contact_url != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_url, 1, 256],       'Body parameter :contact_url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_url],               'Body parameter :contact_url must be a valid URL.');
            }
            /** contact_email **/
            if (typeof req.params.contact_email != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_email, 1, 256],     'Body parameter :contact_email must be between 1 and 256 characters.');
                validate.AssertTrue('isEmail',  [req.params.contact_email],             'Body parameter :contact_email must be a valid Email.');
            }
            /** contact_twitter **/
            if (typeof req.params.contact_twitter != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_twitter, 1, 256],   'Body parameter :contact_twitter must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_twitter],           'Body parameter :contact_twitter must be a valid URL.');
            }
            /** contact_url **/
            if (typeof req.params.contact_fb != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_fb, 1, 256],        'Body parameter :contact_fb must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_fb],                'Body parameter :contact_fb must be a valid URL.');
            }
            /** contact_url **/
            if (typeof req.params.contact_linkedin != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_linkedin, 1, 256],  'Body parameter :contact_linkedin must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_linkedin],          'Body parameter :contact_linkedin must be a valid URL.');
            }
            /** JournalistBackground **/
            for (var i in req.params.journalistBackground){
                /** description **/
                validate.AssertTrue('isLength', [req.params.journalistBackground[i].description, 0, 1024],  'journalistBackground '+[i]+' parameter :description must be between 0 and 1024 characters.')
                /** organization **/
                validate.AssertTrue('isLength', [req.params.journalistBackground[i].organization, 0, 128],  'journalistBackground '+[i]+' parameter :organization must be between 0 and 128 characters.')
                /** title **/
                validate.AssertTrue('isLength', [req.params.journalistBackground[i].title, 0, 128],         'journalistBackground '+[i]+' parameter :title must be between 0 and 128 characters.')
                /** year_end **/
                validate.AssertTrue('isLength', [req.params.journalistBackground[i].year_end, 0, 10],       'journalistBackground '+[i]+' parameter :year_end must be between 0 and 10 characters.')
                /** year_start **/
                validate.AssertTrue('isLength', [req.params.journalistBackground[i].year_start, 0, 10],     'journalistBackground '+[i]+' parameter :year_start must be between 0 and 10 characters.')
            }

            var errors = validate.GetErrors();

            // Purge any defined id, just in case!
            delete req.params['@rid'];
            delete req.params.slug;

            if (!errors.length) {
                Journalist.Create(req.params, function(e, journalist) {
                    if (e || !journalist) {
                        return Client.ServerError(req, res, next);
                    } else {

                        return Client.Success(req, res, next, journalist);
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
     * Return a Journalists data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['journalist.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.journalist_id],               'Path parameter :journalist_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],   'Path parameter :journalist_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Journalist.Find({ where: { '@rid': RID.Decode(req.params.journalist_id) }}, function(e, journalist) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!journalist) {
                        return Client.NotFound(req, res, next);
                    } else {

                        return Client.Success(req, res, next, journalist);
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
     * Update a Journalists data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['journalist.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.journalist_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.journalist_id],            'Path parameter :journalist_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],'Path parameter :journalist_id must be a valid identifier.')
            }
            /** slug **/
            if (typeof req.params.slug != 'undefined') {
                validate.AssertTrue('isLength', [req.params.slug, 3, 32],              'Body parameter :handle must be between 3 and 32 characters.');
                validate.AssertFalse('isNull',  [req.params.slug],                     'Body parameter :handle may not be null.');
            }
            /** First Name **/
            if (typeof req.params.first_name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.first_name, 2, 64],        'Body parameter :first_name must be between 2 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.first_name],               'Body parameter :first_name may not be null.');
            }
            /** Last Name **/
            if (typeof req.params.last_name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.last_name, 2, 64],         'Body parameter :last_name must be between 2 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.last_name],                'Body parameter :last_name may not be null.');
            }
            /** Email Address **/
            if (typeof req.params.email != 'undefined') {
                validate.AssertTrue('isLength', [req.params.email, 5, 128],            'Body parameter :email must be between 5 and 128 characters.')
                validate.AssertTrue('isEmail',  [req.params.email],                    'Body parameter :email must be a valid email address.');
                validate.AssertFalse('isNull',  [req.params.email],                    'Body parameter :email may not be null.');
            }
            /** imageURL **/
            if (typeof req.params.imageUrl != 'undefined') {
                validate.AssertTrue('isURL',    [req.params.imageUrl],                 'Body parameter :imageUrl must be a valid URL.')
                validate.AssertTrue('isLength', [req.params.imageUrl, 0, 256],         'Body parameter :imageUrl must be between 0 and 256 characters.')
            }
            /** url **/
            if (typeof req.params.url != 'undefined') {
                validate.AssertTrue('isURL',    [req.params.url],                      'Body parameter :url must be a valid URL.')
                validate.AssertTrue('isLength', [req.params.url, 1, 256],              'Body parameter :url must be between 1 and 256 characters.')
            }
            /** status  **/
            if (typeof req.params.status != 'undefined') {
                validate.AssertTrue('isIn',     [req.params.status, ['0','1']],        'Body parameter :status must be 0 or 1.')
            }
            /** summary **/
            if (typeof req.params.summary != 'undefined') {
                validate.AssertTrue('isLength', [req.params.summary, 0, 1024],         'Body parameter :summary must be between 1 and 256 characters.');
            }
            /** interest **/
            if (typeof req.params.interest != 'undefined') {
                validate.AssertTrue('isLength', [req.params.interest, 0, 1024],        'Body parameter :interest must be between 1 and 256 characters.');
            }
            /** contact_url **/
            if (typeof req.params.contact_url != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_url, 1, 256],      'Body parameter :contact_url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_url],              'Body parameter :contact_url must be a valid URL.');
            }
            /** contact_email **/
            if (typeof req.params.contact_email != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_email, 1, 256],    'Body parameter :contact_email must be between 1 and 256 characters.');
                validate.AssertTrue('isEmail',  [req.params.contact_email],            'Body parameter :contact_email must be a valid Email.');
            }
            /** contact_twitter **/
            if (typeof req.params.contact_twitter != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_twitter, 1, 256],  'Body parameter :contact_twitter must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_twitter],          'Body parameter :contact_twitter must be a valid URL.');
            }
            /** contact_url **/
            if (typeof req.params.contact_fb != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_fb, 1, 256],       'Body parameter :contact_fb must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_fb],               'Body parameter :contact_fb must be a valid URL.');
            }
            /** contact_url **/
            if (typeof req.params.contact_linkedin != 'undefined') {
                validate.AssertTrue('isLength', [req.params.contact_linkedin, 1, 256], 'Body parameter :contact_linkedin must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.contact_linkedin],         'Body parameter :contact_linkedin must be a valid URL.');
            }
            /** journalistBackground **/
            for (var i in req.params.journalistBackground) {
                /** Description **/
                if (typeof req.params.journalistBackground[i].description != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.journalistBackground[i].description, 0, 1024],  'Body parameter :journalistBackground[' + [i] + '].description must be between 0 and 1024 characters.')
                }
                /** Organization **/
                if (typeof req.params.journalistBackground[i].organization != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.journalistBackground[i].organization, 0, 128],  'Body parameter :journalistBackground[' + [i] + '].organization must be between 0 and 128 characters.')
                }
                /** Title **/
                if (typeof req.params.journalistBackground[i].title != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.journalistBackground[i].title, 0, 128],         'Body parameter :journalistBackground[' + [i] + '].title must be between 0 and 128 characters.')
                }
                /** Year End **/
                if (typeof req.params.journalistBackground[i].year_end != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.journalistBackground[i].year_end, 0, 10],       'Body parameter :journalistBackground[' + [i] + '].year_end must be between 0 and 10 characters.')
                }
                /** Year Start **/
                if (typeof req.params.journalistBackground[i].year_start != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.journalistBackground[i].year_start, 0, 10],     'Body parameter :journalistBackground[' + [i] + '].year_start must be between 0 and 10 characters.')
                }
            }

            var errors = validate.GetErrors();

            if (!errors.length) {
                Journalist.Find({ where: { '@rid': RID.Decode(req.params.journalist_id) }}, function(e, journalist) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!journalist) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.slug != 'undefined') {
                            // TODO: Finish by allowing slug updates (requires unique checks)
                            //journalist.slug = req.params.slug;
                        }
                        if (typeof req.params.first_name != 'undefined') {
                            journalist.first_name = req.params.first_name;
                        }
                        if (typeof req.params.last_name != 'undefined') {
                            journalist.last_name = req.params.last_name;
                        }
                        if (typeof req.params.email != 'undefined') {
                            journalist.email = req.params.email;
                        }
                        if (typeof req.params.imageUrl != 'undefined') {
                            journalist.imageUrl = req.params.imageUrl;
                        }
                        if (typeof req.params.status != 'undefined') {
                            journalist.status = req.params.status;
                        }
                        if (typeof req.params.url != 'undefined') {
                            journalist.url = req.params.url;
                        }
                        if (typeof req.params.summary != 'undefined') {
                            journalist.summary = req.params.summary;
                        }
                        if (typeof req.params.interest != 'undefined') {
                            journalist.interest = req.params.interest;
                        }
                        if (typeof req.params.contact_url != 'undefined') {
                            journalist.contact_url = req.params.contact_url;
                        }
                        if (typeof req.params.contact_email != 'undefined') {
                            journalist.contact_email = req.params.contact_email;
                        }
                        if (typeof req.params.contact_twitter != 'undefined') {
                            journalist.contact_twitter = req.params.contact_twitter;
                        }
                        if (typeof req.params.contact_fb != 'undefined') {
                            journalist.contact_fb = req.params.contact_fb;
                        }
                        if (typeof req.params.contact_linkedin != 'undefined') {
                            journalist.summary = req.params.contact_linkedin;
                        }
                        if (typeof req.params.journalistBackground != 'undefined') {
                            for (var i in journalist.journalistBackground) {
                                if (typeof req.params.journalistBackground[i].description != 'undefined') {
                                    journalist.journalistBackground[i].description = req.params.journalistBackground[i].description;
                                }
                                if (typeof req.params.journalistBackground[i].organization != 'undefined') {
                                    journalist.journalistBackground[i].organization = req.params.journalistBackground[i].organization;
                                }
                                if (typeof req.params.journalistBackground[i].title != 'undefined') {
                                    journalist.journalistBackground[i].title = req.params.journalistBackground[i].title;
                                }
                                if (typeof req.params.journalistBackground[i].year_end != 'undefined') {
                                    journalist.journalistBackground[i].year_end = req.params.journalistBackground[i].year_end;
                                }
                                if (typeof req.params.journalistBackground[i].year_start != 'undefined') {
                                    journalist.journalistBackground[i].year_start = req.params.journalistBackground[i].year_start;
                                }
                            }
                        }

                        journalist.save(function(e, journalist) {
                            if (e || !journalist) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, journalist);
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
     * Delete a Journalist
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['journalist.delete']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.journalist_id],               'Path parameter :journalist_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],   'Path parameter :journalist_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Journalist.Find({ where: { '@rid': RID.Decode(req.params.journalist_id) }}, function(e, journalist) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!journalist) {
                        return Client.NotFound(req, res, next);
                    } else {
                        journalist.delete(function(e, journalist) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next, {});
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
     * Return multiple Journalists data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    List: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['journalist.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            // TODO: Add validation once filtering features are added
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Journalist.FindAll({}, function(e, journalists) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!journalists.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {

                        return Client.Success(req, res, next, journalists);
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
                type: ['Journalist'],
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
    },

    /**
     * Return list of my journalists
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    MyJournalists: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['journalist.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
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
                                return Client.Success(req, res, next, feedSettings.journalists);
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
     * Return recently rated journalists
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    RecentlyRated: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['journalist.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Journalist.FindAll_RecentlyRated({ where: { '@rid': req.token.user['@rid'] }}, function(e, journalists) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!journalists > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, journalists);
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
     * Return journalists recently rated  by friends
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    RecentlyRatedFriends: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['journalist.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Journalist.FindAll_RecentlyRatedByFriends({ where : { '@rid': req.token.user['@rid'] }}, function(e, journalists) {
                    if (e) {
                        console.log(e);
                        return Client.ServerError(req, res, next);
                    } else if (!journalists > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, journalists);
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
     * Return top journalists by rating on their articles
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    TopRated: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['journalist.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Journalist.FindAll_TopRated({}, function(e, journalists) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!journalists > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, journalists);
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
}