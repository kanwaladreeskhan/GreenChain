from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: str
    full_name: str
    user_type: str

class UserCreate(UserBase):
    password: str

class DeviceBase(BaseModel):
    device_name: str
    device_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

class DeviceCreate(DeviceBase):
    user_id: int

class DeviceResponse(DeviceBase):
    device_id: int
    user_id: int
    status: str
    submission_date: datetime
    
    class Config:
        from_attributes = True

class ComponentBase(BaseModel):
    component_name: str
    component_category: Optional[str] = None
    condition_score: int
    market_price: float
    quantity_available: int = 1
    manufacturer: Optional[str] = None

class ComponentResponse(ComponentBase):
    component_id: int
    calculated_price: float
    is_certified: bool
    added_date: datetime
    
    class Config:
        from_attributes = True