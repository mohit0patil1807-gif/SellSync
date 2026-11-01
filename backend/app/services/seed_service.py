from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import json
from app.db.session import Base, engine
from app.models.channel import Channel
from app.models.product import Product, ProductVariant, ChannelListing, StockMovement
from app.models.order import Order, OrderItem, OrderActivityLog
from app.models.payment import Payment, Settlement
from app.models.fulfilment import Shipment
from app.models.automation import AutomationRule, AutomationLog
from app.models.alert import Alert
from app.config.personas import PERSONAS, get_allowed_channel_codes

class SeedService:
    @staticmethod
    def reset_and_seed_database(db: Session, persona_id: str = "boutique"):
        """
        Resets and seeds the SellSync database with realistic sample data for the chosen persona.
        All external marketplace/payment/courier connections are simulated (DEMO MODE).
        """
        if persona_id not in PERSONAS:
            persona_id = "boutique"

        persona = PERSONAS[persona_id]

        # Drop and clean existing tables cleanly via session
        db.query(OrderItem).delete()
        db.query(OrderActivityLog).delete()
        db.query(Payment).delete()
        db.query(Settlement).delete()
        db.query(Shipment).delete()
        db.query(Alert).delete()
        db.query(Order).delete()
        db.query(StockMovement).delete()
        db.query(ChannelListing).delete()
        db.query(ProductVariant).delete()
        db.query(Product).delete()
        db.query(Channel).delete()
        db.query(AutomationLog).delete()
        db.query(AutomationRule).delete()
        db.commit()



        now = datetime.utcnow()

        # ----------------------------------------------------
        # 1. SEED ALL CHANNELS (Marked as DEMO_MODE or LOCAL_FEATURE)
        # ----------------------------------------------------
        channels_master = [
            {
                "code": "amazon",
                "name": "Amazon India",
                "category": "marketplace",
                "status": "DEMO_MODE",
                "icon_slug": "amazon",
                "description": "Amazon India Seller Central (SP-API simulation). Zero real API credentials stored.",
                "capabilities_json": json.dumps(["Order Ingestion (Simulated)", "Inventory Sync", "Easy Ship Labels"]),
                "last_sync_at": now - timedelta(minutes=14),
                "is_demo": True
            },
            {
                "code": "flipkart",
                "name": "Flipkart",
                "category": "marketplace",
                "status": "DEMO_MODE",
                "icon_slug": "flipkart",
                "description": "Flipkart Marketplace Seller API simulation. Zero real API credentials stored.",
                "capabilities_json": json.dumps(["Order Ingestion (Simulated)", "Inventory Sync", "Settlement Tracking"]),
                "last_sync_at": now - timedelta(minutes=28),
                "is_demo": True
            },
            {
                "code": "meesho",
                "name": "Meesho",
                "category": "marketplace",
                "status": "DEMO_MODE",
                "icon_slug": "meesho",
                "description": "Meesho Supplier Panel feed simulation. Zero real API credentials stored.",
                "capabilities_json": json.dumps(["Order Ingestion (Simulated)", "Bulk Dispatch", "Return Processing"]),
                "last_sync_at": now - timedelta(hours=1),
                "is_demo": True
            },
            {
                "code": "myntra",
                "name": "Myntra",
                "category": "marketplace",
                "status": "DEMO_MODE",
                "icon_slug": "myntra",
                "description": "Myntra Partner Portal simulation for fashion catalog. Zero real API credentials stored.",
                "capabilities_json": json.dumps(["Catalog Sync (Simulated)", "Order Ingestion"]),
                "last_sync_at": now - timedelta(hours=2),
                "is_demo": True
            },
            {
                "code": "swiggy",
                "name": "Swiggy",
                "category": "food_delivery",
                "status": "DEMO_MODE",
                "icon_slug": "swiggy",
                "description": "Swiggy Minis & Food Partner simulation. Kitchen prep relay and rider handover PINs.",
                "capabilities_json": json.dumps(["Order Relay (Simulated)", "Kitchen Status", "Rider Handover PIN"]),
                "last_sync_at": now - timedelta(minutes=4),
                "is_demo": True
            },
            {
                "code": "zomato",
                "name": "Zomato",
                "category": "food_delivery",
                "status": "DEMO_MODE",
                "icon_slug": "zomato",
                "description": "Zomato For Business webhook simulator. Instant food order lifecycle and food delivery reconciliation.",
                "capabilities_json": json.dumps(["Order Relay (Simulated)", "Kitchen Status", "Rider Handover PIN"]),
                "last_sync_at": now - timedelta(minutes=8),
                "is_demo": True
            },
            {
                "code": "instagram",
                "name": "Instagram Direct",
                "category": "social_commerce",
                "status": "DEMO_MODE",
                "icon_slug": "instagram",
                "description": "Instagram DM chat commerce simulator. Turns chats into orders with UPI payment links.",
                "capabilities_json": json.dumps(["Chat-to-Order Helper", "UPI Link Dispatch", "Shipping Updates DM"]),
                "last_sync_at": now - timedelta(minutes=2),
                "is_demo": True
            },
            {
                "code": "whatsapp",
                "name": "WhatsApp Business",
                "category": "social_commerce",
                "status": "DEMO_MODE",
                "icon_slug": "whatsapp",
                "description": "WhatsApp catalog and chat order simulator. Automated tracking message previews.",
                "capabilities_json": json.dumps(["Chat-to-Order Helper", "UPI Deep Links", "Tracking Message Previews"]),
                "last_sync_at": now - timedelta(minutes=5),
                "is_demo": True
            },
            {
                "code": "direct",
                "name": "Direct Storefront & Walk-in",
                "category": "direct",
                "status": "LOCAL_FEATURE", # Clearly identified as a purely local feature
                "icon_slug": "globe",
                "description": "Local manual order entry terminal and direct storefront. Runs locally in your browser/SQLite.",
                "capabilities_json": json.dumps(["Manual Order Entry", "Phone / Walk-in Orders", "Custom Invoices"]),
                "last_sync_at": now,
                "is_demo": False
            }
        ]

        allowed_channel_codes = get_allowed_channel_codes(persona["seller_type"])
        channel_map = {}
        for c_data in channels_master:
            if c_data["code"] in allowed_channel_codes:
                ch = Channel(**c_data)
                db.add(ch)
                db.flush()
                channel_map[ch.code] = ch

        # ----------------------------------------------------
        # 2. SEED PERSONA PRODUCTS
        # ----------------------------------------------------
        product_map = {}
        for p_raw in persona["products"]:
            p_info = dict(p_raw)
            listings = p_info.pop("listings", [])
            p = Product(**p_info)
            db.add(p)
            db.flush()
            product_map[p.sku] = p


            # Add channel listings linking central SKU to channel
            for ch_code in listings:
                if ch_code in channel_map:
                    ch_obj = channel_map[ch_code]
                    listing = ChannelListing(
                        product_id=p.id,
                        channel_id=ch_obj.id,
                        external_listing_id=f"{ch_code.upper()[:3]}-{p.sku}",
                        external_sku=p.sku,
                        channel_price=p.base_price,
                        sync_status="SYNCED",
                        last_synced_at=now - timedelta(minutes=15)
                    )
                    db.add(listing)

            # Log initial inventory baseline
            mov = StockMovement(
                product_id=p.id,
                change_qty=p.stock_on_hand,
                reason="INITIAL_STOCK",
                reference_type="CATALOG",
                notes=f"Initial stock setup for {persona['name']}"
            )
            db.add(mov)

        # ----------------------------------------------------
        # 3. SEED AUTOMATION RULES
        # ----------------------------------------------------
        rules_data = [
            {
                "code": "RULE-AUTO-CONFIRM",
                "rule_name": "Auto Confirm on Payment Verification",
                "description": "When customer payment is marked verified, automatically confirm order and reserve stock.",
                "trigger_event": "PAYMENT_VERIFIED",
                "action_type": "CONFIRM_ORDER",
                "is_enabled": True,
                "total_executions": 12,
                "last_executed_at": now - timedelta(hours=2)
            },
            {
                "code": "RULE-LOW-STOCK",
                "rule_name": "Central Low-Stock Alert Engine",
                "description": "When available central inventory falls at or below threshold, create an operational alert.",
                "trigger_event": "STOCK_BELOW_THRESHOLD",
                "action_type": "CREATE_STOCK_ALERT",
                "is_enabled": True,
                "total_executions": 4,
                "last_executed_at": now - timedelta(hours=5)
            },
            {
                "code": "RULE-DISPATCH-NOTIF",
                "rule_name": "Customer Dispatch Notification Preview",
                "description": "When an order is dispatched, generate formatted WhatsApp/SMS shipping message with tracking link.",
                "trigger_event": "SHIPMENT_DISPATCHED",
                "action_type": "PREPARE_TRACKING_NOTIFICATION",
                "is_enabled": True,
                "total_executions": 18,
                "last_executed_at": now - timedelta(hours=1)
            }
        ]

        for r_data in rules_data:
            r = AutomationRule(**r_data)
            db.add(r)

        # ----------------------------------------------------
        # 4. SEED PERSONA-SPECIFIC SAMPLE ORDERS
        # ----------------------------------------------------
        orders_blueprint = []
        product_skus = list(product_map.keys())

        if persona_id == "baker":
            # Home Baker persona orders (includes food delivery channels & handover OTPs)
            orders_blueprint = [
                # 1. WhatsApp Order - Awaiting Payment (Demo walk-through target)
                {
                    "order_number": "ORD-101",
                    "external_order_id": "WA-882190",
                    "channel_code": "whatsapp",
                    "customer_name": "Aarav Sharma",
                    "customer_phone": "+91 98201 44521",
                    "delivery_address": "Flat 302, Palm Greens, Koramangala 4th Block",
                    "delivery_city": "Bengaluru",
                    "delivery_pincode": "560034",
                    "order_type": "handover",
                    "channel_status": "Awaiting UPI Payment Confirmation",
                    "status": "AWAITING_PAYMENT",
                    "payment_status": "PENDING",
                    "fulfilment_status": "UNFULFILLED",
                    "created_at": now - timedelta(minutes=45),
                    "items": [
                        {"sku": product_skus[0], "quantity": 1, "unit_price": product_map[product_skus[0]].base_price},
                        {"sku": product_skus[1], "quantity": 1, "unit_price": product_map[product_skus[1]].base_price}
                    ],
                    "shipping_fee": 40.0,
                    "internal_notes": "Customer initiated via WhatsApp. Self-pickup / direct handover.",
                    "initial_payment": {"method": "UPI", "amount": product_map[product_skus[0]].base_price + product_map[product_skus[1]].base_price + 40.0, "status": "PENDING", "ref": "PAY-WA-101"}
                },
                # 2. Instagram Order with Payment Mismatch
                {
                    "order_number": "ORD-102",
                    "external_order_id": "IG-918231",
                    "channel_code": "instagram",
                    "customer_name": "Pooja Mehta",
                    "customer_phone": "+91 97112 39012",
                    "delivery_address": "Villa 12, Palm Meadows, Whitefield",
                    "delivery_city": "Bengaluru",
                    "delivery_pincode": "560066",
                    "order_type": "handover",
                    "channel_status": "Payment Under Review",
                    "status": "EXCEPTION",
                    "payment_status": "MISMATCH",
                    "fulfilment_status": "UNFULFILLED",
                    "created_at": now - timedelta(hours=3),
                    "items": [
                        {"sku": product_skus[4], "quantity": 1, "unit_price": product_map[product_skus[4]].base_price}
                    ],
                    "shipping_fee": 50.0,
                    "internal_notes": "Customer paid ₹400 via UPI; order total is ₹500.",
                    "initial_payment": {"method": "UPI", "amount": 400.0, "status": "MISMATCH", "ref": "PAY-IG-102", "notes": "Underpaid by ₹100"}
                },
                # 3. Swiggy Food Order - In Kitchen Prep
                {
                    "order_number": "ORD-103",
                    "external_order_id": "SWG-88219",
                    "channel_code": "swiggy",
                    "customer_name": "Karan Malhotra",
                    "customer_phone": "+91 98450 11223",
                    "delivery_address": "Tower 2, Apt 501, Prestige Oasis",
                    "delivery_city": "Bengaluru",
                    "delivery_pincode": "560038",
                    "order_type": "handover",
                    "channel_status": "Baking & Packaging",
                    "status": "PROCESSING",
                    "payment_status": "VERIFIED",
                    "fulfilment_status": "UNFULFILLED",
                    "created_at": now - timedelta(minutes=20),
                    "items": [
                        {"sku": product_skus[0], "quantity": 1, "unit_price": product_map[product_skus[0]].base_price}
                    ],
                    "shipping_fee": 30.0,
                    "internal_notes": "Swiggy order. Rider pickup assigned.",
                    "initial_payment": {"method": "Swiggy Gateway", "amount": product_map[product_skus[0]].base_price + 30.0, "status": "VERIFIED", "ref": "SWG-PAY-103"}
                },
                # 4. Zomato Food Order - Dispatched with Rider Handover PIN
                {
                    "order_number": "ORD-104",
                    "external_order_id": "ZMT-77192",
                    "channel_code": "zomato",
                    "customer_name": "Sneha Roy",
                    "customer_phone": "+91 99012 34567",
                    "delivery_address": "Flat 104, Green Glen Layout, Bellandur",
                    "delivery_city": "Bengaluru",
                    "delivery_pincode": "560103",
                    "order_type": "handover",
                    "channel_status": "Rider In Transit",
                    "status": "DISPATCHED",
                    "payment_status": "VERIFIED",
                    "fulfilment_status": "SHIPPED",
                    "created_at": now - timedelta(minutes=35),
                    "items": [
                        {"sku": product_skus[1], "quantity": 1, "unit_price": product_map[product_skus[1]].base_price},
                        {"sku": product_skus[2], "quantity": 1, "unit_price": product_map[product_skus[2]].base_price}
                    ],
                    "shipping_fee": 40.0,
                    "internal_notes": "Handed over to Zomato fleet rider. Verification PIN: 4812.",
                    "initial_payment": {"method": "Zomato UPI", "amount": product_map[product_skus[1]].base_price + product_map[product_skus[2]].base_price + 40.0, "status": "VERIFIED", "ref": "ZMT-PAY-104"}
                },
                # 5. Direct / Walk-in Order - Delivered
                {
                    "order_number": "ORD-105",
                    "external_order_id": "WALK-0012",
                    "channel_code": "direct",
                    "customer_name": "Vikram Sen",
                    "customer_phone": "+91 98860 77112",
                    "delivery_address": "Store Walk-in Customer",
                    "delivery_city": "Bengaluru",
                    "delivery_pincode": "560034",
                    "order_type": "handover",
                    "channel_status": "Collected at counter",
                    "status": "DELIVERED",
                    "payment_status": "VERIFIED",
                    "fulfilment_status": "DELIVERED",
                    "created_at": now - timedelta(days=1),
                    "items": [
                        {"sku": product_skus[3], "quantity": 1, "unit_price": product_map[product_skus[3]].base_price}
                    ],
                    "shipping_fee": 0.0,
                    "internal_notes": "Counter purchase. Paid via GPay at shop QR.",
                    "initial_payment": {"method": "Store QR UPI", "amount": product_map[product_skus[3]].base_price, "status": "VERIFIED", "ref": "STORE-PAY-105"}
                }
            ]
        else:
            # Physical retail goods personas (Boutique, Reseller, Handmade Goods)
            # ZERO Swiggy, ZERO Zomato. All standard parcel courier shipping.
            p_chans = persona["channels"]
            c1 = p_chans[0] if len(p_chans) > 0 else "whatsapp"
            c2 = p_chans[1] if len(p_chans) > 1 else "instagram"
            c3 = p_chans[2] if len(p_chans) > 2 else "meesho"
            c4 = p_chans[3] if len(p_chans) > 3 else "direct"

            orders_blueprint = [
                # 1. WhatsApp Order - Awaiting Payment (Demo walk-through target)
                {
                    "order_number": "ORD-101",
                    "external_order_id": "WA-882190",
                    "channel_code": "whatsapp",
                    "customer_name": "Aarav Sharma",
                    "customer_phone": "+91 98201 44521",
                    "delivery_address": "Flat 302, Emerald Heights, Linking Road, Bandra West",
                    "delivery_city": "Mumbai",
                    "delivery_pincode": "400050",
                    "order_type": "courier",
                    "channel_status": "Awaiting UPI Payment Confirmation",
                    "status": "AWAITING_PAYMENT",
                    "payment_status": "PENDING",
                    "fulfilment_status": "UNFULFILLED",
                    "created_at": now - timedelta(minutes=45),
                    "items": [
                        {"sku": product_skus[0], "quantity": 1, "unit_price": product_map[product_skus[0]].base_price}
                    ],
                    "shipping_fee": 60.0,
                    "internal_notes": "Customer ordered via WhatsApp catalog. Pending payment check.",
                    "initial_payment": {"method": "UPI", "amount": product_map[product_skus[0]].base_price + 60.0, "status": "PENDING", "ref": "PAY-WA-101"}
                },
                # 2. Instagram Order with Payment Mismatch
                {
                    "order_number": "ORD-102",
                    "external_order_id": "IG-918231",
                    "channel_code": "instagram",
                    "customer_name": "Pooja Mehta",
                    "customer_phone": "+91 97112 39012",
                    "delivery_address": "Villa 12, Palm Meadows, Whitefield",
                    "delivery_city": "Bengaluru",
                    "delivery_pincode": "560066",
                    "order_type": "courier",
                    "channel_status": "Payment Under Review",
                    "status": "EXCEPTION",
                    "payment_status": "MISMATCH",
                    "fulfilment_status": "UNFULFILLED",
                    "created_at": now - timedelta(hours=3),
                    "items": [
                        {"sku": product_skus[1], "quantity": 1, "unit_price": product_map[product_skus[1]].base_price}
                    ],
                    "shipping_fee": 70.0,
                    "internal_notes": f"Customer paid ₹{max(1.0, round(product_map[product_skus[1]].base_price * 0.7, 2)):,.2f}; order total is ₹{product_map[product_skus[1]].base_price + 70.0:,.2f}.",
                    "initial_payment": {"method": "UPI", "amount": round(product_map[product_skus[1]].base_price * 0.7, 2), "status": "MISMATCH", "ref": "PAY-IG-102"}
                },
                # 3. Marketplace Order - Ready to Dispatch
                {
                    "order_number": "ORD-103",
                    "external_order_id": f"{c3.upper()[:3]}-402-9182041",
                    "channel_code": c3,
                    "customer_name": "Vikramaditya Roy",
                    "customer_phone": "+91 99302 81720",
                    "delivery_address": "House 45, Sector 15, Part 2",
                    "delivery_city": "Gurugram",
                    "delivery_pincode": "122001",
                    "order_type": "courier",
                    "channel_status": "Unshipped - Standard",
                    "status": "READY_TO_DISPATCH",
                    "payment_status": "VERIFIED",
                    "fulfilment_status": "PACKED",
                    "created_at": now - timedelta(hours=5),
                    "items": [
                        {"sku": product_skus[2], "quantity": 1, "unit_price": product_map[product_skus[2]].base_price}
                    ],
                    "shipping_fee": 80.0,
                    "internal_notes": "Courier pickup scheduled for afternoon dispatch.",
                    "initial_payment": {"method": "Prepaid Marketplace", "amount": product_map[product_skus[2]].base_price + 80.0, "status": "VERIFIED", "ref": f"{c3.upper()[:3]}-PAY-103"}
                },
                # 4. Social / Direct Order - Dispatched
                {
                    "order_number": "ORD-104",
                    "external_order_id": f"{c4.upper()[:3]}-ORD-77192",
                    "channel_code": c4,
                    "customer_name": "Ananya Sen",
                    "customer_phone": "+91 98301 92837",
                    "delivery_address": "Tower 4, Apt 1102, South City",
                    "delivery_city": "Kolkata",
                    "delivery_pincode": "700068",
                    "order_type": "courier",
                    "channel_status": "In Transit via Delhivery",
                    "status": "DISPATCHED",
                    "payment_status": "VERIFIED",
                    "fulfilment_status": "SHIPPED",
                    "created_at": now - timedelta(hours=24),
                    "items": [
                        {"sku": product_skus[3], "quantity": 1, "unit_price": product_map[product_skus[3]].base_price}
                    ],
                    "shipping_fee": 60.0,
                    "internal_notes": "Shipped via Delhivery Express. Tracking notification sent to customer.",
                    "initial_payment": {"method": "UPI", "amount": product_map[product_skus[3]].base_price + 60.0, "status": "VERIFIED", "ref": "PAY-104"}
                },
                # 5. Direct / Marketplace Order - Delivered
                {
                    "order_number": "ORD-105",
                    "external_order_id": f"{c2.upper()[:3]}-OD3019283",
                    "channel_code": c2,
                    "customer_name": "Kavita Nair",
                    "customer_phone": "+91 94471 29812",
                    "delivery_address": "TC 14/228, Nanthencode",
                    "delivery_city": "Thiruvananthapuram",
                    "delivery_pincode": "695003",
                    "order_type": "courier",
                    "channel_status": "Delivered",
                    "status": "DELIVERED",
                    "payment_status": "VERIFIED",
                    "fulfilment_status": "DELIVERED",
                    "created_at": now - timedelta(days=2),
                    "items": [
                        {"sku": product_skus[4], "quantity": 1, "unit_price": product_map[product_skus[4]].base_price}
                    ],
                    "shipping_fee": 70.0,
                    "internal_notes": "Delivery completed. Positive customer feedback received.",
                    "initial_payment": {"method": "Prepaid UPI", "amount": product_map[product_skus[4]].base_price + 70.0, "status": "VERIFIED", "ref": "PAY-105"}
                }
            ]

        # Insert Orders, Payments, Shipments, and Activity Logs
        for b in orders_blueprint:
            ch = channel_map.get(b["channel_code"], channel_map["direct"])
            
            # Calculate financials
            subtotal = sum(it["quantity"] * it["unit_price"] for it in b["items"])
            tax = round(subtotal * 0.05, 2) # 5% GST
            total_amount = round(subtotal + b["shipping_fee"] + tax, 2)

            ord_obj = Order(
                order_number=b["order_number"],
                external_order_id=b["external_order_id"],
                channel_id=ch.id,
                customer_name=b["customer_name"],
                customer_email=f"{b['customer_name'].lower().replace(' ', '.')}@example.com",
                customer_phone=b["customer_phone"],
                delivery_address=b["delivery_address"],
                delivery_city=b["delivery_city"],
                delivery_pincode=b["delivery_pincode"],
                order_type=b["order_type"],
                channel_status=b["channel_status"],
                status=b["status"],
                payment_status=b["payment_status"],
                fulfilment_status=b["fulfilment_status"],
                currency=persona["currency"],
                subtotal=subtotal,
                discount=0.0,
                shipping_fee=b["shipping_fee"],
                tax=tax,
                total_amount=total_amount,
                internal_notes=b["internal_notes"],
                created_at=b["created_at"],
                updated_at=b["created_at"]
            )
            db.add(ord_obj)
            db.flush()

            # Add Order Items
            for it in b["items"]:
                p_item = product_map.get(it["sku"])
                item_obj = OrderItem(
                    order_id=ord_obj.id,
                    product_id=p_item.id if p_item else None,
                    sku=it["sku"],
                    title=p_item.name if p_item else it["sku"],
                    quantity=it["quantity"],
                    unit_price=it["unit_price"],
                    total_price=round(it["quantity"] * it["unit_price"], 2)
                )
                db.add(item_obj)

            # Add Initial Payment Record
            init_pay = b["initial_payment"]
            pay_obj = Payment(
                payment_reference=init_pay["ref"],
                order_id=ord_obj.id,
                amount=init_pay["amount"],
                payment_method=init_pay["method"],
                gateway_reference=f"UPI/SIM/{init_pay['ref']}",
                verification_status=init_pay["status"],
                settlement_status="SETTLED" if b["status"] == "DELIVERED" else "PENDING",
                transaction_date=b["created_at"],
                notes=init_pay.get("notes", "Simulated demo transaction")
            )
            db.add(pay_obj)

            # Add Shipment Record if label created or dispatched
            if b["status"] in ["READY_TO_DISPATCH", "DISPATCHED", "DELIVERED"]:
                tracking_num = f"DEL-EXP-{ord_obj.id:04d}98"
                courier_name = "Delhivery Express" if ord_obj.order_type == "courier" else "Swiggy / Zomato Fleet"
                shipment = Shipment(
                    order_id=ord_obj.id,
                    tracking_number=tracking_num,
                    courier_name=courier_name,
                    tracking_url=f"https://track.sellsync.demo/pkg/{tracking_num}",
                    shipping_label_id=f"LBL-{b['order_number']}",
                    packing_status="PACKED",
                    status="DELIVERED" if b["status"] == "DELIVERED" else ("PICKED_UP" if b["status"] == "DISPATCHED" else "LABEL_CREATED"),
                    dispatch_date=b["created_at"] + timedelta(hours=1),
                    delivery_handover_code="4812" if ord_obj.order_type == "handover" else None
                )
                db.add(shipment)

            # Add Initial Activity Logs
            act1 = OrderActivityLog(
                order_id=ord_obj.id,
                action="ORDER_RECEIVED",
                description=f"Order received via {ch.name} ({b['external_order_id']}). Total: ₹{total_amount:,.2f}.",
                actor=f"{ch.name} (Demo)",
                created_at=b["created_at"]
            )
            db.add(act1)

            if b["payment_status"] == "VERIFIED":
                act2 = OrderActivityLog(
                    order_id=ord_obj.id,
                    action="PAYMENT_VERIFIED",
                    description=f"Payment verified via {init_pay['method']}.",
                    actor="Payment Helper",
                    created_at=b["created_at"] + timedelta(minutes=5)
                )
                db.add(act2)

        # ----------------------------------------------------
        # 5. SEED SETTLEMENTS
        # ----------------------------------------------------
        for ch_code in persona["channels"]:
            if ch_code in channel_map and ch_code in ["amazon", "flipkart", "meesho", "swiggy", "zomato"]:
                ch_obj = channel_map[ch_code]
                s = Settlement(
                    settlement_reference=f"STL-{ch_code.upper()[:3]}-DEMO-01",
                    channel_id=ch_obj.id,
                    gross_amount=12500.0,
                    deductions=1875.0, # 15% platform fee
                    net_settlement=10625.0,
                    settlement_date=now - timedelta(days=2),
                    status="COMPLETED",
                    notes=f"Simulated weekly {ch_obj.name} marketplace payout credit."
                )
                db.add(s)

        # ----------------------------------------------------
        # 6. SEED OPERATIONAL ALERTS (Needs Attention)
        # ----------------------------------------------------
        first_product = list(product_map.values())[0]
        alerts_data = [
            {
                "alert_type": "PAYMENT_MISMATCH",
                "title": f"Payment Mismatch: Order #ORD-102 (Instagram DM)",
                "description": "Customer paid less than order total. Check payment before packing.",
                "severity": "CRITICAL",
                "status": "OPEN",
                "reference_type": "ORDER",
                "reference_id": "2",
                "created_at": now - timedelta(hours=3)
            },
            {
                "alert_type": "LOW_STOCK",
                "title": f"Low Stock Alert: {first_product.name}",
                "description": f"Available stock is {first_product.available_stock} units (below threshold of {first_product.low_stock_threshold}).",
                "severity": "WARNING",
                "status": "OPEN",
                "reference_type": "PRODUCT",
                "reference_id": str(first_product.id),
                "created_at": now - timedelta(hours=4)
            }
        ]

        for a_data in alerts_data:
            al = Alert(**a_data)
            db.add(al)

        # Seed clean default assumptions and experiments (Zero pre-filled fake interviews)
        from app.services.validation_service import ValidationService
        ValidationService.seed_default_assumptions(db)
        ValidationService.seed_default_experiments(db)

        db.commit()
        return True
