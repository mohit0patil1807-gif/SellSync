from sqlalchemy.orm import Session
from app.models.product import Product, ProductVariant, StockMovement
from app.models.alert import Alert
from app.schemas.product import ProductCreate, ProductUpdate, StockAdjustmentRequest
from typing import List, Optional

class InventoryService:
    @staticmethod
    def get_products(db: Session, category: Optional[str] = None, low_stock_only: bool = False) -> List[Product]:
        query = db.query(Product).filter(Product.is_active == True)
        if category:
            query = query.filter(Product.category == category)
        products = query.order_by(Product.name.asc()).all()
        if low_stock_only:
            return [p for p in products if p.available_stock <= p.low_stock_threshold]
        return products

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_product_by_sku(db: Session, sku: str) -> Optional[Product]:
        return db.query(Product).filter(Product.sku == sku).first()

    @staticmethod
    def create_product(db: Session, product_in: ProductCreate) -> Product:
        product = Product(
            sku=product_in.sku,
            name=product_in.name,
            category=product_in.category,
            image_url=product_in.image_url,
            base_price=product_in.base_price,
            stock_on_hand=product_in.stock_on_hand,
            reserved_stock=product_in.reserved_stock,
            low_stock_threshold=product_in.low_stock_threshold,
            description=product_in.description,
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        
        # Log initial movement
        if product.stock_on_hand > 0:
            movement = StockMovement(
                product_id=product.id,
                change_qty=product.stock_on_hand,
                reason="INITIAL_STOCK",
                reference_type="CATALOG",
                notes="Initial inventory setup"
            )
            db.add(movement)
            db.commit()
            
        return product

    @staticmethod
    def adjust_stock(db: Session, product_id: int, request: StockAdjustmentRequest) -> Product:
        product = InventoryService.get_product_by_id(db, product_id)
        if not product:
            raise ValueError(f"Product with ID {product_id} not found")

        # Safety check: stock on hand cannot become negative
        if product.stock_on_hand + request.change_qty < 0:
            raise ValueError("Adjustment would result in negative stock on hand")

        product.stock_on_hand += request.change_qty
        
        movement = StockMovement(
            product_id=product.id,
            change_qty=request.change_qty,
            reason=request.reason,
            reference_type="MANUAL_ADJUSTMENT",
            notes=request.notes
        )
        db.add(movement)

        # Check if low stock threshold breached
        if product.available_stock <= product.low_stock_threshold:
            # Check if alert already exists
            existing_alert = db.query(Alert).filter(
                Alert.alert_type == "LOW_STOCK",
                Alert.reference_id == str(product.id),
                Alert.status == "OPEN"
            ).first()
            if not existing_alert:
                alert = Alert(
                    alert_type="LOW_STOCK",
                    title=f"Low Stock Alert: {product.name}",
                    description=f"Only {product.available_stock} units available (Threshold: {product.low_stock_threshold}).",
                    severity="WARNING",
                    status="OPEN",
                    reference_type="PRODUCT",
                    reference_id=str(product.id)
                )
                db.add(alert)
        else:
            # Auto-resolve alert if stock restored above threshold
            existing_alert = db.query(Alert).filter(
                Alert.alert_type == "LOW_STOCK",
                Alert.reference_id == str(product.id),
                Alert.status == "OPEN"
            ).first()
            if existing_alert:
                existing_alert.status = "RESOLVED"

        db.commit()
        db.refresh(product)
        return product

    @staticmethod
    def reserve_stock(db: Session, product_id: int, quantity: int, order_id: int) -> bool:
        product = InventoryService.get_product_by_id(db, product_id)
        if not product:
            return False
        
        product.reserved_stock += quantity
        movement = StockMovement(
            product_id=product.id,
            change_qty=0,
            reason="ORDER_RESERVED",
            reference_type="ORDER",
            reference_id=str(order_id),
            notes=f"Reserved {quantity} units for Order #{order_id}"
        )
        db.add(movement)
        db.commit()
        return True

    @staticmethod
    def release_stock(db: Session, product_id: int, quantity: int, order_id: int) -> bool:
        product = InventoryService.get_product_by_id(db, product_id)
        if not product:
            return False
            
        product.reserved_stock = max(0, product.reserved_stock - quantity)
        movement = StockMovement(
            product_id=product.id,
            change_qty=0,
            reason="RESERVATION_RELEASED",
            reference_type="ORDER",
            reference_id=str(order_id),
            notes=f"Released reservation of {quantity} units from cancelled Order #{order_id}"
        )
        db.add(movement)
        db.commit()
        return True

    @staticmethod
    def commit_stock_dispatch(db: Session, product_id: int, quantity: int, order_id: int) -> bool:
        product = InventoryService.get_product_by_id(db, product_id)
        if not product:
            return False

        # Release from reserved and deduct from on-hand
        product.reserved_stock = max(0, product.reserved_stock - quantity)
        product.stock_on_hand = max(0, product.stock_on_hand - quantity)
        
        movement = StockMovement(
            product_id=product.id,
            change_qty=-quantity,
            reason="ORDER_FULFILLED",
            reference_type="ORDER",
            reference_id=str(order_id),
            notes=f"Dispatched {quantity} units for Order #{order_id}"
        )
        db.add(movement)
        db.commit()
        return True
