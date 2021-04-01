// Common
const errors = require('@src/errors');
const dbMgr = require('@src/database/dbMgr');

// Utils
const utils = require('@src/utils/utils');

// Model
const Account = require('@src/model/account');
const User = require('@src/model/user');

class RouterUser {
    constructor() {}

    async join(reqDto) {
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

        const id = reqDto[reqKeys.id];
        const pw = reqDto[reqKeys.pw];
        const nickname = reqDto[reqKeys.nickname];

        const account = new Account();

        const validId = await account.validId(id);
        if (validId == false) {
            throw utils.errorHandling(errors.invalidAccountId);
        }

        const accResult = await account.createAccountInfo(id, pw);

        const user = new User(accResult.user.idx);
        const userResult = await user.createUserInfo(nickname);

        await dbMgr.set(dbMgr.mysqlConn.master, accResult.query);
        await dbMgr.set(dbMgr.mysqlConn.user, userResult.query);

        rtn[resKeys.idx] = accResult.user.idx;

        return rtn;
    }
}

module.exports = new RouterUser();
