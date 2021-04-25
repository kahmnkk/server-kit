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
            throw utils.errorHandling(errors.duplicatedAccountId);
        }

        const accResult = await account.createAccountInfo(id, pw);

        const user = new User(accResult.user.idx);
        const userResult = await user.createUserInfo(nickname);

        const accQuery = dbMgr.getMultiSetFrame();
        accQuery.conn = dbMgr.mysqlConn.master;
        accQuery.query = accResult.query;

        const userQuery = dbMgr.getMultiSetFrame();
        userQuery.conn = dbMgr.mysqlConn.user;
        userQuery.query = userResult.query;

        await dbMgr.multiSet([accQuery, userQuery]);

        rtn[resKeys.idx] = accResult.user.idx;

        return rtn;
    }

    async login(reqDto) {
        const reqKeys = {
            id: 'id',
            pw: 'pw',
        };
        const resKeys = {
            idx: 'idx',
            nickname: 'nickname',
            createTime: 'createTime',
        };
        let rtn = {};

        if (utils.hasKeys(reqKeys, reqDto) == false) {
            throw utils.errorHandling(errors.invalidRequestData);
        }

        const id = reqDto[reqKeys.id];
        const pw = reqDto[reqKeys.pw];

        const account = new Account();
        const accInfo = await account.getAccountInfoById(id);
        if (accInfo == null) {
            throw utils.errorHandling(errors.invalidAccountIdPw);
        }

        const validPw = await account.validAccount(pw, accInfo);
        if (validPw == false) {
            throw utils.errorHandling(errors.invalidAccountIdPw);
        }

        const user = new User(accInfo.idx);
        const userInfo = await user.getUserInfo();

        rtn[resKeys.idx] = userInfo.idx;
        rtn[resKeys.nickname] = userInfo.nickname;
        rtn[resKeys.createTime] = userInfo.createTime;

        return rtn;
    }
}

module.exports = new RouterUser();
