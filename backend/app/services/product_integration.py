import logging
import traceback
import uuid
from datetime import datetime
from typing import Any

from sqlmodel import Session

from app import crud
from app.models.extracted_data import ExtractedData
from app.models.product import ProductPurchase
from app.services.product_matcher import product_matcher

logger = logging.getLogger(__name__)


class ProductIntegrationService:
    """Service to integrate product matching with PDF processing."""

    def process_receipt_items(
        self,
        db: Session,
        extracted_data: ExtractedData,
        user_id: uuid.UUID,
        auto_create_products: bool = True,
    ) -> dict[str, Any]:
        """
        Process receipt items and match/create products.

        Args:
            db: Database session
            extracted_data: Extracted receipt data
            user_id: User ID
            auto_create_products: Whether to auto-create missing products

        Returns:
            Dictionary with processing results
        """
        matched_items: list[dict[str, Any]] = []
        unmatched_items: list[dict[str, Any]] = []
        created_products: list[Any] = []
        created_purchases: list[ProductPurchase] = []

        results: dict[str, Any] = {
            "matched_items": matched_items,
            "unmatched_items": unmatched_items,
            "created_products": created_products,
            "created_purchases": created_purchases,
            "total_items": 0,
            "match_rate": 0.0,
        }

        if not extracted_data.items or not isinstance(extracted_data.items, list):
            logger.info(f"No items found in extracted data {extracted_data.id}")
            return results

        results["total_items"] = len(extracted_data.items)

        for item in extracted_data.items:
            try:
                logger.info(
                    f"Processing item: {item.get('name', 'unknown')} - Price: {item.get('price', 0.0)} - Quantity: {item.get('quantity', 1.0)}"
                )
                item_result = self._process_single_item(
                    db, item, extracted_data, user_id, auto_create_products
                )

                if item_result["matched"]:
                    matched_items.append(item_result)
                    if item_result.get("purchase"):
                        created_purchases.append(item_result["purchase"])
                else:
                    unmatched_items.append(item_result)

                if item_result.get("created_product"):
                    created_products.append(item_result["created_product"])

            except Exception as e:
                logger.error(
                    f"Error processing item {item.get('name', 'unknown')}: {e}"
                )
                logger.error(f"Item processing traceback: {traceback.format_exc()}")
                unmatched_items.append(
                    {"item": item, "error": str(e), "matched": False}
                )
        # Calculate match rate
        if results["total_items"] > 0:
            results["match_rate"] = len(matched_items) / results["total_items"]

        logger.info(
            f"Processed {results['total_items']} items for user {user_id}. "
            f"Match rate: {results['match_rate']:.2%}"
        )

        return results

    def _process_single_item(
        self,
        db: Session,
        item: dict[str, Any],
        extracted_data: ExtractedData,
        user_id: uuid.UUID,
        auto_create_products: bool,
    ) -> dict[str, Any]:
        """Process a single receipt item."""

        item_name = item.get("name", "")
        price = item.get("price", 0.0)
        quantity = item.get("quantity", 1.0)

        if not item_name:
            return {"item": item, "matched": False, "error": "Missing item name"}

        # Try to find matching product
        logger.info(f"Looking for existing product match for: {item_name}")
        matched_product, confidence = product_matcher.find_best_match(
            db,
            item_name=item_name,
            confidence_threshold=0.8,  # Higher threshold to create more new products
        )
        logger.info(
            f"Match result: product={matched_product.name if matched_product else None}, confidence={confidence}"
        )

        result: dict[str, Any] = {
            "item": item,
            "item_name": item_name,
            "confidence": confidence,
            "matched": matched_product is not None,
        }

        if matched_product:
            # Create purchase record
            try:
                purchase = self._create_purchase_record(
                    db, matched_product.id, item, extracted_data, user_id
                )
                result.update({"product": matched_product, "purchase": purchase})
            except Exception as e:
                logger.error(f"Failed to create purchase record for {item_name}: {e}")
                logger.error(f"Purchase creation traceback: {traceback.format_exc()}")
                db.rollback()
                result["error"] = f"Failed to create purchase record: {str(e)}"

        elif auto_create_products:
            # Create new product and purchase record
            logger.info(f"Attempting to create new product for item: {item_name}")
            try:
                new_product = product_matcher.create_product_from_item(
                    db, item_name=item_name, price=price, quantity=quantity
                )
                logger.info(
                    f"Successfully created product: {new_product.name} (ID: {new_product.id})"
                )

                purchase = self._create_purchase_record(
                    db, new_product.id, item, extracted_data, user_id
                )

                result.update(
                    {
                        "product": new_product,
                        "purchase": purchase,
                        "created_product": new_product,
                        "matched": True,
                        "confidence": 0.6,  # Medium confidence for auto-created
                    }
                )

                logger.info(f"Auto-created product: {new_product.name}")

            except Exception as e:
                logger.error(f"Failed to create product for {item_name}: {e}")
                logger.error(f"Product creation traceback: {traceback.format_exc()}")
                # Rollback the transaction to prevent it from being aborted
                db.rollback()
                result["error"] = f"Failed to create product: {str(e)}"

        return result

    def _create_purchase_record(
        self,
        db: Session,
        product_id: int,
        item: dict[str, Any],
        extracted_data: ExtractedData,
        user_id: uuid.UUID,
    ) -> ProductPurchase:
        """Create a purchase record linking the product to the receipt."""

        purchase_data = {
            "product_id": product_id,
            "extracted_data_id": extracted_data.id,
            "user_id": user_id,
            "receipt_item_name": item.get("name", ""),
            "quantity": item.get("quantity", 1.0),
            "unit_price": item.get("price", 0.0) / max(item.get("quantity", 1.0), 1.0),
            "total_price": item.get("price", 0.0),
            "unit_type": item.get("unit_type", "pieces"),
            "weight_kg": item.get("weight_kg"),
            "match_confidence": 0.8,  # Default confidence for matched items
            "is_manual_match": False,
            "purchase_date": extracted_data.created_at
            if extracted_data.created_at
            else datetime.utcnow(),
        }

        purchase = crud.product_purchase.create_purchase(
            db, purchase_data=purchase_data
        )

        return purchase

    def get_user_product_insights(
        self, db: Session, user_id: uuid.UUID
    ) -> dict[str, Any]:
        """Get insights about user's product purchases."""

        purchases = crud.product_purchase.get_by_user(db, user_id=user_id, limit=1000)

        if not purchases:
            return {
                "total_purchases": 0,
                "total_spent": 0.0,
                "top_categories": [],
                "frequent_products": [],
                "recent_purchases": [],
            }

        # Calculate insights
        total_spent = sum(p.total_price for p in purchases)

        # Category analysis
        category_spending: dict[str, float] = {}
        for purchase in purchases:
            if hasattr(purchase, "product") and purchase.product:
                category = purchase.product.category.value
                category_spending[category] = (
                    category_spending.get(category, 0) + purchase.total_price
                )

        top_categories = sorted(
            category_spending.items(), key=lambda x: x[1], reverse=True
        )[:5]

        # Product frequency
        product_counts: dict[int, int] = {}
        for purchase in purchases:
            product_counts[purchase.product_id] = (
                product_counts.get(purchase.product_id, 0) + 1
            )

        frequent_product_ids = sorted(
            product_counts.items(), key=lambda x: x[1], reverse=True
        )[:10]

        frequent_products: list[dict[str, Any]] = []
        for product_id, count in frequent_product_ids:
            product = crud.product.get(db, id=product_id)
            if product:
                frequent_products.append({"product": product, "purchase_count": count})

        return {
            "total_purchases": len(purchases),
            "total_spent": total_spent,
            "top_categories": [
                {"category": cat, "spent": amount} for cat, amount in top_categories
            ],
            "frequent_products": frequent_products,
            "recent_purchases": purchases[:10],  # Last 10 purchases
        }


# Global instance
product_integration = ProductIntegrationService()
