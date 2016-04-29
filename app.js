// ----------------
//   Dependencies
// ----------------

var Restify             = require('restify');
var Cluster             = require('cluster');
var Util                = require('util');
var Client              = require('./utils/client');
var URL                 = require('url');

// Config
var Config              = require('./config.json');
var Package             = require('./package.json');

// Shared Core
var Core                = require('tinynews-common');
var Tokens              = Core.Auth.Tokens;

// --------------------------
//   Server Settings & Init
// --------------------------

var Settings = {
    cpu_cores:      require('os').cpus().length,
    port:           Config.server_port
}

// ------------------------
//   Start Server
// ------------------------

if (Cluster.isMaster && Config.use_cluster) {
    // -----------------
    // --
    //  Cluster Master
    // --
    // -----------------

    Util.log('Tinynews API Master Started ...');

    // Start as many workers as we have CPU cores
    for (var i = 1; i <= Settings.cpu_cores; i++) {
        Cluster.fork();
    }

    Cluster.on('disconnect', function(worker) {
        Util.log('Worker Disconnect!');
        Cluster.fork();
    });

} else {
    // -----------------
    // --
    //  Workers
    // --
    // -----------------

    Util.log('Tinynews API Worker Started ...');

    // -----------------------
    //   Worker Dependencies
    // -----------------------

    // Controllers
    var UserController              = require('./controllers/user');
    var ArticleController           = require('./controllers/article');
    var ArticleFactController       = require('./controllers/article_fact');
    var ArticleStatementController  = require('./controllers/article_statement');
    var PublisherController         = require('./controllers/publisher');
    var CommentController           = require('./controllers/comment');
    var JournalistController        = require('./controllers/journalist');
    var UserProfileController       = require('./controllers/userprofile');
    var UserFeedSettingsController  = require('./controllers/userfeedsettings');
    var GroupController             = require('./controllers/group');
    var AuthController              = require('./controllers/auth');
    var FeedController              = require('./controllers/feed');
    var TagController               = require('./controllers/tag');
    var SearchController            = require('./controllers/search');

    // -----------------
    //   Create Server
    // -----------------
    var server = Restify.createServer({
        name                  : 'Tinynews-API',
        version               : Package.version,
        accept                : ['application/json'],
        responseTimeHeader    : 'X-Runtime',
        responseTimeFormatter : function(durationInMilliseconds) {
            return durationInMilliseconds / 1000;
        }
    });

    // Throttle protection
    server.use(Restify.throttle({
        burst: Config.throttle.burst,
        rate: Config.throttle.rate,
        ip: Config.throttle.ip,
        xff: Config.throttle.xff
    }));

    // Auto parse query parameters into req.params
    server.use(Restify.queryParser());

    // Skip other body types, only parse json
    server.use(Restify.jsonBodyParser());

    // Enable compressed responses
    server.use(Restify.gzipResponse());

    // Check for a token
    server.use(function(req, res, next) {
        //return next();

        // TODO: Re-enable protcol and token checks
        /*if (req.headers['x-forwarded-proto'] != Config.protocol) {
         res.header('Location', 'https://' + req.headers.host + req.url);
         res.send(302);
         return next(false);
         }*/
        if(req.url != '/auth/token') {
            if (req.headers['x-auth-token']) {
                Tokens.Authenticate(req.headers['x-auth-token'], function(token) {
                    req.token = token;
                    if (req.token.is_valid) {
                        res.header('X-Token-Valid-For', parseInt(token.expires - (new Date().getTime() / 1000)));
                        return next();
                    } else {
                        return Client.NotAuthorized(req, res);
                    }
                });
            } else if (!req.headers['X-Auth-Token'] && req.params.stripe_id) {
                if (req.params.stripe_id == Config.stripe.identifier) {
                    return next();
                } else {
                    return Client.NotAuthorized(req, res);
                }
            } else {
                return Client.NotAuthorized(req, res);
            }
        } else{
            return next();
        }
    });

    // Normalize/sanitize paths
    server.pre(Restify.pre.sanitizePath());

    // This runs prior to route functions
    server.pre(function(req, res, next) {
        // Query params for GET are not available at this point.  Parse them manually.
        var params = URL.parse(req.href(), true).query;

        Util.log(req.method + ' ' + req.href());

        // Allow method overrides (for stuff like ajax that can't do PUT/DELETE etc)
        req.method = (params._method) ? params._method.toUpperCase() : req.method;
        return next();
    });

    // ----------------
    //   API Routing
    // ----------------

    /** System **/
    server.get({ path: '/monitor',                          version: '1.0.0' },         AuthController.Monitor);

    /** Authentication **/
    server.post(
        {
            path: '/auth/token',
            version: '1.0.0'
        },
        Restify.throttle({ burst: 3, rate: 1, ip: false, xff: true }),
        AuthController.Create
    );

    /** User **/
    server.get({ path: '/users',                            version: '1.0.0' },         UserController.List);
    server.get({ path: '/user/:user_id',                    version: '1.0.0' },         UserController.Retrieve);
    server.put({ path: '/user/:user_id',                    version: '1.0.0' },         UserController.Update);
    server.del({ path: '/user/:user_id',                    version: '1.0.0' },         UserController.Delete);
    server.post({ path: '/user',                            version: '1.0.0' },         UserController.Create);

    server.get({ path: '/users/validating',                 version: '1.0.0' },         UserController.ListValidating);
    server.get({ path: '/users/active',                     version: '1.0.0' },         UserController.ListActive);
    server.get({ path: '/users/locked',                     version: '1.0.0' },         UserController.ListLocked);


    server.get({ path: '/user/:user_id/friends',            version: '1.0.0' },         UserController.ListFriends);
    server.post({ path: '/user/friend',                     version: '1.0.0' },         UserController.AddFriend);

    /** Feed **/
    server.get({ path: '/feeds',                            version: '1.0.0' },         FeedController.List);
    server.post({ path: '/feed',                            version: '1.0.0' },         FeedController.Subscribe);
    server.get({ path: '/feed/:feed_id',                    version: '1.0.0' },         FeedController.Retrieve);
    server.del({ path: '/feed/:feed_id',                    version: '1.0.0' },         FeedController.Unsubscribe);
    server.get({ path: '/feed/:feed_id/items',              version: '1.0.0' },         FeedController.GetFeedItems);

    /** Tag **/
    server.get({ path: '/tags',                             version: '1.0.0' },         TagController.List);
    server.get({ path: '/tags/search',                      version: '1.0.0' },         TagController.Search);
    server.get({ path: '/tag/:tag_id',                      version: '1.0.0' },         TagController.Retrieve);
    server.put({ path: '/tag/:tag_id',                      version: '1.0.0' },         TagController.Update);
    server.del({ path: '/tag/:tag_id',                      version: '1.0.0' },         TagController.Delete);
    server.post({ path: '/tag',                             version: '1.0.0' },         TagController.Create);

    /** Article **/
    server.get({ path: '/articles',                         version: '1.0.0' },         ArticleController.List);
    server.get({ path: '/articles/featured',                version: '1.0.0' },         ArticleController.GetFeatured);
    server.get({ path: '/article/:article_id',              version: '1.0.0' },         ArticleController.Retrieve);
    server.put({ path: '/article/:article_id',              version: '1.0.0' },         ArticleController.Update);
    server.del({ path: '/article/:article_id',              version: '1.0.0' },         ArticleController.Delete);
    server.get({ path: '/article/:article_id/rating',       version: '1.0.0' },         ArticleController.GetUserRating);
    server.post({ path: '/article',                         version: '1.0.0' },         ArticleController.Create);
    server.post({ path: '/article/:article_id/rate',        version: '1.0.0' },         ArticleController.Rate);
    server.post({ path: '/article/:article_id/publisher',   version: '1.0.0' },         ArticleController.AssignPublisher);
    server.post({ path: '/article/:article_id/journalist',  version: '1.0.0' },         ArticleController.AssignJournalist);

    /** ArticleFact **/
    server.get({ path: '/article/:article_id/facts',            version: '1.0.0' },     ArticleFactController.List);
    server.get({ path: '/article/:article_id/fact/:fact_id',    version: '1.0.0' },     ArticleFactController.Retrieve);
    server.put({ path: '/article/:article_id/fact/:fact_id',    version: '1.0.0' },     ArticleFactController.Update);
    server.del({ path: '/article/:article_id/fact/:fact_id',    version: '1.0.0' },     ArticleFactController.Delete);
    server.post({ path: '/article/:article_id/fact',            version: '1.0.0' },     ArticleFactController.Create);

    /** ArticleStatement **/
    server.get({ path: '/article/:article_id/statements',          version: '1.0.0' },  ArticleStatementController.List);
    server.get({ path: '/article/:article_id/statement/:stmt_id',  version: '1.0.0' },  ArticleStatementController.Retrieve);
    server.put({ path: '/article/:article_id/statement/:stmt_id',  version: '1.0.0' },  ArticleStatementController.Update);
    server.del({ path: '/article/:article_id/statement/:stmt_id',  version: '1.0.0' },  ArticleStatementController.Delete);
    server.post({ path: '/article/:article_id/statement',          version: '1.0.0' },  ArticleStatementController.Create);

    /** Journalist **/
    server.get({ path: '/journalists',                      version: '1.0.0' },         JournalistController.List);
    server.get({ path: '/journalists/search',               version: '1.0.0' },         JournalistController.Search);
    server.get({ path: '/journalist/:journalist_id',        version: '1.0.0' },         JournalistController.Retrieve);
    server.put({ path: '/journalist/:journalist_id',        version: '1.0.0' },         JournalistController.Update);
    server.del({ path: '/journalist/:journalist_id',        version: '1.0.0' },         JournalistController.Delete);
    server.post({ path: '/journalist',                      version: '1.0.0' },         JournalistController.Create);

    server.get({ path: '/journalists/mine',                 version: '1.0.0' },         JournalistController.MyJournalists);
    server.get({ path: '/journalists/recent',               version: '1.0.0' },         JournalistController.RecentlyRated);
    server.get({ path: '/journalists/friends',              version: '1.0.0' },         JournalistController.RecentlyRatedFriends);
    server.get({ path: '/journalists/toprated',             version: '1.0.0' },         JournalistController.TopRated);

    /** Publisher **/
    server.get({ path: '/publishers',                       version: '1.0.0' },         PublisherController.List);
    server.get({ path: '/publishers/search',                version: '1.0.0' },         PublisherController.Search);
    server.get({ path: '/publisher/:publisher_id',          version: '1.0.0' },         PublisherController.Retrieve);
    server.put({ path: '/publisher/:publisher_id',          version: '1.0.0' },         PublisherController.Update);
    server.del({ path: '/publisher/:publisher_id',          version: '1.0.0' },         PublisherController.Delete);
    server.post({ path: '/publisher',                       version: '1.0.0' },         PublisherController.Create);

    server.get({ path: '/publishers/mine',                  version: '1.0.0' },         PublisherController.MyPublishers);
    server.get({ path: '/publishers/recent',                version: '1.0.0' },         PublisherController.RecentlyRated);
    server.get({ path: '/publishers/friends',               version: '1.0.0' },         PublisherController.RecentlyRatedFriends);
    server.get({ path: '/publishers/toprated',              version: '1.0.0' },         PublisherController.TopRated);

    /** UserProfile **/
    server.get({ path: '/user/:user_id/profile',            version: '1.0.0' },         UserProfileController.Retrieve);
    server.put({ path: '/user/:user_id/profile',            version: '1.0.0' },         UserProfileController.Update);

    /** User Feed **/
    server.get({ path: '/user/:user_id/feed',               version: '1.0.0' },         ArticleController.FeedList);

    /** FeedSettings **/
    server.get({ path: '/user/:user_id/feed/settings',       version: '1.0.0' },        UserFeedSettingsController.Retrieve);
    server.put({ path: '/user/:user_id/feed/settings',       version: '1.0.0' },        UserFeedSettingsController.Update);

    /** User Account Actions **/
    server.post({ path: '/user/:user_id/confirmation',        version: '1.0.0' },         UserController.ResendConfirmation);

    /** FeedSettings - Journalists **/
    server.post({ path: '/user/:user_id/feed/settings/journalist',              version:  '1.0.0'}, UserFeedSettingsController.CreateJournalist);
    server.del({ path: '/user/:user_id/feed/settings/journalist/:journalist_id',version:  '1.0.0'}, UserFeedSettingsController.DeleteJournalist);

    /** FeedSettings - Publishers **/
    server.post({ path: '/user/:user_id/feed/settings/publisher',               version:  '1.0.0'}, UserFeedSettingsController.CreatePublisher);
    server.del({ path: '/user/:user_id/feed/settings/publisher/:publisher_id',  version:  '1.0.0'}, UserFeedSettingsController.DeletePublisher);

    /** FeedSettings - Tags **/
    server.post({ path: '/user/:user_id/feed/settings/tag',                     version:  '1.0.0'}, UserFeedSettingsController.CreateTag);
    server.del({ path: '/user/:user_id/feed/settings/tag/:tag_id',              version:  '1.0.0'}, UserFeedSettingsController.DeleteTag);

    /** FeedSettings - Friends **/
    server.post({ path: '/user/:user_id/feed/settings/friend',                  version:  '1.0.0'}, UserFeedSettingsController.CreateFriend);
    server.del({ path: '/user/:user_id/feed/settings/friend/:friend_id',        version:  '1.0.0'}, UserFeedSettingsController.DeleteFriend);

    /** FeedSettings - Groups **/
    server.post({ path: '/user/:user_id/feed/settings/group',                   version:  '1.0.0'}, UserFeedSettingsController.CreateGroup);
    server.del({ path: '/user/:user_id/feed/settings/group/:group_id',          version:  '1.0.0'}, UserFeedSettingsController.DeleteGroup);

    /** Group **/
    server.get({ path: '/groups',                                   version: '1.0.0' },        GroupController.List);
    server.get({ path: '/group/:group_id',                          version: '1.0.0' },        GroupController.Retrieve);
    server.put({ path: '/group/:group_id',                          version: '1.0.0' },        GroupController.Update);
    server.del({ path: '/group/:group_id',                          version: '1.0.0' },        GroupController.Delete);
    server.post({ path: '/group',                                   version: '1.0.0' },        GroupController.Create);

    /** Groups - Members **/
    server.post({ path: '/group/:group_id/member',                  version: '1.0.0' },        GroupController.CreateMember);
    server.del({ path: '/group/:group_id/member/:member_id',        version: '1.0.0' },        GroupController.DeleteMember);
    server.get({ path: '/group/:group_id/members',                  version: '1.0.0' },        GroupController.ListMembers);

    /** Groups - Moderators **/
    server.post({ path: '/group/:group_id/moderator',               version: '1.0.0' },        GroupController.CreateMod);
    server.del({ path: '/group/:group_id/moderator',                version: '1.0.0' },        GroupController.DeleteMod);

    /** Search **/
    server.get({ path: '/search',                                   version: '1.0.0' },        SearchController.GlobalSearch);

    /** Comments **/
    server.post({ path: '/publisher/:owner_id/comment',            version: '1.0.0' },         CommentController.Create);
    server.post({ path: '/journalist/:owner_id/comment',           version: '1.0.0' },         CommentController.Create);
    server.post({ path: '/article/:owner_id/comment',              version: '1.0.0' },         CommentController.Create);

    server.post({ path: '/publisher/:owner_id/comment/:comment_id',    version: '1.0.0' },     CommentController.Create);
    server.post({ path: '/journalist/:owner_id/comment/:comment_id',   version: '1.0.0' },     CommentController.Create);
    server.post({ path: '/article/:owner_id/comment/:comment_id',      version: '1.0.0' },     CommentController.Create);

    server.get({ path: '/publisher/:publisher_id/comment',             version: '1.0.0' },     CommentController.PublisherComments);
    server.get({ path: '/journalist/:journalist_id/comment',           version: '1.0.0' },     CommentController.JournalistComments);
    server.get({ path: '/article/:article_id/comment',                 version: '1.0.0' },     CommentController.ArticleComments);

    server.del({ path: '/journalist/:owner_id/comment/:comment_id',     version: '1.0.0' },     CommentController.Delete);
    server.del({ path: '/publisher/:owner_id/comment/:comment_id',      version: '1.0.0' },     CommentController.Delete);
    server.del({ path: '/article/:owner_id/comment/:comment_id',        version: '1.0.0' },     CommentController.Delete);

    server.put({ path: '/journalist/:owner_id/comment/:comment_id',     version: '1.0.0' },     CommentController.Update);
    server.put({ path: '/publisher/:owner_id/comment/:comment_id',      version: '1.0.0' },     CommentController.Update);
    server.put({ path: '/article/:owner_id/comment/:comment_id',        version: '1.0.0' },     CommentController.Update);

    server.post({ path: '/comment/:comment_id/vote/:vote',              version: '1.0.0' },     CommentController.CommentVote);
    server.get({ path: '/comment/:comment_id/vote/',                    version: '1.0.0' },     CommentController.GetVotes);

    // -----------------
    //   Server Events
    // -----------------

    server.on('NotFound', function(req, res, next) {
        return Client.NotFound(req, res, next, 'Invalid API endpoint.');
    });

    server.on('NotAuthorized', function(req, res, next) {
        return Client.NotAuthorized(req, res, next);
    });

    server.on('uncaughtException', function (req, res, route, err) {
        Client.ServerError(req, res);
        Util.log('Error in: ', route);
        Util.inspect(err);

        // stop taking new requests.
        server.close();

        // Tell the master we're toast
        if (Config.use_cluster) Cluster.worker.disconnect();

        // Give other requests 5 seconds to finish
        var killtimer = setTimeout(function() {
            process.exit(1);
        }, 5000);

        // But don't keep the process open just for that!
        killtimer.unref();

        return;
    });

    // --------------------
    //   Start the Server
    // --------------------

    Core.Database.connect(Core.Config, function(e) {
        if (e) {
            Util.log(e);
            Util.log("Tinynews API shutting down...");
        } else {
            Util.log("OrientDB connection available.");
            server.listen(Settings.port, function() {
                Util.log('Worker Listening: ' + server.url);
            });
        }
    });

}
