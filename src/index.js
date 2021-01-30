require('module-alias/register');

const config = require('@root/config');
const errors = require('@src/errors');
const logger = require('@src/utils/logger');

const service = require('@src/service/service');
const ApiService = require('@src/service/ApiService');

async function initApiService() {
    const apiService = new ApiService({
        sessionStore: config.redis.sessionStore,
        port: config.port.api,
        pubsubInfo: config.redis.pubsub,
    });

    await apiService.init();
    await apiService.run((err) => {
        if (err) throw err;
        logger.log('api service running.');
        service.api = apiService;
    });
}

async function proc(serverType) {
    try {
        logger.init(serverType);

        switch (serverType) {
            case 'api':
                await initApiService();
                break;

            default:
                throw errors.undefinedServer;
        }
    } catch (err) {
        logger.error(err);
    }
}

const commands = process.argv.slice(2);
proc(commands[0]);
