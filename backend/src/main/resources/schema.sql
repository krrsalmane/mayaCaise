-- CaisseMaya Database Schema
-- MySQL 8+

CREATE DATABASE IF NOT EXISTS CaiseMaya
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE CaiseMaya;

CREATE TABLE categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500)
);

CREATE TABLE clients (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20)  NOT NULL UNIQUE,
    email        VARCHAR(255) UNIQUE,
    client_type  VARCHAR(20)  NOT NULL DEFAULT 'EXTERNE'
);

CREATE TABLE products (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150)   NOT NULL,
    description VARCHAR(500),
    price       DECIMAL(10, 2) NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    image_url   VARCHAR(500),
    category_id BIGINT         NOT NULL,
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE purchases (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_date     DATETIME       NOT NULL,
    unit_price        DECIMAL(10, 2) NOT NULL,
    discount_percent  INT            NOT NULL DEFAULT 0,
    total_price       DECIMAL(10, 2) NOT NULL,
    paid          TINYINT(1)     NOT NULL DEFAULT 0,
    client_id     BIGINT         NOT NULL,
    product_id    BIGINT         NOT NULL,
    CONSTRAINT fk_purchases_client
        FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_purchases_product
        FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_purchases_client  ON purchases(client_id);
CREATE INDEX idx_purchases_product ON purchases(product_id);
CREATE INDEX idx_purchases_date    ON purchases(purchase_date);
