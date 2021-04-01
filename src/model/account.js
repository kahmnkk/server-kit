// Module
const crypto = require('crypto');
const uniqid = require('uniqid');

// Common
const dbMgr = require('@src/database/dbMgr');
const querys = require('@src/querys');
const errors = require('@src/errors');

// Model
const BaseModel = require('@src/model/baseModel');

// Utils
const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');
const time = require('@src/utils/time');

const accountFrame = {
    idx: null,
    id: null,
    pw: null,
    salt: null,
    status: null,
};

const status = {
    default: 0,
};

const genKey = 'gen:account';

class Account extends BaseModel {
    constructor() {
        super();
    }

    get status() { return status; } // prettier-ignore

    /**
     * @override
     * @returns {accountFrame}
     */
    getFrame(initData = null) {
        const rtn = super.getFrame(accountFrame, initData);
        return rtn;
    }

    /**
     *
     * @param {String} id
     * @returns {accountFrame}
     */
    async getAccountInfoById(id) {
        const [result] = await dbMgr.mysql.master.makeAndQuery(querys.master.selectAccountById, id);
        return result;
    }

    async createAccountInfo(id, pw) {
        let rtn = {
            user: this.getFrame(),
            query: dbMgr.getQueryFrame(),
        };

        const salt = uniqid();
        const cryptoResult = await utils.injectPromise(crypto.pbkdf2, pw, salt, 10000, 64, 'sha512');
        const cryptoPassword = cryptoResult.toString('hex');

        let accObj = this.getFrame();
        accObj.idx = await this.genIdx();
        accObj.id = id;
        accObj.pw = cryptoPassword;
        accObj.salt = salt;
        accObj.status = status.default;

        rtn.user = accObj;

        rtn.query.querys.push(this.queryInsertAccount(accObj));

        return rtn;
    }

    async validId(id) {
        let rtn = false;

        const [result] = await dbMgr.mysql.master.makeAndQuery(querys.master.selectAccountById, id);
        if (result == null) {
            rtn = true;
        }

        return rtn;
    }

    // Private
    async genIdx() {
        return await dbMgr.redis.gen.client.incrby(genKey, 1);
    }

    /**
     *
     * @param {accountFrame} accObj
     * @returns {String}
     */
    queryInsertAccount(accObj) {
        return dbMgr.mysql.master.makeQuery(querys.master.insertAccountInfo, accObj.idx, accObj.id, accObj.pw, accObj.salt, accObj.status);
    }
}

module.exports = Account;
