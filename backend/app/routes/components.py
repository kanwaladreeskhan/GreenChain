from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models import Component
from app.schemas import ComponentResponse

router = APIRouter(prefix="/api/components", tags=["Components"])

@router.get("/available", response_model=List[ComponentResponse])
def get_available_components(
    category: Optional[str] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    db: Session = Depends(get_db)
):
    """Get all available components for B2B marketplace"""
    
    query = db.query(Component).filter(
        Component.quantity_available > 0,
        Component.is_certified == True
    )
    
    if category:
        query = query.filter(Component.component_category == category)
    
    if min_price:
        query = query.filter(Component.calculated_price >= min_price)
    
    if max_price:
        query = query.filter(Component.calculated_price <= max_price)
    
    components = query.order_by(Component.added_date.desc()).all()
    return components

@router.get("/{component_id}")
def get_component_detail(component_id: int, db: Session = Depends(get_db)):
    """Get detailed component information"""
    component = db.query(Component).filter(Component.component_id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return {
        "component_id": component.component_id,
        "component_name": component.component_name,
        "condition_score": component.condition_score,
        "calculated_price": component.calculated_price,
        "quantity_available": component.quantity_available,
        "manufacturer": component.manufacturer,
        "specifications": component.specifications
    }