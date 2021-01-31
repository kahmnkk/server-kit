// Common
const errors = require('@src/errors');

// Utils
const utils = require('@src/utils/utils');

class RouterUser {
    constructor() {}

    /**
     *
     * @param {Object} reqDto
     */
    async join(reqDto) {
        const reqKeys = {
            id: 'id',
            pw: 'pw',
        };
        const resKeys = {
            idx: 'idx',
        };
        let rtn = {};

        if (utils.hasKeys(reqKeys, reqDto) == false) {
            throw utils.errorHandling(errors.invalidRequestData);
        }

        // to-do query

        rtn[resKeys.idx] = 1;
        return rtn;
    }
}

module.exports = new RouterUser();
