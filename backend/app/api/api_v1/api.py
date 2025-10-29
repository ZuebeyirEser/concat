from fastapi import APIRouter

from app.api.api_v1.endpoints import items, login, pdf_processing, products, users, utils
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(pdf_processing.router, prefix="/pdf", tags=["pdf-processing"])
api_router.include_router(products.router, prefix="/products", tags=["products"])

# Include private routes only in local environment
if settings.ENVIRONMENT == "local":
    from app.api.api_v1.endpoints import private

    api_router.include_router(private.router, prefix="/private", tags=["private"])
