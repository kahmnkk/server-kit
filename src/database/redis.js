const redis = require('async-redis');

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
}

module.exports = Redis;
