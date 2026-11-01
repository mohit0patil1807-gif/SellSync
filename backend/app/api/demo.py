from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.seed_service import SeedService
from app.models.order import Order
from app.models.product import Product
from app.models.channel import Channel
from app.config.personas import PERSONAS, SELLER_TYPES
from typing import Optional

router = APIRouter(prefix="/demo", tags=["Demo Mode & Utilities"])

@router.get("/personas")
def get_personas():
    """
    Returns available demo personas and seller types.
    """
    return {
        "personas": [
            {
                "id": p["id"],
                "tag": p["tag"],
                "name": p["name"],
                "seller_type": p["seller_type"],
                "seller_type_label": p["seller_type_label"],
                "tagline": p["tagline"],
                "shipping_mode": p["shipping_mode"],
                "city": p["city"],
                "channels": p["channels"],
                "product_count": len(p["products"])
            }
            for p in PERSONAS.values()
        ],
        "seller_types": SELLER_TYPES
    }

@router.post("/reset")
def reset_demo_data(
    persona: str = Query("boutique", description="Persona ID: boutique, baker, reseller, handmade"),
    db: Session = Depends(get_db)
):
    """
    Resets the database and seeds it with clean sample data for the chosen persona.
    """
    target_persona = persona.lower().strip()
    if target_persona not in PERSONAS:
        target_persona = "boutique"

    SeedService.reset_and_seed_database(db, persona_id=target_persona)
    orders_count = db.query(Order).count()
    products_count = db.query(Product).count()
    channels_count = db.query(Channel).count()
    
    return {
        "status": "success",
        "persona": target_persona,
        "persona_name": PERSONAS[target_persona]["name"],
        "message": f"Demo data reset to clean {PERSONAS[target_persona]['name']} sample data.",
        "counts": {
            "channels": channels_count,
            "products": products_count,
            "orders": orders_count
        }
    }

@router.get("/status")
def get_demo_status(db: Session = Depends(get_db)):
    return {
        "is_demo_mode": True,
        "environment": "demo-prototype",
        "channels_count": db.query(Channel).count(),
        "products_count": db.query(Product).count(),
        "orders_count": db.query(Order).count(),
        "active_persona": "dynamic"
    }

@router.get("/export-data")
def export_user_data(db: Session = Depends(get_db)):
    """
    Micro-seller data sovereignty: 1-click full export of orders, products, and channels.
    """
    from datetime import datetime
    from app.models.payment import Payment

    products = db.query(Product).all()
    orders = db.query(Order).all()
    payments = db.query(Payment).all()

    return {
        "exported_at": datetime.utcnow().isoformat(),
        "disclaimer": "SellSync micro-seller portable data export.",
        "summary": {
            "products_count": len(products),
            "orders_count": len(orders),
            "payments_count": len(payments)
        },
        "products": [
            {
                "id": p.id,
                "sku": p.sku,
                "name": p.name,
                "price": p.base_price,
                "available_stock": p.available_stock,
                "category": p.category
            }
            for p in products
        ],

        "orders": [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_name": o.customer_name,
                "customer_phone": o.customer_phone,
                "shipping_city": o.delivery_city,
                "channel": o.channel.name if o.channel else "Direct",

                "total_amount": o.total_amount,
                "status": o.status,
                "payment_status": o.payment_status,
                "created_at": o.created_at.isoformat() if o.created_at else None,
                "items": [
                    {
                        "sku": it.sku,
                        "title": it.title,
                        "quantity": it.quantity,
                        "unit_price": it.unit_price,
                        "total_price": it.total_price
                    }
                    for it in o.items
                ]
            }
            for o in orders
        ],
        "channels": [
            {
                "code": c.code,
                "name": c.name,
                "status": c.status,
                "is_demo": c.is_demo
            }
            for c in db.query(Channel).all()
        ]
    }

@router.post("/delete-data")
def delete_user_data(db: Session = Depends(get_db)):
    """
    Clears all operational orders, activities, and payments. Leaves channels intact for re-use.
    """
    from app.models.order import OrderItem, OrderActivityLog
    from app.models.payment import Payment, Settlement
    from app.models.alert import Alert

    db.query(OrderItem).delete()
    db.query(OrderActivityLog).delete()
    db.query(Payment).delete()
    db.query(Settlement).delete()
    db.query(Alert).delete()
    db.query(Order).delete()
    db.commit()


    return {
        "status": "success",
        "message": "All orders, payment records, and activity logs have been permanently deleted."
    }

