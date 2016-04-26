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
    TokenNoPerm : '',
    User: {
        handle: 'testuser1',
        password: 'testpass',
        first_name: 'Test',
        last_name: 'User',
        email: 'test_name@abc.com',
        status : 1
    },
    User2: {
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
        userBackground:[{
            description: 'Tinynews project working since 2014',
            organization: 'Dalca',
            title: 'Senior NodeJS developer',
            year_end: 'Current',
            year_start: '2014'
        },
        {
            description: 'Apple projects US',
            organization: 'Apple Inc',
            title : 'Senior Jive developer',
            year_start: '2012',
            year_end : '2014'
        }
        ]
    }
    },
    Article: {
        "body":"asdasdsadsa",
        "featured": 0,
        "imageUrl": "http://glass-apps.org/wp-content/uploads/2013/06/google-glass1.jpg",
        "postDate": 1397573350,
        "title": "My Awesome Google Glass Article 34567890",
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
                    TestData.User.id = body['@rid'];
                    TestData.User.handle = body.handle;

                    Request.post({
                        url: Config.host + '/user',
                        body: TestData.User2,
                        headers: {
                            "X-Auth-Token": TestData.Token.token
                        },
                        json: true
                    }, function(e, r, body) {
                        if (e) {
                            throw e;
                            done(e);
                        } else {
                            TestData.User2.id = body['@rid'];
                            TestData.User2.handle = body.handle;
                            done();
                        }
                    });
                }
            });
        });
    });

    // --
    // CRUD Tests
    // --

    test('> POST /auth/token - Creating an Auth Token', function(done){
        Request.post({
            url: Config.host + '/auth/token',
            headers: {
                'X-Auth-User': TestData.User.handle,
                'X-Auth-Password': TestData.User.password
            },
            json:true
        }, function(e, r, body) {
            body.should.be.ok;
            body.token.should.be.ok;
            body.issued.should.be.ok;
            body.expires.should.be.ok;
            body.is_valid.should.equal(true);
            body.user.first_name.should.equal(TestData.User.first_name);
            body.user.last_name.should.equal(TestData.User.last_name);
            body.user.email.should.equal(TestData.User.email);
            body.user.status.should.equal(TestData.User.status);
            body.user.handle.should.equal(TestData.User.handle);
            r.statusCode.should.equal(200);

            TestData.TokenNoPerm = body;
            done();
        })
    });

    // --
    // Security Tests
    // --

    test('> Integrity: POST /auth/token with invalid password should be rejected', function(done) {
        Request.post({
            url: Config.host + '/auth/token',
            headers: {
                'X-Auth-User': TestData.User.handle,
                'X-Auth-Password': Crypto.createHash('sha1').update(TestData.User.password).digest('hex')
            },
            json:true
        }, function(e, r, body) {
            r.statusCode.should.equal(401);
            done();
        })
    });

    test('> Integrity: POST /auth/token with invalid user handle should be rejected', function(done) {
        Request.post({
            url: Config.host + '/auth/token',
            headers: {
                'X-Auth-User': "wrong handle",
                'X-Auth-Password': TestData.User.password
            },
            json: true
        }, function(e, r, body) {
            r.statusCode.should.equal(401);
            done();
        })
    });

    // --
    // Integrity Tests
    // --

    test('> Integrity: POST /auth/token with invalid header should be rejected', function(done) {
        Request.post({
            url: Config.host + '/auth/token',
            headers: {
                'X-Auth-Usar': TestData.User.handle,
                'X-Auth-Password': TestData.User.password
            },
            json:true
        }, function(e, r, body) {
            r.statusCode.should.equal(401);
            done();
        })
    });

    // --
    // Suite Teardown
    // --

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
                Request.del({
                    url: Config.host + '/user/' + RID.Encode(TestData.User2.id),
                    headers: {
                        "X-Auth-Token": TestData.Token.token
                    },
                    json: true
                }, function(e, r, body) {
                    if (e) {
                        throw e;
                        done(e);
                    } else {
                        done();
                    }
                });
            }
        });
    });

});
