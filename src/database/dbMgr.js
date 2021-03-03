const config = require('@root/config');
const errors = require('@src/errors');

// Utils
const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');

// DB
const MySQL = require('@src/database/mysql');
const Redis = require('@src/database/redis');

class dbMgr {
    constructor() {
        this.mysql = {
            master: null,
        };

        this.redis = {
            sessionStore: null,
            user: null,
            gen: null,
        };
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
}

module.exports = new dbMgr();
