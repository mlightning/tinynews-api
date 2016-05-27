// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var crypto              = require('crypto');
var util                = require('util');

// Shared Core
var Core                = require('tinynews-common');

// Models
var User                = Core.Models.User;
var FeedSettings        = Core.Models.FeedSettings;

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Return FeedSetting data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.user_id],               'Path parameter :user_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.user_id)],   'Path parameter :user_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                return Client.Success(req, res, next, feedSettings);
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
     * Update UserProfile data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try{
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Article Filter **/
            if (typeof req.params.article_filter != 'undefined') {
                validate.AssertTrue('isIn', [req.params.article_filter, ['0','1']],                   'Body parameter :article_filter must be 0 or 1.');
            }
            /** Average Article Rating **/
            if (typeof req.params.avg_article_rating != 'undefined') {
                validate.AssertTrue('isIn', [req.params.avg_article_rating, [1,2,3,4,5]],             'Body parameter :avg_article_rating must be an integer between 1 to 5.');
            }
            /** Factuality Rating **/
            if (typeof req.params.factuality_rating != 'undefined') {
                validate.AssertTrue('isIn', [req.params.factuality_rating, ['1','2','3','4','5']],    'Body parameter :factuality_rating must be an integer between 1 to 5.');
            }
            /** Importance Rating **/
            if (typeof req.params.importance_rating != 'undefined') {
                validate.AssertTrue('isIn', [req.params.importance_rating, ['1','2','3','4','5']],    'Body parameter :importance_rating must be an integer between 1 to 5.');
            }
            /** Independence Rating **/
            if (typeof req.params.independence_rating != 'undefined') {
                validate.AssertTrue('isIn', [req.params.independence_rating, ['1','2','3','4','5']],  'Body parameter :independence_rating must be an integer between 1 to 5.');
            }
            /** Transparency Rating **/
            if (typeof req.params.transparency_rating != 'undefined') {
                validate.AssertTrue('isIn', [req.params.transparency_rating, ['1','2','3','4','5']],  'Body parameter :transparency_rating must be an integer between 1 to 5.');
            }
            /** Ratings Overall **/
            if (typeof req.params.ratings_overall != 'undefined') {
                validate.AssertTrue('isIn', [req.params.ratings_overall, ['0','1']],                  'Body parameter :ratings_overall must be 0 or 1.');
            }
            /** Article Filter **/
            if (typeof req.params.track_public_ratings != 'undefined') {
                validate.AssertTrue('isIn', [req.params.track_public_ratings, [0,1]],                  'Body parameter :track_public_ratings must be 0 or 1.');
            }

            var errors = validate.GetErrors();

            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        user.get_feed_settings(function(e, feedSettings) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!feedSettings) {
                                return Client.NotFound(req, res, next);
                            } else {
                                if (typeof req.params.article_filter != 'undefined') {
                                    feedSettings.article_filter = req.params.article_filter;
                                }
                                if (typeof req.params.avg_article_rating != 'undefined') {
                                    feedSettings.avg_article_rating = req.params.avg_article_rating;
                                }
                                if (typeof req.params.factuality_rating != 'undefined') {
                                    feedSettings.factuality_rating = req.params.factuality_rating;
                                }
                                if (typeof req.params.importance_rating != 'undefined') {
                                    feedSettings.importance_rating = req.params.importance_rating;
                                }
                                if (typeof req.params.independence_rating != 'undefined') {
                                    feedSettings.independence_rating = req.params.independence_rating;
                                }
                                if (typeof req.params.ratings_overall != 'undefined') {
                                    feedSettings.ratings_overall = req.params.ratings_overall;
                                }
                                if (typeof req.params.track_public_ratings != 'undefined') {
                                    feedSettings.track_public_ratings = req.params.track_public_ratings;
                                }
                                if (typeof req.params.transparency_rating != 'undefined') {
                                    feedSettings.transparency_rating = req.params.transparency_rating;
                                }
                            
                                feedSettings.save(function(e, feedSettings){
                                    if (e || !feedSettings) {
                                        return Client.ServerError(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.Success(req, res, next, feedSettings);
                                    }
                                });
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
     * Add a Journalist in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreateJournalist: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // TODO: Figure out why @rid's are inconsistent
            if (req.params['@rid'] && !req.params.journalist_id) {
                req.params.journalist_id = req.params['@rid'];
            } else if (!req.params['@rid'] && req.params.journalist_id && req.params.journalist_id.indexOf('#') >= 0) {
                // Do Nothing ...
            } else {
                req.params.journalist_id = RID.Decode(req.params.journalist_id);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Journalist ID **/
            if (typeof req.params.journalist_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.journalist_id],                           'Path parameter :journalist_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],               'Path parameter :journalist_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Filter sensitive data
                        delete user.password;
                        delete user.permissions;

                        user.get_feed_settings(function(e, feedSettings) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!feedSettings) {
                                return Client.NotFound(req, res, next);
                            } else {
                                feedSettings.assign_journalist(req.params.journalist_id, function(e, journalist) {
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!journalist) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.Success(req, res, next, "Journalist Added");
                                    }
                                })
                            }
                        })
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            console.log(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Delete Journalist in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeleteJournalist: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.journalist_id) {
                req.params.journalist_id = req.params['@rid'];
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Journalist ID **/
            if (typeof req.params.journalist_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.journalist_id],                           'Path parameter :journalist_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],               'Path parameter :journalist_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.remove_journalist(RID.Decode(req.params.journalist_id), function(e, journalist){
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!journalist) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.NoContent(req, res, next);
                                    }
                                });
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
     * Add a Publisher in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreatePublisher: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // TODO: Figure out why @rid's are inconsistent
            if (req.params['@rid'] && !req.params.publisher_id) {
                req.params.publisher_id = req.params['@rid'];
            } else if (!req.params['@rid'] && req.params.publisher_id && req.params.publisher_id.indexOf('#') >= 0) {
                // Do Nothing ...
            } else {
                req.params.publisher_id = RID.Decode(req.params.publisher_id);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Publisher ID **/
            if (typeof req.params.publisher_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.publisher_id],                           'Path parameter :publisher_id may not be null.')
                validate.AssertTrue('isRID',    [req.params.publisher_id],                           'Path parameter :publisher_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        console.log(e);
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
                                feedSettings.assign_publisher(req.params.publisher_id, function(e, publisher){
                                    if (e) {
                                        console.log(e);
                                        return Client.ServerError(req, res, next);
                                    } else if (!publisher) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.Success(req, res, next, "Publisher Added");
                                    }
                                })
                            }
                        })
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            console.log(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Delete publisher in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeletePublisher: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.publisher_id) {
                req.params.publisher_id = req.params['@rid'];
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Publisher ID **/
            if (typeof req.params.journalist_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.publisher_id],                           'Path parameter :publisher_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)],               'Path parameter :publisher_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.remove_publisher(RID.Decode(req.params.publisher_id), function(e, publisher){
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!publisher) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.NoContent(req, res, next);
                                    }
                                })
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
     * Add a Tag in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreateTag: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.tag_id) {
                req.params.tag_id = req.params['@rid'];
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Tag ID **/
            if (typeof req.params.tag_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.tag_id],                                  'Body parameter :tag_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.tag_id)],                      'Body parameter :tag_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.assign_tag(RID.Decode(req.params.tag_id), function(e, tag) {
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!tag) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.Success(req, res, next, "Tag Added");
                                    }
                                })
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
     * Delete tag in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeleteTag: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.tag_id) {
                req.params.tag_id = req.params['@rid'];
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Tag ID **/
            if (typeof req.params.tag_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.tag_id],                                   'Path parameter :tag_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.tag_id)],                       'Path parameter :tag_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.remove_tag(RID.Decode(req.params.tag_id), function(e, tag){
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!tag) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.NoContent(req, res, next);
                                    }
                                })
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
     * Add a Friend in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreateFriend: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // TODO: Figure out why @rid's are inconsistent
            if (req.params['@rid'] && !req.params.friend_id) {
                req.params.friend_id = req.params['@rid'];
            } else if (!req.params['@rid'] && req.params.friend_id && req.params.friend_id.indexOf('#') >= 0) {
                // Do Nothing ...
            } else {
                req.params.friend_id = RID.Decode(req.params.friend_id);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** User (Friend) ID **/
            if (typeof req.params.friend_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.friend_id],                                  'Path parameter :friend_id may not be null.')
                validate.AssertTrue('isRID',    [req.params.friend_id],                                  'Path parameter :friend_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.assign_friend(req.params.friend_id, function(e, friend){
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!friend) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.Success(req, res, next, "Friend Added");
                                    }
                                })
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
     * Delete friend in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeleteFriend: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.friend_id) {
                req.params.friend_id = req.params['@rid'];
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** User (Friend) ID **/
            if (typeof req.params.friend_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.friend_id],                                   'Path parameter :friend_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.friend_id)],                       'Path parameter :friend_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.remove_friend(RID.Decode(req.params.friend_id), function(e, friend){
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!friend) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.NoContent(req, res, next);
                                    }
                                })
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
     * Add a Group in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreateGroup: function(req, res, next, body) {

        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.group_id) {
                req.params.group_id = req.params['@rid'];
            } else if (!req.params['@rid'] && req.params.group_id && req.params.group_id.indexOf('#') >= 0) {
                // Do Nothing ...
            } else {
                req.params.group_id = RID.Decode(req.params.group_id);
            }
            console.log(req.params.group_id);

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Group ID **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],                                  'Path parameter :group_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],                      'Path parameter :group_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
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
                                feedSettings.assign_group(req.params.group_id, function(e, group){
                                    if (e) {
                                        console.log('db error',e);
                                        return Client.ServerError(req, res, next);
                                    } else if (!group) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.Success(req, res, next, "Group Added");
                                    }
                                })
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
     * Delete friend in UserFeedSettings
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeleteGroup: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            if (req.params['@rid'] && !req.params.group_id) {
                req.params.group_id = req.params['@rid'];
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],                                 'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],                     'Path parameter :user_id must be a valid identifier.')
            }
            /** Group ID **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],                                   'Path parameter :group_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],                       'Path parameter :group_id must be a valid identifier.')
            }
            var errors = validate.GetErrors();
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        console.log('error',e);
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
                                feedSettings.remove_group(RID.Decode(req.params.group_id), function(e, group){
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!group) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        // Don't update the Token data, unless same user
                                        if (req.token.user['@rid'] == user['@rid']) {
                                            Core.Auth.Tokens.Sync(user['@rid'], req.headers['x-auth-token']);
                                        }

                                        return Client.NoContent(req, res, next);
                                    }
                                })
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
    }

}