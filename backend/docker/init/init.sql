CREATE DATABASE IF NOT EXISTS fileDB;
CREATE DATABASE IF NOT EXISTS userDB;
USE fileDB;

CREATE TABLE dds_file_server (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    address VARCHAR(255),
    type VARCHAR(255),
    dds_store_path VARCHAR(255),
    dds_bin_path VARCHAR(255)
);

CREATE TABLE dds_file (
    fileId BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    size BIGINT,
    content_type VARCHAR(255),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    fileserver BIGINT REFERENCES dds_file_server(id),
    path VARCHAR(255),
    user VARCHAR(255)
);

USE userDB;

CREATE TABLE user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    isAdmin BOOLEAN
);