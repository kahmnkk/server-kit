// Common
const errors = require('@src/errors');
const dbMgr = require('@src/database/dbMgr');

// Utils
const utils = require('@src/utils/utils');

class UserTest {
    constructor() {}

    async test(socket, reqDto) {
        const reqKeys = {
            test: 'test',
        };
        const resKeys = {
            result: 'result',
        };
        let rtn = {};

        if (utils.hasKeys(reqKeys, reqDto) == false) {
            throw utils.errorHandling(errors.invalidRequestData);
        }

        rtn[resKeys.result] = true;

        return rtn;
    }
}

module.exports = new UserTest();
