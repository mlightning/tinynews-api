// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var RID                 = require('../utils/rid');

// Shared Core
var Core                = require('tinynews-common');

// Models
var Group           = Core.Models.Group;

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Create a Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check - Super Admin & Editors only

            var validate = new Validate();

            /** Name **/
            validate.AssertTrue('isLength', [req.params.name, 1, 64],            'Body parameter :name must be between 1 and 64 characters.');
            validate.AssertFalse('isNull',  [req.params.name],                   'Body parameter :name may not be null.');
            /** Description **/
            validate.AssertTrue('isLength', [req.params.description, 0, 1024],   'Body parameter :description must be between 1 and 1024 characters');
            /** Profile Image **/
            validate.AssertTrue('isLength', [req.params.imageUrl, 1, 256],       'Body parameter :imageUrl must be between 1 and 256 characters.');
            /** Type **/
            validate.AssertTrue('isIn',     [req.params.type, [0,1,2]],          'Body parameter :type must be between 0,1,2');        
            /**  URL **/
            validate.AssertTrue('isLength', [req.params.url, 1, 256],            'Body parameter :url must be between 1 and 256 characters.');
            validate.AssertTrue('isURL',    [req.params.url],                    'Body parameter :url must be a valid URL.');
            /** Status **/
            validate.AssertTrue('isIn',     [req.params.status, [0,1,2]],        'Body parameter :status must be between 0,1,2');        
            /** Email **/
            if (typeof req.params.contact_email != 'undefined') {
                validate.AssertTrue('isEmail',     [req.params.contact_email],   'Body parameter :contact_email must be valid');
            }
            /** Url **/
            if (typeof req.params.contact_url != 'undefined') {
                validate.AssertTrue('isURL',     [req.params.contact_url],       'Body parameter :contact_url must be valid URL');
            }
            /** Twitter **/
            if (typeof req.params.contact_twitter != 'undefined') {
                validate.AssertTrue('isURL',     [req.params.contact_twitter],   'Body parameter :contact_twitter must be valid URL');
            }
            /** Facebook **/
            if (typeof req.params.contact_fb != 'undefined') {
                validate.AssertTrue('isURL',     [req.params.contact_fb],        'Body parameter :contact_fb must be valid URL');
            }
            var errors = validate.GetErrors();

            // Purge any defined slug, let the system manage this
            delete req.params.slug;

            // Purge any defined id, just in case!
            delete req.params['@rid'];

            if (!errors.length) {
                Group.Create(req.params, function(e, group) {
                    if (e || !group) {
                        return Client.ServerError(req, res, next);
                    } else {
			// Add the creator to the group as a member
                        group.add_member(req.token.user['@rid'], function(e, member) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!member) {
                                return Client.NotFound(req, res, next);
                            } else {
                                // Add the creator to the group as a moderator
                                group.add_moderator(req.token.user['@rid'], function(e, mod) {
                                    if (e) {
                                        return Client.ServerError(req, res, next);
                                    } else if (!mod) {
                                        return Client.NotFound(req, res, next);
                                    } else {
                                        return Client.Success(req, res, next, group);
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
    },

    /**
     * Return a Group data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Retrieve: function(req, res, next, body) {
        try {
            // Security Check
            // TODO: Add check

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.group_id],               'Path parameter :group_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.group_id)],   'Path parameter :group_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        return Client.Success(req, res, next, group);
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
     * Update a Group data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Update: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check - Super Admin or Owner Only

            // Validate
            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],                   'Body parameter :group_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],       'Body parameter :group_id must be a valid identifier.');
            }
            /** Name **/
            if (typeof req.params.name != 'undefined') {
                validate.AssertTrue('isLength', [req.params.name, 1, 64],                'Body parameter :name must be between 1 and 64 characters.');
                validate.AssertFalse('isNull',  [req.params.name],                       'Body parameter :name may not be null.');
            }
            /** Description **/
            if (typeof req.params.description != 'undefined') {
                validate.AssertTrue('isLength', [req.params.description, 1, 1024],       'Body parameter :description must be between 1 and 1024 characters');
            }
            /**  Profile Image **/
            if (typeof req.params.imageUrl != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.imageUrl],                   'Body parameter :imageUrl may not be null.');
                validate.AssertTrue('isLength', [req.params.imageUrl, 1, 256],           'Body parameter :imageUrl must be between 1 and 256 characters.');
            }
            /** Type **/
            if (typeof req.params.type != 'undefined') {
                validate.AssertTrue('isIn',     [req.params.type, [0,1,2]],              'Body parameter :type must be between 0,1,2');       
            }
            /**  URL **/
            if (typeof req.params.url != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.url],                        'Body parameter :url may not be null.');
                validate.AssertTrue('isLength', [req.params.url, 1, 256],                'Body parameter :url must be between 1 and 256 characters.');
                validate.AssertTrue('isURL',    [req.params.url],                        'Body parameter :url must be a valid URL.');
            }
            /** Status **/
            if (typeof req.params.status != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.status],                     'Body parameter :status may not be null.')
                validate.AssertTrue('isIn',     [req.params.status, [0,1,2]],            'Body parameter :status must be between 0,1,2');  
            }
            /** Email **/
            if (typeof req.params.contact_email != 'undefined') {
                validate.AssertTrue('isEmail',  [req.params.contact_email],              'Body parameter :contact_email must be valid');
            }
            /** URL **/
            if (typeof req.params.contact_url != 'undefined') {
                validate.AssertTrue('isURL',    [req.params.contact_url],                'Body parameter :contact_url must be valid URL');
            }
            /** Twitter **/
            if (typeof req.params.contact_twitter != 'undefined') {
                validate.AssertTrue('isURL',    [req.params.contact_twitter],            'Body parameter :contact_twitter must be valid URL');
            }
            /** Facebook **/
            if (typeof req.params.contact_fb != 'undefined') {
                validate.AssertTrue('isURL',    [req.params.contact_fb],                 'Body parameter :contact_fb must be valid URL');
            }
            var errors = validate.GetErrors();

            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        // Apply updates
                        if (typeof req.params.name != 'undefined') {
                            group.name = req.params.name;
                        }
                        if (typeof req.params.description != 'undefined') {
                            group.description = req.params.description;
                        }
                        if (typeof req.params.imageUrl != 'undefined') {
                            group.imageUrl = req.params.imageUrl;
                        }
                        if (typeof req.params.type != 'undefined') {
                            group.type = req.params.type;
                        }
                        if (typeof req.params.url != 'undefined') {
                            group.url = req.params.url;
                        }
                        if (typeof req.params.status != 'undefined') {
                            group.status = req.params.status;
                        }
                        if (typeof req.params.contact_email != 'undefined') {
                            group.contact_email = req.params.contact_email;
                        }
                        if (typeof req.params.contact_url != 'undefined') {
                            group.contact_url = req.params.contact_url;
                        }
                        if (typeof req.params.contact_twitter != 'undefined') {
                            group.contact_twitter = req.params.contact_twitter;
                        }
                        if (typeof req.params.contact_fb != 'undefined') {
                            group.contact_fb = req.params.contact_fb;
                        }

                        group.save(function(e, group) {
                            if (e || !group) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.Success(req, res, next, group);
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
     * Add a User to Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreateMember: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check

            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],                  'Path parameter :group_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],      'Path parameter :group_id must be a valid identifier.');
            }
            /** Member ID **/
            if (typeof req.params.member_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.member_id],                 'Path parameter :member_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.member_id)],     'Path parameter :member_id must be a valid identifier.');
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        group.add_member(req.params.member_id, function(e, member) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!member) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.Success(req, res, next, {});
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
     * Delete User from Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeleteMember: function(req, res, next, body) {
        try {
            // Security Check
            // TODO: Add check

            var validate = new Validate();

            /** @rid **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],                  'Path parameter :group_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],      'Path parameter :group_id must be a valid identifier.');
            }
            /** Member ID **/
            if (typeof req.params.member_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.member_id],                 'Path parameter :member_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.member_id)],     'Path parameter :member_id must be a valid identifier.');
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    console.log('Group.Find', e, group);
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        group.remove_member(RID.Decode(req.params.member_id), function(e, member) {
                            console.log('group.remove_member', e, member);
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!member) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next);
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
     * List Users in Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    ListMembers: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check

            var validate = new Validate();

            /** @rid **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],              'Path parameter :group_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],  'Path parameter :group_id must be a valid identifier.');
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        group.get_members(function(e, members) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!members) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.Success(req, res, next, members);
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
     * Add a Moderator User to Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    CreateMod: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check

            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],               'Path parameter :group_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],  'Path parameter :group_id must be a valid identifier.');
            }
            /** Member ID **/
            if (typeof req.params.mod_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.mod_id],                'Path parameter :mod_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.mod_id)],    'Path parameter :mod_id must be a valid identifier.');
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        group.add_moderator(req.params.mod_id, function(e, mod) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!mod) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.Success(req, res, next, {});
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
     * Delete Moderator User from Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    DeleteMod: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check

            var validate = new Validate();
            /** @rid **/
            if (typeof req.params.group_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.group_id],              'Path parameter :group_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.group_id)],  'Path parameter :group_id must be a valid identifier.');
            }
            /** Member ID **/
            if (typeof req.params.mod_id != 'undefined') {
                validate.AssertFalse('isNull',  [req.params.mod_id],                'Path parameter :mod_id may not be null.');
                validate.AssertTrue('isRID',    [RID.Decode(req.params.mod_id)],    'Path parameter :mod_id must be a valid identifier.');
            }
            var errors = validate.GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        group.remove_moderator(RID.Decode(req.params.mod_id), function(e, mod){
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else if (!mod) {
                                return Client.NotFound(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next);
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
     * Delete a Group
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Delete: function(req, res, next, body) {
        try {
            // Security Check
            // TODO: Add check

            // Validate
            var errors = new Validate()
                .AssertFalse('isNull',  [req.params.group_id],               'Path parameter :group_id may not be null.')
                .AssertTrue('isRID',    [RID.Decode(req.params.group_id)],   'Path parameter :group_id must be a valid identifier.')
                .GetErrors();

            // Fetch and return
            if (!errors.length) {
                Group.Find({ where: { '@rid': RID.Decode(req.params.group_id) }}, function(e, group) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!group) {
                        return Client.NotFound(req, res, next);
                    } else {
                        group.delete(function(e, group) {
                            if (e) {
                                return Client.ServerError(req, res, next);
                            } else {
                                return Client.NoContent(req, res, next);
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
     * Return multiple Groups data
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    List: function(req, res, next, body) {
        try{
            // Security Check
            // TODO: Add check

            // Validate
            // TODO: Add validation once filtering features are added
            var errors = [];

            // Fetch and return
            if (!errors.length) {
                Group.FindAll({}, function(e, groups) {
                    if (e) {
                        return Client.ServerError(req, res, next);
                    } else if (!groups.length > 0) {
                        return Client.NoContent(req, res, next);
                    } else {
                        return Client.Success(req, res, next, groups);
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
}
