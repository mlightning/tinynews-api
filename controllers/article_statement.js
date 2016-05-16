// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');

// Shared Core
var Core                = require('tinynews-common');

// Models
var Article             = Core.Models.Article;
var ArticleStatement         = Core.Models.ArticleStatement;

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Create an ArticleStatement
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        // Security Check
        if (!req.token.user.permissions['article.edit']) {
            return Client.NotAuthorized(req, res, next);
        }

        try {
            var errors = new Validate()
                /** Article ID **/
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                /** Quote **/
                //.AssertTrue('isLength', [req.params.quote, 1, 1024],           'Body parameter :quote must be between 1 and 102400 characters.')
                //.AssertFalse('isNull',  [req.params.quote],                    'Body parameter :quote may not be null.')
                /** Note **/
                .AssertTrue('isLength', [req.params.note, 1, 1024],            'Body parameter :note must be between 1 and 102400 characters.')
                .AssertFalse('isNull',  [req.params.note],                     'Body parameter :note may not be null.')
                /** Type **/
                .AssertTrue('isIn',     [req.params.type, ArticleStatement.properties.type.options], 'Body parameter :type must be \'immediate\' or \'contextual\'')
                .AssertFalse('isNull',  [req.params.type],                     'Body parameter :type may not be null.')
                .GetErrors();
        }
        catch(e) {
            console.log(e);
            return Client.ServerError(req, res, next);
        }

        // Purge any defined id, just in case!
        delete req.params['@rid'];

        // Convert path article_id
        req.params.article_id = RID.Decode(req.params.article_id);

        if (!errors.length) {
            ArticleStatement.Create(req.params, function(e, statement) {
                if (e || !statement) {
                    return Client.ServerError(req, res, next);
                } else {
                    return Client.Success(req, res, next, statement);
                }
            });
        } else {
            return Client.InvalidRequest(req, res, next, errors);
        }
    },

    /**
     * Return an ArticleStatement
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['article.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                /** Article ID **/
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                /** Fact ID **/
                .AssertFalse('isNull',  [req.params.stmt_id],                  'Path parameter :fact_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.stmt_id)],      'Path parameter :fact_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                ArticleStatement.Find({ where: { '@rid': RID.Decode(req.params.stmt_id), article_id: RID.Decode(req.params.article_id)  }}, function(e, article) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!article) {
                        return Client.NotFound(req, res, next);
                    } else {
                        return Client.Success(req, res, next, article);
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
     * Update an ArticlesFact
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['article.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** Article ID **/
            if (typeof req.params.article_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.article_id],               'Body parameter :article_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Body parameter :article_id must be a valid identifier.')
            }
            /** Article Statement ID **/
            if (typeof req.params.stmt_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.stmt_id],               'Body parameter :stmt_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.stmt_id)],   'Body parameter :stmt_id must be a valid identifier.')
            }
            /** Quote **/
            //if (typeof req.params.quote != 'undefined') {
            //    validate.AssertTrue('isLength', [req.params.quote, 1, 1024],      'Body parameter :quote must be between 1 and 1024 characters.');
            //    validate.AssertFalse('isNull',  [req.params.quote],               'Body parameter :quote may not be null.');
            //}
            /** Note **/
            if (typeof req.params.note != 'undefined') {
                validate.AssertTrue('isLength', [req.params.note, 1, 1024],      'Body parameter :note must be between 1 and 1024 characters.');
                validate.AssertFalse('isNull',  [req.params.note],               'Body parameter :note may not be null.');
            }
            /** Type **/
            if (typeof req.params.type != 'undefined') {
                validate.AssertFalse('isNull', [req.params.type],             'Body parameter :type must be an integer.')
                validate.AssertTrue('isIn',    [req.params.type, ArticleStatement.properties.type.options],  'Body parameter :type must be \'immediate\' or \'contextual\'.')
            }
            var errors = validate.GetErrors();

            if (!errors.length) {
                ArticleStatement.Find({ where: { '@rid': RID.Decode(req.params.stmt_id), article_id: RID.Decode(req.params.article_id)  }}, function(e, statement) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!statement) {
                        return Client.NotFound(req, res, next);
                    } else {
                        //if (typeof req.params.quote != 'undefined') {
                        //    statement.quote = req.params.quote;
                        //}
                        if (typeof req.params.note != 'undefined') {
                            statement.note = req.params.note;
                        }
                        if (typeof req.params.type != 'undefined') {
                            statement.type = req.params.type;
                        }

                        statement.save(function(e, statement) {
                            if (e || !statement) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, statement);
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
     * Delete an ArticleStatement
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['article.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                /** Article ID **/
                .AssertFalse('isNull',  [req.params.article_id],               'Path parameter :article_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.article_id)],   'Path parameter :article_id must be a valid identifier.')
                /** Statement ID **/
                .AssertFalse('isNull',  [req.params.stmt_id],                  'Path parameter :stmt_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.stmt_id)],      'Path parameter :stmt_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                ArticleStatement.Find({ where: { '@rid': RID.Decode(req.params.stmt_id), article_id: RID.Decode(req.params.article_id)  }}, function(e, statement) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!statement) {
                        return Client.NotFound(req, res, next);
                    } else {
                        statement.delete(function(e) {
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
        }catch (e) {
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
            var errors = new Validate()
                /** Article ID **/
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
                    }

                    article.fetch_meta(function(e) {
                        if (e) {
                            return Client.ServerError(req, res, next);
                        } else if (!article.statements.length > 0) {
                            return Client.NoContent(req, res, next);
                        } else {
                            return Client.Success(req, res, next, article.statements);
                        }
                    }, 'statements');
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

