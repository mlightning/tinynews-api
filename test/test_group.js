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
    Group: {
        "name":"Premium Members Group",
        "imageUrl":"www.google.com/images/test.com",
        "type":2,
        "url": "http://google.com/glass",
        "status":1
    },
    GroupChanged: {
        "name":"Super Premium Members Group",
        "imageUrl":"www.google.com/images/image.jpg",
        "type":1,
        "url": "https://google.com",
        "status" : 2
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
    }
};

// ----------------
//   Test
// ----------------

describe('API - Group :', function() {

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

    test('> POST /group - Creating a Group', function(done) {
        Request.post({
            url: Config.host + '/group',
            body: TestData.Group,
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
                body.name.should.equal(TestData.Group.name);
                body.imageUrl.should.equal(TestData.Group.imageUrl);
                body.type.should.equal(TestData.Group.type);
                body.url.should.equal(TestData.Group.url);
                body.status.should.equal(TestData.Group.status);
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));
                body.slug.should.be.ok;

                TestData.Group.id = body['@rid'];
                TestData.Group.slug = body.slug;
                console.log('test.data.group.id',TestData.Group.id);

                Request.get({
                    url: Config.host + '/group/' + RID.Encode(TestData.Group.id) + '/members',
                    headers: {
                        "X-Auth-Token": TestData.Token.token
                    },
                    json:true
                }, function(e, r, body){
                    r.statusCode.should.equal(200);

                    var exists = false;
                    body.forEach(function(member) {
                        if (member['@rid'] == TestData.Token.user['@rid']) {
                            exists = true;
                            member.first_name.should.equal(TestData.Token.user.first_name);
                            member.last_name.should.equal(TestData.Token.user.last_name);
                            member.email.should.equal(TestData.Token.user.email);
                        }
                    });

                    exists.should.be.ok;

                    Request.get({
                        url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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

                            var mod_exists = false;
                            body.moderators.forEach(function(mod) {
                                if (mod['@rid'] == TestData.Token.user['@rid']) {
                                    mod_exists = true;
                                    mod.handle.should.equal(TestData.Token.user.handle);
                                }
                            });

                            mod_exists.should.be.ok;
                            body.slug.should.be.ok;
                            done();
                        }
                    });

                })
            }
        });
    });

    test('> POST /user - Creating a User to test membership functions', function(done) {
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

    test('> GET /group/:id - Retrieving a Group', function(done) {
        Request.get({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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
                body.name.should.equal(TestData.Group.name);
                body.imageUrl.should.equal(TestData.Group.imageUrl);
                body.type.should.equal(TestData.Group.type);
                body.url.should.equal(TestData.Group.url);
                body.status.should.equal(TestData.Group.status);
                body.slug.should.be.ok;
                done();
            }
        });
    });

    test('> PUT /group/:id - Updating an Group', function(done) {
        Request.put({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
            body: TestData.GroupChanged,
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

                body.name.should.equal(TestData.GroupChanged.name);
                body.imageUrl.should.equal(TestData.GroupChanged.imageUrl);
                body.type.should.equal(TestData.GroupChanged.type);
                body.url.should.equal(TestData.GroupChanged.url);
                body.status.should.equal(TestData.GroupChanged.status);
                body.slug.should.be.ok;

                // Slug should remain unchanged
                body.slug.should.equal(TestData.Group.slug);

                // --
                // Step 2: Retrieve again and check response.
                // --

                Request.get({
                    url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
                    headers: {
                        "X-Auth-Token": TestData.Token.token
                    },
                    json: true
                }, function(e, r, body) {
                    if (e) {
                        throw e;
                        done(e);
                    } else {
                        body['@rid'].should.be.ok;
                        body.name.should.equal(TestData.GroupChanged.name);
                        body.imageUrl.should.equal(TestData.GroupChanged.imageUrl);
                        body.type.should.equal(TestData.GroupChanged.type);
                        body.url.should.equal(TestData.GroupChanged.url);
                        body.status.should.equal(TestData.GroupChanged.status);
                        body.slug.should.be.ok;
                     // Slug should remain unchanged
                        body.slug.should.equal(TestData.Group.slug);

                        done();
                    }
                });
            }
        });
    });

    test('> LIST /groups - Listing Groups', function(done) {
        // TODO: This test will require an update when listing gets filtering options.
        Request.get({
            url: Config.host + '/groups',
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
                    if (body[i]['@rid'] == TestData.Group.id) {
                        exists = true;
                    }
                }

                exists.should.be.ok;

                done();
            }
        });
    });

    // --
    // Group Member CRUD
    // --

    test('> POST /group/:group_id/member - Add a User to a Group', function(done){
        Request.post({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id) + '/member',
            body: { member_id: TestData.User.id },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body) {
            try {
                r.statusCode.should.equal(200);
                done();
            }
            catch (e) {
                done(e);
            }

        })
    });

    test('> GET /group/:group_id/members - List Group members', function(done){
        Request.get({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id) + '/members',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(200);

            var exists = false;
            body.forEach(function(member) {
                if (member['@rid'] == TestData.User.id) {
                    exists = true;
                    member.first_name.should.equal(TestData.User.first_name);
                    member.last_name.should.equal(TestData.User.last_name);
                    member.email.should.equal(TestData.User.email);
                }
            });

            exists.should.be.ok;

            done();
        })
    });

    test('> POST /user/:user_id/feed/settings/group - Add a group in UserFeedSettings', function(done){
            Request.post({
                url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/group?group_id='+RID.Encode(TestData.Group.id),
                body: { group_id: TestData.Group.id },
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function(e, r, body){
                r.statusCode.should.equal(200);
                body.should.equal("Group Added");
                done()

            })
    });

    test('> DEL /user/:user_id/feed/settings/group/:group_id - Delete a group in UserFeedSettings', function(done){
        Request.del({
            url: Config.host + '/user/' + RID.Encode(TestData.User.id) + '/feed/settings/group/' + RID.Encode(TestData.Group.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(204);
            done()

        })
    });

    // --
    // Group Moderator CRUD
    // --

    test('> POST /group/:group_id/moderator - Add a Moderator to Group', function(done){
        Request.post({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id) + '/moderator',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            body: { mod_id: TestData.User.id },
            json:true
        }, function(e, r, body) {
            r.statusCode.should.equal(200);
            done();
        })
    });

    test('> GET /group/:id - Retrieving a Group should list Moderators', function(done) {
        Request.get({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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

                var exists = false;
                body.moderators.forEach(function(mod) {
                    if (mod['@rid'] == TestData.User.id) {
                        exists = true;
                        mod.handle.should.equal(TestData.User.handle);
                    }
                });

                exists.should.be.ok;
                body.slug.should.be.ok;

                done();
            }
        });
    });

    test('> DELETE /group/:group_id/moderator - Delete a Moderator from Group', function(done){
        Request.del({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id) + '/moderator',
            body: { mod_id: TestData.User.id },
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body) {
            r.statusCode.should.equal(204);
            done();
        })
    });

    test('> DELETE /group/:group_id/member -  Delete a User from Group', function(done){
        Request.del({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id) + '/member/' + RID.Encode(TestData.User.id),
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json:true
        }, function(e, r, body){
            r.statusCode.should.equal(204);
            done();
        });
    });

    // --
    // Integrity Tests
    // --

    test('> Integrity: GET /group/:id with invalid @rid should 400', function(done) {
        Request.get({
            url: Config.host + '/group/asddasd',
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

    test('> Integrity: GET /group/:id with non-existent @rid should 404', function(done) {
        Request.get({
            url: Config.host + '/group/0.0',
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

    test('> Integrity: POST /group with supplied :slug & @rid should be ignored, and remain unique', function(done) {
        // !! Relies on earlier verification that a slug exists.
        Request.post({
            url: Config.host + '/group',
            body: TestData.GroupChanged,
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
                body.name.should.equal(TestData.GroupChanged.name);
                body.imageUrl.should.equal(TestData.GroupChanged.imageUrl);
                body.type.should.equal(TestData.GroupChanged.type);
                body.url.should.equal(TestData.GroupChanged.url);
                body.status.should.equal(TestData.GroupChanged.status);
                body.slug.should.be.ok;

                // Main Tests
                body.slug.should.not.equal( TestData.Group.slug );
                body['@rid'].should.not.equal( TestData.Group.id );

                // Clean up after ourself.
                Request.del({
                    url: Config.host + '/group/' + RID.Encode(body['@rid']),
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

    test('> Integrity: POST /group with invalid :name [ too short ] should be rejected', function(done) {
        var old = TestData.Group.name;
        TestData.Group.name = '';

        Request.post({
            url: Config.host + '/group',
            body: TestData.Group,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Group.name = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /group with invalid :name [ too long ] should be rejected', function(done) {
        var old = TestData.Group.name;

        Crypto.randomBytes(80, function(ex, buf) {
            TestData.Group.name = buf.toString('hex');

            Request.post({
                url: Config.host + '/group',
                body: TestData.Group,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.Group.name = old;
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

    test('> Integrity: POST /group with invalid :url [ not url ] should be rejected', function(done) {
        var old = TestData.Group.url;
        TestData.Group.url = 'Honey Boo Boo';

        Request.post({
            url: Config.host + '/group',
            body: TestData.Group,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Group.url = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /group with invalid :url [ too short ] should be rejected', function(done) {
        var old = TestData.Group.url;
        TestData.Group.url = '';

        Request.post({
            url: Config.host + '/group',
            body: TestData.Group,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.Group.url = old;
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
     test('> Integrity: POST /group with invalid :url [ too long ] should be rejected', function(done) {
        var old = TestData.Group.url;

        Crypto.randomBytes(257, function(ex, buf) {
            TestData.Group.url = buf.toString('hex');

            Request.post({
                url: Config.host + '/group',
                body: TestData.Group,
                json: true
            }, function (e, r, body) {
                TestData.Group.url = old;
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

    test('> Integrity: PUT /group/:id - Trying to change slug should fail', function(done) {
        // !! Relies on earlier verification that a slug exists.

        var fake = '1234567890-my-new-fake-slug';

        Request.put({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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

    test('> Integrity: PUT /group/:id with invalid :description [ too long ] should be rejected', function(done) {
        Crypto.randomBytes(1025, function(ex, buf) {
            Request.put({
                url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
                body: { description: buf.toString('hex') },
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

    test('> Integrity: PUT /group/:id with invalid :url [ too short ] should be rejected', function(done) {
        Request.put({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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

    // --
    // Suite Teardown
    // --

    test('> DELETE /group/:id - Deleting a Group', function(done) {
        Request.del({
            url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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
                    url: Config.host + '/group/' + RID.Encode(TestData.Group.id),
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

});
