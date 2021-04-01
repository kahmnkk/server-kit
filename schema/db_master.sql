CREATE DATABASE IF NOT EXISTS `db_master`;
USE `db_master`;

DROP TABLE IF EXISTS `tb_account_info`;
CREATE TABLE `tb_account_info` (
  `idx` bigint(20) unsigned NOT NULL,
  `id` varchar(254) NOT NULL,
  `pw` varchar(200) NOT NULL,
  `salt` varchar(50) NOT NULL,
  `status` int(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idx`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Account Info';
