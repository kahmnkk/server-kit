// npm
const socketio = require('socket.io');
const redisAdapter = require('socket.io-redis');
const redis = require('async-redis');
const uniqid = require('uniqid');
const express = require('express');

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
const routerUser = require('@src/api/user/index');

// Socket
const SocketMgr = require('@src/socket/socketMgr');
const messages = require('@src/socket/messages');

class SocketService {
    constructor(options) {
        this.port = options.port;
        this.app = express();

        this.http = require('http').createServer(this.app).listen(this.port);
        this.http.keepAliveTimeout = 0;

        // socket.io option
        let option = {
            pingInterval: 5000,
            pingTimeout: 100000,
            transport: ['polling', 'websocket'],
            allowUpgrades: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 10,
        };
        this.io = socketio(this.http, option);

        if (options.pubsubInfo != null) {
            this.io.adapter(redisAdapter({ host: options.pubsubInfo.host, port: options.pubsubInfo.port }));
        }

        // express option
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

            logger.info('[' + req['txid'] + '] req: ' + JSON.stringify(reqs));
            next();
        });

        this.app.use('/user', routerUser);

        this.app.use((req, res, next) => {
            let err = new Error('404 Not Found');
            err['status'] = 404;
            next(err);
        });

        this.app.use((err, req, res, next) => {
            res.status(err['status'] || 500);
            const data = {
                message: err.message,
                error: err,
            };
            logger.error('[' + req['txid'] + '] res: ' + JSON.stringify(data));
            res.send(data);
        });

        this.app.set('port', this.port);
    }

    async init() {
        await dbMgr.init();

        await time.init(config.devTime);
        await time.syncTime();
    }

    run() {
        this.io.on('connect', (socket) => {
            logger.info('[' + socket.id + '] socket connected');

            for (let msg in messages) {
                socket.on(msg, (data) => {
                    const socketMgr = new SocketMgr(socket, msg);
                    socketMgr.message(data);
                });
            }

            socket.on('disconnect', () => {
                logger.info('[' + socket.id + '] socket disconnected');
            });
        });

        logger.info('socket service running.');
    }
}

module.exports = SocketService;
