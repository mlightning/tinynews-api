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
	TestComment: {
        body: "Bla Blla Comment",
        type: 1
    },
    TestComment2: {
        body: "waka waka comment: child of bla blla",
        type: 1
    },
    TestComment3: {
    	body: "la la la comment : child for bla blla",
        type: 1
    },
    TestComment4: {
    	body: "tadaa~~~:  child of la la la",
        type: 1
    },
    TestCommentChanged: {
    	body: "changed balbalbal"
    },
    TestUser1: {
        handle: 'testuser1',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@abc.com',
        status : 1
    },
    Publisher: {
        "name":"asdasdsadsa",
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "url": "http://google.com/glass"
    }
}

var user_id = "";
var owner_id = "";

// ----------------
//   Test
// ----------------

describe('API - Comment :', function() {

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
                body.slug.should.be.ok;

                TestData.Publisher.id = body['@rid'];
                TestData.Publisher['@rid'] = body['@rid'];
                TestData.Publisher['@class'] = body['@rid'];
                TestData.Publisher.slug = body.slug;
                
                owner_id = TestData.Publisher.id;
                done();
            }
        });
    });

    test('> POST /publisher/:owner_id/comment - Creating a Publisher Comment', function(done) {
        Request.post({
            url: Config.host + '/publisher/'+ RID.Encode(TestData.Publisher.id) +'/comment',
            body: TestData.TestComment,
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
                body.body.should.equal(TestData.TestComment.body);
                body.type.should.equal(TestData.TestComment.type);
                
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

                TestData.TestComment.id = body['@rid'];
                done();
            }
        });
    });
    
    test('> POST /publisher/:owner_id/comment/:comment_id - Creating a Comment to Comment', function(done) {
        Request.post({
            url: Config.host + '/publisher/' + RID.Encode(owner_id) + '/comment/' + RID.Encode(TestData.TestComment.id),
            body: TestData.TestComment2,
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
                body.body.should.equal(TestData.TestComment2.body);
                body.type.should.equal(TestData.TestComment2.type);
                
                body.creation_date.should.be.ok;
                body.modification_date.should.be.ok;
                body.creation_date.should.equal(body.modification_date);
                body.creation_date.should.be.within(Math.round(Date.now() / 1000) - 2, Math.round(Date.now() / 1000));

                TestData.TestComment2.id = body['@rid'];
                done();
            }
        });
    });

    test('> GET /publisher/:publisher_id/comments - Retrieving an Comment for Publisher', function(done) {
        Request.get({
            url: Config.host + '/publisher/' + RID.Encode(owner_id) + '/comment',
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
                body.length.should.be.ok;
                body.length.should.equal(2);
                done();
            }
        });
    });

    test('> PUT /publisher/:owner_id/comment/:comment_id - Updating an Comment for publisher', function(done) {
        Request.put({
            url: Config.host + '/publisher/'+RID.Encode(owner_id)+'/comment/' + RID.Encode(TestData.TestComment.id),
            body: TestData.TestCommentChanged,
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
            	body.body.should.equal(TestData.TestCommentChanged.body);

                // Type should remain unchanged
            	body.type.should.equal(TestData.TestComment.type);

            	done();
            }
        });
    });

    test('> POST /comment/:comment_id/vote/:vote_id - Voting on a Comment ', function(done) {
        Request.post({
            url: Config.host + '/comment/' + RID.Encode(TestData.TestComment.id) + '/vote/-1' ,
            body: TestData.TestCommentChanged,
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

    test('> POST /comment/:comment_id/vote/:vote_id - Get votes for a Comment ', function(done) {
        Request.get({
            url: Config.host + '/comment/' + RID.Encode(TestData.TestComment.id) + '/vote' ,
            body: TestData.TestCommentChanged,
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
                body.downVotes.should.equal(1);
                body.effective.should.equal(-1);
                body.upVotes.should.equal(0);
                body.total.should.equal(1);
                done();
            }
        });
    });
   
   
    // --
    // Integrity Tests
    // --
  
    test('> Integrity: POST /publisher/:owner_id/comment with invalid :body [ too short ] should be rejected', function(done) {
        var old = TestData.TestComment.body;
        TestData.TestComment.body = '';

        Request.post({
        	url: Config.host + '/publisher/'+ RID.Encode(owner_id) +'/comment',
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            body: TestData.TestComment,
            json: true
        }, function(e, r, body) {
            TestData.TestComment.body = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });

    test('> Integrity: POST /publisher/:owner_id/comment with invalid :body [ too long ] should be rejected', function(done) {
        var old = TestData.TestComment.body;

        Crypto.randomBytes(1025, function(ex, buf) {
            TestData.TestComment.body = buf.toString('hex');

            Request.post({
            	url: Config.host + '/publisher/'+ RID.Encode(owner_id) +'/comment',
                body: TestData.TestComment,
                headers: {
                    "X-Auth-Token": TestData.Token.token
                },
                json: true
            }, function (e, r, body) {
                TestData.TestComment.body = old;
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

    test('> Integrity: POST /publisher/:owner_id/comment with invalid :type [ not int ] should be rejected', function(done) {
        var old = TestData.TestComment.type;
        TestData.TestComment.type = 'wakawaka';
            
    	Request.post({
            url: Config.host + '/publisher/'+ RID.Encode(owner_id) +'/comment',
            body: TestData.TestComment,
            headers: {
                "X-Auth-Token": TestData.Token.token
            },
            json: true
        }, function(e, r, body) {
            TestData.TestComment.type = old;
            if (e) {
                throw e;
                done(e);
            } else {
                r.statusCode.should.equal(400);
                done();
            }
        });
    });
    
    test('> Integrity: DELETE /comment/:id with non-existent @rid should 404', function(done) {
    	 Request.del({
         	url: Config.host + '/publisher/'+RID.Encode(owner_id)+'/comment/0.0',
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

    
    // --
    // Suite Teardown
    // --

    test('> DELETE /publisher/:owner_id/comment/:comment_id - Deleting an Comment for Publisher', function(done) {
        Request.del({
        	url: Config.host + '/publisher/'+RID.Encode(owner_id)+'/comment/' + RID.Encode(TestData.TestComment.id),
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
                done();
            }
        });
    });

    test('> DELETE /publisher/:id - Deleting a Publisher', function(done) {
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

    after(function(done) {
        done();
    });

});
