const query = {
    master: {
        timestamp: 'SELECT UNIX_TIMESTAMP(NOW(3)) AS now, TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), NOW()) AS offset',
    },
};

module.exports = query;
