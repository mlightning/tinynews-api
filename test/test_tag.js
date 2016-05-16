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
    TestTag: {
        name: "test_api_tag_00001",
        type_group: 1
    },
    TestTagChanged: {
        name: "test_api_tag_00005",
        slug: "should_never_exist_01",
        type_group: 1
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

describe('API - Tags :', function() {

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
                    TestData.TestTag.publisher_id = body['@rid'];
                    done();
                }
            });
        })
    });

    // --
    // CRUD Tests
    // --

    test('> POST /tag - Creating a new Tag', function(done) {
        Request.post({
            url: Config.host + '/tag',
            body: TestData.TestTag,
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
                body.name.should.equal(TestData.TestTag.name);
                body.slug.should.be.ok;

                TestData.TestTag.id = body['@rid'];
                TestData.TestTag.slug = body.slug;

                done();
            }
        });
    });

    test('> GET /tag/:tag_id - Retrieving a Tag', function(done) {
        Request.get({
            url: Config.host + '/tag/' + RID.Encode(TestData.TestTag.id),
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
                body.name.should.equal(TestData.TestTag.name);
                body.slug.should.equal(TestData.TestTag.slug);

                done();
            }
        });
    });

    test('> LIST /tags - Listing Tags', function(done) {
        Request.get({
            url: Config.host + '/tags',
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
                    if (body[i]['@rid'] == TestData.TestTag.id) {
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

    test('> Integrity: GET /tag/:id with invalid @rid should 400', function(done) {
        Request.get({
            url: Config.host + '/tag/asddasd',
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

    test('> Integrity: GET /tag/:id with non-existent @rid should 404', function(done) {
        Request.get({
            url: Config.host + '/tag/0.0',
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

    test('> Integrity: POST /tag with supplied :slug & @rid should be ignored, and remain unique', function(done) {
        // !! Relies on earlier verification that a slug exists.
        Request.post({
            url: Config.host + '/tag',
            body: TestData.TestTagChanged,
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
                body.name.should.equal(TestData.TestTagChanged.name);
                body.slug.should.be.ok;

                // Main Tests
                body.slug.should.not.equal( TestData.TestTag.slug );
                body['@rid'].should.not.equal( TestData.TestTag.id );

                // Clean up after ourself.
                Request.del({
                    url: Config.host + '/tag/' + RID.Encode(body['@rid']),
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

    test('> Integrity: POST /tag with invalid :name [ too short ] should be rejected', function(done) {
        var old = TestData.TestTag.name;
        TestData.TestTag.name = '';

        Request.post({
            url: Config.host + '/tag',
            body: TestData.TestTag,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.TestTag.name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /tag with invalid :name [ too long ] should be rejected', function(done) {
        var old = TestData.TestTag.name;

        Crypto.randomBytes(80, function(ex, buf) {
            TestData.TestTag.name = buf.toString('hex');

            Request.post({
                url: Config.host + '/tag',
                body: TestData.TestTag,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.TestTag.name = old;
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

    test('> Integrity: PUT /tag/:id - Trying to change slug should fail', function(done) {
        // !! Relies on earlier verification that a slug exists.

        var fake = '1234567890-my-new-fake-slug';

        Request.put({
            url: Config.host + '/tag/' + RID.Encode(TestData.TestTag.id),
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

    test('> Integrity: PUT /tag/:id with invalid :name [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/tag/' + RID.Encode(TestData.TestTag.id),
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

    test('> Integrity: PUT /tag/:id with invalid :name [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(80, function(ex, buf) {
            Request.put({
                url: Config.host + '/tag/' + RID.Encode(TestData.TestTag.id),
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

    // --
    // Suite Teardown
    // --

    test('> DELETE /tag/:tag_id - Deleting a Tag', function(done) {
        Request.del({
            url: Config.host + '/tag/' + RID.Encode(TestData.TestTag.id),
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

                // --
                // Step 2: Verify the object is still gone.
                // --

                Request.get({
                    url: Config.host + '/tag/' + RID.Encode(TestData.TestTag.id),
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