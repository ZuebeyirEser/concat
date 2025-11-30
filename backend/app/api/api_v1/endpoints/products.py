import logging
import traceback
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app import crud
from app.api import deps
from app.core.db import get_db
from app.models import User
from app.models.product import (
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
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
    skip: int = 0,
    limit: int = Query(default=100, le=1000),
    category: ProductCategory | None = None,
    search: str | None = None,
) -> Any:
    """
    Get products with optional filtering.
    """
    try:
        if search:
            products = crud.product.search_by_name(db, query=search, limit=limit)
        elif category:
            products = crud.product.get_by_category(
                db, category=category, skip=skip, limit=limit
            )
        else:
            products = crud.product.get_multi(db, skip=skip, limit=limit)

        return products
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=500, detail=f"Error fetching products: {str(e)}"
        )


@router.post("/", response_model=ProductRead)
def create_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
    product_in: ProductCreate,
) -> Any:
    """
    Create new product.
    """
    # Normalize the name for better matching
    product_data = product_in.model_dump()
    product_data["normalized_name"] = product_matcher.normalize_product_name(
        product_in.name
    )

    # Check if product with same normalized name already exists
    existing = crud.product.get_by_normalized_name(
        db, normalized_name=product_data["normalized_name"]
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="A product with this name already exists"
        )

    product = crud.product.create(db, obj_in=product_data)
    return product


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
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
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
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
    if "name" in update_data:
        update_data["normalized_name"] = product_matcher.normalize_product_name(
            update_data["name"]
        )

    product = crud.product.update(db, db_obj=product, obj_in=update_data)
    return product


@router.delete("/{product_id}")
def delete_product(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
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
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
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
        return {"product": matched_product, "confidence": confidence, "matched": True}
    else:
        # Suggest category and potential new product
        predicted_category = product_matcher.predict_category(item_name)
        return {
            "product": None,
            "confidence": 0.0,
            "matched": False,
            "suggested_category": predicted_category.value,
            "normalized_name": product_matcher.normalize_product_name(item_name),
        }


@router.post("/create-from-item/", response_model=ProductRead)
def create_product_from_item(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
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


@router.get("/purchases/")
def get_user_purchases(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_active_user),
    skip: int = 0,
    limit: int = Query(default=100, le=1000),
    include_bill: bool = Query(default=False),
) -> Any:
    """
    Get user's product purchases, optionally with bill information.
    """
    
    logger.info(f"Fetching purchases for user {current_user.id}, include_bill={include_bill}")

    purchases = crud.product_purchase.get_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    
    logger.info(f"Found {len(purchases)} purchases")

    if include_bill:
        # Return with bill information
        result = []
        for purchase in purchases:
            purchase_dict = {
                "id": purchase.id,
                "product_id": purchase.product_id,
                "extracted_data_id": purchase.extracted_data_id,
                "receipt_item_name": purchase.receipt_item_name,
                "quantity": purchase.quantity,
                "unit_price": purchase.unit_price,
                "total_price": purchase.total_price,
                "unit_type": purchase.unit_type,
                "weight_kg": purchase.weight_kg,
                "match_confidence": purchase.match_confidence,
                "is_manual_match": purchase.is_manual_match,
                "purchase_date": purchase.purchase_date,
                "created_at": purchase.created_at,
                "product": purchase.product,
                "extracted_data": None,
            }

            # Load extracted data if available
            if hasattr(purchase, "extracted_data") and purchase.extracted_data:
                ed = purchase.extracted_data
                logger.info(f"Found extracted_data for purchase {purchase.id}: store_name={ed.store_name}")
                
                # Get document filename for fallback
                document_filename = None
                if hasattr(ed, "document") and ed.document:
                    document_filename = ed.document.original_filename
                
                purchase_dict["extracted_data"] = {
                    "id": ed.id,
                    "document_id": ed.document_id,
                    "store_name": ed.store_name,
                    "store_address": ed.store_address,
                    "receipt_number": ed.receipt_number,
                    "transaction_date": str(ed.transaction_date)
                    if ed.transaction_date
                    else None,
                    "transaction_time": ed.transaction_time,
                    "subtotal": float(ed.subtotal) if ed.subtotal else None,
                    "tax_amount": float(ed.tax_amount) if ed.tax_amount else None,
                    "total_amount": float(ed.total_amount) if ed.total_amount else None,
                    "payment_method": ed.payment_method,
                    "document_filename": document_filename,
                    "created_at": ed.created_at,
                    "updated_at": ed.updated_at,
                }
            else:
                logger.warning(f"No extracted_data found for purchase {purchase.id}, extracted_data_id={purchase.extracted_data_id}")

            result.append(purchase_dict)
        return result
    else:
        # Return without bill information
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
    current_user: User = Depends(deps.get_current_active_user),  # noqa: ARG001
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
