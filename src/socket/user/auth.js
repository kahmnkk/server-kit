// Common
const errors = require('@src/errors');
const dbMgr = require('@src/database/dbMgr');

// Utils
const utils = require('@src/utils/utils');

class UserAuth {
    constructor() {}

    async login(socket, reqDto) {
        const reqKeys = {
            id: 'id',
            pw: 'pw',
            nickname: 'nickname',
        };
        const resKeys = {
            idx: 'idx',
        };
        let rtn = {};

        if (utils.hasKeys(reqKeys, reqDto) == false) {
            throw utils.errorHandling(errors.invalidRequestData);
        }

        return rtn;
    }

    async example(socket, reqDto) {
        const reqKeys = {
            req1: 'req1',
        };
        const resKeys = {
            res1: 'res1',
        };
        let rtn = {};

        if (utils.hasKeys(reqKeys, reqDto) == false) {
            throw utils.errorHandling(errors.invalidRequestData);
        }

        return rtn;
    }
}

module.exports = new UserAuth();
