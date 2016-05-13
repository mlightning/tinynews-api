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
    Token : '',
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
    },
    Publisher1: {
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
    },
    Publisher2: {
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
    },
    PublisherChanged: {
        name: 'test publisher changed',
        url: 'http://changed.test.publisher',
        imageUrl: 'http://image.changed.publisher',
        summary: '2 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu.',
        about: '2 Consectetur adipiscing elit. Pellentesque sapien massa, ullamcorper eu. Praesent gravida purus id consequat dapibus.',
        specialty: '2 Nunc ac ante egestas, interdum massa sed, rutrum libero. Praesent nec elit ipsum.',
        owner: '2 Somebody Cool',
        owner_url: 'http://somecoolcompany2.com',
        twitter: 'test2.publisher2',
        facebook: 'test22pub'
    },
    Article: {
        "body":"asdasdsadsa",
        "featured": 0,
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "post_date": 1397573350,
        "title": "My Awesome Google Glass Article 34567890",
        "url": "http://google.com/glass"
    },
    Article1: {
        "body":"asdasdsadsa",
        "featured": 0,
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "post_date": 1397573350,
        "title": "My Awesome Google Glass Article 34567890",
        "url": "http://google.com/glass"
    },
    Article2: {
        "body":"asdasdsadsa",
        "featured": 0,
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "post_date": 1397573350,
        "title": "My Awesome Google Glass Article 34567890",
        "url": "http://google.com/glass"
    },
    User: {
        first_name: 'Tester',
        last_name: 'Guy',
        email: 'marius+tinynews_testguy@gmail.com',
        password: 'test12345',
        status : 0
    },
    User1: {
        first_name: 'Johnny',
        last_name: 'Depp',
        email: 'marius+jdepp@gmail.com',
        password: '12345test',
        status:1
    }
};

// ----------------
//   Test
// ----------------

describe('API - Publisher :', function() {

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
            done();
        });
    });

    // --
    // CRUD Tests
    // --

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
                body.summary.should.equal(TestData.Publisher.summary);
                body.about.should.equal(TestData.Publisher.about);
                body.specialty.should.equal(TestData.Publisher.specialty);
                body.owner.should.equal(TestData.Publisher.owner);
                body.owner_url.should.equal(TestData.Publisher.owner_url);
                body.twitter.should.equal(TestData.Publisher.twitter);
                body.facebook.should.equal(TestData.Publisher.facebook);
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

                body.slug.should.be.ok;

                TestData.Publisher.id = body['@rid'];
                TestData.Publisher.slug = body.slug;

                done();
            }
        });
    });

    test('> POST /publisher - Creating two more publishers for testing', function(done) {
        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher1,
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

                TestData.Publisher1.id = body['@rid'];
                TestData.Publisher1.slug = body.slug;

                Request.post({
                    url: Config.host + '/publisher',
                    body: TestData.Publisher1,
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
                
                        TestData.Publisher2.id = body['@rid'];
                        TestData.Publisher2.slug = body.slug;

                        done();
                    }
                });
            }
        });
    });

    test('> POST /publisher - Creating two users for testing', function(done) {
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
                TestData.User.id = body['@rid'];
                TestData.User.slug = body.handle;
                Request.post({
                    url: Config.host + '/auth/token',
                    headers: {
                        "X-Auth-User": TestData.User.slug,
                        "X-Auth-Password": TestData.User.password
                    },
                    json:true
                }, function(e, r, body) {
                    TestData.User.Token = body;
                });

                Request.post({
                    url: Config.host + '/user',
                    body: TestData.User1,
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
                        TestData.User1.id = body['@rid'];
                        TestData.User1.slug = body.handle

                        Request.post({
                            url: Config.host + '/auth/token',
                            headers: {
                                "X-Auth-User": TestData.User1.slug,
                                "X-Auth-Password": TestData.User1.password
                            },
                            json:true
                        }, function(e, r, body) {
                            TestData.User1.Token = body;
                        });

                        done();
                    }
                });
            }
        });
    });

    test('> POST /user/friend - Adding friend for testing', function(done) {
        Request.post({
            url: Config.host + '/user/friend',
            body: {friend_id : TestData.User.id},
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body) {
            if (e) {
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body.should.be.true
                Request.post({
                    url: Config.host + '/user/friend',
                    body: {friend_id : TestData.User1.id},
                    headers: {
                        "X-Auth-Token": TestData.Token.token
                    },
                    json:true
                }, function(e, r, body) {
                    if (e) {
                        done(e);
                    } else {
                        r.statusCode.should.equal(200);
                        body.should.be.true
                        done();
                    }
                });
            }
        });
    });

    test('> POST /article - Creating Articles for testing', function(done) {
        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
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
                body.slug.should.be.ok;

                TestData.Article.id = body['@rid'];
                TestData.Article.slug = body.slug;
                // Assign a publisher to this article
                Request.post({
                    url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/publisher',
                    body: {publisher_id: TestData.Publisher.id},
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
                        body.should.be.true;
                        done();
                    }
                });
            }
        });
    });

    test('> POST /article - Creating Articles for testing', function(done) {
        Request.post({
            url: Config.host + '/article',
            body: TestData.Article1,
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
                body.slug.should.be.ok;

                TestData.Article1.id = body['@rid'];
                TestData.Article1.slug = body.slug;
                // Assign a publisher to this article
                Request.post({
                    url: Config.host + '/article/'+ RID.Encode(TestData.Article1.id) +'/publisher',
                    body: {publisher_id: TestData.Publisher1.id},
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
                        body.should.be.true;
                        done();
                    }
                });
            }
        });
    });

    test('> POST /article - Creating Articles for testing', function(done) {
        Request.post({
            url: Config.host + '/article',
            body: TestData.Article2,
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
                body.slug.should.be.ok;

                TestData.Article2.id = body['@rid'];
                TestData.Article2.slug = body.slug;
                // Assign a publisher to this article
                Request.post({
                    url: Config.host + '/article/'+ RID.Encode(TestData.Article2.id) +'/publisher',
                    body: {publisher_id: TestData.Publisher2.id},
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
                        body.should.be.true;
                        done();
                    }
                });
            }
        });
    });

    test('> GET /publisher/:id - Retrieving an Publisher', function(done) {
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
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.name.should.equal(TestData.Publisher.name);
                body.imageUrl.should.equal(TestData.Publisher.imageUrl);
                body.url.should.equal(TestData.Publisher.url);
                body.summary.should.equal(TestData.Publisher.summary);
                body.about.should.equal(TestData.Publisher.about);
                body.specialty.should.equal(TestData.Publisher.specialty);
                body.owner.should.equal(TestData.Publisher.owner);
                body.owner_url.should.equal(TestData.Publisher.owner_url);
                body.twitter.should.equal(TestData.Publisher.twitter);
                body.facebook.should.equal(TestData.Publisher.facebook);
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                body.slug.should.be.ok;
                done();
            }
        });
    });

    test('> PUT /publisher/:id - Updating an Publisher', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: TestData.PublisherChanged,
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
                body.name.should.equal(TestData.PublisherChanged.name);
                body.imageUrl.should.equal(TestData.PublisherChanged.imageUrl);
                body.url.should.equal(TestData.PublisherChanged.url);
                body.summary.should.equal(TestData.PublisherChanged.summary);
                body.about.should.equal(TestData.PublisherChanged.about);
                body.specialty.should.equal(TestData.PublisherChanged.specialty);
                body.owner.should.equal(TestData.PublisherChanged.owner);
                body.owner_url.should.equal(TestData.PublisherChanged.owner_url);
                body.twitter.should.equal(TestData.PublisherChanged.twitter);
                body.facebook.should.equal(TestData.PublisherChanged.facebook);

                // Slug should remain unchanged
                body.slug.should.equal(TestData.Publisher.slug);

                // --
                // Step 2: Retrieve again and check response.
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
                        r.statusCode.should.equal(200);
                        body['@rid'].should.be.ok;
                        body.name.should.equal(TestData.PublisherChanged.name);
                        body.imageUrl.should.equal(TestData.PublisherChanged.imageUrl);
                        body.url.should.equal(TestData.PublisherChanged.url);
                        body.summary.should.equal(TestData.PublisherChanged.summary);
                        body.about.should.equal(TestData.PublisherChanged.about);
                        body.specialty.should.equal(TestData.PublisherChanged.specialty);
                        body.owner.should.equal(TestData.PublisherChanged.owner);
                        body.owner_url.should.equal(TestData.PublisherChanged.owner_url);
                        body.twitter.should.equal(TestData.PublisherChanged.twitter);
                        body.facebook.should.equal(TestData.PublisherChanged.facebook);

                        // Slug should remain unchanged
                        body.slug.should.equal(TestData.Publisher.slug);

                        done();
                    }
                });
            }
        });
    });

    test('> GET /publishers/mine/ - Get My Publishers', function(done) {
        Request.get({
            url: Config.host + '/publishers/mine',
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
                body.should.be.Array;
                body.length.should.equal(0);

                done();
            }
        });
    });

    test('> POST /user/:user_id/feed/settings/publisher - Add a Publisher to UserFeedSettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.Token.user['@rid']) + '/feed/settings/publisher',
            body: { publisher_id: TestData.Publisher.id },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            r.statusCode.should.equal(200);
            body.should.equal('Publisher Added');
            done()
        })
    });

    test('> GET /publishers/mine/ - Get My Publishers', function(done) {
        Request.get({
            url: Config.host + '/publishers/mine',
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
                body.should.be.Array;
                body.length.should.equal(1);
                body[0]['@rid'].should.equal(TestData.Publisher.id);

                done();
            }
        });
    });

    test('> POST /user/:user_id/feed/settings/publisher - Add another Publisher in UserFeedSettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.Token.user['@rid']) + '/feed/settings/publisher',
            body: { publisher_id :TestData.Publisher1.id },
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

    test('> GET /publishers/mine/ - Get My Publishers (recheck after new addition)', function(done) {
        Request.get({
            url: Config.host + '/publishers/mine',
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
                body.should.be.Array;
                body.length.should.equal(2);
                body[0]['@rid'].should.equal(TestData.Publisher.id);
                body[1]['@rid'].should.equal(TestData.Publisher1.id);

                done();
            }
        });
    });

    test('> POST /user/:user_id/feed/settings/publisher Add another publisher in userfeedsettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.Token.user['@rid']) + '/feed/settings/publisher',
            body: {publisher_id :TestData.Publisher2.id},
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

    test('> GET /publishers/mine/ - Get My Publishers (recheck after 2nd new addition)', function(done) {
        Request.get({
            url: Config.host + '/publishers/mine',
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
                body.should.be.Array;
                body.length.should.equal(3);
                body[0]['@rid'].should.equal(TestData.Publisher.id);
                body[1]['@rid'].should.equal(TestData.Publisher1.id);
                body[2]['@rid'].should.equal(TestData.Publisher2.id);

                done();
            }
        });
    });

    test('> GET /publishers/recent/ - Get Recently rated Publishers by me', function(done) {
        Request.get({
            url: Config.host + '/publishers/recent',
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
                body.should.be.Array;

                done();
            }
        });
    });

    test('> GET /publishers/recent/ - Get Recently rated Publishers by me (rate another: recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/rate',
            body: {
                importance: 4,
                independence: 4,
                factuality: 4,
                transparency: 5
            },
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
                
                // Get recently rated publishers
                Request.get({
                    url: Config.host + '/publishers/recent',
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
                        body.should.be.Array;
                        body.length.should.be.above(0);


                        var exists = false;
                        for (var i in body) {
                            if (body[i]['@rid'] == TestData.Publisher.id) {
                                exists = true;
                            }
                        }

                        exists.should.be.true;
                        done();
                    }
                });
            }
        });
    });

    test('> GET /publishers/recent/ - Get Recently rated Publishers by me (rate a 2nd publisher: recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article1.id) +'/rate',
            body: {
                importance: 4,
                independence: 4,
                factuality: 4,
                transparency: 5
            },
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
                
                // Get recently rated publishers
                Request.get({
                    url: Config.host + '/publishers/recent',
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
                        body.should.be.Array;

                        var exists = 0;
                        for (var i in body) {
                            if (body[i]['@rid'] == TestData.Publisher1.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Publisher.id) {
                                exists++;
                            }
                        }

                        exists.should.be.above(1);
                        body.length.should.be.above(1);
                        done();
                    }
                });
            }
        });
    });

    test('> GET /publishers/recent/ - Get Recently rated Publishers by me (rate a 3rd publisher: recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article2.id) +'/rate',
            body: {
                importance: 4,
                independence: 4,
                factuality: 4,
                transparency: 5
            },
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
                
                // Get recently rated publishers
                Request.get({
                    url: Config.host + '/publishers/recent',
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
                        body.should.be.Array;

                        var exists = 0;
                        for (var i in body) {
                            if (body[i]['@rid'] == TestData.Publisher.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Publisher1.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Publisher2.id) {
                                exists++;
                            }
                        }

                        exists.should.be.above(2);
                        body.length.should.be.above(2);
                        done();
                    }
                });
            }
        });
    });

    test('> GET /publishers/friends/ - Get Recently rated Publishers by friends', function(done) {
        Request.get({
            url: Config.host + '/publishers/friends',
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
                body.should.be.Array;
                body.length.should.equal(0);

                done();
            }
        });
    });

    test('> GET /publishers/recent/ - Get Recently rated Publishers by friends (new rating and recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/rate',
            body: {
                importance: 4,
                independence: 4,
                factuality: 4,
                transparency: 5
            },
            headers: {
                "X-Auth-Token": TestData.User.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body.should.be.true
                
                // Get recently rated publishers
                Request.get({
                    url: Config.host + '/publishers/friends',
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
                        body.should.be.Array;
                        body.length.should.be.above(0);

                        var exists = false;
                        for (var i in body) {
                            if (body[i]['@rid'] == TestData.Publisher.id) {
                                exists = true;
                            }
                        }

                        exists.should.be.true;
                        done();
                    }
                });
            }
        });
    });

    test('> GET /publishers/recent/ - Get Recently rated Publishers by friends (2nd new rating and recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article1.id) +'/rate',
            body: {
                importance: 4,
                independence: 4,
                factuality: 4,
                transparency: 5
            },
            headers: {
                "X-Auth-Token": TestData.User1.Token.token
            },
            json: true
        }, function(e, r, body) {
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(200);
                body.should.be.true
                
                // Get recently rated publishers
                Request.get({
                    url: Config.host + '/publishers/friends',
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
                        body.should.be.Array;
                        body.length.should.be.above(1);

                        var exists = 0;
                        for (var i in body) {
                            if (body[i]['@rid'] == TestData.Publisher.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Publisher1.id) {
                                exists++;
                            }
                        }

                        exists.should.be.above(1);
                        done();
                    }
                });
            }
        });
    });

    test('> GET /publishers/toprated/ - Get Top rated Publishers', function(done) {
        Request.get({
            url: Config.host + '/publishers/toprated',
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
                body.should.be.Array;
                for (var i = 0; i < body.length-2; i++ ) {
                    if (body[i].rating < body[i+1].rating) {
                        done("Error in Top rated test")
                    }
                }
                done();
            }
        });
    });

    test('> LIST /publishers - Listing Publishers', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/publishers',
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
                    if (body[i]['@rid'] == TestData.Publisher.id) {
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

    test('> Integrity: GET /publisher/:id with invalid @rid should 400', function(done) {
        Request.get({
            url: Config.host + '/publisher/asddasd',
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

    test('> Integrity: GET /publisher/:id with non-existent @rid should 404', function(done) {
        Request.get({
            url: Config.host + '/publisher/0.0',
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

    test('> Integrity: PUT /publisher/:id with invalid @rid should 400', function(done) {
        Request.put({
            url: Config.host + '/publisher/asddasd',
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

    test('> Integrity: PUT /publisher/:id with non-existent @rid should 404', function(done) {
        Request.put({
            url: Config.host + '/publisher/0.0',
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

    test('> Integrity: DELETE /publisher/:id with invalid @rid should 400', function(done) {
        Request.del({
            url: Config.host + '/publisher/asddasd',
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

    test('> Integrity: DELETE /publisher/:id with non-existent @rid should 404', function(done) {
        Request.del({
            url: Config.host + '/publisher/0.0',
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

    test('> Integrity: POST /publisher with supplied :slug & @rid should be ignored, and remain unique', function(done) {
        // !! Relies on earlier verification that a slug exists.
        Request.post({
            url: Config.host + '/publisher',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            body: TestData.Publisher,
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

                // Main Tests
                body.slug.should.not.equal( TestData.Publisher.slug );
                body['@rid'].should.not.equal( TestData.Publisher.id );

                // Clean up after ourself.
                Request.del({
                    url: Config.host + '/publisher/' + RID.Encode(body['@rid']),
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

    test('> Integrity: POST /publisher with invalid :name [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.name;
        TestData.Publisher.name = '';

        Request.post({
            url: Config.host + '/publisher',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            body: TestData.Publisher,
            json: true
        }, function(e, r, body) {
            TestData.Publisher.name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :name [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.name;

        Crypto.randomBytes(80, function(ex, buf) {
            TestData.Publisher.name = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.name = old;
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

    test('> Integrity: POST /publisher with invalid :url [ not url ] should be rejected', function(done) {
        var old = TestData.Publisher.url;
        TestData.Publisher.url = 'Honey Boo Boo';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.url = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :url [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.url;
        TestData.Publisher.url = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.url = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    /**
     * This test exposes a DoS vulnerability in validator.isURL()
     * https://github.com/chriso/validator.js/issues/152
     * TODO: Fix this test & vulnerability
     *
     test('> Integrity: POST /publisher with invalid :url [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.url;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Publisher.url = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                json: true
            }, function (e, r, body) {
                TestData.Publisher.url = old;
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

     */

    test('> Integrity: POST /publisher with invalid :imageUrl [ not url ] should be rejected', function(done) {
        var old = TestData.Publisher.imageUrl;
        TestData.Publisher.imageUrl = 'Honey Boo Boo';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.imageUrl = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :imageUrl [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.imageUrl;
        TestData.Publisher.imageUrl = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.imageUrl = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    /**
     * This test exposes a DoS vulnerability in validator.isURL()
     * https://github.com/chriso/validator.js/issues/152
     * TODO: Fix this test & vulnerability
     *
     test('> Integrity: POST /publisher with invalid :imageUrl [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.imageUrl;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Publisher.imageUrl = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                json: true
            }, function (e, r, body) {
                TestData.Publisher.imageUrl = old;
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
     */

    test('> Integrity: POST /publisher with invalid :summary [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.summary;
        TestData.Publisher.summary = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.summary = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :summary [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.summary;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.Publisher.summary = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.summary = old;
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

    test('> Integrity: POST /publisher with invalid :about [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.about;
        TestData.Publisher.about = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.about = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :about [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.about;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.Publisher.about = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.about = old;
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

    test('> Integrity: POST /publisher with invalid :specialty [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.specialty;
        TestData.Publisher.specialty = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.specialty = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :specialty [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.specialty;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.Publisher.specialty = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.specialty = old;
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

    test('> Integrity: POST /publisher with invalid :owner [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.owner;
        TestData.Publisher.owner = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.owner = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :owner [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.owner;

        Crypto.randomBytes(65, function(ex, buf) {
            TestData.Publisher.owner = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.owner = old;
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

    test('> Integrity: POST /publisher with invalid :owner_url [ not url ] should be rejected', function(done) {
        var old = TestData.Publisher.owner_url;
        TestData.Publisher.owner_url = 'Honey Boo Boo';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.owner_url = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :owner_url [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.owner_url;
        TestData.Publisher.owner_url = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.owner_url = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :twitter [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.twitter;
        TestData.Publisher.twitter = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.twitter = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :twitter [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.twitter;

        Crypto.randomBytes(80, function(ex, buf) {
            TestData.Publisher.twitter = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.twitter = old;
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

    test('> Integrity: POST /publisher with invalid :facebook [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.facebook;
        TestData.Publisher.facebook = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.facebook = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :facebook [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.facebook;

        Crypto.randomBytes(80, function(ex, buf) {
            TestData.Publisher.facebook = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.facebook = old;
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

    /**
     * This test exposes a DoS vulnerability in validator.isURL()
     * https://github.com/chriso/validator.js/issues/152
     * TODO: Fix this test & vulnerability
     *
     test('> Integrity: POST /publisher with invalid :owner_url [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.owner_url;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Publisher.owner_url = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                json: true
            }, function (e, r, body) {
                TestData.Publisher.imageUrl = old;
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
     */

    // --------------------------------------

    test('> Integrity: POST /publisher with invalid :name [ too short ] should be rejected', function(done) {
        var old = TestData.Publisher.name;
        TestData.Publisher.name = '';

        Request.post({
            url: Config.host + '/publisher',
            body: TestData.Publisher,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Publisher.name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher with invalid :name [ too long ] should be rejected', function(done) {
        var old = TestData.Publisher.name;

        Crypto.randomBytes(80, function(ex, buf) {
            TestData.Publisher.name = buf.toString('hex');

            Request.post({
                url: Config.host + '/publisher',
                body: TestData.Publisher,
                headers: {
                "X-Auth-Token": TestData.Token.token
            },
                json: true
            }, function (e, r, body) {
                TestData.Publisher.name = old;
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

    test('> Integrity: PUT /publisher/:id - Trying to change slug should fail', function(done) {
        // !! Relies on earlier verification that a slug exists.

        var fake = '1234567890-my-new-fake-slug';

        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { slug: fake },
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
                body.slug.should.not.equal( fake );

                done();
            }
        });
    });

    test('> Integrity: PUT /publisher/:id with invalid :name [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { name: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :name [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { name: buf.toString('hex') },
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

    test('> Integrity: PUT /publisher/:id with invalid :url [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { url: '' },
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

    /**
     * This test exposes a DoS vulnerability in validator.isURL()
     * https://github.com/chriso/validator.js/issues/152
     * TODO: Fix this test & vulnerability
     *
     test('> Integrity: PUT /publisher/:id with invalid :url [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            var url = buf.toString('hex');

            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { url: url },
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
     */

    test('> Integrity: PUT /publisher/:id with invalid :url [ not url ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { url: 'Honey Boo Boo' },
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

    test('> Integrity: PUT /publisher/:id with invalid :imageUrl [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { imageUrl: '' },
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

    /**
     * This test exposes a DoS vulnerability in validator.isURL()
     * https://github.com/chriso/validator.js/issues/152
     * TODO: Fix this test & vulnerability
     *
     test('> Integrity: PUT /publisher/:id with invalid :imageUrl [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            var imageUrl = buf.toString('hex');

            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { imageUrl: imageUrl },
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
     */

    test('> Integrity: PUT /publisher/:id with invalid :imageUrl [ not url ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { imageUrl: 'Honey Boo Boo' },
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

    test('> Integrity: PUT /publisher/:id with invalid :summary [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { summary: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :summary [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1025, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { summary: buf.toString('hex') },
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

    test('> Integrity: PUT /publisher/:id with invalid :about [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { about: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :about [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1025, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { about: buf.toString('hex') },
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

    test('> Integrity: PUT /publisher/:id with invalid :specialty [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { specialty: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :specialty [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1025, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { specialty: buf.toString('hex') },
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

    test('> Integrity: PUT /publisher/:id with invalid :owner [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { owner: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :owner [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { owner: buf.toString('hex') },
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

    test('> Integrity: PUT /publisher/:id with invalid :owner_url [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { owner_url: '' },
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

    /**
     * This test exposes a DoS vulnerability in validator.isURL()
     * https://github.com/chriso/validator.js/issues/152
     * TODO: Fix this test & vulnerability
     *
     test('> Integrity: PUT /publisher/:id with invalid :owner_url [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            var owner_url = buf.toString('hex');

            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { owner_url: owner_url },
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
     */

    test('> Integrity: PUT /publisher/:id with invalid :owner_url [ not url ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { owner_url: 'Honey Boo Boo' },
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

    test('> Integrity: PUT /publisher/:id with invalid :twitter [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { twitter: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :twitter [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { twitter: buf.toString('hex') },
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

    test('> Integrity: PUT /publisher/:id with invalid :facebook [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
            body: { facebook: '' },
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

    test('> Integrity: PUT /publisher/:id with invalid :facebook [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher.id),
                body: { facebook: buf.toString('hex') },
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

    // --
    // Suite Teardown
    // --

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

    test('> DELETE /publisher/:id - Deleting an Publisher', function(done) {
        Request.del({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher1.id),
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
                    url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher1.id),
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

    test('> DELETE /publisher/:id - Deleting a Publisher', function(done) {
        Request.del({
            url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher2.id),
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
                    url: Config.host + '/publisher/' + RID.Encode(TestData.Publisher2.id),
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

    test('> DELETE /publisher/:id - Deleting a User', function(done) {
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

    test('> DELETE /publisher/:id - Deleting 2nd User', function(done) {
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.User1.id),
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
                    url: Config.host + '/user/' + RID.Encode(TestData.User1.id),
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

    test('> DELETE /article/:id - Deleting an Article', function(done) {
        Request.del({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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
                    url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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

    test('> DELETE /article/:id - Deleting Article1', function(done) {
        Request.del({
            url: Config.host + '/article/' + RID.Encode(TestData.Article1.id),
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
                    url: Config.host + '/article/' + RID.Encode(TestData.Article1.id),
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
    
    test('> DELETE /article/:id - Deleting an Article', function(done) {
        Request.del({
            url: Config.host + '/article/' + RID.Encode(TestData.Article2.id),
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
                    url: Config.host + '/article/' + RID.Encode(TestData.Article2.id),
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
