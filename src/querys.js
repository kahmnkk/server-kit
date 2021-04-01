const query = {
    master: {
        timestamp: 'SELECT UNIX_TIMESTAMP(NOW(3)) AS now, TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), NOW()) AS offset',

        // tb_account_info
        selectAccountById: 'SELECT idx, id, pw, salt, status FROM tb_account_info WHERE id = ?',
        insertAccountInfo: 'INSERT INTO tb_account_info (idx, id, pw, salt, status) VALUES (?, ?, ?, ?, ?)',
    },
    user: {
        // tb_user_info
        selectUserInfo: 'SELECT idx, nickname, profile, UNIX_TIMESTAMP(createTime), UNIX_TIMESTAMP(updateTime) FROM tb_user_info WHERE idx = ?',
        insertUserInfo: 'INSERT INTO tb_user_info (idx, nickname, createTime) VALUES (?, ?, ?)',
    },
};

module.exports = query;
