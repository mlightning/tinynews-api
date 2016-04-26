// ----------------
//   Dependencies
// ----------------

// ~~

// ----------------
//   Definition
// ----------------

/**
 * @rid Utilities Object
 */
var RID = {

    /**
     * Encodes an OrientDB @rid for use in urls.
     *
     * @param   String    rid     RID Value (Eg. #30:1)
     * @returns String
     */
    Encode: function(rid) {
        if (rid) {
            return rid.replace('#', '').replace(':', '.');
        } else {
            return false;
        }
        
    },

    /**
     * Decodes an OrientDB @rid from use in urls.
     *
     * @param   String    rid     RID Value in URL format (Eg. 30.1)
     * @returns String
     */
    Decode: function(rid) {
        if (rid) {
            return '#' + rid.replace('.', ':');
        } else {
            return false;
        }
    }

}

module.exports = RID;