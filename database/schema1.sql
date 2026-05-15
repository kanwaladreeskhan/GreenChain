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

USE GreenChainDB;
GO

-- Image column ka size badhao (NVARCHAR(MAX) use karo)
ALTER TABLE Devices ALTER COLUMN image_url NVARCHAR(MAX);
GO

USE GreenChainDB;
GO

-- 1. Orders Table agar nahi hai to create karein
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Orders' AND xtype='U')
BEGIN
    CREATE TABLE Orders (
        order_id INT IDENTITY(1,1) PRIMARY KEY,
        repair_shop_id INT FOREIGN KEY REFERENCES Users(user_id),
        component_id INT FOREIGN KEY REFERENCES Components(component_id),
        quantity INT NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        order_status NVARCHAR(50) DEFAULT 'pending',
        order_date DATETIME DEFAULT GETDATE(),
        shipping_date DATETIME,
        tracking_number NVARCHAR(100),
        invoice_number NVARCHAR(100),
        shipping_address NVARCHAR(500)
    );
    PRINT 'Orders table created';
END
GO

-- 2. Add condition_grade column to Components
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name='condition_grade' AND object_id=OBJECT_ID('Components'))
BEGIN
    ALTER TABLE Components ADD condition_grade NVARCHAR(10) CHECK (condition_grade IN ('S-Grade', 'A-Grade', 'B-Grade', 'C-Grade'));
    PRINT 'condition_grade column added';
END
GO

-- 3. Stored Procedure: Monthly Revenue Calculation
CREATE OR ALTER PROCEDURE sp_GetMonthlyRevenue
    @Year INT = NULL,
    @Month INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        YEAR(order_date) as Year,
        MONTH(order_date) as Month,
        COUNT(DISTINCT order_id) as TotalOrders,
        SUM(total_price) as TotalRevenue,
        COUNT(component_id) as TotalComponentsSold
    FROM Orders
    WHERE order_status = 'delivered'
        AND (@Year IS NULL OR YEAR(order_date) = @Year)
        AND (@Month IS NULL OR MONTH(order_date) = @Month)
    GROUP BY YEAR(order_date), MONTH(order_date)
    ORDER BY Year DESC, Month DESC;
END
GO

-- 4. Stored Procedure: Dashboard Stats
CREATE OR ALTER PROCEDURE sp_GetDashboardStats
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Total Devices Collected
    SELECT COUNT(*) as TotalDevicesCollected FROM Devices WHERE status IN ('collected', 'evaluated', 'dismantled');
    
    -- Total Components Sold
    SELECT SUM(quantity) as TotalComponentsSold FROM Orders WHERE order_status = 'delivered';
    
    -- Total Revenue
    SELECT ISNULL(SUM(total_price), 0) as TotalRevenue FROM Orders WHERE order_status = 'delivered';
    
    -- Environmental Impact (Estimated 5kg e-waste per device)
    SELECT COUNT(*) * 5 as EwasteDiverted_KG FROM Devices WHERE status = 'dismantled';
    
    -- Low Stock Alert (Less than 5 items)
    SELECT COUNT(*) as LowStockItems FROM Components WHERE quantity_available < 5 AND quantity_available > 0;
END
GO

-- 5. Stored Procedure: Inventory Health Check
CREATE OR ALTER PROCEDURE sp_InventoryHealth
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        component_category,
        COUNT(*) as TotalParts,
        SUM(quantity_available) as TotalQuantity,
        AVG(condition_score) as AvgCondition,
        SUM(calculated_price * quantity_available) as InventoryValue
    FROM Components
    WHERE quantity_available > 0
    GROUP BY component_category
    ORDER BY InventoryValue DESC;
END
GO

-- Insert sample components for testing
INSERT INTO Components (parent_device_id, component_name, component_category, condition_score, condition_grade, market_price, calculated_price, quantity_available, manufacturer, is_certified)
VALUES 
(1, 'iPhone 12 Screen', 'Display', 8, 'A-Grade', 150.00, 90.00, 3, 'Apple', 1),
(1, 'iPhone 12 Battery', 'Battery', 9, 'S-Grade', 50.00, 30.00, 5, 'Apple', 1),
(1, 'iPhone 12 Camera', 'Camera', 7, 'B-Grade', 80.00, 48.00, 2, 'Sony', 1);
GO