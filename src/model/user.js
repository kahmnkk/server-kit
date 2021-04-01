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

const userFrame = {
    idx: null,
    nickname: null,
    createTime: null,
};

const genKey = 'gen:user';

class User extends BaseModel {
    constructor(userIdx) {
        super();

        this.userIdx = userIdx;

        this.CACHE_KEY = 'KEY_USER_INFO:'.concat(this.userIdx);
    }

    /**
     * @override
     * @returns {userFrame}
     */
    getFrame(initData = null) {
        const rtn = super.getFrame(userFrame, initData);
        return rtn;
    }

    /**
     *
     * @returns {userFrame}
     */
    async getUserInfo() {
        const [result] = await dbMgr.getFromCache(dbMgr.mysqlConn.user, this.CACHE_KEY, this.querySelectUser());
        return result;
    }

    async createUserInfo(nickname) {
        let rtn = {
            user: this.getFrame(),
            query: dbMgr.getQueryFrame(),
        };

        let userObj = this.getFrame();
        userObj.idx = this.userIdx;
        userObj.nickname = nickname;
        userObj.createTime = time.nowTimestamp();

        rtn.user = userObj;

        rtn.query.querys.push(this.queryInsertUser(userObj));
        rtn.query.cmds.push(['hset', this.CACHE_KEY, userObj.idx, JSON.stringify(userObj)]);

        return rtn;
    }

    // Private

    querySelectUser() {
        return dbMgr.mysql.user.makeQuery(querys.user.selectUserInfo, this.userIdx);
    }

    /**
     *
     * @param {userFrame} userObj
     * @returns {String}
     */
    queryInsertUser(userObj) {
        return dbMgr.mysql.user.makeQuery(querys.user.insertUserInfo, userObj.idx, userObj.nickname, time.datetime(userObj.createTime));
    }
}

module.exports = User;
