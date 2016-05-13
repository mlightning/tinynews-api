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
    Article: {
        "body":"asdasdsadsa",
        "featured": 0,
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "post_date": 1397573350,
        "title": "My Awesome Google Glass Article 34567890",
        "url": "http://google.com/glass"
    },
    ArticleChanged: {
        "body":"22asdasdsadsa",
        "featured": 1,
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg22",
        "post_date": 1397573351,
        "title": "My Awesome Google Glass Article 34567890 22",
        "url": "http://google.com/glass22"
    },
    Fact: {
        Immediate: {
            note: "Fact note #1",
            type: "immediate"
        },
        Contextual: {
            note: "Fact note #2",
            type: "contextual"
        }
    },
    Statement: {
        Immediate: {
            note: "Statement note #1",
            type: "immediate"
        },
        Contextual: {
            note: "Statement note #2",
            type: "contextual"
        }
    },
    FactChanged: {
        Immediate: {
            note: "Fact note #1 (changed)",
            type: "contextual"
        },
        Contextual: {
            note: "Fact note #2 (changed)",
            type: "immediate"
        }
    },
    StatementChanged: {
        Immediate: {
            note: "Statement note #1 (changed)",
            type: "contextual"
        },
        Contextual: {
            note: "Statement note #2 (changed)",
            type: "immediate"
        }
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
    },
    Journalist: {
        first_name: 'Tester',
        last_name: 'Guy',
        email: 'marius+test2@gmail.com',
        status: '1',
        url : 'http://www.itechfreak.com'
    }
};

// ----------------
//   Test
// ----------------

describe('API - Articles :', function() {

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
        })
    });

    // --
    // CRUD Tests
    // --

    test('> POST /article - Creating an Article', function(done) {
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
                body.body.should.equal(TestData.Article.body);
                body.title.should.equal(TestData.Article.title);
                body.featured.should.equal(TestData.Article.featured);
                body.imageUrl.should.equal(TestData.Article.imageUrl);
                body.post_date.should.equal(TestData.Article.post_date);
                body.url.should.equal(TestData.Article.url);
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                body.slug.should.be.ok;

                TestData.Article.id = body['@rid'];
                TestData.Article.slug = body.slug;

                done();
            }
        });
    });

    test('> GET /article/:id - Retrieving an Article', function(done) {
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
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.body.should.equal(TestData.Article.body);
                body.title.should.equal(TestData.Article.title);
                body.featured.should.equal(TestData.Article.featured);
                body.imageUrl.should.equal(TestData.Article.imageUrl);
                body.post_date.should.equal(TestData.Article.post_date);
                body.url.should.equal(TestData.Article.url);
                body.slug.should.be.ok;
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
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

    test('> POST /Journalist - Creating a Journalist', function(done) {
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

                TestData.Journalist.id = body['@rid'];

                done();
            }
        });
    });

    test('> PUT /article/:id - Updating an Article', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
            body: TestData.ArticleChanged,
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
                body.body.should.equal(TestData.ArticleChanged.body);
                body.title.should.equal(TestData.ArticleChanged.title);
                body.featured.should.equal(TestData.ArticleChanged.featured);
                body.imageUrl.should.equal(TestData.ArticleChanged.imageUrl);
                body.post_date.should.equal(TestData.ArticleChanged.post_date);
                body.url.should.equal(TestData.ArticleChanged.url);

                // Slug should remain unchanged
                body.slug.should.equal(TestData.Article.slug);

                // --
                // Step 2: Retrieve again and check response.
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
                        r.statusCode.should.equal(200);
                        body['@rid'].should.be.ok;
                        body.body.should.equal(TestData.ArticleChanged.body);
                        body.title.should.equal(TestData.ArticleChanged.title);
                        body.featured.should.equal(TestData.ArticleChanged.featured);
                        body.imageUrl.should.equal(TestData.ArticleChanged.imageUrl);
                        body.post_date.should.equal(TestData.ArticleChanged.post_date);
                        body.url.should.equal(TestData.ArticleChanged.url);

                        // Slug should remain unchanged
                        body.slug.should.equal(TestData.Article.slug);

                        done();
                    }
                });
            }
        });
    });

    test('> LIST /articles - Listing Articles', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/articles',
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
                    if (body[i]['@rid'] == TestData.Article.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    test('> GET /article/:article_id/rate - Rate an article', function(done) {
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
                body.should.be.true;
                done();
            }
        });
    });

    test('> GET /article/:article_id/rate - Rate an article again (overwrite previous rating). Should accept float values', function(done) {
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/rate',
            body: {
                importance: 4.1,
                independence: 3.1,
                factuality: 2.1,
                transparency: 1.1
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
                body.should.be.true;
                done();
            }
        });
    });

    test('> GET /article/:article_id/rating - Get user rating for an article', function(done) {
        Request.get({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/rating',
            body: {
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
                body.should.be.true;
                body.importance.should.equal(4.1);
                body.independence.should.equal(3.1);
                body.factuality.should.equal(2.1);
                body.transparency.should.equal(1.1);
                done();
            }
        });
    });

    test('> GET /article/:article_id/publisher - Assign a publisher', function(done) {
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
    });

    test('> GET /article/:article_id/journalist - Assign a journalist', function(done) {
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
    });

    test('> GET /article/:id - Retrieving an Article to check rating, publisher & journalist data', function(done) {
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
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.publisher['@rid'].should.be.ok;
                body.publisher['@rid'].should.equal(TestData.Publisher.id);
                body.journalist['@rid'].should.be.ok;
                body.journalist['@rid'].should.equal(TestData.Journalist.id);
                body.rating.importance.should.equal(5);
                body.rating.independence.should.equal(5);
                body.rating.factuality.should.equal(5);
                body.rating.transparency.should.equal(5);
                done();
            }
        });
    });

    test('> POST /article/:article_id/fact - Creating Article Facts: ', function(done) {
        Request.post({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact',
            body: TestData.Fact.Immediate,
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
                body.note.should.equal(TestData.Fact.Immediate.note);
                body.type.should.equal(TestData.Fact.Immediate.type);

                TestData.Fact.Immediate.id = body['@rid'];

                done();
            }
        });
    });

    test('> POST /article/:article_id/statement - Creating Article Statements: ', function(done) {
        Request.post({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement',
            body: TestData.Statement.Immediate,
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
                body.note.should.equal(TestData.Statement.Immediate.note);
                body.type.should.equal(TestData.Statement.Immediate.type);

                TestData.Statement.Immediate.id = body['@rid'];

                done();
            }
        });
    });

    test('> GET /article/:article_id/fact/:fact_id - Retrieving an Article Fact: ', function(done) {
        Request.get({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
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
                body['@rid'].should.equal(TestData.Fact.Immediate.id);
                body.note.should.equal(TestData.Fact.Immediate.note);
                body.type.should.equal(TestData.Fact.Immediate.type);

                done();
            }
        });
    });

    test('> GET /article/:article_id/fact/:stmt_id - Retrieving an Article Statement: ', function(done) {
        Request.get({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
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
                body['@rid'].should.equal(TestData.Statement.Immediate.id);
                body.note.should.equal(TestData.Statement.Immediate.note);
                body.type.should.equal(TestData.Statement.Immediate.type);

                done();
            }
        });
    });

    test('> PUT /article/:article_id/fact/:fact_id - Updating an Article Fact: ', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
            body: TestData.FactChanged.Immediate,
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
                body.note.should.equal(TestData.FactChanged.Immediate.note);
                body.type.should.equal(TestData.FactChanged.Immediate.type);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
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
                        body.note.should.equal(TestData.FactChanged.Immediate.note);
                        body.type.should.equal(TestData.FactChanged.Immediate.type);

                        done();
                    }
                });
            }
        });
    });

    test('> PUT /article/:article_id/statement/:stmt_id - Updating an Article Statement: ', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
            body: TestData.StatementChanged.Immediate,
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
                body.note.should.equal(TestData.StatementChanged.Immediate.note);
                body.type.should.equal(TestData.StatementChanged.Immediate.type);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
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
                        body.note.should.equal(TestData.StatementChanged.Immediate.note);
                        body.type.should.equal(TestData.StatementChanged.Immediate.type);

                        done();
                    }
                });
            }
        });
    });

    // --
    // Integrity Tests
    // --

    test('> Integrity: GET /article/:id with invalid @rid should 400', function(done) {
        Request.get({
            url: Config.host + '/article/asddasd',
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

    test('> Integrity: GET /article/:id with non-existent @rid should 404', function(done) {
        Request.get({
            url: Config.host + '/article/0.0',
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

    test('> Integrity: PUT /article/:id with invalid @rid should 400', function(done) {
        Request.put({
            url: Config.host + '/article/asddasd',
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

    test('> Integrity: PUT /article/:id with non-existent @rid should 404', function(done) {
        Request.put({
            url: Config.host + '/article/0.0',
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

    test('> Integrity: DELETE /article/:id with invalid @rid should 400', function(done) {
        Request.del({
            url: Config.host + '/article/asddasd',
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

    test('> Integrity: DELETE /article/:id with non-existent @rid should 404', function(done) {
        Request.del({
            url: Config.host + '/article/0.0',
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

    test('> Integrity: POST /article with supplied :slug & @rid should be ignored, and remain unique', function(done) {
        // !! Relies on earlier verification that a slug exists.
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
                body.body.should.equal(TestData.Article.body);
                body.title.should.equal(TestData.Article.title);
                body.featured.should.equal(TestData.Article.featured);
                body.imageUrl.should.equal(TestData.Article.imageUrl);
                body.post_date.should.equal(TestData.Article.post_date);
                body.url.should.equal(TestData.Article.url);
                body.slug.should.be.ok;

                // Main Tests
                body.slug.should.not.equal( TestData.Article.slug );
                body['@rid'].should.not.equal( TestData.Article.id );

                // Clean up after ourself.
                Request.del({
                    url: Config.host + '/article/' + RID.Encode(body['@rid']),
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

    test('> Integrity: POST /article with invalid :title [ too short ] should be rejected', function(done) {
        var old_title = TestData.Article.title;
        TestData.Article.title = '';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.title = old_title;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article with invalid :title [ too long ] should be rejected', function(done) {
        var old_title = TestData.Article.title;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Article.title = buf.toString('hex');

            Request.post({
                url: Config.host + '/article',
                body: TestData.Article,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Article.title = old_title;
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

    test('> Integrity: POST /article with invalid :body [ too short ] should be rejected', function(done) {
        var old_body = TestData.Article.body;
        TestData.Article.body = '';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.body = old_body;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article with invalid :body [ too long ] should be rejected', function(done) {
        var old_body = TestData.Article.body;

        Crypto.randomBytes(102600, function(ex, buf) {
            TestData.Article.body = buf.toString('hex');

            Request.post({
                url: Config.host + '/article',
                body: TestData.Article,
                headers: {
                "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Article.body = old_body;
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

    test('> Integrity: POST /article with invalid :url [ not url ] should be rejected', function(done) {
        var old = TestData.Article.url;
        TestData.Article.url = 'Honey Boo Boo';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.url = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article with invalid :url [ too short ] should be rejected', function(done) {
        var old = TestData.Article.url;
        TestData.Article.url = '';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.url = old;
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
    test('> Integrity: POST /article with invalid :url [ too long ] should be rejected', function(done) {
        var old = TestData.Article.url;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Article.url = buf.toString('hex');

            Request.post({
                url: Config.host + '/article',
                body: TestData.Article,
                json: true
            }, function (e, r, body) {
                TestData.Article.url = old;
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

    test('> Integrity: POST /article with invalid :imageUrl [ not url ] should be rejected', function(done) {
        var old = TestData.Article.imageUrl;
        TestData.Article.imageUrl = 'Honey Boo Boo';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.imageUrl = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article with invalid :imageUrl [ too short ] should be rejected', function(done) {
        var old = TestData.Article.imageUrl;
        TestData.Article.imageUrl = '';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.imageUrl = old;
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
     test('> Integrity: POST /article with invalid :imageUrl [ too long ] should be rejected', function(done) {
        var old = TestData.Article.imageUrl;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Article.imageUrl = buf.toString('hex');

            Request.post({
                url: Config.host + '/article',
                body: TestData.Article,
                json: true
            }, function (e, r, body) {
                TestData.Article.imageUrl = old;
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

    test('> Integrity: POST /article with invalid :featured [ too high ] should be rejected', function(done) {
        var old = TestData.Article.featured;
        TestData.Article.featured = 3;

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.featured = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article with invalid :featured [ not numeric ] should be rejected', function(done) {
        var old = TestData.Article.featured;
        TestData.Article.featured = 'Stuff&Such';

        Request.post({
            url: Config.host + '/article',
            body: TestData.Article,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Article.featured = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: PUT /article/:id - Trying to change slug should fail', function(done) {
        // !! Relies on earlier verification that a slug exists.

        var fake = '1234567890-my-new-fake-slug';

        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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

    test('> Integrity: PUT /article/:id with invalid :title [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
            body: { title: '' },
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

    test('> Integrity: PUT /article/:id with invalid :title [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            var title = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
                body: { title: title },
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

    test('> Integrity: PUT /article/:id with invalid :body [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
            body: { body: '' },
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

    test('> Integrity: PUT /article/:id with invalid :body [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(102600, function(ex, buf) {
            var body = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
                body: { body: body },
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

    test('> Integrity: PUT /article/:id with invalid :url [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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
    test('> Integrity: PUT /article/:id with invalid :url [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            var url = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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

    test('> Integrity: PUT /article/:id with invalid :url [ not url ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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

    test('> Integrity: PUT /article/:id with invalid :imageUrl [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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
     test('> Integrity: PUT /article/:id with invalid :imageUrl [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(257, function(ex, buf) {
            var imageUrl = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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

    test('> Integrity: PUT /article/:id with invalid :imageUrl [ not url ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
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

    test('> Integrity: PUT /article/:id with invalid :featured [ too high ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
            body: { featured: 3 },
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

    test('> Integrity: PUT /article/:id with invalid :featured [ not numeric ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id),
            body: { featured: 'Honey Boo Boo' },
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

    test('> Integrity: POST /article/:article_id/fact with invalid :note [ too short ] should be rejected', function(done) {
        var old = TestData.Fact.Immediate.note;
        TestData.Fact.Immediate.note = '';

        Request.post({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact',
            body: TestData.Fact.Immediate,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Fact.Immediate.note = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article/:article_id/fact with invalid :note [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1050, function(ex, buf) {
            var val = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
                body: { note: val },
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

    test('> Integrity: POST /article/:article_id/statement with invalid :note [ too short ] should be rejected', function(done) {
        var old = TestData.Statement.Immediate.note;
        TestData.Statement.Immediate.note = '';

        Request.post({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement',
            body: TestData.Statement.Immediate,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Statement.Immediate.note = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /article/:article_id/statement with invalid :note [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1050, function(ex, buf) {
            var val = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
                body: { note: val },
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

    test('> Integrity: PUT /article/:article_id/fact/:fact_id with invalid :note [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
            body: { note: '' },
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

    test('> Integrity: PUT /article/:article_id/fact/:fact_id with invalid :note [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1050, function(ex, buf) {
            var val = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
                body: { note: val },
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

    test('> Integrity: PUT /article/:article_id/statement/:stmt_id with invalid :note [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
            body: { note: '' },
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

    test('> Integrity: PUT /article/:article_id/statement/:stmt_id with invalid :note [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1050, function(ex, buf) {
            var val = buf.toString('hex');

            Request.put({
                url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
                body: { note: val },
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

    test('> Integrity: GET /article/:article_id/rate - Rate an article with rating 6 : should fail', function(done) {
        Request.post({
            url: Config.host + '/article/'+ RID.Encode(TestData.Article.id) +'/rate',
            body: {rating: 6},
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

    // TODO: Test invalid :type for ArticleFact & ArticleStatement

    // --
    // Suite Teardown
    // --

    test('> DELETE /article/:id/fact/:fact_id - Deleting an Article Fact', function(done) {
        Request.del({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
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
                if (body == undefined) {
                    // --
                    // Step 2: Verify the object is still gone.
                    // --

                    Request.get({
                        url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/fact/' + RID.Encode(TestData.Fact.Immediate.id),
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
            }
        });
    });

    test('> DELETE /article/:id/statement/:stmt_id - Deleting an Article Statement', function(done) {
        Request.del({
            url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
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
                    url: Config.host + '/article/' + RID.Encode(TestData.Article.id) + '/statement/' + RID.Encode(TestData.Statement.Immediate.id),
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

    test('> GET /article/:id - Retrieving an Article again to check complete data', function(done) {
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
                r.statusCode.should.equal(200);
                body['@rid'].should.be.ok;
                body.rating.should.exists;
                body.publisher.should.exists;
                body.journalist.should.exists;
                done();
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

    after(function(done) {
        done();
    });

});