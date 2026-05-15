from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Device, User
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

router = APIRouter(prefix="/api/devices", tags=["Devices"])

# Create Pydantic model for request body
class DeviceSubmit(BaseModel):
    user_id: int
    device_name: str
    device_type: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None

@router.post("/submit")
def submit_device(device: DeviceSubmit, db: Session = Depends(get_db)):
    """Submit a new e-waste device"""
    try:
        print(f"Received device: {device}")
        
        # Check if user exists, if not create a default one
        user = db.query(User).filter(User.user_id == device.user_id).first()
        if not user:
            # Create a default user for testing
            user = User(
                user_id=device.user_id,
                email=f"user{device.user_id}@example.com",
                password_hash="dummy",
                full_name="Test User",
                user_type="household"
            )
            db.add(user)
            db.commit()
            print(f"Created new user with id: {user.user_id}")
        
        # Create new device
        new_device = Device(
            user_id=device.user_id,
            device_name=device.device_name,
            device_type=device.device_type,
            brand=device.brand,
            model=device.model,
            description=device.description,
            image_url=device.image_url,
            status="pending",
            submission_date=datetime.now()
        )
        
        db.add(new_device)
        db.commit()
        db.refresh(new_device)
        
        print(f"Device created with id: {new_device.device_id}")
        
        return {
            "message": "Device submitted successfully",
            "device_id": new_device.device_id,
            "status": new_device.status
        }
        
    except Exception as e:
        db.rollback()
        print(f"Error submitting device: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}")
def get_user_devices(user_id: int, db: Session = Depends(get_db)):
    """Get all devices for a user"""
    devices = db.query(Device).filter(Device.user_id == user_id).all()
    return devices

@router.get("/status/{device_id}")
def get_device_status(device_id: int, db: Session = Depends(get_db)):
    """Track device status"""
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    return {
        "device_id": device.device_id,
        "device_name": device.device_name,
        "status": device.status,
        "submission_date": device.submission_date,
        "device_type": device.device_type,
        "brand": device.brand
    }