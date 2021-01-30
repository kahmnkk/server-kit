// npm
const express = require('express');
const session = require('express-session');
const sessionStore = require('connect-redis')(session);
const redis = require('async-redis');
const uniqid = require('uniqid');
const cors = require('cors');

// Common
const config = require('@root/config');
const errors = require('@src/errors');

// Utils
const utils = require('@src/utils/utils');
const time = require('@src/utils/time');
const logger = require('@src/utils/logger');

// Database
const dbMgr = require('@src/database/dbMgr');

// Api Router
const routerIndex = require('@src/api/index');

class ApiService {
    constructor(options) {
        if (!options.sessionStore) throw errors['invalidSessionStore'];

        this.port = 6100;
        this.app = express();
        options.secret = '';

        // CORS 처리
        this.app.use(cors({ origin: true, credentials: true }));

        this.app.use(
            session({
                store: new sessionStore(redis.createClient(options.sessionStore)),
                secret: 'a!i-@e#v$r-%k^p&o*l(',
                resave: false,
                saveUninitialized: true,
            }),
        );

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use((req, res, next) => {
            let reqs = {};
            const txid = uniqid();
            req['txid'] = txid;
            res['txid'] = txid;
            reqs['method'] = req.method;
            reqs['path'] = req.path;
            if (req.method == 'POST') {
                reqs['params'] = req.body;
            } else {
                reqs['params'] = req.query;
            }

            logger.log('[' + req['txid'] + '] req: ' + JSON.stringify(reqs));
            next();
        });

        this.app.use('/index', routerIndex);

        this.app.use((req, res, next) => {
            let err = new Error('404 Not Found');
            err['status'] = 404;
            next(err);
        });

        this.app.use((err, req, res, next) => {
            res.status(err['status'] || 500);
            const data = JSON.stringify({
                message: err.message,
                error: err,
            });
            logger.log('[' + req['txid'] + '] res: ' + JSON.stringify(data));
            res.send(data);
        });

        this.app.set('port', this.port);
    }

    async init() {
        await dbMgr.init();

        await time.init(config.devTime);
        await time.syncTime();
    }

    async run(callback) {
        if (!callback) utils.promiseInjector(this.run);

        this.app.listen(this.port, (err) => {
            callback(err);
        });
    }
}

module.exports = ApiService;
