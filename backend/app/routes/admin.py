from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.database import get_db
from app.models import Component, Device, Order

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# Pydantic Models
class ComponentCreate(BaseModel):
    parent_device_id: int
    component_name: str
    component_category: str
    condition_score: int
    condition_grade: str
    market_price: float
    calculated_price: float
    quantity_available: int
    manufacturer: str
    specifications: Optional[str] = None

class ComponentUpdate(BaseModel):
    component_name: Optional[str] = None
    condition_score: Optional[int] = None
    condition_grade: Optional[str] = None
    market_price: Optional[float] = None
    calculated_price: Optional[float] = None
    quantity_available: Optional[int] = None

class OrderUpdate(BaseModel):
    order_status: str
    tracking_number: Optional[str] = None

@router.get("/received-devices")
def get_received_devices(db: Session = Depends(get_db)):
    """Get all devices received from households"""
    devices = db.query(Device).filter(
        Device.status.in_(['collected', 'evaluated', 'pending'])
    ).order_by(Device.submission_date.desc()).all()
    
    return devices

@router.post("/mark-dismantled/{device_id}")
def mark_device_dismantled(device_id: int, components: List[ComponentCreate], db: Session = Depends(get_db)):
    """Mark device as dismantled and add components"""
    device = db.query(Device).filter(Device.device_id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    device.status = "dismantled"
    device.evaluation_date = datetime.now()
    
    # Add all components
    for comp in components:
        new_component = Component(
            parent_device_id=device_id,
            component_name=comp.component_name,
            component_category=comp.component_category,
            condition_score=comp.condition_score,
            condition_grade=comp.condition_grade,
            market_price=comp.market_price,
            calculated_price=comp.calculated_price,
            quantity_available=comp.quantity_available,
            manufacturer=comp.manufacturer,
            specifications=comp.specifications
        )
        db.add(new_component)
    
    db.commit()
    return {"message": f"Device {device_id} dismantled with {len(components)} components"}

@router.get("/inventory")
def get_inventory(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all components with filters"""
    query = db.query(Component)
    
    if category:
        query = query.filter(Component.component_category == category)
    
    if search:
        query = query.filter(
            Component.component_name.contains(search) |
            Component.manufacturer.contains(search)
        )
    
    components = query.order_by(Component.added_date.desc()).all()
    return components

@router.post("/inventory/add")
def add_component(component: ComponentCreate, db: Session = Depends(get_db)):
    """Add new component to inventory"""
    new_component = Component(**component.dict())
    db.add(new_component)
    db.commit()
    db.refresh(new_component)
    return new_component

@router.put("/inventory/{component_id}")
def update_component(component_id: int, component: ComponentUpdate, db: Session = Depends(get_db)):
    """Update component details"""
    existing = db.query(Component).filter(Component.component_id == component_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Component not found")
    
    for key, value in component.dict(exclude_unset=True).items():
        setattr(existing, key, value)
    
    existing.last_updated = datetime.now()
    db.commit()
    db.refresh(existing)
    return existing

@router.delete("/inventory/{component_id}")
def delete_component(component_id: int, db: Session = Depends(get_db)):
    """Delete component from inventory"""
    component = db.query(Component).filter(Component.component_id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    db.delete(component)
    db.commit()
    return {"message": "Component deleted"}

@router.get("/orders/pending")
def get_pending_orders(db: Session = Depends(get_db)):
    """Get all pending orders from repair shops"""
    orders = db.query(Order).filter(
        Order.order_status == 'pending'
    ).order_by(Order.order_date.asc()).all()
    
    return orders

@router.put("/orders/{order_id}/ship")
def mark_order_shipped(order_id: int, order_update: OrderUpdate, db: Session = Depends(get_db)):
    """Mark order as shipped"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.order_status = order_update.order_status
    order.tracking_number = order_update.tracking_number
    order.shipping_date = datetime.now()
    
    # Update inventory quantity
    component = db.query(Component).filter(Component.component_id == order.component_id).first()
    if component and order.order_status == 'shipped':
        component.quantity_available -= order.quantity
    
    db.commit()
    
    # Generate invoice number
    invoice_number = f"INV-{order_id}-{datetime.now().strftime('%Y%m%d')}"
    
    return {
        "message": f"Order {order_id} marked as shipped",
        "invoice_number": invoice_number
    }

@router.get("/stats/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics using stored procedures"""
    
    # Execute stored procedures
    result = db.execute(text("EXEC sp_GetDashboardStats"))
    stats = {}
    
    # Parse results (simplified)
    stats['total_devices'] = db.query(Device).filter(Device.status == 'dismantled').count()
    stats['total_components_sold'] = db.query(Order).filter(Order.order_status == 'delivered').count()
    stats['total_revenue'] = db.query(Order).filter(Order.order_status == 'delivered').with_entities(db.func.sum(Order.total_price)).scalar() or 0
    stats['ewaste_diverted_kg'] = db.query(Device).filter(Device.status == 'dismantled').count() * 5
    stats['low_stock_items'] = db.query(Component).filter(Component.quantity_available < 5, Component.quantity_available > 0).count()
    
    # Inventory health
    inventory_health = db.execute(text("EXEC sp_InventoryHealth")).fetchall()
    
    # Monthly revenue
    monthly_revenue = db.execute(text("EXEC sp_GetMonthlyRevenue")).fetchall()
    
    return {
        "stats": stats,
        "inventory_health": [dict(row._mapping) for row in inventory_health],
        "monthly_revenue": [dict(row._mapping) for row in monthly_revenue]
    }