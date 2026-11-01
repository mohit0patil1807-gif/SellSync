from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# ----------------- Customer Interview Schemas -----------------
class CustomerInterviewBase(BaseModel):
    seller_name: str
    seller_type: str
    sales_channels: str
    approx_order_volume: str
    current_process: str
    most_time_consuming_task: str
    current_tools: str
    operational_mistakes: Optional[str] = None
    most_requested_feature: str
    willingness_to_pilot: bool = True
    pricing_feedback: Optional[str] = None
    follow_up_notes: Optional[str] = None

class CustomerInterviewCreate(CustomerInterviewBase):
    pass

class CustomerInterviewUpdate(BaseModel):
    seller_name: Optional[str] = None
    seller_type: Optional[str] = None
    sales_channels: Optional[str] = None
    approx_order_volume: Optional[str] = None
    current_process: Optional[str] = None
    most_time_consuming_task: Optional[str] = None
    current_tools: Optional[str] = None
    operational_mistakes: Optional[str] = None
    most_requested_feature: Optional[str] = None
    willingness_to_pilot: Optional[bool] = None
    pricing_feedback: Optional[str] = None
    follow_up_notes: Optional[str] = None

class CustomerInterviewResponse(CustomerInterviewBase):
    id: int
    interview_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class SegmentStat(BaseModel):
    segment: str
    count: int

class ProblemStat(BaseModel):
    problem: str
    count: int

class FeatureStat(BaseModel):
    feature: str
    count: int

class ValidationDashboardStats(BaseModel):
    total_interviews: int
    segments_represented: List[SegmentStat]
    frequent_problems: List[ProblemStat]
    requested_features: List[FeatureStat]
    pilot_interested_count: int
    pilot_percentage: float
    pricing_summaries: List[str]

# ----------------- Business Assumption Schemas -----------------
class BusinessAssumptionBase(BaseModel):
    assumption_code: str
    description: str
    category: str
    evidence_available: str
    confidence_level: str
    validation_method: str
    status: str
    next_action: Optional[str] = None

class BusinessAssumptionCreate(BusinessAssumptionBase):
    pass

class BusinessAssumptionUpdate(BaseModel):
    description: Optional[str] = None
    category: Optional[str] = None
    evidence_available: Optional[str] = None
    confidence_level: Optional[str] = None
    validation_method: Optional[str] = None
    status: Optional[str] = None
    next_action: Optional[str] = None

class BusinessAssumptionResponse(BusinessAssumptionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Validation Experiment Schemas -----------------
class ValidationExperimentBase(BaseModel):
    experiment_code: str
    hypothesis: str
    target_segment: str
    experiment_description: str
    success_metric: str
    target_threshold: str
    actual_result: Optional[str] = None
    decision: str = "Pending"
    next_action: Optional[str] = None

class ValidationExperimentCreate(ValidationExperimentBase):
    pass

class ValidationExperimentUpdate(BaseModel):
    hypothesis: Optional[str] = None
    target_segment: Optional[str] = None
    experiment_description: Optional[str] = None
    success_metric: Optional[str] = None
    target_threshold: Optional[str] = None
    actual_result: Optional[str] = None
    decision: Optional[str] = None
    next_action: Optional[str] = None

class ValidationExperimentResponse(ValidationExperimentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- Break-Even Calculator Schemas -----------------
class BreakEvenCalculationRequest(BaseModel):
    avg_monthly_rev_per_seller: float = 499.0
    variable_cost_per_seller: float = 99.0
    monthly_fixed_operating_costs: float = 20000.0
    selected_customers_count: int = 50

class BreakEvenCalculationResponse(BaseModel):
    monthly_rev_per_seller: float
    variable_cost_per_seller: float
    contribution_per_seller: float
    contribution_margin_percentage: float
    fixed_costs: float
    break_even_customers: int
    revenue_at_selected_count: float
    variable_cost_at_selected_count: float
    total_cost_at_selected_count: float
    operating_surplus_deficit: float
    status: str
    is_illustrative_assumption: bool = True
