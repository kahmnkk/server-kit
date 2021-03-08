const redis = require('async-redis');

const errors = require('@src/errors');
const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');

class Redis {
    constructor() {
        this.client = null;

        this._created_client = false;
    }

    async createClient(options) {
        if (this.client != null || this._created_client == true) {
            logger.log('already created client');
            return;
        }

        this.client = redis.createClient(options);
        this._created_client = true;
    }

    async multiCmd(cmds) {
        if (this.client == null) {
            throw utils.errorHandling(errors.failedCache);
        }

        await this.client.multi(cmds).exec((err, results) => {
            if (err) {
                throw utils.errorHandling(err);
            }

            if (results == null) {
                logger.error(errors.failedCache);
            } else {
                logger.log(cmds);
            }
        });
    }
}

module.exports = Redis;
