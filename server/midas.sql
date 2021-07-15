/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 100138
 Source Host           : localhost:3306
 Source Schema         : midas

 Target Server Type    : MySQL
 Target Server Version : 100138
 File Encoding         : 65001

 Date: 15/07/2021 14:32:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for coinflip_history
-- ----------------------------
DROP TABLE IF EXISTS `coinflip_history`;
CREATE TABLE `coinflip_history`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8 COLLATE utf8_bin NULL DEFAULT NULL,
  `avatar` tinyint(2) NULL DEFAULT 0,
  `bet` double(10, 5) NULL DEFAULT NULL,
  `reward` double(10, 5) NULL DEFAULT NULL,
  `ctime` datetime(0) NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `time index`(`ctime`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 11 CHARACTER SET = utf8 COLLATE = utf8_bin ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
