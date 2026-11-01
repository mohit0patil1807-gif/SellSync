from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.product import StockMovement, Product
from app.services.inventory_service import InventoryService
from app.schemas.product import (
    ProductResponse,
    ProductCreate,
    ProductUpdate,
    StockAdjustmentRequest,
    StockMovementResponse
)
from typing import List, Optional

router = APIRouter(prefix="/products", tags=["Products & Inventory"])

@router.get("", response_model=List[ProductResponse])
def get_products(
    category: Optional[str] = Query(None),
    low_stock: bool = Query(False),
    db: Session = Depends(get_db)
):
    products = InventoryService.get_products(db, category=category, low_stock_only=low_stock)
    return [ProductResponse.from_orm(p) for p in products]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = InventoryService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.from_orm(product)

@router.post("", response_model=ProductResponse)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    existing = InventoryService.get_product_by_sku(db, product_in.sku)
    if existing:
        raise HTTPException(status_code=400, detail=f"SKU {product_in.sku} already exists")
    created = InventoryService.create_product(db, product_in)
    return ProductResponse.from_orm(created)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_update: ProductUpdate, db: Session = Depends(get_db)):
    product = InventoryService.get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    
    db.commit()
    db.refresh(product)
    return ProductResponse.from_orm(product)

@router.post("/{product_id}/adjust-stock", response_model=ProductResponse)
def adjust_stock(product_id: int, adjustment: StockAdjustmentRequest, db: Session = Depends(get_db)):
    try:
        updated = InventoryService.adjust_stock(db, product_id, adjustment)
        return ProductResponse.from_orm(updated)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{product_id}/movements", response_model=List[StockMovementResponse])
def get_stock_movements(product_id: int, db: Session = Depends(get_db)):
    movements = db.query(StockMovement).filter(StockMovement.product_id == product_id).order_by(StockMovement.created_at.desc()).all()
    return [StockMovementResponse.from_orm(m) for m in movements]
