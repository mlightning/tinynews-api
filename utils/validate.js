// ----------------
//   Dependencies
// ----------------

var validator   = require('validator');

// ----------------
//   Definition
// ----------------

var Validate = function() {
    this.errors = [];
}

/**
 * Asserts that the validation returns True
 *
 * @param String    func        Validator module function to call
 * @param Array     args        Function arguments to call the function with
 * @param String    message     Error message, should validation fail
 * @returns self
 */
Validate.prototype.AssertTrue = function(func, args, message) {
    if (Special[func]) {
        if (!Special[func](args)) {
            this.errors.push(message);
        }
    } else if (!validator[func].apply(validator, args)) {
        this.errors.push(message);
    }

    return this;
}

/**
 * Asserts that the validation returns False
 *
 * @param String    func        Validator module function to call
 * @param Array     args        Function arguments to call the function with
 * @param String    message     Error message, should validation fail
 * @returns self
 */
Validate.prototype.AssertFalse = function(func, args, message) {
    if (Special[func]) {
        if (Special[func](args)) {
            this.errors.push(message);
        }
    } else if (validator[func].apply(validator, args)) {
        this.errors.push(message);
    }

    return this;
}

/**
 * Returns any errors we've accumulated.
 *
 * @returns Array
 */
Validate.prototype.GetErrors = function() {
    return this.errors;
}

// --
// Specialized Validators
// --

var Special = {

    /**
     * InRange - Validator Function
     *
     * TODO: Float support
     *
     * @param   Array     args        Array of function arguments
     * @returns boolean
     */
    InRange: function(args) {
        var value = args[0];
        var min = args[1][0];
        var max = args[1][1];
        
        if (parseFloat(value) >= parseFloat(min) && parseFloat(value) <= parseFloat(max)) {
            return true;
        } else {
            return false;
        }
    },

    /**
     * IsRID - Validator Function
     *
     * @param   Array     args        Array of function arguments
     * @returns boolean
     */
    isRID: function(args) {
        var result = true;
        var tmp = args[0].split(':');

        if (tmp.length != 2 || tmp[0].indexOf('#') != 0 || parseInt(tmp[0].replace('#', '')) < 0 || parseInt(tmp[1]) < 0) {
            result = false;
        }

        return result;
    },

    /**
     * isURL - Replaces a DoS vulnerable method in the
     * validator library.
     */
    isURL: function(args) {
        if (!args[0]) {
            return false;
        }

        // Cap length to avoid DoS issues
        if (args[0].length > 256) {
            return false;
        }

        var regex = /^(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
        if (!regex.test(args[0])) {
            return false;
        }

        return true;
    }

}

module.exports = Validate;