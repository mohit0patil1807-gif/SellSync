import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import Base, get_db
from app.services.seed_service import SeedService

# In-memory SQLite with StaticPool so TestClient threads share the exact same DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    SeedService.reset_and_seed_database(db, "boutique")
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

def test_persona_switching_and_channel_rules(client):
    # Switch to baker
    res = client.post("/api/demo/reset?persona=baker")
    assert res.status_code == 200
    data = res.json()
    assert data["persona"] == "baker"

    # Check channels for baker
    ch_res = client.get("/api/channels")
    assert ch_res.status_code == 200
    channels = ch_res.json()
    codes = [c["code"] for c in channels]
    assert "swiggy" in codes
    assert "zomato" in codes
    assert "meesho" not in codes
    assert "myntra" not in codes

    # Switch to boutique
    res_boutique = client.post("/api/demo/reset?persona=boutique")
    assert res_boutique.status_code == 200
    ch_boutique = client.get("/api/channels").json()
    b_codes = [c["code"] for c in ch_boutique]
    assert "meesho" in b_codes
    assert "swiggy" not in b_codes
    assert "zomato" not in b_codes

def test_chat_parser_flow(client):
    chat = """Hi didi, please send 2 linen shirts to Ananya Roy, 42 Park Street, Flat 3B, Kolkata 700016. Phone 9830112345. Will pay via GPay."""
    res = client.post("/api/orders/parse-chat", json={"chat_text": chat})
    assert res.status_code == 200
    data = res.json()
    assert data["customer_name"] == "Ananya Roy"
    assert data["delivery_pincode"] == "700016"
    assert data["pincode_valid"] is True
    assert "98301" in data["customer_phone"]
    assert data["phone"] == "9830112345"
    assert data["phone_valid"] is True

def test_payment_match_helper_flow(client):
    res = client.post("/api/payments/match-helper", json={
        "amount": 2499.0,
        "reference": "UPI/40289123841",
        "customer_hint": "Pooja"
    })
    assert res.status_code == 200
    data = res.json()
    assert "candidates" in data
    assert "disclaimer" in data

def test_day_end_summary_endpoint(client):
    res = client.get("/api/analytics/day-end-summary")
    assert res.status_code == 200
    data = res.json()
    assert "summary_date" in data
    assert "total_orders" in data
    assert "orders_today" in data
    assert data["is_demo_mode"] is True

def test_data_export_and_clean_delete(client):
    export_res = client.get("/api/demo/export-data")
    assert export_res.status_code == 200
    exp = export_res.json()
    assert "products" in exp
    assert "orders" in exp
    assert "channels" in exp

    # Delete data (clean slate)
    del_res = client.post("/api/demo/delete-data")
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "success"

    # Verify orders are 0
    orders_res = client.get("/api/orders")
    assert orders_res.status_code == 200
    assert orders_res.json()["total"] == 0
