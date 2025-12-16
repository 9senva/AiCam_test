DROP DATABASE IF EXISTS cam;
CREATE DATABASE IF NOT EXISTS cam DEFAULT CHARSET utf8;
USE cam;

-- 用户信息表
CREATE TABLE user (
    id            BIGINT(20)   NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    username      VARCHAR(255) NOT NULL DEFAULT '' UNIQUE COMMENT '用户账号',
    password      VARCHAR(100) DEFAULT '123456' COMMENT '密码',
    nickName      VARCHAR(30) COMMENT '用户昵称',
    email         VARCHAR(50) UNIQUE COMMENT '用户邮箱',
    phoneNumber   VARCHAR(11) UNIQUE COMMENT '手机号码',
    sex           CHAR(1)      DEFAULT '0' COMMENT '用户性别（0=未知 1=男 2=女）',
    birthday      TIMESTAMP NULL DEFAULT NULL COMMENT '生日',
    avatarFileUrl VARCHAR(100) NOT NULL DEFAULT '' COMMENT '头像文件路径',
    role          VARCHAR(20)  DEFAULT 'user' COMMENT '角色（user=普通用户 admin=管理员）',
    accountStatus BIT          DEFAULT TRUE COMMENT '帐号状态（true =正常 false=停用）',
    coin          INT          DEFAULT 0 COMMENT '币',
    count         INT          DEFAULT 0 COMMENT '访问次数',
    delFlag       BIT          DEFAULT FALSE COMMENT '删除标志（true=删除 false=存在）',
    createTime    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    remark        TEXT COMMENT '备注',
    PRIMARY KEY (id)
) COMMENT = '用户信息表';

-- 设置自增起始值为100000000
ALTER TABLE user AUTO_INCREMENT = 100000000;
