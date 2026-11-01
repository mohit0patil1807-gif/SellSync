import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.session import Base, get_db
from app.config.personas import PERSONAS, SELLER_TYPES, get_allowed_channel_codes
from app.services.seed_service import SeedService
from app.services.chat_parser_service import ChatParserService
from app.services.payment_helper_service import PaymentHelperService
from app.services.analytics_service import AnalyticsService
from app.models.channel import Channel
from app.models.product import Product
from app.models.order import Order

from sqlalchemy.pool import StaticPool

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    c = TestClient(app)
    yield c
    app.dependency_overrides.clear()

def test_persona_channel_rules():
    boutique_channels = get_allowed_channel_codes("boutique")
    baker_channels = get_allowed_channel_codes("baker")
    reseller_channels = get_allowed_channel_codes("reseller")
    handmade_channels = get_allowed_channel_codes("handmade")

    assert "direct" in boutique_channels
    assert "whatsapp" in boutique_channels
    assert "instagram" in boutique_channels
    assert "swiggy" not in boutique_channels
    assert "zomato" not in boutique_channels

    assert "swiggy" in baker_channels
    assert "zomato" in baker_channels

    assert "swiggy" not in reseller_channels
    assert "zomato" not in handmade_channels

def test_seed_persona_isolation(db):
    # Seed Boutique
    SeedService.reset_and_seed_database(db, "boutique")
    channels = db.query(Channel).all()
    channel_codes = [c.code for c in channels]

    assert "swiggy" not in channel_codes
    assert "zomato" not in channel_codes
    assert "direct" in channel_codes

    direct_ch = db.query(Channel).filter(Channel.code == "direct").first()
    assert direct_ch.is_demo is False
    assert direct_ch.status == "LOCAL_FEATURE"

    # Seed Baker
    SeedService.reset_and_seed_database(db, "baker")
    baker_channels = db.query(Channel).all()
    baker_codes = [c.code for c in baker_channels]
    assert "swiggy" in baker_codes
    assert "zomato" in baker_codes

    # Check products are bakery items
    products = db.query(Product).all()
    titles = [p.name.lower() for p in products]
    assert any("cake" in t or "brownie" in t or "sourdough" in t for t in titles)


def test_chat_parser_service(db):
    SeedService.reset_and_seed_database(db, "boutique")
    
    sample_chat = """
    Hi sis, I want to order!
    Name: Ananya Sharma
    Phone: +91 98201 12345
    Address: Flat 402, Sunshine Heights, Linking Road, Bandra West, Mumbai 400050
    Item: 2 pcs of Gulab Jamun Pink Kurti Set size M
    Please send UPI QR code!
    """

    parsed = ChatParserService.parse_chat_text(sample_chat, db)

    assert parsed["customer_name"] == "Ananya Sharma"
    assert parsed["phone"] == "9820112345"
    assert parsed["pin_code"] == "400050"
    assert "Bandra" in parsed["shipping_address"]
    assert len(parsed["items"]) >= 1
    assert parsed["confidence"] in ["HIGH", "MEDIUM"]

def test_payment_helper_matching(db):
    SeedService.reset_and_seed_database(db, "boutique")
    orders = db.query(Order).all()
    assert len(orders) > 0

    target_order = orders[0]
    target_order.payment_status = "PENDING"
    db.commit()

    # Exact match test
    match_result = PaymentHelperService.match_payment(
        db=db,
        amount=target_order.total_amount,
        reference=target_order.order_number,
        customer_hint=target_order.customer_name
    )

    assert match_result["best_match"] is not None
    assert match_result["best_match"]["order_id"] == target_order.id
    assert match_result["best_match"]["match_status"] == "PAID"

    # Underpaid test
    partial_amount = round(target_order.total_amount - 50.0, 2)
    partial_result = PaymentHelperService.match_payment(
        db=db,
        amount=partial_amount,
        reference=target_order.order_number
    )
    assert partial_result["best_match"] is not None
    assert partial_result["best_match"]["match_status"] == "PLEASE_CHECK"
    assert "Shortfall" in partial_result["best_match"]["plain_message"]

def test_day_end_summary(db):
    SeedService.reset_and_seed_database(db, "boutique")
    summary = AnalyticsService.get_day_end_summary(db)
    
    assert summary.total_orders > 0
    assert summary.total_sales > 0
    assert summary.is_demo_mode is True
    assert len(summary.orders_today) > 0

def test_api_endpoints_integration(client, db):
    # 1. Personas list
    res = client.get("/api/demo/personas")
    assert res.status_code == 200
    data = res.json()
    assert len(data["personas"]) == 4

    # 2. Reset persona
    res_reset = client.post("/api/demo/reset?persona=reseller")
    assert res_reset.status_code == 200
    assert res_reset.json()["persona"] == "reseller"

    # 3. Channels filtered by seller_type
    res_ch = client.get("/api/channels?seller_type=reseller")
    assert res_ch.status_code == 200
    codes = [c["code"] for c in res_ch.json()]
    assert "swiggy" not in codes
    assert "meesho" in codes

    # 4. Day-end summary
    res_summary = client.get("/api/analytics/day-end-summary")
    assert res_summary.status_code == 200
    assert res_summary.json()["total_orders"] > 0

    # 5. Export data
    res_export = client.get("/api/demo/export-data")
    assert res_export.status_code == 200
    export_json = res_export.json()
    assert "products" in export_json
    assert "orders" in export_json

    # 6. Delete data
    res_delete = client.post("/api/demo/delete-data")
    assert res_delete.status_code == 200
    assert db.query(Order).count() == 0
