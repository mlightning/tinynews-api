// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');
var crypto              = require('crypto');
var util                = require('util');

// Shared Core
var Core                = require('tinynews-common');

// Models
var User                = Core.Models.User;

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Return a UserProfile data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try{
            // Security Check
            if (!req.token.user.permissions['user.api_get']) {
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
                        // Filter sensitive data
                        delete user.password;
                        delete user.permissions;

                        user.fetch_profile(function(e, profile){
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!profile) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.Success(req, res, next, profile);
                            }
                        })
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
     * Update UserProfile data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try{
            // Security Check
            if (RID.Decode(req.params.user_id) != req.token.user['@rid'] && !req.token.user.permissions['user.edit']) {
                return Client.NotAuthorized(req, res, next);
            }

            // Validate
            if (!util.isArray(req.params.userBackground)) {
                return Client.InvalidRequest(req, res, next, "Body parameter :userBackground should be an array");
            }

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.user_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.user_id],            'Path parameter :user_id may not be null.')
                validate.AssertTrue('isRID',    [RID.Decode(req.params.user_id)],'Path parameter :user_id must be a valid identifier.')
            }
            /** about_me **/
            if (typeof req.params.about_me != 'undefined') {
                validate.AssertTrue('isLength', [req.params.about_me, 0, 1024],  'Body parameter :about_me must be between 0 and 1024 characters.');
            }
            /** city **/
            if (typeof req.params.city != 'undefined') {
                validate.AssertTrue('isLength', [req.params.city, 0, 64],        'Body parameter :city must be between 0 and 64 characters.');
            }
            /** country **/
            if (typeof req.params.country != 'undefined') {
                validate.AssertTrue('isLength', [req.params.country, 0, 64],     'Body parameter :country must be between 0 and 64 characters.');
            }
            /** phone_home **/
            if (typeof req.params.phone_home != 'undefined') {
                validate.AssertTrue('isLength', [req.params.phone_home, 0, 16],  'Body parameter :phone_home must be between 0 and 16 characters.');
            }
            /** phone_mobile **/
            if (typeof req.params.phone_mobile != 'undefined') {
                validate.AssertTrue('isLength', [req.params.phone_mobile, 0, 16],'Body parameter :phone_mobile must be between 0 and 16 characters.');
            }
            /** state **/
            if (typeof req.params.state != 'undefined') {
                validate.AssertTrue('isLength', [req.params.state, 0, 64],       'Body parameter :state must be between 0 and 64 characters.');
            }
            /** city **/
            if (typeof req.params.street1 != 'undefined') {
                validate.AssertTrue('isLength', [req.params.street1, 0, 64],     'Body parameter :street1 must be between 0 and 64 characters.');
            }
            /** city **/
            if (typeof req.params.street2 != 'undefined') {
                validate.AssertTrue('isLength', [req.params.street2, 0, 64],     'Body parameter :street2 must be between 0 and 64 characters.');
            }
            /** city **/
            if (typeof req.params.website_url != 'undefined') {
                validate.AssertTrue('isLength', [req.params.website_url, 0, 64], 'Body parameter :website_url must be between 0 and 64 characters.');
            }

            for (var i in req.params.userBackground) {
                /** Description **/
                if (typeof req.params.userBackground[i].description != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.userBackground[i].description, 0, 1024],  'Body parameter :userBackground[' + [i] + '].description must be between 0 and 1024 characters.')
                }
                /** Organization **/
                if (typeof req.params.userBackground[i].organization != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.userBackground[i].organization, 0, 128],  'Body parameter :userBackground[' + [i] + '].organization must be between 0 and 128 characters.')
                }
                /** Title **/
                if (typeof req.params.userBackground[i].title != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.userBackground[i].title, 0, 128],         'Body parameter :userBackground[' + [i] + '].title must be between 0 and 128 characters.')
                }
                /** Year End **/
                if (typeof req.params.userBackground[i].year_end != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.userBackground[i].year_end, 0, 10],       'Body parameter :userBackground[' + [i] + '].year_end must be between 0 and 10 characters.')
                }
                /** Year Start **/
                if (typeof req.params.userBackground[i].year_start != 'undefined') {
                    validate.AssertTrue('isLength', [req.params.userBackground[i].year_start, 0, 10],     'Body parameter :userBackground[' + [i] + '].year_start must be between 0 and 10 characters.')
                }
            }

            var errors = validate.GetErrors();

            if (!errors.length) {
                User.Find({ where: { '@rid': RID.Decode(req.params.user_id) }}, function(e, user) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!user) {
                        return Client.NotFound(req, res, next);
                    } else {
                        user.fetch_profile(function(e, profile) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!profile) {
                                return Client.NotFound(req, res, next);
                            } else {
                                if (typeof req.params.about_me != 'undefined') {
                                    profile.about_me = req.params.about_me;
                                }
                                if (typeof req.params.city != 'undefined') {
                                    profile.city = req.params.city;
                                }
                                if (typeof req.params.country != 'undefined') {
                                    profile.country = req.params.country;
                                }
                                if (typeof req.params.phone_home != 'undefined') {
                                    profile.phone_home = req.params.phone_home;
                                }
                                if (typeof req.params.phone_mobile != 'undefined') {
                                    profile.phone_mobile = req.params.phone_mobile;
                                }
                                if (typeof req.params.state != 'undefined') {
                                    profile.state = req.params.state;
                                }
                                if (typeof req.params.street1 != 'undefined') {
                                    profile.street1 = req.params.street1;
                                }
                                if (typeof req.params.street2 != 'undefined') {
                                    profile.street2 = req.params.street2;
                                }
                                if (typeof req.params.website_url != 'undefined') {
                                    profile.website_url = req.params.website_url;
                                }
                                if (typeof req.params.zip != 'undefined') {
                                    profile.zip = req.params.zip;
                                }

                                /*if (typeof req.params.userBackground != 'undefined') {
                                    for (var i in profile.userBackground) {
                                        if (typeof req.params.userBackground[i].description != 'undefined') {
                                            profile.userBackground[i].description = req.params.userBackground[i].description;
                                        }
                                        if (typeof req.params.userBackground[i].organization != 'undefined') {
                                            profile.userBackground[i].organization = req.params.userBackground[i].organization;
                                        }
                                        if (typeof req.params.userBackground[i].title != 'undefined') {
                                            profile.userBackground[i].title = req.params.userBackground[i].title;
                                        }
                                        if (typeof req.params.userBackground[i].year_end != 'undefined') {
                                            profile.userBackground[i].year_end = req.params.userBackground[i].year_end;
                                        }
                                        if (typeof req.params.userBackground[i].year_start != 'undefined') {
                                            profile.userBackground[i].year_start = req.params.userBackground[i].year_start;
                                        }
                                    }
                                }*/

                                // Check UserBackground entries for validity
                                if (typeof req.params.userBackground != 'undefined' && req.params.userBackground instanceof Array) {
                                    profile.userBackground = req.params.userBackground;
                                } else {
                                    profile.userBackground = [];
                                }

                                profile.save(function(e, profile) {
                                    if (e || !profile) {
                                        return Client.ServerError(req, res, next);
                                    } else {
                                        user.fetch_profile(function(e, profile) {
                                            if (e) {
                                                return Client.ServerError(req, res, next);
                                            } else {
                                                return Client.Success(req, res, next, profile);
                                            }
                                        });
                                    }
                                });
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
    }
}