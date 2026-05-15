-- Green-Chain E-Waste Marketplace Database Schema
-- For Microsoft SQL Server

-- Create Database
CREATE DATABASE GreenChainDB;
GO

USE GreenChainDB;
GO

-- Users Table
CREATE TABLE Users (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NOT NULL,
    user_type NVARCHAR(50) CHECK (user_type IN ('household', 'admin', 'repair_shop')) NOT NULL,
    phone_number NVARCHAR(20),
    address NVARCHAR(500),
    company_name NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    is_active BIT DEFAULT 1
);

-- Devices Table (Submitted by households)
CREATE TABLE Devices (
    device_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT FOREIGN KEY REFERENCES Users(user_id),
    device_name NVARCHAR(255) NOT NULL,
    device_type NVARCHAR(100),
    brand NVARCHAR(100),
    model NVARCHAR(255),
    description NVARCHAR(1000),
    image_url NVARCHAR(500),
    status NVARCHAR(50) CHECK (status IN ('pending', 'collected', 'evaluated', 'dismantled')) DEFAULT 'pending',
    submission_date DATETIME DEFAULT GETDATE(),
    collection_date DATETIME,
    evaluation_date DATETIME,
    condition_notes NVARCHAR(1000),
    estimated_value DECIMAL(10,2)
);

-- Components Table (Dismantled parts)
CREATE TABLE Components (
    component_id INT IDENTITY(1,1) PRIMARY KEY,
    parent_device_id INT FOREIGN KEY REFERENCES Devices(device_id),
    component_name NVARCHAR(255) NOT NULL,
    component_category NVARCHAR(100),
    condition_score INT CHECK (condition_score BETWEEN 1 AND 10),
    market_price DECIMAL(10,2),
    calculated_price DECIMAL(10,2), -- 50% of market price
    quantity_available INT DEFAULT 1,
    manufacturer NVARCHAR(255),
    specifications NVARCHAR(1000),
    image_url NVARCHAR(500),
    is_certified BIT DEFAULT 1,
    added_date DATETIME DEFAULT GETDATE(),
    last_updated DATETIME DEFAULT GETDATE()
);

-- Orders Table (B2B Transactions)
CREATE TABLE Orders (
    order_id INT IDENTITY(1,1) PRIMARY KEY,
    repair_shop_id INT FOREIGN KEY REFERENCES Users(user_id),
    component_id INT FOREIGN KEY REFERENCES Components(component_id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    order_status NVARCHAR(50) CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    order_date DATETIME DEFAULT GETDATE(),
    shipping_address NVARCHAR(500),
    tracking_number NVARCHAR(100),
    notes NVARCHAR(1000)
);

-- Create Indexes for Performance
CREATE INDEX idx_devices_user ON Devices(user_id);
CREATE INDEX idx_devices_status ON Devices(status);
CREATE INDEX idx_components_device ON Components(parent_device_id);
CREATE INDEX idx_components_category ON Components(component_category);
CREATE INDEX idx_components_price ON Components(calculated_price);
CREATE INDEX idx_orders_shop ON Orders(repair_shop_id);
CREATE INDEX idx_orders_status ON Orders(order_status);

-- Create View for Available Components
CREATE VIEW AvailableComponents AS
SELECT 
    c.component_id,
    c.component_name,
    c.component_category,
    c.condition_score,
    c.calculated_price as price,
    c.quantity_available,
    c.manufacturer,
    c.specifications,
    c.is_certified,
    d.device_name as parent_device,
    d.brand as device_brand
FROM Components c
JOIN Devices d ON c.parent_device_id = d.device_id
WHERE c.quantity_available > 0 AND c.is_certified = 1;
GO