// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var ElasticSearch       = require('elasticsearch');

// Shared Core
var Core                = require('tinynews-common');
var Tokens              = Core.Auth.Tokens;

// Models
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
     * Search globally through all indexes data types.
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    GlobalSearch: function(req, res, next, body) {
        var pageNum = 1;
        var perPage = 10;

        try {
            var errors = new Validate();
            /** Query String **/
            errors.AssertTrue('isLength', [req.params.query, 1, 256],       'Body parameter :query must be between 1 and 256 characters.');
            errors.AssertFalse('isNull',  [req.params.query],               'Body parameter :query may not be null.');
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
                index: Core.Config.elastic.index,
                from: (pageNum - 1) * perPage,
                size: perPage,
                q: req.params.query
            }, function (error, response) {
                if (error) {
                    console.log(err, err.stack);
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