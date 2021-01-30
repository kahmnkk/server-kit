const mysql = require('mysql2/promise');

const errors = require('@src/errors');
const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');

class MySQL {
    constructor() {
        this.pool = null;
        this.options = null;

        /** @access private */
        this._retry_conn_count_limit =   10; // prettier-ignore
        this._retry_conn_interval    = 1000; // prettier-ignore
    }

    async createPool(options) {
        if (this.pool != null || this._created_pool == true) {
            logger.log('already created pool');
            return;
        }

        options.connectTimeout = 0; // (Default: 10000)
        this.options = options;
        this.pool = await mysql.createPool(this.options);
        this._created_pool = true;
    }

    /**
     * if DB Server has gone and connectTimeout option doesn't exists, Application Server goes down after 10 seconds with message 'Error: connect ETIMEDOUT'.
     * but protect by connectTimeout option
     *
     * @returns {mysql.PromisePoolConnection} connection from Pool
     * @see this.createPool
     */
    async getConnection() {
        let rtn = null;

        const that = this;
        let retry_count = 0;
        while (rtn == null) {
            try {
                rtn = await this.pool.getConnection();
            } catch (err) {
                retry_count += 1;

                // wait for retry getConnection
                logger.error(this.constructor.name + '.getConnection() ... retry ' + retry_count + '. waiting for ' + this._retry_conn_interval + ' ms');
                await new Promise((resolve) => {
                    setTimeout(resolve, that._retry_conn_interval);
                });
            }
        }

        return rtn;
    }

    bindQuery(query, args) {
        if (args.constructor.name == 'Array') {
            return this.pool.format(query, args);
        } else {
            return this.makeQuery(query, args);
        }
    }

    makeQuery(query, ...args) {
        if (args[0] != null && typeof args[0] == 'object' && args[0].constructor.name == 'Object') {
            return query;
        } else {
            return this.pool.format(query, [...args]);
        }
    }

    makeMultipleQuery(querys, args) {
        let retval = [];
        if (args == null || args.length == 0) {
            retval = querys;
        } else {
            for (let i = 0; i < querys.length; ++i) {
                retval.push(this.makeQuery(querys[i], ...args[i]));
            }
        }
        return retval.join('; ');
    }

    async query(...args) {
        let opts = { log: true };
        if (args.length > 0) {
            if (args[args.length - 1] != null && typeof args[args.length - 1] == 'object' && args[args.length - 1].constructor.name == 'Object') {
                opts = args[args.length - 1];
                args.splice(args.length - 1, 1);
            }
        }

        if (args.length == 1) {
            return await this.queryPool(args[0], opts);
        } else if (args.length == 2) {
            return await this.queryConn(args[0], args[1], opts);
        } else {
            throw utils.errorHandling(errors.failedQuery);
        }
    }

    async selectOne(query, ...args) {
        let result = await this.makeAndQuery(query, ...args);
        if (result == null || result.length == 0) return null;
        return result[0];
    }

    async queryPool(sql, opts) {
        let conn = null;

        try {
            if (opts !== undefined && opts.log == true) {
                logger.log(sql);
            }

            let [rows] = '';
            conn = await this.getConnection();

            [rows] = await conn.query(sql);

            if (rows == null) {
                throw utils.errorHandling(errors.failedQuery);
            }

            return rows;
        } catch (err) {
            logger.error(err);
            throw utils.errorHandling(errors.failedQuery);
        } finally {
            if (conn != null) {
                conn.release();
            }
        }
    }

    async queryConn(conn, sql, opts) {
        try {
            if (opts !== undefined && opts.log == true) {
                logger.log(sql);
            }
            let [rows] = await conn.query(sql);
            if (rows == null) {
                throw utils.errorHandling(errors.failedQuery);
            }
            return rows;
        } catch (err) {
            logger.error(err);
            throw utils.errorHandling(errors.failedQuery);
        }
    }

    async makeAndQuery(query, ...args) {
        let sql = this.makeQuery(query, ...args);

        let opts = { log: true };
        if (args.length > 0) {
            if (args[args.length - 1] != null && typeof args[args.length - 1] == 'object' && args[args.length - 1].constructor.name == 'Object') {
                opts = args[args.length - 1];
            }
        }

        return await this.query(sql, opts);
    }

    async beginTransaction() {
        let conn = null;
        try {
            conn = await this.getConnection();
            await conn.beginTransaction();
            return conn;
        } catch (err) {
            if (conn != null) {
                conn.release();
            }
            throw err;
        }
    }

    async commit(conn) {
        await conn.commit();
        conn.release();
    }

    async rollback(conn) {
        await conn.rollback();
        conn.release();
    }
}

module.exports = MySQL;
