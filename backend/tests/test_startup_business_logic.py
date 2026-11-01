import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
from app.models.validation import CustomerInterview, BusinessAssumption, ValidationExperiment
from app.services.validation_service import ValidationService
from app.schemas.validation import (
    BreakEvenCalculationRequest,
    CustomerInterviewCreate,
    CustomerInterviewUpdate,
    BusinessAssumptionUpdate,
    ValidationExperimentUpdate
)

TEST_DB_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_break_even_calculator_standard():
    req = BreakEvenCalculationRequest(
        avg_monthly_rev_per_seller=499.0,
        variable_cost_per_seller=99.0,
        monthly_fixed_operating_costs=20000.0,
        selected_customers_count=50
    )
    res = ValidationService.calculate_break_even(req)
    
    assert res.contribution_per_seller == 400.0
    # 20,000 / 400 = 50 customers to break even
    assert res.break_even_customers == 50
    # At 50 customers: rev = 50 * 499 = 24,950; cost = 20,000 + (50 * 99 = 4,950) = 24,950
    assert res.revenue_at_selected_count == 24950.0
    assert res.operating_surplus_deficit == 0.0
    assert res.status == "BREAK_EVEN"

def test_break_even_calculator_surplus_and_deficit():
    # 1. Test Surplus at 100 customers
    req_surplus = BreakEvenCalculationRequest(
        avg_monthly_rev_per_seller=499.0,
        variable_cost_per_seller=99.0,
        monthly_fixed_operating_costs=20000.0,
        selected_customers_count=100
    )
    res_surplus = ValidationService.calculate_break_even(req_surplus)
    assert res_surplus.status == "SURPLUS"
    assert res_surplus.operating_surplus_deficit == 20000.0 # 50 extra * 400 contribution

    # 2. Test Deficit at 25 customers
    req_deficit = BreakEvenCalculationRequest(
        avg_monthly_rev_per_seller=499.0,
        variable_cost_per_seller=99.0,
        monthly_fixed_operating_costs=20000.0,
        selected_customers_count=25
    )
    res_deficit = ValidationService.calculate_break_even(req_deficit)
    assert res_deficit.status == "DEFICIT"
    assert res_deficit.operating_surplus_deficit == -10000.0

def test_break_even_calculator_zero_division_safety():
    # When rev <= variable cost, contribution <= 0
    req_unprofitable = BreakEvenCalculationRequest(
        avg_monthly_rev_per_seller=50.0,
        variable_cost_per_seller=100.0,
        monthly_fixed_operating_costs=20000.0,
        selected_customers_count=10
    )
    res = ValidationService.calculate_break_even(req_unprofitable)
    assert res.contribution_per_seller == 0.0 or res.contribution_per_seller < 0.0
    assert res.break_even_customers == 0 # Cannot break even
    assert res.status == "DEFICIT"

def test_customer_validation_empty_state_and_dynamic_stats(db):
    # 1. Initial empty state: no fabricated data
    stats_empty = ValidationService.get_validation_stats(db)
    assert stats_empty.total_interviews == 0
    assert len(stats_empty.segments_represented) == 0
    assert len(stats_empty.frequent_problems) == 0
    assert stats_empty.pilot_interested_count == 0

    # 2. Add Interview 1
    it1 = CustomerInterviewCreate(
        seller_name="Ananya Silks",
        seller_type="Instagram Boutique",
        sales_channels="Instagram, WhatsApp",
        approx_order_volume="15-20 orders/week",
        current_process="Takes screenshots of UPI in DMs and writes down addresses in a physical diary",
        most_time_consuming_task="Manual payment verification in WhatsApp DMs",
        current_tools="WhatsApp Web, Google Sheets",
        operational_mistakes="Oversold a saree because WhatsApp order wasn't deducted immediately",
        most_requested_feature="Unified order inbox with instant UPI payment verification",
        willingness_to_pilot=True,
        pricing_feedback="Willing to pay ₹299-499/month if it prevents overselling",
        follow_up_notes="Re-contact next week for live prototype walkthrough"
    )
    ValidationService.create_interview(db, it1)

    # 3. Add Interview 2
    it2 = CustomerInterviewCreate(
        seller_name="Brownie Box Studio",
        seller_type="Home Baker / Food",
        sales_channels="Swiggy, Instagram, WhatsApp",
        approx_order_volume="25 orders/day on weekends",
        current_process="Swiggy tablet on kitchen counter, Instagram orders on personal phone",
        most_time_consuming_task="Rider coordination & address copy-pasting",
        current_tools="Swiggy Partner app, WhatsApp",
        operational_mistakes="Delayed preparing order because phone was on silent",
        most_requested_feature="Kitchen preparation display with sound alerts",
        willingness_to_pilot=True,
        pricing_feedback="Would pay ₹799/month if it handles Swiggy + WhatsApp orders together",
        follow_up_notes="Interested in food handover PIN flow"
    )
    ValidationService.create_interview(db, it2)

    # 4. Check dynamic validation stats
    stats = ValidationService.get_validation_stats(db)
    assert stats.total_interviews == 2
    assert len(stats.segments_represented) == 2
    assert stats.pilot_interested_count == 2
    assert stats.pilot_percentage == 100.0
    assert len(stats.pricing_summaries) == 2

def test_business_assumptions_register(db):
    # Seed default assumptions
    assumptions = ValidationService.get_assumptions(db)
    assert len(assumptions) >= 5
    
    asm1 = assumptions[0]
    assert asm1.assumption_code == "ASM-01"
    assert asm1.status in ["Untested", "Testing"]


    # Update assumption status to "Supported"
    updated = ValidationService.update_assumption(
        db,
        asm1.id,
        BusinessAssumptionUpdate(status="Supported", next_action="Incorporate finding into BMC Channels block")
    )
    assert updated.status == "Supported"
    assert "finding into BMC" in updated.next_action

def test_validation_experiments_planner(db):
    # Seed default experiments
    exps = ValidationService.get_experiments(db)
    assert len(exps) >= 2
    
    exp1 = exps[0]
    assert exp1.experiment_code == "EXP-01"
    assert exp1.decision == "Pending"

    # Update experiment with actual findings
    updated_exp = ValidationService.update_experiment(
        db,
        exp1.id,
        ValidationExperimentUpdate(
            actual_result="7 out of 8 sellers processed test batch in under 4 minutes vs 11 minutes manual baseline",
            decision="Validated",
            next_action="Prepare pilot onboarding documentation for these 7 sellers"
        )
    )
    assert updated_exp.decision == "Validated"
    assert "7 out of 8" in updated_exp.actual_result
