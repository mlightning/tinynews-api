// ----------------
//   Dependencies
// ----------------

var Client              = require('../utils/client');
var Validate            = require('../utils/validate');
var crypto              = require('crypto');

// Shared Core
var Core                = require('tinynews-common');

// Models
var User                = Core.Models.User;

// --------------------------
//   Controller Definition
// --------------------------

module.exports = {

    /**
     * Create an Authentication token
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Create: function(req, res, next, body) {
        try{
            var handle   = req.headers["x-auth-user"] || "";
            var password = req.headers["x-auth-password"] || "";

            // Validate
            var validate = new Validate();
            /** Username **/
                validate.AssertTrue('isLength', [handle, 3, 32],        'Header parameter :X-Auth-User must be between 3 and 64 characters.')
                validate.AssertFalse('isNull',  [handle],               'Header parameter :X-Auth-User may not be null.')
            /** Password **/
                validate.AssertTrue('isLength', [password, 8, 64],      'Header parameter :X-Auth-Password must be between 8 and 64 characters.')
                validate.AssertFalse('isNull',  [password],             'Header parameter :X-Auth-Password may not be null.')      
            var errors = validate.GetErrors();

            if (!errors.length) {
                User.Find({where: {handle: handle, password: crypto.createHash('sha1').update(password).digest('hex')}}, function(e, user) {
                    if (e || !user) {
                        return Client.NotAuthorized(req, res, next);
                    } else {
                        token = Core.Auth.Tokens.Issue(user);
                        var userToken = token;

                        Core.Auth.Tokens.Authenticate(token, function(token) {
                            if (token.user.password) {
                                delete token.user.password;
                            }    
                            token.token = userToken;
                            if (token.is_valid) {
                                return Client.Success(req, res, next, token);    
                            } else {
                                // Invalid token
                                return Client.NotAuthorized(req, res, next);
                            }
                        })
  
                    }
                });
            } else {
                return Client.NotAuthorized(req, res, next);
            }
        }catch (e) {
            console.trace(e);
            return Client.ServerError(req, res, next);
        }        
    },

    /**
     * Create an Authentication token
     *
     * @param   Obj   req       Request Object
     * @param   Obj   res       Response Object
     * @param   Func  next      Restify next()
     * @param   Obj   body      Request Body
     */
    Monitor: function(req, res, next, body) {
        return Client.NoContent(req, res, next);
    }
}