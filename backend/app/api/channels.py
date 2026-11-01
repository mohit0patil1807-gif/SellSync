from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.session import get_db
from app.models.channel import Channel
from app.schemas.channel import ChannelResponse, ChannelToggleDemoRequest
from app.config.personas import get_allowed_channel_codes
from typing import List, Optional

router = APIRouter(prefix="/channels", tags=["Channels & Integrations"])

@router.get("", response_model=List[ChannelResponse])
def get_channels(
    seller_type: Optional[str] = None,
    show_all: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(Channel).order_by(Channel.id.asc())
    channels = query.all()
    if seller_type:
        allowed = get_allowed_channel_codes(seller_type, show_all=show_all)
        channels = [c for c in channels if c.code in allowed]
    return [ChannelResponse.from_orm(c) for c in channels]

@router.get("/{channel_code}", response_model=ChannelResponse)
def get_channel(channel_code: str, db: Session = Depends(get_db)):
    channel = db.query(Channel).filter(Channel.code == channel_code).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return ChannelResponse.from_orm(channel)

@router.post("/{channel_code}/toggle", response_model=ChannelResponse)
def toggle_channel_status(channel_code: str, request: ChannelToggleDemoRequest, db: Session = Depends(get_db)):
    channel = db.query(Channel).filter(Channel.code == channel_code).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    channel.status = request.status
    channel.last_sync_at = datetime.utcnow()
    db.commit()
    db.refresh(channel)
    return ChannelResponse.from_orm(channel)

@router.post("/{channel_code}/retry-sync", response_model=ChannelResponse)
def retry_channel_sync(channel_code: str, db: Session = Depends(get_db)):
    channel = db.query(Channel).filter(Channel.code == channel_code).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    
    # Simulate sync resolution
    channel.status = "DEMO_MODE"
    channel.error_details = None
    channel.last_sync_at = datetime.utcnow()
    db.commit()
    db.refresh(channel)
    return ChannelResponse.from_orm(channel)
