CREATE DATABASE IF NOT EXISTS fileDB;
USE fileDB;

CREATE TABLE dds_file_server (
    id bigint primary key AUTO_INCREMENT,
    name varchar(255),
    address varchar(255),
    type varchar(255),
    dds_store_path varchar(255),
    dds_bin_path varchar(255)
);

CREATE TABLE dds_file (
    fileId bigint primary key AUTO_INCREMENT,
    name varchar(255),
    size bigint,
    content_type varchar(255),
    created_date DateTime DEFAULT CURRENT_TIMESTAMP,
    fileserver bigint references dds_file_server(id),
    path varchar(255)
);