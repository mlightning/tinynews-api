// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var Async               = require('async');
var ElasticSearch       = require('elasticsearch');

// Shared Core
var Core                = require('tinynews-common');
var Tokens              = Core.Auth.Tokens;

// Models
var User                = Core.Models.User;
var Article             = Core.Models.Article;

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
     * Create a Article
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        if (!req.token.user.permissions['article.admin']) {
            return Client.NotAuthorized(req, res, next);
        }

        try {
            var errors = new Validate()
                /** Body **/
                .AssertFalse('isNull',  [req.params.body],                       'Body parameter :body may not be null.')
                .AssertTrue('isLength', [req.params.body, 1, 102400],            'Body parameter :body must be between 1 and 102400 characters.')
                /** Featured **/
                .AssertTrue('isInt',    [req.params.featured],                   'Body parameter :featured must be an integer.')
                .AssertTrue('isIn',     [req.params.featured, ['0','1']],        'Body parameter :featured must be 0 or 1.')
                /** Image URL **/
                .AssertTrue('isURL',    [req.params.imageUrl],                   'Body parameter :imageUrl must be a valid URL.')
                /** Post Date **/
                .AssertTrue('isInt',    [req.params.post_date],                   'Body parameter :post_date must be integer.')
                /** Title **/
                .AssertFalse('isNull',  [req.params.title],                      'Body parameter :title may not be null.')
                .AssertTrue('isLength', [req.params.title, 1, 256],              'Body parameter :title must be between 1 and 256 characters.')
                /** Article URL **/
                .AssertFalse('isNull',  [req.params.url],                        'Body parameter :url may not be null.')
                .AssertTrue('isLength', [req.params.url, 1, 256],                'Body parameter :url must be between 1 and 256 characters.')
                .AssertTrue('isURL',    [req.params.url],                        'Body parameter :url must be a valid URL.')
                .GetErrors();
        }
        catch(e) {
            console.log(e, e.stack);
            return Client.ServerError(req, res, next);
        }

        // Purge any defined slug, let the system manage this
        delete req.params.slug;

        // Purge any defined id, just in case!
        delete req.params['@rid'];

        if (!errors.length) {
            Article.Create(req.params, function(e, article) {
                if (e || !article) {
                    return Client.ServerError(req, res, next);
                } else {
                    return Client.Success(req, res, next, article);
                }
            });
        } else {
            return Client.InvalidRequest(req, res, next, errors);
        }
    },

    /**
     * Return a Articles data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['article.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        article.fetch_meta(function(e) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            }else{
                                return Client.Success(req, res, next, article);
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
     * Update a Articles data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['article.edit'] && !req.token.user.permissions['article.admin']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.article_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.article_id],               'Body parameter :article_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Body parameter :article_id must be a valid identifier.')
            }
            /** Body **/
            if (typeof req.params.body != 'undefined') {
                validate.AssertTrue('isLength', [req.params.body, 1, 102400],    'Body parameter :body must be between 1 and 102400 characters.');
                validate.AssertFalse('isNull',  [req.params.body],               'Body parameter :body may not be null.');
            }
            /** Featured **/
            if (typeof req.params.featured != 'undefined') {
                validate.AssertTrue('isInt',   [req.params.featured],            'Body parameter :featured must be an integer.')
                validate.AssertTrue('isIn',    [req.params.featured, ['0','1']], 'Body parameter :featured must be 0 or 1.')
            }
            /** Image URL **/
            if (typeof req.params.imageUrl != 'undefined') {
                validate.AssertTrue('isURL',    [req.params.imageUrl],           'Body parameter :imageUrl must be a URL.')
            }
            /** Post Date **/
            if (typeof req.params.post_date != 'undefined') {
                validate.AssertTrue('isInt',    [req.params.post_date],           'Body parameter :post_date must be integer.')
            }
            /** Title **/
            if (typeof req.params.title != 'undefined') {
                validate.AssertTrue('isLength', [req.params.title, 1, 256],      'Body parameter :title must be between 1 and 256 characters.');
                validate.AssertFalse('isNull',  [req.params.title],              'Body parameter :title may not be null.')
            }
            /** Article URL **/
            if (typeof req.params.url != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.url],                'Body parameter :url may not be null.')
                validate.AssertTrue('isURL',    [req.params.url],                'Body parameter :url must be a valid URL.')
            }
            var errors = validate.GetErrors();

            if (!errors.length) {
                Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.body != 'undefined') {
                            article.body = req.params.body;
                        }
                        if (typeof req.params.featured != 'undefined') {
                            article.featured = req.params.featured;
                        }
                        if (typeof req.params.imageUrl != 'undefined') {
                            article.imageUrl = req.params.imageUrl;
                        }
                        if (typeof req.params.post_date != 'undefined') {
                            article.post_date = req.params.post_date;
                        }
                        if (typeof req.params.title != 'undefined') {
                            article.title = req.params.title;
                        }
                        if (typeof req.params.url != 'undefined') {
                            article.url = req.params.url;
                        }

                        article.save(function(e, user) {
                            if (e || !article) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, article);
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
     * Delete a Article
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['article.delete']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        article.delete(function(e, article) {
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
        try {
            // Security Check
            if (!req.token.user.permissions['article.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            // TODO: Add validation once filtering features are added
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Article.FindAll({}, function(e, articles) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!articles.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, articles);
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
     * Return multiple Articles data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    GetFeatured: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['article.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            var pageNum = 1;
            var perPage = 3;

            var must = { match: {featured : 1}};

            var errors = [];

            // Fetch and return
            if (!errors.length) {
                try {
                    ES.search({
                        index: Core.Config.elastic.index,
                        from: (pageNum - 1) * perPage,
                        size: perPage,
                        type: ['Article'],
                        body: {
                            query: {
                                bool: {
                                    must: must
                                }
                            }
                        }
                    }, function (error, response) {
                        if (error) {
                            console.log(error, error.stack);
                            return Client.Success(req, res, next, { error: error });
                        }
                            return Client.Success(req, res, next, {
                                results: response.hits.hits,
                                page: pageNum,
                                pages: Math.ceil(response.hits.total / perPage)

                        });
                    });
                } catch(e) { return Client.ServerError(req, res, next); }
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return multiple Articles filtered by a users
     * FeedSettings.
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    FeedList: function(req, res, next, body) {
        // Security Check
        if (!req.token.user.permissions['article.api_get']) {
            return Client.NotAuthorized(req, res, next);
        }

        var pageNum = 1;
        var perPage = 20;

        try {
            var errors = new Validate();
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
            errors.AssertFalse('isNull',  [req.params.user_id],              'Path parameter :user_id may not be null.');
            errors.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],  'Path parameter :user_id must be a valid identifier.');
            errors = errors.GetErrors();
        }
        catch (e) {
            console.log(e, e.stack);
            return Client.ServerError(req, res, next);
        }

        if (req.params.perpage) {
            perPage = req.params.perpage;
        }
        if (req.params.page) {
            pageNum = req.params.page;
        }

        if (!errors.length) {

            User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function (e, user) {
                if (e) {
                    return Client.ServerError(req, res, next);
                } else if (!user) {
                    return Client.NotFound(req, res, next);
                } else {
                    // Filter sensitive data
                    delete user.password;
                    delete user.permissions;
                    user.get_feed_settings(function (e, feedSettings) {
                        if (e) {
                            return Client.ServerError(req, res, next);
                        } else if (!feedSettings) {
                            return Client.NotFound(req, res, next);
                        } else {

                            var journalists = [];
                            var publishers = [];
                            var tags = [];

                            feedSettings.publishers.forEach(function(item) {
                                publishers.push(item['@rid']);
                            });

                            feedSettings.journalists.forEach(function(item) {
                                journalists.push(item['@rid']);
                            });

                            feedSettings.tags.forEach(function(item) {
                                tags.push(item['@rid']);
                            });

                            var must = [];

                            if (publishers.length) {
                                must.push( { match: { 'publisher.@rid': publishers.join(',') }} );
                            }
                            if (journalists.length) {
                                must.push( { match: { 'journalist.@rid': journalists.join(',') }} );
                            }
                            //if (tags.length) {
                            //    must.push( { match: { 'publisher.@rid': publishers.join(',') }} );
                            //}

                            console.log(must);

                            // --
                            // Query Elastic Search
                            // --
                            try {
                                ES.search({
                                    index: Core.Config.elastic.index,
                                    from: (pageNum - 1) * perPage,
                                    size: perPage,
                                    type: ['Article'],
                                    body: {
                                        query: {
                                            bool: {
                                                must: must
                                            }
                                        }
                                    }
                                }, function (error, response) {
                                    if (error) {
                                        console.log(error, error.stack);

                                        return Client.Success(req, res, next, { error: error });

                                        return Client.ServerError(req, res, next);
                                    }

                                    return Client.Success(req, res, next, {
                                        results: response.hits.hits,
                                        page: pageNum,
                                        pages: Math.ceil(response.hits.total / perPage)
                                    });
                                });
                            } catch(e) { console.log(e); }
                        }
                    })
                }
            });

        } else {
            return Client.InvalidRequest(req, res, next, errors);
        }
    },

    /**
     * Get user ratings for an article
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     */

    GetUserRating: function(req, res, next) {

        if (!req.token.user.permissions['article.rate']) {
            return Client.NotAuthorized(req, res, next);
        }

        Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
            if (e) {
                return Client.ServerError(req, res, next);
            } else if (!article) {
                return Client.NotFound(req, res, next);
            } else {
                article.get_user_rating(req.token.user["@rid"], function (er, results) {
                    if (er) {
                        return Client.NotFound(req, res, next);
                    } else {
                        return Client.Success(req, res, next, results);
                    }
                });
            }
        });
    },

    /**
     * Rate an Article
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Rate: function(req, res, next, body) {
        try {
            console.log(req.token.user);

            // Security Check
            // TODO: Add security
            if (!req.token.user.permissions['article.rate']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                .AssertFalse('isNull',  [req.params.importance],                   'Body parameter :importance may not be null.')
                .AssertTrue('isFloat',    [req.params.importance],                   'Body parameter :importance must be a valid integer.')
                .AssertTrue('InRange',     [req.params.importance, [1,5]],      'Body parameter :importance must be between 1 to 5.')
                .AssertFalse('isNull',  [req.params.independence],                 'Body parameter :importance may not be null.')
                .AssertTrue('isFloat',    [req.params.independence],                 'Body parameter :importance must be a valid integer.')
                .AssertTrue('InRange',     [req.params.independence, [1,5]],    'Body parameter :importance must be between 1 to 5.')
                .AssertFalse('isNull',  [req.params.factuality],                   'Body parameter :factuality may not be null.')
                .AssertTrue('isFloat',    [req.params.factuality],                   'Body parameter :factuality must be a valid integer.')
                .AssertTrue('InRange',     [req.params.factuality, [1,5]],      'Body parameter :factuality must be between 1 to 5.')
                .AssertFalse('isNull',  [req.params.transparency],                 'Body parameter :transparency may not be null.')
                .AssertTrue('isFloat',    [req.params.transparency],                 'Body parameter :transparency must be a valid integer.')
                .AssertTrue('InRange',     [req.params.transparency, [1,5]],    'Body parameter :transparency must be between 1 to 5.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        article.rate({
                            importance: req.params.importance,
                            independence: req.params.independence,
                            factuality: req.params.factuality,
                            transparency: req.params.transparency
                        }, req.token.user['@rid'], function(e, rating) {
                            if (e || ! rating) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, rating);
                            }
                        });
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        }catch  (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }   
    },

    /**
     * Assign a Publisher
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    AssignPublisher: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['article.admin']) {
                return Client.NotAuthorized(req, res, next);
            }
            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                .AssertFalse('isNull',  [req.params.publisher_id],             'Body parameter :publisher_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)], 'Body parameter :publisher_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        article.assign_publisher(req.params.publisher_id, function(e, pub) {
                            if (e || ! pub) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, pub);
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
     * Assign a Journalist
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    AssignJournalist: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['article.admin']) {
                return Client.NotAuthorized(req, res, next);
            }
            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                .AssertFalse('isNull',  [req.params.journalist_id],            'Body parameter :journalist_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],'Body parameter :journalist_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Article.Find({ where: { '@rid': RID.Decode(req.params.article_id) }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        article.assign_journalist(req.params.journalist_id, function(e, journalist) {
                            if (e || ! journalist) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, journalist);
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
}