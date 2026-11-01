from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from datetime import datetime
from app.db.session import Base

class CustomerInterview(Base):
    __tablename__ = "customer_interviews"

    id = Column(Integer, primary_key=True, index=True)
    seller_name = Column(String(150), nullable=False) # e.g. "Ananya Boutique", "SpiceKart Studio"
    seller_type = Column(String(100), nullable=False) # "Instagram Boutique", "Home Baker / Food", "Reseller", "Apparel Brand"
    sales_channels = Column(String(255), nullable=False) # e.g. "Instagram, WhatsApp, Meesho"
    approx_order_volume = Column(String(100), nullable=False) # e.g. "10-25 orders/week"
    current_process = Column(Text, nullable=False)
    most_time_consuming_task = Column(String(150), nullable=False)
    current_tools = Column(String(200), nullable=False) # e.g. "WhatsApp Business, Excel, Pen & Paper"
    operational_mistakes = Column(Text, nullable=True)
    most_requested_feature = Column(String(150), nullable=False)
    willingness_to_pilot = Column(Boolean, default=True)
    pricing_feedback = Column(String(200), nullable=True) # e.g. "Willing to pay ₹299/mo if it auto-verifies payments"
    follow_up_notes = Column(Text, nullable=True)
    interview_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class BusinessAssumption(Base):
    __tablename__ = "business_assumptions"

    id = Column(Integer, primary_key=True, index=True)
    assumption_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "ASM-01"
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False) # "Problem", "Solution", "Willingness to Pay", "Feasibility", "Channel"
    evidence_available = Column(Text, nullable=False)
    confidence_level = Column(String(20), default="Medium") # "Low", "Medium", "High"
    validation_method = Column(String(150), nullable=False) # e.g. "Semi-structured Seller Interviews"
    status = Column(String(30), default="Untested") # "Untested", "Testing", "Supported", "Rejected"
    next_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ValidationExperiment(Base):
    __tablename__ = "validation_experiments"

    id = Column(Integer, primary_key=True, index=True)
    experiment_code = Column(String(50), unique=True, index=True, nullable=False) # e.g. "EXP-01"
    hypothesis = Column(Text, nullable=False)
    target_segment = Column(String(100), nullable=False) # e.g. "Social Commerce Sellers"
    experiment_description = Column(Text, nullable=False)
    success_metric = Column(String(150), nullable=False) # e.g. "60% task completion time reduction"
    target_threshold = Column(String(100), nullable=False) # e.g. ">= 5 out of 8 sellers prefer SellSync"
    actual_result = Column(Text, nullable=True)
    decision = Column(String(50), default="Pending") # "Pending", "Validated", "Invalidated", "Iterate"
    next_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
