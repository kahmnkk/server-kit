const config = require('@root/config');
const errors = require('@src/errors');

// Utils
const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');

// DB
const MySQL = require('@src/database/mysql');
const Redis = require('@src/database/redis');

// Model
const BaseModel = require('@src/model/baseModel');

const mysqlConn = {
    master: 'master',
    user: 'user',
};

const redisConn = {
    sessionStorage: 'sessionStorage',
    gen: 'gen',
    user: 'user',
};

const queryFrame = {
    querys: [],
    cmds: [],
};

const multiSetFrame = {
    conn: null,
    query: /** @type {queryFrame} */ (null),
};

class dbMgr extends BaseModel {
    constructor() {
        super();

        this.mysql = {
            master: /** @type {MySQL} */ (null),
            user: /** @type {MySQL} */ (null),
        };

        this.redis = {
            sessionStore: /** @type {Redis} */ (null),
            user: /** @type {Redis} */ (null),
            gen: /** @type {Redis} */ (null),
        };
    }

    get mysqlConn()     { return mysqlConn; } // prettier-ignore
    get redisConn()     { return redisConn; } // prettier-ignore

    /**
     * @override
     * @returns {queryFrame}
     */
    getQueryFrame(initData = null) {
        const rtn = super.getFrame(queryFrame, initData);
        return rtn;
    }

    /**
     * @override
     * @returns {multiSetFrame}
     */
    getMultiSetFrame(initData = null) {
        const rtn = super.getFrame(multiSetFrame, initData);
        return rtn;
    }

    async init() {
        for (let dbName in this.mysql) {
            if (config.mysql[dbName] == null) {
                throw utils.errorHandling(errors.undefinedConfig);
            }

            let initMySql = new MySQL();
            await initMySql.createPool(config.mysql[dbName]);

            this.mysql[dbName] = initMySql;
        }

        for (let dbName in this.redis) {
            if (config.redis[dbName] == null) {
                throw utils.errorHandling(errors.undefinedConfig);
            }

            let initRedis = new Redis();
            await initRedis.createClient(config.redis[dbName]);

            this.redis[dbName] = initRedis;
            this.redis[dbName].client.on('error', (err) => {
                logger.error('redis ' + dbName + ' error: ' + err);
            });
        }
    }

    /**
     *
     * @param {typeof mysqlConn| typeof redisConn} dbConn
     * @param {queryFrame} querys
     */
    async set(dbConn, querys) {
        if (querys.querys.length > 0 || this.mysql[dbConn] != null) {
            const mysqlObj = /** @type {MySQL} */ (this.mysql[dbConn]);
            const mysqlQuerys = mysqlObj.makeMultipleQuery(querys.querys);
            const mysqlConn = await mysqlObj.beginTransaction();

            try {
                await mysqlObj.query(mysqlConn, mysqlQuerys);
                await mysqlObj.commit(mysqlConn);
            } catch (err) {
                await mysqlObj.rollback(mysqlConn);
                throw err;
            }
        }

        if (querys.cmds.length > 0 || this.redis[dbConn] != null) {
            const redisObj = /** @type {Redis} */ (this.redis[dbConn]);

            try {
                // Redis Set
                await redisObj.multiCmd(querys.cmds);
            } catch (err) {
                throw err;
            }
        }
    }

    /**
     *
     * @param {Array<multiSetFrame>} multiSetFrames
     */
    async multiSet(multiSetFrames) {
        const tempMysqls = [];
        for (let i in multiSetFrames) {
            if (multiSetFrames[i].query.querys.length > 0 || this.mysql[multiSetFrames[i].conn] != null) {
                const mysqlObj = /** @type {MySQL} */ (this.mysql[multiSetFrames[i].conn]);
                const mysqlConn = await mysqlObj.beginTransaction();
                const mysqlQuerys = mysqlObj.makeMultipleQuery(multiSetFrames[i].query.querys);

                tempMysqls.push({ mysqlObj, mysqlConn, mysqlQuerys });
            }
        }
        try {
            for (let i in tempMysqls) {
                await tempMysqls[i].mysqlObj.query(tempMysqls[i].mysqlConn, tempMysqls[i].mysqlQuerys);
            }
            for (let i in tempMysqls) {
                await tempMysqls[i].mysqlObj.commit(tempMysqls[i].mysqlConn);
            }
        } catch (err) {
            for (let i in tempMysqls) {
                await tempMysqls[i].mysqlObj.rollback(tempMysqls[i].mysqlConn);
                throw err;
            }
        }

        for (let i in multiSetFrames) {
            if (multiSetFrames[i].query.cmds.length > 0 || this.redis[multiSetFrames[i].conn] != null) {
                const redisObj = /** @type {Redis} */ (this.redis[multiSetFrames[i].conn]);

                try {
                    // Redis Set
                    await redisObj.multiCmd(multiSetFrames[i].query.cmds);
                } catch (err) {
                    throw err;
                }
            }
        }
    }

    async getFromCache(dbConn, key, query = null) {
        let rtn = [];

        const redisObj = /** @type {Redis} */ (this.redis[dbConn]);
        const mysqlObj = /** @type {MySQL} */ (this.mysql[dbConn]);

        if (redisObj != null) {
            const result = await redisObj.client.hgetall(key);
            if (result != null) {
                for (let i in result) {
                    try {
                        rtn.push(JSON.parse(result[i]));
                    } catch (e) {
                        throw e;
                    }
                }
            }
        }

        if (mysqlObj != null && query != null && rtn.length <= 0) {
            rtn = [];

            let records = await mysqlObj.makeAndQuery(query);
            for (let i in records) {
                if (redisObj != null && records[i].idx != null) {
                    await redisObj.client.hset(key, records[i].idx, records[i]);
                }
                rtn.push(records[i]);
            }
        }

        return rtn;
    }
}

module.exports = new dbMgr();
