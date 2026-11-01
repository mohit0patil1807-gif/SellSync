from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.analytics_service import AnalyticsService
from app.schemas.analytics import DashboardOverviewResponse, DayEndSummaryResponse
from typing import Optional

router = APIRouter(prefix="/analytics", tags=["Analytics & BI"])

@router.get("/dashboard", response_model=DashboardOverviewResponse)
def get_dashboard(
    days: int = Query(30, ge=1, le=365),
    channel: Optional[str] = Query("all"),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_dashboard_overview(db, days=days, channel_code=channel)

@router.get("/day-end-summary", response_model=DayEndSummaryResponse)
def get_day_end_summary(db: Session = Depends(get_db)):
    """
    Day-End Close Summary for micro-sellers.
    Aggregates today's money collected vs pending, packing/shipping tasks, low stock,
    and returns a downloadable order log.
    """
    return AnalyticsService.get_day_end_summary(db)

