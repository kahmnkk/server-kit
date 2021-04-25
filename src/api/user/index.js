// Modules
const express = require('express');
const router = express.Router();

// Common
const errors = require('@src/errors');

// Api
const SessionMgr = require('@src/api/sessionMgr');
const routerUser = require('@src/api/user/router');

// Utils
const utils = require('@src/utils/utils');

const ROUTERS = {
    join: 'join',
    login: 'login',
};

async function index(req, res) {
    const reqKeys = {
        router: 'router',
        data: 'data',
    };
    const resKeys = {
        result: 'result',
    };

    const session = new SessionMgr(req, res);
    const body = session.body;

    try {
        let response = {};

        let reqRouter = body[reqKeys.router];
        let reqDto = body[reqKeys.data];
        if (reqDto == null) {
            throw utils.errorHandling(errors.invalidRequestData);
        }

        if (typeof reqDto != 'object') {
            reqDto = JSON.parse(reqDto);
        }

        let uid = null;
        if (reqRouter == ROUTERS.join || reqRouter == ROUTERS.login) {
            uid = session.create(req);
        } else {
            uid = session.getUid();
        }
        if (uid == null) {
            throw utils.errorHandling(errors.sessionWrongAccess);
        }

        let resDto = null;
        switch (reqRouter) {
            case ROUTERS.join:
                resDto = await routerUser.join(reqDto);
                break;

            case ROUTERS.login:
                resDto = await routerUser.login(reqDto);
                session.addValue(req, 'idx', resDto.idx);
                break;

            default:
                throw utils.errorHandling(errors.invalidRequestRouter);
        }

        if (resDto == null) {
            throw utils.errorHandling(errors.invalidResponseData);
        }

        response[resKeys.result] = resDto;
        session.send(response);
    } catch (err) {
        session.error(err);
    }
}

utils.setRoute(router, '/index', index);

module.exports = router;
