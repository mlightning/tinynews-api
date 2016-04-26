// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var Crypto              = require('crypto');
var Async               = require('async');
var Redis               = require('redis');
var Kue                 = require('kue');

// Shared Core
var Core                = require('tinynews-common');

// Models
var User                = Core.Models.User;

// Init Email Job server queue
Kue.redis.createClient = function() {
    return Redis.createClient(Core.Config.redis.port, Core.Config.redis.host);
}

var Jobs = Kue.createQueue();

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Create a User
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.admin']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** Password **/
                validate.AssertTrue('isLength', [req.params.password, 8, 64],    'Body parameter :password must be between 8 and 64 characters.')
                validate.AssertFalse('isNull',  [req.params.password],           'Body parameter :password may not be null.')
            /** First Name **/
                validate.AssertTrue('isLength', [req.params.first_name, 2, 64],  'Body parameter :first_name must be between 2 and 64 characters.')
                validate.AssertFalse('isNull',  [req.params.first_name],         'Body parameter :first_name may not be null.')
            /** Last Name **/
                validate.AssertTrue('isLength', [req.params.last_name, 2, 64],   'Body parameter :last_name must be between 2 and 64 characters.')
                validate.AssertFalse('isNull',  [req.params.last_name],          'Body parameter :last_name may not be null.')
            /** Email Address **/
                validate.AssertTrue('isLength', [req.params.email, 5, 128],      'Body parameter :email must be between 5 and 128 characters.')
                validate.AssertTrue('isEmail',  [req.params.email],              'Body parameter :email must be a valid email address.')
                validate.AssertFalse('isNull',  [req.params.email],              'Body parameter :email may not be null.')
            /** status **/
                validate.AssertFalse('isNull',  [req.params.status],             'Body parameter :status may not be null.')
                if (req.params.userProfile != undefined) {
                    /** about_me **/
                    validate.AssertTrue('isLength', [req.params.userProfile.about_me, 0, 1024],  'Profile parameter :about_me must be between 0 and 1024 characters.')
                    /** city **/
                    validate.AssertTrue('isLength', [req.params.userProfile.city, 0, 64],        'Profile parameter :city must be between 0 and 64 characters.')
                    /** country **/
                    validate.AssertTrue('isLength', [req.params.userProfile.country, 0, 64],     'Profile parameter :country must be between 0 and 64 characters.')
                    /** state **/
                    validate.AssertTrue('isLength', [req.params.userProfile.state, 0, 64],       'Profile parameter :state must be between 0 and 64 characters.')
                    /** phone_home **/
                    validate.AssertTrue('isLength', [req.params.userProfile.phone_home, 0, 16],  'Profile parameter :phone_home must be between 0 and 16 characters.')
                    /** phone_mobile **/
                    validate.AssertTrue('isLength', [req.params.userProfile.phone_mobile, 0, 16],'Profile parameter :phone_mobile must be between 0 and 16 characters.')
                    /** street1 **/
                    validate.AssertTrue('isLength', [req.params.userProfile.street1, 0, 64],     'Profile parameter :street1 must be between 0 and 64 characters.')
                    /** street2 **/
                    validate.AssertTrue('isLength', [req.params.userProfile.street2, 0, 64],     'Profile parameter :street2 must be between 0 and 64 characters.')
                    /** website_url **/
                    validate.AssertTrue('isLength', [req.params.userProfile.website_url, 0, 64], 'Profile parameter :website_url must be between 0 and 64 characters.')
                    /** zip **/
                    validate.AssertTrue('isLength', [req.params.userProfile.zip, 0, 64],         'Profile parameter :zip must be between 0 and 64 characters.')

                    for (var i in req.params.userProfile.userBackground){
                        var errorsbg = new Validate()
                        /** description **/
                        .AssertTrue('isLength', [req.params.userProfile.userBackground[i].description, 0, 1024],  'userBackground '+[i]+' parameter :description must be between 0 and 1024 characters.')
                        /** organization **/
                        .AssertTrue('isLength', [req.params.userProfile.userBackground[i].organization, 0, 128],  'userBackground '+[i]+' parameter :organization must be between 0 and 128 characters.')
                        /** title **/
                        .AssertTrue('isLength', [req.params.userProfile.userBackground[i].title, 0, 128],         'userBackground '+[i]+' parameter :title must be between 0 and 128 characters.')
                        /** year_end **/
                        .AssertTrue('isLength', [req.params.userProfile.userBackground[i].year_end, 0, 10],       'userBackground '+[i]+' parameter :year_end must be between 0 and 10 characters.')
                        /** year_start **/
                        .AssertTrue('isLength', [req.params.userProfile.userBackground[i].year_start, 0, 10],     'userBackground '+[i]+' parameter :year_start must be between 0 and 10 characters.')
                        .GetErrors();
                        if(errorsbg.length){
                            return Client.InvalidRequest(req, res, next, errorsbg);
                        }
                    }
                }

            var errors = validate.GetErrors();
            // Purge any defined handle, let the system manage this
            delete req.params.handle;

            // Purge any defined id, just in case!
            delete req.params['@rid'];

            if (!errors.length) {
                try {
                User.Create(req.params, function(e, user) {
                    if (e || !user) {
                        return Client.ServerError(req, res, next);
                    } else {
                        // Filter sensitive data
                        delete user.password;
                        delete user.permissions;

                        return Client.Success(req, res, next, user);
                    }
                });
                } catch (e) {
                    console.log(e);
                    return Client.ServerError(req, res, next);
                }
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return a Users data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.user_id],               'Path parameter :user_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.user_id)],   'Path parameter :user_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        console.log(e);
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Filter sensitive data
                        delete user.password;
                        delete user.permissions;

                        return Client.Success(req, res, next, user);
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            console.log(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Update a Users data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try {
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],            'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],'Path parameter :user_id must be a valid identifier.')
            }
            /** Handle **/
            if (typeof req.params.handle != 'undefined') {
                validate.AssertTrue('isLength', [req.params.handle, 3, 32],      'Body parameter :handle must be between 3 and 32 characters.');
                validate.AssertFalse('isNull',  [req.params.handle],             'Body parameter :handle may not be null.');
            }
            /** Password **/
            if (typeof req.params.password != 'undefined') {
                validate.AssertTrue('isLength', [req.params.password, 8, 64],    'Body parameter :password must be between 8 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.password],           'Body parameter :password may not be null.');
            }
            /** First Name **/
            if (typeof req.params.first_name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.first_name, 2, 64],  'Body parameter :first_name must be between 2 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.first_name],         'Body parameter :first_name may not be null.');
            }
            /** Last Name **/
            if (typeof req.params.last_name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.last_name, 2, 64],   'Body parameter :last_name must be between 2 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.last_name],          'Body parameter :last_name may not be null.');
            }
            /** Email Address **/
            if (typeof req.params.email != 'undefined') {
                validate.AssertTrue('isLength', [req.params.email, 5, 128],      'Body parameter :email must be between 5 and 128 characters.')
                validate.AssertTrue('isEmail',  [req.params.email],              'Body parameter :email must be a valid email address.');
                validate.AssertFalse('isNull',  [req.params.email],              'Body parameter :email may not be null.');
            }
            /** Profile Image **/
            if (typeof req.params.imageUrl != 'undefined') {
                validate.AssertTrue('isLength', [req.params.imageUrl, 5, 256],   'Body parameter :imageUrl must be between 5 and 256 characters.')
                //validate.AssertTrue('isURL',    [req.params.imageUrl],           'Body parameter :imageUrl must be a valid URL.');
                validate.AssertFalse('isNull',  [req.params.imageUrl],           'Body parameter :imageUrl may not be null.');
            }
            /** User status **/
            if (typeof req.params.status != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.status],              'Body parameter :status may not be null.');
            }

            var errors = validate.GetErrors();

            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.password != 'undefined') {
                            user.password = Crypto.createHash('sha1').update(req.params.password).digest('hex');
                        }
                        if (typeof req.params.first_name != 'undefined') {
                            user.first_name = req.params.first_name;
                        }
                        if (typeof req.params.last_name != 'undefined') {
                            user.last_name = req.params.last_name;
                        }
                        if (typeof req.params.email != 'undefined') {
                            user.email = req.params.email;
                        }
                        if (typeof req.params.status != 'undefined') {
                            user.status = req.params.status;
                        }
                        if (typeof req.params.imageUrl != 'undefined') {
                            user.imageUrl = req.params.imageUrl;
                        }

                        user.save(function(e, user) {
                            if (e || !user) {
                                return Client.ServerError(req, res, next);
                            } else {
                                // Filter sensitive data
                                delete user.password;
                                delete user.permissions;

                                return Client.Success(req, res, next, user);
                            }
                        });
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Delete a User
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.delete']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.user_id],               'Path parameter :user_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.user_id)],   'Path parameter :user_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        user.delete(function(e, user) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next, {});
                            }
                        });
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return multiple Users data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    List: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            // TODO: Add validation once filtering features are added
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                User.FindAll({}, function(e, users) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!users.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        for (var i in users) {
                            // Filter sensitive data
                            delete users[i].password;
                            delete users[i].permissions;
                        }

                        return Client.Success(req, res, next, users);
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return Active Users List
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ListActive: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                User.FindAll({ where: {status : 1}}, function(e, users) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!users.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        for (var i in users) {
                            // Filter sensitive data
                            delete users[i].password;
                            delete users[i].permissions;
                        }

                        return Client.Success(req, res, next, users);
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return Validating Users List
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ListValidating: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                User.FindAll({ where: { status: 0 }}, function(e, users) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!users.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        for (var i in users) {
                            // Filter sensitive data
                            delete users[i].password;
                            delete users[i].permissions;
                        }

                        return Client.Success(req, res, next, users);
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return Locked Users List
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ListLocked: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                User.FindAll({ where: {status : 2}}, function(e, users) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!users.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        for (var i in users) {
                            // Filter sensitive data
                            delete users[i].password;
                            delete users[i].permissions;
                        }

                        return Client.Success(req, res, next, users);
                    }
                })
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    },

     /**
     * Add a Friend
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    AddFriend: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
                return Client.NotAuthorized(req, res, next);
            }

            var errors = new Validate()
            .AssertFalse('isNull',  [req.params.friend_id],               'Body parameter :friend_id may not be null.')
            .AssertTrue('isRID',    [RID.Decode(req.params.friend_id)],   'Body parameter :friend_id must be a valid identifier.')
            .GetErrors();

            // Validate
            // Fetch and return
            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.token.user['@rid']) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        user.add_friend(req.params.friend_id, function(e, friend) {
                             if (e || !friend) {
                                console.log(e);
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, friend);
                            }
                        });
                    }
                });
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.log(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Return a list of the Users Friends
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ListFriends: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.api_get'] && !req.token.user.permissions['user.api_self']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Make sure the user has permission to fetch this User's data
            if (req.token.user.permissions['user.api_get']) {
                var user_id = RID.Decode(req.params.user_id);
            } else {
                if (RID.Decode(req.params.user_id) != req.token.user['@rid']) {
                    return Client.NotAuthorized(req, res, next);
                } else {
                    var user_id = RID.Decode(req.token.user['@rid']);
                }
            }

            // Validate
            // TODO: Add validation once filtering features are added
            var errors = [];

            User.Find({ where: { '@rid': user_id }}, function(e, user) {
                if (e) {
                    console.log(e);
                    return Client.ServerError(req, res, next);
                }

                user.get_friends(function(e, users) {
                    if (e) {
                        console.log(e);
                        return Client.ServerError(req, res, next);
                    }

                    users.forEach(function(user, i) {
                        delete user.password;
                        delete user.permissions;
                    });

                    // Fetch and return
                    if (!errors.length) {
                        return Client.Success(req, res, next, users);
                    } else {
                        return Client.InvalidRequest(req, res, next, errors);
                    }
                });
            });
        }
        catch (e) {
            console.log(e);
            return Client.ServerError(req, res, next);
        }
    },

    /**
     * Create a User
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ResendConfirmation: function(req, res, next, body) {
        try {
            // Security Check
            if (!req.token.user.permissions['user.admin']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.user_id],               'Path parameter :user_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.user_id)],   'Path parameter :user_id must be a valid identifier.')
                .GetErrors();

            if (!errors.length) {
                try {
                    User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                        if (e) {
                            return Client.ServerError(req, res, next);
                        } else if (!user) {
                            return Client.NotFound(req, res, next);
                        } else {
                            // Generate Confirmation Code
                            var ccode = user['@rid'] + '--tinyNews--' + user.email + '--tinyNews--' + user.handle;
                            ccode = Crypto.createHash('md5').update(ccode).digest("hex");
                            ccode = Crypto.createHash('sha256').update(ccode).digest("hex");
                            var rid = RID.Encode(user['@rid']);
                            ccode = rid.split('.')[0] + '_' + ccode + '_' + rid.split('.')[1];

                            // Queue the email for send
                            var job = Jobs.create('email_reg_email_confirmation', {
                                title: 'Email: Email Confirmation',
                                ccode: ccode,
                                email: user.email,
                                username: user.handle
                            }).priority('high').save();

                            job
                                .on('complete', function() {
                                    Util.log('Email Job Succeeded');
                                })
                                .on('failed', function(e) {
                                    Util.log('Email Job Failed:', e);
                                });

                            // We don't wait for the job to complete
                            return Client.NoContent(req, res, next);
                        }
                    });
                } catch (e) {
                    console.log(e);
                    return Client.ServerError(req, res, next);
                }
            } else {
                return Client.InvalidRequest(req, res, next, errors);
            }
        } catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }
    }

}
