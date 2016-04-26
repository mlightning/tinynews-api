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
    Journalist: {
        first_name: 'Tester',
        last_name: 'Guy',
        slug: 'tester-guy',
        email: 'marius+jdepp@gmail.com',
        status: '1',
        imageUrl : 'http://www.google.com',
        url : 'http://www.google.com',
        journalistBackground:
            [{
                organization : 'Indian Institute of Technology, Delhi',
                title : 'Computer Science',
                year_start : '2003',
                year_end : '2007',
                description: 'B. Tech in Computer Science'
            }]
    },
    JournalistChanged: {
        first_name: 'Munish',
        last_name: 'Chopra',
        slug: 'munish-chopra',
        email: 'marius+changed@gmail.com',
        status: '1',
        imageUrl : 'http://www.google.com',
        url : 'http://www.itechfreak.com'
    },
    Journalist1: {
        first_name: 'Tester',
        last_name: 'Guy',
        email: 'marius+test2@gmail.com',
        status: '1',
        url : 'http://www.itechfreak.com'
    },
    Journalist2: {
        first_name: 'Tester',
        last_name: 'Guy',
        email: 'marius+test3@gmail.com',
        status: '1',
        url : 'http://www.itechfreak.com'
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

describe('API - Journalists :', function() {

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

    test('> POST /Journalist - Creating an Journalist', function(done) {
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
                body.journalistBackground.should.be.ok;
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                body.journalistBackground[0].organization.should.equal(TestData.Journalist.journalistBackground[0].organization);
                body.journalistBackground[0].title.should.equal(TestData.Journalist.journalistBackground[0].title);
                body.journalistBackground[0].year_end.should.equal(TestData.Journalist.journalistBackground[0].year_end);
                body.journalistBackground[0].year_start.should.equal(TestData.Journalist.journalistBackground[0].year_start);
                body.journalistBackground[0].description.should.equal(TestData.Journalist.journalistBackground[0].description);
                body.journalistBackground[0].creation_date.should.be.ok;
                body.journalistBackground[0].modification_date.should.be.ok;
                body.journalistBackground[0].creation_date.should.equal(body.modification_date);
                body.journalistBackground[0].creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                TestData.Journalist.journalistBackground[0]['@rid'] = body.journalistBackground[0]['@rid']


                TestData.Journalist.id = body['@rid'];

                done();
            }
        });
    });

    test('> POST /Journalist - Creating another Journalist with incomplete data and existing slug', function(done) {
        TestData.Journalist1.slug =  'tester-guy';
        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist1,
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
                body.first_name.should.equal(TestData.Journalist1.first_name);
                body.last_name.should.equal(TestData.Journalist1.last_name);
                body.email.should.equal(TestData.Journalist1.email);
                body.slug.should.be.ok;

                TestData.Journalist1.id = body['@rid'];

                done();
            }
        });
    });

    test('> POST /Journalist - Creating another Journalist for testing', function(done) {
        TestData.Journalist1.slug =  'tester-guy';
        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist2,
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
                body.first_name.should.equal(TestData.Journalist2.first_name);
                body.last_name.should.equal(TestData.Journalist2.last_name);
                body.email.should.equal(TestData.Journalist2.email);
                body.slug.should.be.ok;

                TestData.Journalist2.id = body['@rid'];

                done();
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
                    url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/journalist',
                    body: {journalist_id: TestData.Journalist.id},
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
                    url: Config.host + '/article/'+ RID.Encode(TestData.Article1.id) +'/journalist',
                    body: {journalist_id: TestData.Journalist1.id},
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
                    url: Config.host + '/article/'+ RID.Encode(TestData.Article2.id) +'/journalist',
                    body: {journalist_id: TestData.Journalist2.id},
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

    test('> GET /journalist/:id - Retrieving a journalist', function(done) {
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
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.first_name.should.equal(TestData.Journalist.first_name);
                body.last_name.should.equal(TestData.Journalist.last_name);
                body.email.should.equal(TestData.Journalist.email);
                body.imageUrl.should.equal(TestData.Journalist.imageUrl);
                body.url.should.equal(TestData.Journalist.url);
                body.slug.should.be.ok;
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                done();
            }
        });
    });

    test('> PUT /journalist/:id - Updating a journalist', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
            body: TestData.JournalistChanged,
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
                body.first_name.should.equal(TestData.JournalistChanged.first_name);
                body.last_name.should.equal(TestData.JournalistChanged.last_name);
                body.email.should.equal(TestData.JournalistChanged.email);
                body.imageUrl.should.equal(TestData.JournalistChanged.imageUrl);
                body.url.should.equal(TestData.JournalistChanged.url);
                body.slug.should.be.ok;

                // Slug should remain unchanged
                body.slug.should.equal(TestData.Journalist.slug);

                // --
                // Step 2: Retrieve again and check response.
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
                        r.statusCode.should.equal(200);
                        body.first_name.should.equal(TestData.JournalistChanged.first_name);
                        body.last_name.should.equal(TestData.JournalistChanged.last_name);
                        body.email.should.equal(TestData.JournalistChanged.email);
                        body.imageUrl.should.equal(TestData.JournalistChanged.imageUrl);
                        body.url.should.equal(TestData.JournalistChanged.url);
                        body.slug.should.be.ok;
                        body.slug.should.be.equal(TestData.Journalist.slug)

                        done();
                    }
                });
            }
        });
    }); 

    test('> GET /journalists/mine/ - Get My Journalists', function(done) {
        Request.get({
            url: Config.host + '/journalists/mine',
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

    test('> POST /user/:user_id/feed/settings/journalist - Add a Journalist in UserFeedSettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.Token.user['@rid']) + '/feed/settings/journalist',
            body: { journalist_id :TestData.Journalist.id },
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

    test('> GET /journalists/mine/ - Get My Journalists', function(done) {
        Request.get({
            url: Config.host + '/journalists/mine',
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

                done();
            }
        });
    });

    test('> POST /user/:user_id/feed/settings/journalist Add another journalist in userfeedsettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.Token.user['@rid']) + '/feed/settings/journalist',
            body: {journalist_id :TestData.Journalist1.id},
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

    test('> GET /journalists/mine/ - Get My Journalists - again', function(done) {
        Request.get({
            url: Config.host + '/journalists/mine',
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
                body[0]['@rid'].should.equal(TestData.Journalist.id);
                body[1]['@rid'].should.equal(TestData.Journalist1.id);

                done();
            }
        });
    });

    test('> POST /user/:user_id/feed/settings/journalist Add another 2nd journalist in userfeedsettings', function(done){
        Request.post({
            url: Config.host + '/user/' + RID.Encode(TestData.Token.user['@rid']) + '/feed/settings/journalist',
            body: {journalist_id :TestData.Journalist2.id},
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

    test('> GET /journalists/mine/ - Get My Journalists - again - again', function(done) {
        Request.get({
            url: Config.host + '/journalists/mine',
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
                body[0]['@rid'].should.equal(TestData.Journalist.id);
                body[1]['@rid'].should.equal(TestData.Journalist1.id);
                body[2]['@rid'].should.equal(TestData.Journalist2.id);

                done();
            }
        });
    });

    test('> GET /journalists/recent/ - Get Recently rated Journalists by me (when nothing rated yet)', function(done) {
        Request.get({
            url: Config.host + '/journalists/recent',
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

    test('> GET /journalists/recent/ - Get Recently rated Journalists by me (when rating exists)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/rate',
            body: {
                importance: 5,
                independence: 5,
                factuality: 5,
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
                
                // Get recently rated journalists
                Request.get({
                    url: Config.host + '/journalists/recent',
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
                            if (body[i]['@rid'] == TestData.Journalist.id) {
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

    test('> GET /journalists/recent/ - Get Recently rated Journalists by me (rate another journalist: check counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article1.id) +'/rate',
            body: {
                importance: 2,
                independence: 1,
                factuality: 3,
                transparency: 2
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
                
                // Get recently rated journalists
                Request.get({
                    url: Config.host + '/journalists/recent',
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
                            if (body[i]['@rid'] == TestData.Journalist.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Journalist1.id) {
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

    test('> GET /journalists/recent/ - Get Recently rated Journalists by me (rate a 3rd journalist: check counts)', function(done) {
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
                
                // Get recently rated journalists
                Request.get({
                    url: Config.host + '/journalists/recent',
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
                            if (body[i]['@rid'] == TestData.Journalist.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Journalist1.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Journalist2.id) {
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

    test('> GET /journalists/friends/ - Get Recently rated Journalists by friends', function(done) {
        Request.get({
            url: Config.host + '/journalists/friends',
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

    test('> GET /journalists/friends/ - Get Recently rated Journalists by friends (new rating and recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) + '/rate',
            body: {
                importance: 2,
                independence: 1,
                factuality: 3,
                transparency: 2
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
                
                // Get recently rated journalists
                Request.get({
                    url: Config.host + '/journalists/friends',
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
                            if (body[i]['@rid'] == TestData.Journalist.id) {
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

    test('> GET /journalists/friends/ - Get Recently rated Journalists by friends (2nd new rating and recheck counts)', function(done) {
        // rate an article
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article1.id) +'/rate',
            body: {
                importance: 1,
                independence: 1,
                factuality: 1,
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
                
                // Get recently rated journalists
                Request.get({
                    url: Config.host + '/journalists/friends',
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
                            if (body[i]['@rid'] == TestData.Journalist.id) {
                                exists++;
                            }
                            if (body[i]['@rid'] == TestData.Journalist1.id) {
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
    
    test('> GET /journalists/toprated/ - Get top rated Journalists', function(done) {
        Request.get({
            url: Config.host + '/journalists/toprated',
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

    test('> LIST /journalists - Listing journalists', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/journalists',
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
                    if (body[i]['@rid'] == TestData.Journalist.id) {
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
    
    test('> Integrity: GET /journalist/:id with invalid @rid should 400', function(done) {
        Request.get({
            url: Config.host + '/journalist/asddasd',
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

    test('> Integrity: GET /journalist/:id with non-existent @rid should 404', function(done) {
        Request.get({
            url: Config.host + '/journalist/0.0',
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

    test('> Integrity: PUT /journalist/:id with invalid @rid should 400', function(done) {
        Request.put({
            url: Config.host + '/journalist/asddasd',
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

    test('> Integrity: PUT /journalist/:id with non-existent @rid should 404', function(done) {
        Request.put({
            url: Config.host + '/journalist/0.0',
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

    test('> Integrity: DELETE /journalist/:id with invalid @rid should 400', function(done) {
        Request.del({
            url: Config.host + '/journalist/asddasd',
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

    test('> Integrity: DELETE /journalist/:id with non-existent @rid should 404', function(done) {
        Request.del({
            url: Config.host + '/journalist/0.0',
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

    test('> Integrity: POST /journalist with supplied :handle & @rid should be ignored, and remain unique', function(done) {
        // !! Relies on earlier verification that a handle exists.

        var old = TestData.Journalist.email;
        TestData.Journalist.email = 'marius+tg_changed@gmail.com';

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
                body.slug.should.be.ok;

                // Main Tests
                body.slug.should.not.equal( TestData.Journalist.slug );
                body['@rid'].should.not.equal( TestData.Journalist.id );

                // Clean up after ourself
                TestData.Journalist.email = old;

                Request.del({
                    url: Config.host + '/journalist/' + RID.Encode(body['@rid']),
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

    test('> Integrity: POST /journalist with invalid :first_name [ too short ] should be rejected', function(done) {
        var old = TestData.Journalist.first_name;
        TestData.Journalist.first_name = '';

        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Journalist.first_name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /journalist with invalid :first_name [ too long ] should be rejected', function(done) {
        var old = TestData.Journalist.first_name;

        Crypto.randomBytes(65, function(ex, buf) {
            TestData.Journalist.first_name = buf.toString('hex');

            Request.post({
                url: Config.host + '/journalist',
                body: TestData.Journalist,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Journalist.first_name = old;
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

    test('> Integrity: POST /journalist with invalid status code should be rejected', function(done) {
        var old = TestData.Journalist.status;

            TestData.Journalist.status = "2"

            Request.post({
                url: Config.host + '/journalist',
                body: TestData.Journalist,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Journalist.status = old;
                if (e) {
                    throw e;
                    done(e);
                } else {
                    r.statusCode.should.equal(400);
                    done();
                }
            });
    });

    test('> Integrity: POST /journalist with invalid :last_name [ too short ] should be rejected', function(done) {
        var old = TestData.Journalist.last_name;
        TestData.Journalist.last_name = '';

        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Journalist.last_name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /journalist with invalid :last_name [ too long ] should be rejected', function(done) {
        var old = TestData.Journalist.last_name;

        Crypto.randomBytes(65, function(ex, buf) {
            TestData.Journalist.last_name = buf.toString('hex');

            Request.post({
                url: Config.host + '/journalist',
                body: TestData.Journalist,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Journalist.last_name = old;
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

    test('> Integrity: POST /journalist with invalid :email [ too short ] should be rejected', function(done) {
        var old = TestData.Journalist.email;
        TestData.Journalist.email = '';

        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Journalist.email = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /journalist with invalid :email [ too long ] should be rejected', function(done) {
        var old = TestData.Journalist.email;

        Crypto.randomBytes(130, function(ex, buf) {
            TestData.Journalist.email = buf.toString('hex');

            Request.post({
                url: Config.host + '/journalist',
                body: TestData.Journalist,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Journalist.email = old;
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

    test('> Integrity: POST /journalist with invalid :email [ invalid ] should be rejected', function(done) {
        var old = TestData.Journalist.email;

        TestData.Journalist.email = 'not_a_valid_email';

        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            TestData.Journalist.email = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /journalist with invalid :imageUrl [ invalid ] should be rejected', function(done) {
        var old = TestData.Journalist.imageUrl;

        TestData.Journalist.imageUrl = 'not_a_valid_url';

        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            TestData.Journalist.imageUrl = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /journalist with invalid :status [ invalid ] should be rejected', function(done) {
        var old = TestData.Journalist.status;

        TestData.Journalist.imageUrl = '2';

        Request.post({
            url: Config.host + '/journalist',
            body: TestData.Journalist,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function (e, r, body) {
            TestData.Journalist.status = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /journalist/:id with invalid :first_name [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :first_name [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :last_name [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :last_name [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(65, function(ex, buf) {
            Request.put({
                url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :email [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :email [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(130, function(ex, buf) {
            Request.put({
                url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :email [ invalid ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
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

    test('> Integrity: PUT /journalist/:id with invalid :imageUrl [ invalid ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
            body: { imageUrl: 'not_a_valid_url' },
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

    test('> Integrity: PUT /journalist/:id with invalid :url [ invalid ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
            body: { url: 'not_a_valid_url' },
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

    test('> Integrity: PUT /journalist/:id with invalid :status [ invalid ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist.id),
            body: { status: '3' },
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

    test('> DELETE /journalist/:id - Deleting an Journalist', function(done) {
        Request.del({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist1.id),
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
                    url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist1.id),
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

    test('> DELETE /journalist/:id - Deleting an Journalist', function(done) {
        Request.del({
            url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist2.id),
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
                    url: Config.host + '/journalist/' + RID.Encode(TestData.Journalist2.id),
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
