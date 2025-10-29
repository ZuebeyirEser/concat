import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app import crud
from app.api import deps
from app.core.db import get_db
from app.models import User
from app.models.product import (
    Product,
    ProductCategory,
    ProductCreate,
    ProductPurchaseRead,
    ProductRead,
    ProductUpdate,
)
from app.services.product_matcher import product_matcher

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=list[ProductRead])
def get_products(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = Query(default=100, le=1000),
    category: ProductCategory | None = None,
    search: str | None = None,
) -> Any:
    """
    Get products with optional filtering.
    """
    if search:
        products = crud.product.search_by_name(db, query=search, limit=limit)
    elif category:
        products = crud.product.get_by_category(
            db, category=category, skip=skip, limit=limit
        )
    else:
        products = crud.product.get_multi(db, skip=skip, limit=limit)
    
    return products


@router.post("/", response_model=ProductRead)
def create_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    product_in: ProductCreate,
) -> Any:
    """
    Create new product.
    """
    # Normalize the name for better matching
    product_data = product_in.model_dump()
    product_data['normalized_name'] = product_matcher.normalize_product_name(product_in.name)
    
    # Check if product with same normalized name already exists
    existing = crud.product.get_by_normalized_name(
        db, normalized_name=product_data['normalized_name']
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A product with this name already exists"
        )
    
    product = crud.product.create(db, obj_in=product_data)
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    product_id: int,
) -> Any:
    """
    Get product by ID.
    """
    product = crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    product_id: int,
    product_in: ProductUpdate,
) -> Any:
    """
    Update product.
    """
    product = crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Update normalized name if name is being changed
    update_data = product_in.model_dump(exclude_unset=True)
    if 'name' in update_data:
        update_data['normalized_name'] = product_matcher.normalize_product_name(
            update_data['name']
        )
    
    product = crud.product.update(db, db_obj=product, obj_in=update_data)
    return product


@router.delete("/{product_id}")
def delete_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    product_id: int,
) -> Any:
    """
    Delete product.
    """
    product = crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    crud.product.remove(db, id=product_id)
    return {"message": "Product deleted successfully"}


@router.get("/categories/", response_model=list[str])
def get_categories() -> Any:
    """
    Get all available product categories.
    """
    return [category.value for category in ProductCategory]


@router.get("/popular/", response_model=list[ProductRead])
def get_popular_products(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    limit: int = Query(default=20, le=100),
) -> Any:
    """
    Get most popular products based on purchase frequency.
    """
    products = crud.product.get_popular_products(
        db, user_id=current_user.id, limit=limit
    )
    return products


@router.post("/match/")
def match_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    item_name: str,
    confidence_threshold: float = Query(default=0.7, ge=0.0, le=1.0),
) -> Any:
    """
    Find matching product for a receipt item name.
    """
    matched_product, confidence = product_matcher.find_best_match(
        db, item_name=item_name, confidence_threshold=confidence_threshold
    )
    
    if matched_product:
        return {
            "product": matched_product,
            "confidence": confidence,
            "matched": True
        }
    else:
        # Suggest category and potential new product
        predicted_category = product_matcher.predict_category(item_name)
        return {
            "product": None,
            "confidence": 0.0,
            "matched": False,
            "suggested_category": predicted_category.value,
            "normalized_name": product_matcher.normalize_product_name(item_name)
        }


@router.post("/create-from-item/", response_model=ProductRead)
def create_product_from_item(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    item_name: str,
    price: float,
    quantity: float = 1.0,
) -> Any:
    """
    Create a new product from a receipt item.
    """
    # Check if product already exists
    normalized_name = product_matcher.normalize_product_name(item_name)
    existing = crud.product.get_by_normalized_name(db, normalized_name=normalized_name)
    
    if existing:
        return existing
    
    # Create new product
    new_product = product_matcher.create_product_from_item(
        db, item_name=item_name, price=price, quantity=quantity
    )
    
    logger.info(f"Created new product from receipt item: {new_product.name}")
    return new_product


@router.get("/purchases/", response_model=list[ProductPurchaseRead])
def get_user_purchases(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = Query(default=100, le=1000),
) -> Any:
    """
    Get user's product purchases.
    """
    purchases = crud.product_purchase.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return purchases


@router.get("/{product_id}/purchases/", response_model=list[ProductPurchaseRead])
def get_product_purchases(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    product_id: int,
) -> Any:
    """
    Get purchase history for a specific product.
    """
    product = crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    purchases = crud.product_purchase.get_by_product(
        db, product_id=product_id, user_id=current_user.id
    )
    return purchases


@router.post("/{product_id}/aliases/")
def create_product_alias(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    product_id: int,
    alias_name: str,
    store_specific: str | None = None,
) -> Any:
    """
    Create an alias for a product to improve matching.
    """
    product = crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    alias = crud.product_alias.create_alias(
        db, product_id=product_id, alias_name=alias_name, store_specific=store_specific
    )
    
    return {"message": "Alias created successfully", "alias": alias}