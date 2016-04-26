// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');

// Shared Core
var Core                = require('tinynews-common');

// Models
var Comment             = Core.Models.Comment;
var Publisher           = Core.Models.Publisher;
var Journalist          = Core.Models.Journalist;
var Article             = Core.Models.Article;
var User                = Core.Models.User;

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Create a Comment
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        try {
            // Security Check
            //if (!req.token.user.permissions['comment.create']) {
            //    return Client.NotAuthorized(req, res, next);
            //}
            // Temporarily Disabled

            var validate = new Validate();
            /** @rid - Owner Id (either publisher , journalist or article) **/
            validate.AssertFalse('isNull',      [req.params.owner_id],                 'Path parameter :owner_id may not be null.');
            validate.AssertTrue('isRID',        [RID.Decode(req.params.owner_id)],     'Path parameter :owner_id must be a valid identifier.');
        
            validate.AssertFalse('isNull',      [req.params.body],                     'Body parameter :body must not be null.');
            validate.AssertTrue('isLength',     [req.params.body, 1, 1024],            'Body parameter :body must be between 1 and 1024 characters.');

            validate.AssertFalse('isNull',      [req.params.type],                     'Body parameter :type may not be null.');

            switch(req.params.type) {
                case 'article':
                    req.params.type = 0;
                    break;

                case 'publisher':
                    req.params.type = 1;
                    break;

                case 'journalist':
                    req.params.type = 2;
                    break;

                default:
                    break;
            }

            validate.AssertTrue('isInt',        [req.params.type],             'Body parameter :Type parameter must be integer');

            if (typeof req.params.comment_id != 'undefined') {
                validate.AssertFalse('isNull',      [req.params.comment_id],                  'Path parameter :comment_id may not be null.');
                validate.AssertTrue('isRID',        [RID.Decode(req.params.comment_id)],      'Path parameter :comment_id must be a valid identifier.');
            }
        
            var errors = validate.GetErrors();

            console.log('Errors', errors);

            // Purge any defined id, just in case!
            delete req.params['@rid'];
            req.params.user_id = req.token.user['@rid'];
            req.params.owner_id = RID.Decode(req.params.owner_id);

            if (!errors.length) {
                Comment.Create(req.params, function(e, comment) {
                    console.log('e comment', e, comment);
                    if (e || !comment) {
                        return Client.ServerError(req, res, next);
                    } else {
                        return Client.Success(req, res, next, comment);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        }  catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Return a Comments data for Publisher
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    PublisherComments: function(req, res, next, body) {
        try {
            // Security Check
            //if (!req.token.user.permissions['comment.api_get']) {
            //    return Client.NotAuthorized(req, res, next);
            //}

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.publisher_id],               'Path parameter :publisher_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.publisher_id)],   'Path parameter :publisher_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Publisher.Find({ where: { '@rid': RID.Decode(req.params.publisher_id) }}, function(e, publisher) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!publisher) {
                        return Client.NotFound(req, res, next);
                    } else {
                        publisher.get_comments(function(e, comments) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!comments.length > 0) {
                                return Client.NoContent(req, res, next);
                            } else {
                                return Client.Success(req, res, next, comments);
                            }
                        });
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        }catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },
    
    /**
     * Return a Comments data for Journalist
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    JournalistComments: function(req, res, next, body) {
        try {
            // Security Check
            //if (!req.token.user.permissions['comment.api_get']) {
            //    return Client.NotAuthorized(req, res, next);
            //}

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.journalist_id],               'Path parameter :journalist_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.journalist_id)],   'Path parameter :journalist_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Journalist.Find({ where: { '@rid': RID.Decode(req.params.journalist_id) }}, function(e, journalist) {
            	   if (e) {
                       console.log(e);
                        return Client.ServerError(req, res, next);
                    } else if (!journalist) {
                        return Client.NotFound(req, res, next);
                    } else {
                	   journalist.get_comments(true,function(e, comments) {
                           if (e) {
                               return Client.ServerError(req, res, next);
                           } else if (!comments.length > 0) {
                               return Client.NoContent(req, res, next);
                           } else {
                               var o_user_ids = {};
                               var user_ids = [];

                               for (var i in comments) {
                                   o_user_ids[comments[i].user_id] = true;
                               }

                               for (var i in o_user_ids) {
                                   user_ids.push(i);
                               }

                               try {
                                   User.FindAll({ select: ['@rid', 'first_name', 'last_name', 'imageUrl'], where: { '@rid': user_ids }, raw: true}, function(e, users) {
                                       if (e) {
                                           console.log(e);
                                           return Client.ServerError(req, res, next);
                                       } else {
                                           var index = {};
                                           for (var i in users) {
                                               index[users[i].rid] = users[i];
                                           }

                                           for (var i in comments) {
                                               comments[i].user = index[comments[i].user_id];
                                           }

                                           return Client.Success(req, res, next, comments);
                                       }
                                   });
                               }
                               catch(ee) {
                                   console.log(ee);
                                   return Client.ServerError(req, res, next);
                               }
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
     * Return a Comments data for Article
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ArticleComments: function(req, res, next, body) {
        try {
            // Security Check
            //if (!req.token.user.permissions['comment.api_get']) {
            //    return Client.NotAuthorized(req, res, next);
            //}

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
                       article.get_comments(function(e, comments) {
                           if (e) {
                               return Client.ServerError(req, res, next);
                           } else if (!comments.length > 0) {
                               return Client.NoContent(req, res, next);
                           } else {
                               var o_user_ids = {};
                               var user_ids = [];

                               for (var i in comments) {
                                   o_user_ids[comments[i].user_id] = true;
                               }

                               for (var i in o_user_ids) {
                                   user_ids.push(i);
                               }

                               try {
                                   User.FindAll({ select: ['@rid', 'first_name', 'last_name', 'imageUrl'], where: { '@rid': user_ids }, raw: true}, function(e, users) {
                                       if (e) {
                                           console.log(e);
                                           return Client.ServerError(req, res, next);
                                       } else {
                                           var index = {};
                                           for (var i in users) {
                                               index[users[i].rid] = users[i];
                                           }

                                           for (var i in comments) {
                                               comments[i].user = index[comments[i].user_id];
                                           }

                                           return Client.Success(req, res, next, comments);
                                       }
                                   });
                               }
                               catch(ee) {
                                   console.log(ee);
                                   return Client.ServerError(req, res, next);
                               }
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
     * Update a Comments data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['comment.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.comment_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.comment_id],               'Path parameter :comment_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.comment_id)],   'Path parameter :comment_id must be a valid identifier.')
            }
        
            /** Name **/
            if (typeof req.params.body != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.body],            'Body parameter :body must not be null.');
                validate.AssertTrue('isLength', [req.params.body, 1, 1024],   'Body parameter :body must be between 1 and 1024 characters.');
            }

            var errors = validate.GetErrors();

            if (!errors.length) {
                Comment.Find({ where: { '@rid': RID.Decode(req.params.comment_id) }}, function(e, comment) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!comment) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.body != 'undefined') {
                            comment.body = req.params.body;
                        }
                   
                        comment.save(function(e, upcom) {
                            if (e || !comment) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, upcom);
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
     * Vote a Comments data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CommentVote: function(req, res, next, body) {
        try {
            // Security Check
            console.log(req.token.user.permissions);

            if (!req.token.user.permissions['comment.vote']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
        
            /** @rid - Current comment Id**/
            validate.AssertFalse('isNull',  [req.params.comment_id],               'Path parameter :comment_id may not be null.')
            validate.AssertTrue('isRID',    [RID.Decode(req.params.comment_id)],   'Path parameter :comment_id must be a valid identifier.')

            /** vote **/
            validate.AssertFalse('isNull',  [req.params.vote],                      'Path parameter :owner_id may not be null.');
            validate.AssertTrue('isIn',    [req.params.vote, ['-1','1']],           'Path parameter :featured must be -1 or 1.');

            var errors = validate.GetErrors();

            if (!errors.length) {
                Comment.Find({ where: { '@rid': RID.Decode(req.params.comment_id) } }, function(e, comment) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!comment) {
                        return Client.NotFound(req, res, next);
                    } else {
                        comment.vote(req.params.vote, req.token.user['@rid'], function(e, vote) {
                            if (e || !vote) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, vote);
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
     * Get votes for a comment
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    GetVotes: function(req, res, next, body) {
        try {
            // Security Check
            //if (!req.token.user.permissions['comment.api_get']) {
            //    return Client.NotAuthorized(req, res, next);
            //}

            // Validate
            var validate = new Validate();
        
            /** @rid - Current comment Id**/
            validate.AssertFalse('isNull',  [req.params.comment_id],               'Path parameter :comment_id may not be null.')
            validate.AssertTrue('isRID',    [RID.Decode(req.params.comment_id)],   'Path parameter :comment_id must be a valid identifier.')

            var errors = validate.GetErrors();

            if (!errors.length) {
                Comment.Find({ where: { '@rid': RID.Decode(req.params.comment_id) } }, function(e, comment) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!comment) {
                        return Client.NotFound(req, res, next);
                    } else {
                        comment.get_votes(function(e, vote) {
                            if (e || !vote) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, vote);
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
     * Delete a Comment
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['comment.delete']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
        
            var validate = new Validate();
        
            /** @rid - Owner Id **/
    	   validate.AssertFalse('isNull',  [req.params.owner_id],               	'Path parameter :owner_id may not be null.');
           validate.AssertTrue('isRID',    [RID.Decode(req.params.comment_id)],   	'Path parameter :owner_idmust be a valid identifier.');
        
            /** @rid - Comment Id **/
            validate.AssertFalse('isNull',  [req.params.comment_id],               'Path parameter :comment_id may not be null.');
            validate.AssertTrue('isRID',    [RID.Decode(req.params.comment_id)],   'Path parameter :comment_id must be a valid identifier.');
        
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
        	   var owner_id = RID.Decode(req.params.owner_id);
                Comment.Find({ where: { '@rid': RID.Decode(req.params.comment_id) } }, function(e, comment) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!comment) {
                        return Client.NotFound(req, res, next);
                    } else {
                	   //check owner 
                	   if (owner_id != comment.owner_id) {
                		  errors.push('Path parameter :owner_id does not match with comment_id');
                		  return Client.InvalidRequest(req, res, next, errors);
                	   }
                        comment.delete(function(e, result) {
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
}