CREATE DATABASE IF NOT EXISTS `db_user`;
USE `db_user`;

DROP TABLE IF EXISTS `tb_user_info`;
CREATE TABLE `tb_user_info` (
  `idx` bigint(20) unsigned NOT NULL,
  `nickname` varchar(254) NOT NULL,
  `createTime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateTime` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='User Info';
