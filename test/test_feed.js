// ----------------
//   Dependencies
// ----------------

var Config      = require('../config.json');
var should      = require('should');
var Request     = require('request');
var RID         = require('../utils/rid');
var Crypto      = require('crypto');

var test = it;

// ----------------
//   Test Data
// ----------------

var TestData = {
    TestSourceFeed: {
        title: "BBC News",
        url: "http://www.bbc.co.uk/blogs/magazinemonitor/rss.xml",
        endpoint: ""
    },
    Publisher: {
        name: 'test publisher',
        url: 'http://sample.test.publisher',
        imageUrl: 'http://image.test.publisher',
        summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: 'Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: 'Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: 'Somebody Cool',
        owner_url: 'http://somecoolcompany.com',
        twitter: 'test.publisher',
        facebook: 'testpub'
    }
};

// ----------------
//   Test
// ----------------

describe('API - SourceFeeds :', function() {

    // --
    // Suite Setup
    // --

    before(function(done) {
        Request.post({
            url: Config.host + '/auth/token',
            headers: {
                "X-Auth-User": "admin",
                "X-Auth-Password": "administrator"
            },
            json:true
        }, function(e, r, body) {
            TestData.Token = body;

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function(e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(200);
                    body['@rid'].should.be.ok;
                    TestData.Publisher['@rid'] = body['@rid'];
                    TestData.TestSourceFeed.publisher_id = body['@rid'];
                    done();
                }
            });
        })
    });

    // --
    // CRUD Tests
    // --

    test('> POST /feed - Creating a new Subscription', function(done) {
        Request.post({
            url: Config.host + '/feed',
            body: TestData.TestSourceFeed,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.url.should.equal(TestData.TestSourceFeed.url);
                body.title.should.equal(TestData.TestSourceFeed.title);
                body.slug.should.be.ok;

                TestData.TestSourceFeed.id = body['@rid'];
                TestData.TestSourceFeed.slug = body.slug;

                done();
            }
        });
    });

    test('> GET /feed/:feed_id - Retrieving a SourceFeed', function(done) {
        Request.get({
            url: Config.host + '/feed/' + RID.Encode(TestData.TestSourceFeed.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.url.should.equal(TestData.TestSourceFeed.url);
                body.title.should.equal(TestData.TestSourceFeed.title);
                body.slug.should.equal(TestData.TestSourceFeed.slug);

                done();
            }
        });
    });

    test('> LIST /feeds - Listing SourceFeeds', function(done) {
        Request.get({
            url: Config.host + '/feeds',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body.should.be.an.Array;
                body.length.should.be.ok;

                var exists = false;
                for (var i in body) {
                    if (body[i]['@rid'] == TestData.TestSourceFeed.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    test('> GetFeedItems /feeds - Get Feed items', function(done) {
        Request.get({
            url: Config.host + '/feed/' + RID.Encode(TestData.TestSourceFeed.id) + "/items",
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body.should.be.ok;
                done();
            }
        });
    });

    // --
    // Suite Teardown
    // --

    test('> DELETE /feed/:feed_id - Unsubscribe', function(done) {
        Request.del({
            url: Config.host + '/feed/' + RID.Encode(TestData.TestSourceFeed.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(204);
                should(body).not.be.ok;
                // --
                // Step 2: Verify the object is still gone.
                // --

                Request.get({
                    url: Config.host + '/feed/' + RID.Encode(TestData.TestSourceFeed.id),
                    headers: {
                        "X-Auth-Token": TestData.Token.token
                    },
                    json: true
                }, function(e, r, body) {
                    if (e) {
                        throw e;
                        done(e);
                    } else {
                        r.statusCode.should.equal(404);
                        done();
                    }
                });
            }
        });
    });

    after(function(done) {
        Request.del({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher['@rid']),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(204);
                done();
            }
        });
    });

});