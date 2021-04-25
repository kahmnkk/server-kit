const errors = {
    undefinedError: {
        code: 1,
        message: 'undefined error',
    },
    undefinedServer: {
        code: 2,
        message: 'undefined server',
    },
    undefinedConfig: {
        code: 3,
        message: 'undefined config',
    },
    undefinedModule: {
        code: 4,
        message: 'undefined module',
    },

    // DataBases
    failedQuery: {
        code: 1001,
        message: 'failed query',
    },
    failedCache: {
        code: 1002,
        message: 'failed cache',
    },

    // Api
    invalidSessionStore: {
        code: 10001,
        message: 'invalid session store',
    },
    invalidRequestRouter: {
        code: 10002,
        message: 'invalid request router',
    },
    invalidRequestData: {
        code: 10003,
        message: 'invalid request data',
    },
    invalidResponseData: {
        code: 10004,
        message: 'invalid response data',
    },

    // Account
    invalidAccountIdPw: {
        code: 11001,
        message: 'invalid account id or pw',
    },
    invalidAccountStatus: {
        code: 11002,
        message: 'invalid account status',
    },
    duplicatedAccountId: {
        code: 11003,
        message: 'duplicated account id',
    },
};

module.exports = errors;
