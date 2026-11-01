from fastapi import APIRouter
from app.api.orders import router as orders_router
from app.api.products import router as products_router
from app.api.payments import router as payments_router
from app.api.fulfilment import router as fulfilment_router
from app.api.channels import router as channels_router
from app.api.automations import router as automations_router
from app.api.alerts import router as alerts_router
from app.api.analytics import router as analytics_router
from app.api.demo import router as demo_router
from app.api.business import router as business_router

api_router = APIRouter(prefix="/api")

api_router.include_router(orders_router)
api_router.include_router(products_router)
api_router.include_router(payments_router)
api_router.include_router(fulfilment_router)
api_router.include_router(channels_router)
api_router.include_router(automations_router)
api_router.include_router(alerts_router)
api_router.include_router(analytics_router)
api_router.include_router(demo_router)
api_router.include_router(business_router)
