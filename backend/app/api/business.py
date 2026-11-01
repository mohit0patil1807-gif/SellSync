from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.validation_service import ValidationService
from app.schemas.validation import (
    CustomerInterviewResponse,
    CustomerInterviewCreate,
    CustomerInterviewUpdate,
    ValidationDashboardStats,
    BusinessAssumptionResponse,
    BusinessAssumptionCreate,
    BusinessAssumptionUpdate,
    ValidationExperimentResponse,
    ValidationExperimentCreate,
    ValidationExperimentUpdate,
    BreakEvenCalculationRequest,
    BreakEvenCalculationResponse
)
from typing import List

router = APIRouter(prefix="/business", tags=["Business Strategy & Validation"])

# ----------------- Customer Interviews -----------------
@router.get("/interviews", response_model=List[CustomerInterviewResponse])
def get_interviews(db: Session = Depends(get_db)):
    return ValidationService.get_interviews(db)

@router.post("/interviews", response_model=CustomerInterviewResponse)
def create_interview(interview_in: CustomerInterviewCreate, db: Session = Depends(get_db)):
    try:
        return ValidationService.create_interview(db, interview_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/interviews/{interview_id}", response_model=CustomerInterviewResponse)
def update_interview(interview_id: int, update_in: CustomerInterviewUpdate, db: Session = Depends(get_db)):
    updated = ValidationService.update_interview(db, interview_id, update_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Interview not found")
    return updated

@router.delete("/interviews/{interview_id}")
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    success = ValidationService.delete_interview(db, interview_id)
    if not success:
        raise HTTPException(status_code=404, detail="Interview not found")
    return {"status": "success", "message": f"Interview #{interview_id} deleted"}

@router.get("/validation-stats", response_model=ValidationDashboardStats)
def get_validation_stats(db: Session = Depends(get_db)):
    return ValidationService.get_validation_stats(db)

# ----------------- Business Assumptions -----------------
@router.get("/assumptions", response_model=List[BusinessAssumptionResponse])
def get_assumptions(db: Session = Depends(get_db)):
    return ValidationService.get_assumptions(db)

@router.post("/assumptions", response_model=BusinessAssumptionResponse)
def create_assumption(assumption_in: BusinessAssumptionCreate, db: Session = Depends(get_db)):
    try:
        return ValidationService.create_assumption(db, assumption_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/assumptions/{assumption_id}", response_model=BusinessAssumptionResponse)
def update_assumption(assumption_id: int, update_in: BusinessAssumptionUpdate, db: Session = Depends(get_db)):
    updated = ValidationService.update_assumption(db, assumption_id, update_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Assumption not found")
    return updated

# ----------------- Validation Experiments -----------------
@router.get("/experiments", response_model=List[ValidationExperimentResponse])
def get_experiments(db: Session = Depends(get_db)):
    return ValidationService.get_experiments(db)

@router.post("/experiments", response_model=ValidationExperimentResponse)
def create_experiment(experiment_in: ValidationExperimentCreate, db: Session = Depends(get_db)):
    try:
        return ValidationService.create_experiment(db, experiment_in)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/experiments/{experiment_id}", response_model=ValidationExperimentResponse)
def update_experiment(experiment_id: int, update_in: ValidationExperimentUpdate, db: Session = Depends(get_db)):
    updated = ValidationService.update_experiment(db, experiment_id, update_in)
    if not updated:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return updated

# ----------------- Break-Even Calculator -----------------
@router.post("/break-even", response_model=BreakEvenCalculationResponse)
def calculate_break_even(request: BreakEvenCalculationRequest):
    return ValidationService.calculate_break_even(request)
