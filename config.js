const config = {
    dev: true,
    baseUrl: '127.0.0.1',
    port: {
        api: 8080,
    },
    mysql: {
        master: {
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '1234',
            database: 'db_master',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true,
        },
        user: {
            host: '127.0.0.1',
            port: 3306,
            user: 'root',
            password: '1234',
            database: 'db_user',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true,
        },
    },
    redis: {
        sessionStore: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
        },
        gen: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
        },
        user: {
            host: '127.0.0.1',
            port: 6379,
            db: 0,
        },
    },
};

module.exports = config;
