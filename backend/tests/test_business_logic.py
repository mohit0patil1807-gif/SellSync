import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.models.channel import Channel
from app.models.product import Product, StockMovement
from app.models.order import Order, OrderItem
from app.models.payment import Payment
from app.models.alert import Alert
from app.services.inventory_service import InventoryService
from app.services.payment_service import PaymentService
from app.services.order_service import OrderService
from app.schemas.product import StockAdjustmentRequest

# Setup test in-memory SQLite database
TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    
    # Create test channel
    channel = Channel(
        code="amazon",
        name="Amazon India",
        category="marketplace",
        status="DEMO_MODE"
    )
    session.add(channel)
    session.commit()
    
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_inventory_available_stock_formula(db):
    product = Product(
        sku="SKU-TEST-01",
        name="Test T-Shirt",
        category="Apparel",
        base_price=999.0,
        stock_on_hand=50,
        reserved_stock=10,
        low_stock_threshold=5
    )
    db.add(product)
    db.commit()

    assert product.available_stock == 40

def test_stock_reservation_and_commit(db):
    product = Product(
        sku="SKU-TEST-02",
        name="Test Jeans",
        category="Apparel",
        base_price=1999.0,
        stock_on_hand=20,
        reserved_stock=0,
        low_stock_threshold=5
    )
    db.add(product)
    db.commit()

    # Reserve 5 units for Order #101
    InventoryService.reserve_stock(db, product.id, 5, 101)
    db.refresh(product)
    assert product.stock_on_hand == 20
    assert product.reserved_stock == 5
    assert product.available_stock == 15

    # Dispatch/Commit 5 units
    InventoryService.commit_stock_dispatch(db, product.id, 5, 101)
    db.refresh(product)
    assert product.stock_on_hand == 15
    assert product.reserved_stock == 0
    assert product.available_stock == 15

def test_stock_adjustment_safety_and_low_stock_alert(db):
    product = Product(
        sku="SKU-TEST-03",
        name="Test Mug",
        category="Home",
        base_price=499.0,
        stock_on_hand=15,
        reserved_stock=0,
        low_stock_threshold=10
    )
    db.add(product)
    db.commit()

    # Adjust down by 7 units -> remaining 8 (below threshold of 10)
    InventoryService.adjust_stock(db, product.id, StockAdjustmentRequest(change_qty=-7, reason="DAMAGE"))
    db.refresh(product)
    assert product.stock_on_hand == 8
    assert product.available_stock == 8

    # Check alert was generated
    alert = db.query(Alert).filter(Alert.reference_id == str(product.id), Alert.status == "OPEN").first()
    assert alert is not None
    assert "Low Stock Alert" in alert.title

    # Adjustment that would cause negative stock should raise ValueError
    with pytest.raises(ValueError):
        InventoryService.adjust_stock(db, product.id, StockAdjustmentRequest(change_qty=-100, reason="MANUAL_ADJUSTMENT"))

def test_payment_verification_confirms_order(db):
    channel = db.query(Channel).first()
    order = Order(
        order_number="SS-TEST-99",
        external_order_id="EXT-99",
        channel_id=channel.id,
        customer_name="Test Customer",
        status="AWAITING_PAYMENT",
        payment_status="PENDING",
        total_amount=1500.0
    )
    db.add(order)
    db.commit()

    # Simulate payment verification
    PaymentService.simulate_payment_action(db, order.id, "verify")
    db.refresh(order)

    assert order.payment_status == "VERIFIED"
    assert order.status == "CONFIRMED"
    assert len(order.activity_logs) >= 1
    assert order.activity_logs[0].action == "PAYMENT_VERIFIED"

def test_payment_failure_does_not_confirm_order(db):
    channel = db.query(Channel).first()
    order = Order(
        order_number="SS-TEST-100",
        external_order_id="EXT-100",
        channel_id=channel.id,
        customer_name="Test Customer 2",
        status="AWAITING_PAYMENT",
        payment_status="PENDING",
        total_amount=2000.0
    )
    db.add(order)
    db.commit()

    # Simulate payment failure
    PaymentService.simulate_payment_action(db, order.id, "fail")
    db.refresh(order)

    assert order.payment_status == "FAILED"
    assert order.status == "AWAITING_PAYMENT" # NOT confirmed!

def test_payment_mismatch_creates_alert(db):
    channel = db.query(Channel).first()
    order = Order(
        order_number="SS-TEST-101",
        external_order_id="EXT-101",
        channel_id=channel.id,
        customer_name="Test Customer 3",
        status="AWAITING_PAYMENT",
        payment_status="PENDING",
        total_amount=2500.0
    )
    db.add(order)
    db.commit()

    # Simulate payment mismatch
    PaymentService.simulate_payment_action(db, order.id, "mismatch")
    db.refresh(order)

    assert order.payment_status == "MISMATCH"
    assert order.status == "AWAITING_PAYMENT" # NOT confirmed!
    alert = db.query(Alert).filter(Alert.reference_id == str(order.id), Alert.alert_type == "PAYMENT_MISMATCH").first()
    assert alert is not None

def test_order_cancellation_releases_reservation(db):
    channel = db.query(Channel).first()
    product = Product(
        sku="SKU-TEST-04",
        name="Test Candle",
        category="Home",
        base_price=500.0,
        stock_on_hand=30,
        reserved_stock=2,
        low_stock_threshold=5
    )
    db.add(product)
    db.commit()

    order = Order(
        order_number="SS-TEST-102",
        external_order_id="EXT-102",
        channel_id=channel.id,
        customer_name="Test Customer 4",
        status="CONFIRMED",
        payment_status="VERIFIED",
        total_amount=1000.0
    )
    db.add(order)
    db.commit()

    item = OrderItem(
        order_id=order.id,
        product_id=product.id,
        sku=product.sku,
        title=product.name,
        quantity=2,
        unit_price=500.0,
        total_price=1000.0
    )
    db.add(item)
    db.commit()

    # Now cancel the order
    OrderService.update_order_status(db, order.id, "CANCELLED", "Customer cancelled order")
    db.refresh(product)
    assert product.reserved_stock == 0 # Reservation released!
    assert product.available_stock == 30
