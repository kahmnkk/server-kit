// Socket Messages
const messages = require('@src/socket/messages');

const userAuth = require('@src/socket/user/auth');
const userTest = require('@src/socket/user/test');

// Common
const errors = require('@src/errors');

// Utils
const utils = require('@src/utils/utils');

class Router {
    constructor(msg) {
        this.msg = msg;
    }

    async process(socket, data) {
        let rtn = {};

        switch (this.msg) {
            // User Auth
            case messages.Login:
                rtn = await userAuth.login(socket, data);
                break;
            case messages.Example:
                rtn = await userAuth.example(socket, data);
                break;

            // User Test
            case messages.Test:
                rtn = await userTest.test(socket, data);
                break;

            default:
                throw utils.errorHandling(errors.invalidRequestRouter);
        }

        return rtn;
    }
}

module.exports = Router;
