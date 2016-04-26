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
    Token: '',
    TestUser1: {
        handle: 'testuser1',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@abc.com',
        status : 1
    },
    User: {
        first_name: 'Tester',
        last_name: 'Guy',
        email: 'marius+tinynews_testguy@gmail.com',
        password: 'test12345',
        status : 0,
        userProfile: {
            about_me: 'I am a programmer working at a nodejs project',
            city: 'Bangalore',
            country: 'India',
            phone_home: '+91-963-2995608',
            phone_mobile: '0183-25654332',
            state: 'Punjab',
            street1: '1 Norwalk Drive',
            street2: '5th cross, 17th main',
            website_url: 'http://www.google.com',
            zip: '143001',
            userBackground: [{
                description: 'Tinynews project working since 2014',
                organization: 'Dalca',
                title: 'Senior NodeJS developer',
                year_end: 'Current',
                year_start: '2014'
            },{
                description: 'Apple projects US',
                organization: 'Apple Inc',
                title : 'Senior Jive developer',
                year_start: '2012',
                year_end : '2014'
            }]
        }
    },
    UserChanged: {
        first_name: 'Johnny',
        last_name: 'Depp',
        email: 'marius+jdepp@gmail.com',
        password: '12345test'
    },
    FeedSettings: {
        article_filter : 0,
        avg_article_rating : 4,
        factuality_rating : 3,
        importance_rating : 3,
        independence_rating : 2,
        track_public_ratings : 1,
        transparency_rating : 3
    },
    Journalist: {
        first_name: 'Tester',
        last_name: 'Guy',
        slug: 'tester-guy',
        email: 'marius+jdepp@gmail.com',
        status: '1',
        imageUrl : 'http://www.google.com',
        url : 'http://www.google.com'
    },
    Tag: {
        name: 'api-tag'
    },
    Publisher: {
        "name":"asdasdsadsa",
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "url": "http://google.com/glass"
    }
};

// ----------------
//   Test
// ----------------

describe('API - Users :', function() {

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
            json: true
        }, function(e, r, body) {
            TestData.Token = body;
            done();
        });
    });

    // --
    // CRUD Tests
    // --

    test('> POST /user - Creating an User', function(done) {
        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
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
                body.first_name.should.equal(TestData.User.first_name);
                body.last_name.should.equal(TestData.User.last_name);
                body.email.should.equal(TestData.User.email);
                body.handle.should.be.ok;
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

                TestData.User.id = body['@rid'];
                TestData.User.handle = body.handle;

                done();
            }
        });
    });

    test('> POST /user - Creating a User without UserProfile data', function(done) {
        Request.post({
            url: Config.host + '/user',
            body: TestData.TestUser1,
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
                body.first_name.should.equal(TestData.TestUser1.first_name);
                body.last_name.should.equal(TestData.TestUser1.last_name);
                body.email.should.equal(TestData.TestUser1.email);
                body.handle.should.be.ok;
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

                TestData.TestUser1.id = body['@rid'];
                TestData.TestUser1.handle = body.handle;

                done();
            }
        });
    });

    test('> POST /journalist - Creating an Journalist', function(done) {
        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
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
                body.first_name.should.equal(TestData.Journalist.first_name);
                body.last_name.should.equal(TestData.Journalist.last_name);
                body.email.should.equal(TestData.Journalist.email);
                body.imageUrl.should.equal(TestData.Journalist.imageUrl);
                body.url.should.equal(TestData.Journalist.url);
                body.slug.should.be.ok;

                TestData.Journalist.id = body['@rid'];
                TestData.Journalist.handle = body.handle;

                done();
            }
        });
    });

    test('> POST /publisher - Creating an Publisher', function(done) {
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
                body.name.should.equal(TestData.Publisher.name);
                body.imageUrl.should.equal(TestData.Publisher.imageUrl);
                body.url.should.equal(TestData.Publisher.url);
                body.slug.should.be.ok;

                TestData.Publisher.id = body['@rid'];
                TestData.Publisher.slug = body.slug;

                done();
            }
        });
    });

    test('> GET /user/:id - Retrieving an User', function(done) {
        Request.get({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                body.first_name.should.equal(TestData.User.first_name);
                body.last_name.should.equal(TestData.User.last_name);
                body.email.should.equal(TestData.User.email);
                body.handle.should.be.ok;
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                done();
            }
        });
    });

    test('> GET /user/:user_id/profile - Fetch a user profile', function(done){
        Request.get({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(200);
            body.about_me.should.equal(TestData.User.userProfile.about_me);
            body.city.should.equal(TestData.User.userProfile.city);
            body.country.should.equal(TestData.User.userProfile.country);
            body.phone_home.should.equal(TestData.User.userProfile.phone_home);
            body.phone_mobile.should.equal(TestData.User.userProfile.phone_mobile);
            body.state.should.equal(TestData.User.userProfile.state);
            body.street1.should.equal(TestData.User.userProfile.street1);
            body.street2.should.equal(TestData.User.userProfile.street2);
            body.website_url.should.equal(TestData.User.userProfile.website_url);
            body.zip.should.equal(TestData.User.userProfile.zip);
            body.creation_date.should.be.ok;
            body.modification_date.should.be.ok;
            body.creation_date.should.equal(body.modification_date);
            body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
            body.userBackground[0].description.should.equal(TestData.User.userProfile.userBackground[0].description);
            body.userBackground[1].description.should.equal(TestData.User.userProfile.userBackground[1].description);
            body.userBackground[0].creation_date.should.be.ok;
            body.userBackground[0].modification_date.should.be.ok;
            body.userBackground[0].creation_date.should.equal(body.modification_date);
            body.userBackground[0].creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
            done()

        })
    });

    test('> GET /user/:user_id/feed/settings - Fetch feed settings for a user', function(done){
        Request.get({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(200);
            body.article_filter.should.equal(0);
            body.track_public_ratings.should.equal(0);
            body.avg_article_rating.should.equal(4);
            body.creation_date.should.be.ok;
            body.modification_date.should.be.ok;
            body.creation_date.should.equal(body.modification_date);
            body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

            done()

        })
    });

    test('> POST /user/:user_id/feed/settings/journalist - Add a journalist in UserFeedSettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/journalist',
            body: {journalist_id :TestData.Journalist.id},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(200);
            body.should.equal("Journalist Added");
            done()

        })
    });

    test('> DEL /user/:user_id/feed/settings/journalist - Delete a journalist in UserFeedSettings', function(done){
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/journalist/' + RID.Encode(TestData.Journalist.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(204);
            done()

        })
    });

    test('> POST /user/:user_id/feed/settings/publisher - Add a publisher in UserFeedSettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/publisher',
            body: {publisher_id :TestData.Publisher.id},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(200);
            body.should.equal("Publisher Added");
            done()

        })
    });

    test('> DEL /user/:user_id/feed/settings/publisher - Delete a publisher in UserFeedSettings', function(done){
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/publisher/' + RID.Encode(TestData.Publisher.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(204);
            done()

        })
    });

    test('> POST /user/:user_id/feed/settings/friend - Add a friend in UserFeedSettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/friend',
            body: { friend_id: TestData.TestUser1.id },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body){
            r.statusCode.should.equal(200);
            body.should.equal("Friend Added");
            done()

        })
    });

    test('> DEL /user/:user_id/feed/settings/friend - Delete a friend in UserFeedSettings', function(done){
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/friend/' + RID.Encode(TestData.TestUser1.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(204);
            done()

        })
    });

    test('> PUT /user/:id - Updating an User', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: TestData.UserChanged,
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

                // --
                // Step 1: Check the immediate response
                // --

                body['@rid'].should.be.ok;
                body.first_name.should.equal(TestData.UserChanged.first_name);
                body.last_name.should.equal(TestData.UserChanged.last_name);
                body.email.should.equal(TestData.UserChanged.email);
                body.handle.should.be.ok;

                // Slug should remain unchanged
                body.handle.should.equal(TestData.User.handle);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                        body.first_name.should.equal(TestData.UserChanged.first_name);
                        body.last_name.should.equal(TestData.UserChanged.last_name);
                        body.email.should.equal(TestData.UserChanged.email);
                        body.handle.should.be.ok;

                        // Slug should remain unchanged
                        body.handle.should.equal(TestData.User.handle);

                        done();
                    }
                });
            }
        });
    });

    test('> LIST /users - Listing Users With Status Validating', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/users/validating',
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
                    if (body[i]['@rid'] == TestData.User.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    test('> PUT /user/:id - Updating an User Status to Locked', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: {status: 2},
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

                // --
                // Step 1: Check the immediate response
                // --

                body['@rid'].should.be.ok;
                body.status.should.equal(2);
                body.handle.should.be.ok;

                // Slug should remain unchanged
                body.handle.should.equal(TestData.User.handle);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                        body.status.should.equal(2);
                        body.handle.should.be.ok;

                        // Slug should remain unchanged
                        body.handle.should.equal(TestData.User.handle);

                        done();
                    }
                });
            }
        });
    });

    test('> LIST /users - Listing Users With Status Locked', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/users/locked',
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
                    if (body[i]['@rid'] == TestData.User.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    test('> PUT /user/:id - Updating an User Status to Active', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: {status: 1},
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

                // --
                // Step 1: Check the immediate response
                // --

                body['@rid'].should.be.ok;
                body.status.should.equal(1);
                body.handle.should.be.ok;

                // Slug should remain unchanged
                body.handle.should.equal(TestData.User.handle);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                        body.status.should.equal(1);
                        body.handle.should.be.ok;

                        // Slug should remain unchanged
                        body.handle.should.equal(TestData.User.handle);

                        done();
                    }
                });
            }
        });
    });

    test('> LIST /users - Listing Users With Status Active', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/users/active',
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
                    if (body[i]['@rid'] == TestData.User.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    test('> PUT /user/:id - Updating an User Status Back', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: {status: TestData.User.status},
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

                // --
                // Step 1: Check the immediate response
                // --

                body['@rid'].should.be.ok;
                body.status.should.equal(TestData.User.status);
                body.handle.should.be.ok;

                // Slug should remain unchanged
                body.handle.should.equal(TestData.User.handle);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                        body.status.should.equal(TestData.User.status);
                        body.handle.should.be.ok;

                        // Slug should remain unchanged
                        body.handle.should.equal(TestData.User.handle);

                        done();
                    }
                });
            }
        });
    });

    test('> PUT /user/:id/feed/settings - Updating User feedsettings', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) +'/feed/settings',
            body: TestData.FeedSettings,
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

                // --
                // Step 1: Check the immediate response
                // --

                body['@rid'].should.be.ok;
                body.article_filter.should.equal(TestData.FeedSettings.article_filter);
                body.track_public_ratings.should.equal(TestData.FeedSettings.track_public_ratings);
                body.avg_article_rating.should.equal(TestData.FeedSettings.avg_article_rating);
                body.factuality_rating.should.equal(TestData.FeedSettings.factuality_rating);
                body.importance_rating.should.equal(TestData.FeedSettings.importance_rating);
                body.independence_rating.should.equal(TestData.FeedSettings.independence_rating);
                body.transparency_rating.should.equal(TestData.FeedSettings.transparency_rating);

                 // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
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
                        body.article_filter.should.equal(TestData.FeedSettings.article_filter);
                        body.track_public_ratings.should.equal(TestData.FeedSettings.track_public_ratings);
                        body.avg_article_rating.should.equal(TestData.FeedSettings.avg_article_rating);
                        body.factuality_rating.should.equal(TestData.FeedSettings.factuality_rating);
                        body.importance_rating.should.equal(TestData.FeedSettings.importance_rating);
                        body.independence_rating.should.equal(TestData.FeedSettings.independence_rating);
                        body.transparency_rating.should.equal(TestData.FeedSettings.transparency_rating);

                        done();
                    }
                });
            }
        });
    });

    test('> LIST /users - Listing Users', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/users',
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
                    if (body[i]['@rid'] == TestData.User.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    // --
    // Integrity Tests
    // --

    test('> Integrity: GET /user/:id - Retrieving a User should not return their password', function(done) {
        Request.get({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                body.should.not.have.property('password');
                done();
            }
        });
    });

    test('> Integrity: GET /users - Retrieving User list should not return their passwords', function(done) {
        Request.get({
            url: Config.host + '/users',
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
                for (var i in body) {
                    body[i].should.not.have.property('password');
                }
                done();
            }
        });
    });

    test('> Integrity: GET /user/:id with invalid @rid should 400', function(done) {
        Request.get({
            url: Config.host + '/user/asddasd',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: GET /user/:id with non-existent @rid should 404', function(done) {
        Request.get({
            url: Config.host + '/user/0.0',
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
    });

    test('> Integrity: PUT /user/:id with invalid @rid should 400', function(done) {
        Request.put({
            url: Config.host + '/user/asddasd',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:id with non-existent @rid should 404', function(done) {
        Request.put({
            url: Config.host + '/user/0.0',
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
    });

    test('> Integrity: DELETE /user/:id with invalid @rid should 400', function(done) {
        Request.del({
            url: Config.host + '/user/asddasd',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: DELETE /user/:id with non-existent @rid should 404', function(done) {
        Request.del({
            url: Config.host + '/user/0.0',
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
    });

    test('> Integrity: POST /user with supplied :handle & @rid should be ignored, and remain unique', function(done) {
        // !! Relies on earlier verification that a handle exists.

        var old = TestData.User.email;
        TestData.User.email = 'marius+tg_changed@gmail.com';

        Request.post({
            url: Config.host + '/user',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            body: TestData.User,
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.first_name.should.equal(TestData.User.first_name);
                body.last_name.should.equal(TestData.User.last_name);
                body.email.should.equal(TestData.User.email);
                body.handle.should.be.ok;

                // Main Tests
                body.handle.should.not.equal( TestData.User.handle );
                body['@rid'].should.not.equal( TestData.User.id );

                // Clean up after ourself
                TestData.User.email = old;

                Request.del({
                    url: Config.host + '/user/' + RID.Encode(body['@rid']),
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
            }
        });
    });

    test('> Integrity: POST /user with invalid :first_name [ too short ] should be rejected', function(done) {
        var old = TestData.User.first_name;
        TestData.User.first_name = '';

        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.User.first_name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /user with invalid :first_name [ too long ] should be rejected', function(done) {
        var old = TestData.User.first_name;

        Crypto.randomBytes(65, function(ex, buf) {
            TestData.User.first_name = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.first_name = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user with invalid :last_name [ too short ] should be rejected', function(done) {
        var old = TestData.User.last_name;
        TestData.User.last_name = '';

        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.User.last_name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /user with invalid :last_name [ too long ] should be rejected', function(done) {
        var old = TestData.User.last_name;

        Crypto.randomBytes(65, function(ex, buf) {
            TestData.User.last_name = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.last_name = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user with invalid :password [ too short ] should be rejected', function(done) {
        var old = TestData.User.password;
        TestData.User.password = '';

        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.User.password = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /user with invalid :password [ too long ] should be rejected', function(done) {
        var old = TestData.User.password;

        Crypto.randomBytes(65, function(ex, buf) {
            TestData.User.password = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.password = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user with invalid :email [ too short ] should be rejected', function(done) {
        var old = TestData.User.email;
        TestData.User.email = '';

        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.User.email = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /user with invalid :email [ too long ] should be rejected', function(done) {
        var old = TestData.User.email;

        Crypto.randomBytes(130, function(ex, buf) {
            TestData.User.email = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.email = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user with invalid :email [ invalid ] should be rejected', function(done) {
        var old = TestData.User.email;

        TestData.User.email = 'not_a_valid_email';

        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            TestData.User.email = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:id with invalid :first_name [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: { first_name: '' },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:id with invalid :first_name [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id),
                body: { first_name: buf.toString('hex') },
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:id with invalid :last_name [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: { last_name: '' },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:id with invalid :last_name [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id),
                body: { first_name: buf.toString('hex') },
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:id with invalid :password [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: { password: '' },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:id with invalid :password [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id),
                body: { password: buf.toString('hex') },
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:id with invalid :email [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: { email: '' },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:id with invalid :email [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(130, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id),
                body: { email: buf.toString('hex') },
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:id with invalid :email [ invalid ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
            body: { email: 'not_a_valid_email' },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    /* UserProfile Integrity */
    test('> Integrity: POST /user/:user_id/profile with invalid :phone_mobile [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.phone_mobile;
        TestData.User.userProfile.phone_mobile = '987654332512615672681763827sighishi';

        Request.post({
            url: Config.host + '/user',
            body: TestData.User,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.User.userProfile.phone_mobile = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :about_me [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.about_me;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.User.userProfile.about_me = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.about_me = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :city [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.city;

        Crypto.randomBytes(77, function(ex, buf) {
            TestData.User.userProfile.city = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.city = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :state [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.state;

        Crypto.randomBytes(77, function(ex, buf) {
            TestData.User.userProfile.state = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.state = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :website_url [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.website_url;

        Crypto.randomBytes(77, function(ex, buf) {
            TestData.User.userProfile.website_url = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.website_url = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :description [0][ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[0].description;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.User.userProfile.userBackground[0].description = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[0].description = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :description  [1][ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[1].description;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.User.userProfile.userBackground[1].description = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[1].description = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :organization [0] [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[0].organization;

        Crypto.randomBytes(129, function(ex, buf) {
            TestData.User.userProfile.userBackground[0].organization = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[0].organization = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :title [0] [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[0].title;

        Crypto.randomBytes(129, function(ex, buf) {
            TestData.User.userProfile.userBackground[0].title = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[0].title = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :year_start [0] [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[0].year_start;

        Crypto.randomBytes(11, function(ex, buf) {
            TestData.User.userProfile.userBackground[0].year_start = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[0].year_start = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :title [1] [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[1].title;

        Crypto.randomBytes(129, function(ex, buf) {
            TestData.User.userProfile.userBackground[1].title = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[1].title = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: POST /user/:user_id/profile with invalid :year_end [0] [ invalid ] should be rejected', function(done) {
        var old = TestData.User.userProfile.userBackground[0].year_end;

        Crypto.randomBytes(129, function(ex, buf) {
            TestData.User.userProfile.userBackground[0].year_end = buf.toString('hex');

            Request.post({
                url: Config.host + '/user',
                body: TestData.User,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.User.userProfile.userBackground[0].year_end = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid @rid should 400', function(done) {
        Request.put({
            url: Config.host + '/user/asddasd/profile',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :about_me [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1025, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ about_me: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :city [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(66, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ city: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :country [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ country: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :phone_mobile [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(17, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ phone_mobile: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :phone_home [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(17, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ phone_home: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :state [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ state: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :street1 [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ street1: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :street2 [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ street2: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :website_url [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ website_url: buf.toString('hex') }},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :description [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1025, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ userBackground:[{ description : buf.toString('hex') }]}},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/user_:id/profile with invalid :organization [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(129, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ userBackground:[{ organization : buf.toString('hex') }]}},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :title [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(129, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ userBackground:[{ title : buf.toString('hex') }]}},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :year_end [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(11, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ userBackground:[{ year_end : buf.toString('hex') }]}},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    test('> Integrity: PUT /user/:user_id/profile with invalid :year_start [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(11, function(ex, buf) {
            Request.put({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/profile',
                body: {userProfile:{ userBackground:[{ year_start : buf.toString('hex') }]}},
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
        });
    });

    /* Feed Settngs Integrity Tests */
    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :article_filter [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.article_filter;
        TestData.FeedSettings.article_filter = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.article_filter},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.article_filter = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :avg_article_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.avg_article_rating;
        TestData.FeedSettings.avg_article_rating = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.avg_article_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.avg_article_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :factuality_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.factuality_rating;
        TestData.FeedSettings.factuality_rating = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.factuality_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.factuality_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :importance_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.importance_rating;
        TestData.FeedSettings.importance_rating = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.importance_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.importance_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :independence_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.independence_rating;
        TestData.FeedSettings.independence_rating = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.independence_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.independence_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :track_public_ratings [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.track_public_ratings;
        TestData.FeedSettings.track_public_ratings = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.track_public_ratings},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.track_public_ratings = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :transparency_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.transparency_rating;
        TestData.FeedSettings.transparency_rating = 6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.transparency_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.transparency_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :transparency_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.transparency_rating;
        TestData.FeedSettings.transparency_rating = 'Munish Chopra';
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.transparency_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.transparency_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :transparency_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.transparency_rating;
        TestData.FeedSettings.transparency_rating = 6.6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.transparency_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.transparency_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :transparency_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.transparency_rating;
        TestData.FeedSettings.transparency_rating = 2.6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.transparency_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.transparency_rating = old;
                done();
            }
        });
    });

    test('> Integrity: PUT /user/:user_id/feed/settings with invalid :transparency_rating [ invalid value ] should be rejected', function(done) {
        var old = TestData.FeedSettings.transparency_rating;
        TestData.FeedSettings.transparency_rating = 2.6;
        Request.put({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings',
            body: {article_filter : TestData.FeedSettings.transparency_rating},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                TestData.FeedSettings.transparency_rating = old;
                done();
            }
        });
    });

    // --
    // Suite Teardown
    // --

    test('> DELETE /journalist/:id - Deleting an Journalist', function(done) {
        Request.del({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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
                    url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> DELETE /publisher/:id - Deleting an Publisher', function(done) {
        Request.del({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
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
                    url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
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

    test('> DELETE /user/:id - Deleting an User', function(done) {
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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
                    url: Config.host + '/user/' + RID.Encode(TestData.User.id),
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

    test('> DELETE /user/:id - Deleting 2nd User', function(done) {
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.TestUser1.id),
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
                    url: Config.host + '/user/' + RID.Encode(TestData.TestUser1.id),
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
        done();
    });

});
