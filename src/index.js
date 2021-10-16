// https://github.com/ilearnio/module-alias
require('module-alias/register');

const config = require('@root/config');
const errors = require('@src/errors');

const service = require('@src/service/service');
const ApiService = require('@src/service/apiService');
const SocketService = require('@src/service/socketService');

const utils = require('@src/utils/utils');
const logger = require('@src/utils/logger');

async function initApiService() {
    const apiService = new ApiService({
        sessionStore: config.redis.sessionStore,
        port: config.port.api,
        pubsubInfo: config.redis.pubsub,
    });

    await apiService.init();
    apiService.run();
    service.api = apiService;
}

async function initSocketService() {
    const socketService = new SocketService({
        port: config.port.socket,
        pubsubInfo: config.redis.pubsub,
    });

    await socketService.init();
    socketService.run();
    service.socket = socketService;
}

async function proc(serverType) {
    try {
        logger.init(serverType);

        switch (serverType) {
            case 'api':
                await initApiService();
                break;

            case 'socket':
                await initSocketService();
                break;

            default:
                throw utils.errorHandling(errors.undefinedServer);
        }
    } catch (err) {
        logger.error(err);
    }
}

const commands = process.argv.slice(2);
proc(commands[0]);
