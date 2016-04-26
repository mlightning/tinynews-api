// ----------------
//   Dependencies
// ----------------

// ~~

/**
 * Client Utilities Object
 */
var Client = function() { }

/**
 * Sends a response to the client.
 *
 * @param	int		status	HTTP Status Code
 * @param	Object	res		Node response object.
 * @param	Object	req		Node request object.
 * @param   Func    next    Restify next()
 * @param	Array	data	Data array to respond with.
 */
Client.prototype._send = function(status, req, res, next, data) {
    if (req.log && req.log.fields && req.log.fields.route) {
        res.header('X-API-Route', req.log.fields.route);
    }
    if (req.params && typeof req.params.callback != "undefined") {
        res.contentType = 'application/javascript';
        res.send(status, req.params.callback + "(" + JSON.stringify(data) + ")");
    } else {
        res.json(status, data);
    }
    if (next) {
        return next();
    }
}

/**
 * HTTP Response 200 - Success
 *   -- Operation completed.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	Array	data	Data array to respond with.
 */
Client.prototype.Success = function(req, res, next, data) {
    this._send(200, req, res, next, data);
}

/**
 * HTTP Response 201 - Created
 *   -- (For PUT requests) Object was created.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	Array	data	Data array to respond with.
 */
Client.prototype.Created = function(req, res, next, data) {
    this._send(201, req, res, next, data);
}

/**
 * HTTP Response 202 - Accepted
 *   -- (For PUT requests) Object was created.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	Array	data	Data array to respond with.
 */
Client.prototype.Accepted = function(req, res, next, data) {
    this._send(202, req, res, next, { message: 'Accepted' });
}

/**
 * HTTP Response 204 - No Content
 *   -- Valid Request, but there is no data to respond with.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	Array	data	Data array to respond with.
 */
Client.prototype.NoContent = function(req, res, next) {
    this._send(204, req, res, next );
}

/**
 * HTTP Response 400 - Invalid Request
 *   -- Parameters or body is missing required data.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	string	msg		Data array to respond with.
 */
Client.prototype.InvalidRequest = function(req, res, next, msg) {
    if (!msg) {
        msg = 'Missing or invalid parameters.'
    }
    var data = { message: msg };
    this._send(400, req, res, next, data);
}

/**
 * HTTP Response 404 - Object Not Found
 *   -- User requested data that does not exist
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	string	msg		Data array to respond with.
 */
Client.prototype.NotFound = function(req, res, next, msg) {
    if (!msg) {
        msg = 'Object does not exist.'
    }
    var data = { message: msg };
    this._send(404, req, res, next, data);
}

/**
 * HTTP Response 401 - Not Authorized
 *   -- User does not have access to this object.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	string	msg		Data array to respond with.
 */
Client.prototype.NotAuthorized = function(req, res, next, msg) {
    if (!msg) {
        msg = 'Not authorized to perform this action.'
    }
    var data = { message: msg };
    this._send(401, req, res, next, data);
}

/**
 * HTTP Response 409 - Illegal Conflict
 *   -- User tried to modify something that would break the data.
 *   -- ie. Tried to change an objects key/id.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	string	msg		Data array to respond with.
 */
Client.prototype.IllegalConflict = function(req, res, next, msg) {
    if (!msg) {
        msg = 'Attempted to modify a conflicting parameter.'
    }
    var data = { message: msg };
    this._send(409, req, res, next, data);
}

/**
 * HTTP Response 500 - Internal Server Error
 *   -- The server messed up somehow.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	string	msg		Data array to respond with.
 */
Client.prototype.ServerError = function(req, res, next, msg) {
    if (!msg) {
        msg = 'Server reported an error processing the operation.'
    }
    var data = { message: msg };
    this._send(500, req, res, next, data);
}

/**
 * HTTP Response 501 - Not Implemented
 *   -- A function planned but not implemented.
 *
 * @param	Object	req		Node request object.
 * @param	Object	res		Node response object.
 * @param   Func    next    Restify next()
 * @param	string	msg		Data array to respond with.
 */
Client.prototype.NotImplemented = function(req, res, next, msg) {
    if (!msg) {
        msg = 'Operation not yet supported.'
    }
    var data = { message: msg };
    this._send(501, req, res, next, data);
}

/**
 * Instance the object
 */
module.exports = new Client();