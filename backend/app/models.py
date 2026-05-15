from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "Users"
    
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    user_type = Column(String(50), nullable=False)
    phone_number = Column(String(20))
    address = Column(String(500))
    company_name = Column(String(255))
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    devices = relationship("Device", back_populates="user")

class Device(Base):
    __tablename__ = "Devices"
    
    device_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("Users.user_id"))
    device_name = Column(String(255), nullable=False)
    device_type = Column(String(100))
    brand = Column(String(100))
    model = Column(String(255))
    description = Column(String(1000))
    image_url = Column(String(500))
    status = Column(String(50), default="pending")
    submission_date = Column(DateTime, default=func.now())
    collection_date = Column(DateTime)
    evaluation_date = Column(DateTime)
    condition_notes = Column(String(1000))
    estimated_value = Column(Float)
    
    user = relationship("User", back_populates="devices")
    components = relationship("Component", back_populates="parent_device")

class Component(Base):
    __tablename__ = "Components"
    
    component_id = Column(Integer, primary_key=True, index=True)
    parent_device_id = Column(Integer, ForeignKey("Devices.device_id"))
    component_name = Column(String(255), nullable=False)
    component_category = Column(String(100))
    condition_score = Column(Integer)
    condition_grade = Column(String(10))  # S-Grade, A-Grade, B-Grade
    market_price = Column(Float)
    calculated_price = Column(Float)
    quantity_available = Column(Integer, default=1)
    manufacturer = Column(String(255))
    specifications = Column(String(1000))
    image_url = Column(String(500))
    is_certified = Column(Boolean, default=True)
    added_date = Column(DateTime, default=func.now())
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())
    
    parent_device = relationship("Device", back_populates="components")

class Order(Base):
    __tablename__ = "Orders"
    
    order_id = Column(Integer, primary_key=True, index=True)
    repair_shop_id = Column(Integer, ForeignKey("Users.user_id"))
    component_id = Column(Integer, ForeignKey("Components.component_id"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    order_status = Column(String(50), default="pending")
    order_date = Column(DateTime, default=func.now())
    shipping_date = Column(DateTime, nullable=True)
    tracking_number = Column(String(100), nullable=True)
    invoice_number = Column(String(100), nullable=True)
    shipping_address = Column(String(500), nullable=True)
    notes = Column(String(1000), nullable=True)
    
    # Relationships
    repair_shop = relationship("User", foreign_keys=[repair_shop_id])
    component = relationship("Component")