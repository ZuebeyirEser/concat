import uuid

from sqlalchemy import text
from sqlmodel import Session, col, select

from app.crud.base import CRUDBase
from app.models.product import (
    Product,
    ProductAlias,
    ProductCategory,
    ProductCreate,
    ProductPurchase,
    ProductUpdate,
)


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    def get_by_name(self, db: Session, *, name: str) -> Product | None:
        """Get product by exact name match."""
        statement = select(Product).where(Product.name == name)
        return db.exec(statement).first()

    def get_by_normalized_name(
        self, db: Session, *, normalized_name: str
    ) -> Product | None:
        """Get product by normalized name for fuzzy matching."""
        statement = select(Product).where(Product.normalized_name == normalized_name)
        return db.exec(statement).first()

    def get_by_barcode(self, db: Session, *, barcode: str) -> Product | None:
        """Get product by barcode."""
        statement = select(Product).where(Product.barcode == barcode)
        return db.exec(statement).first()

    def search_by_name(
        self, db: Session, *, query: str, limit: int = 10
    ) -> list[Product]:
        """Search products by name with fuzzy matching."""
        # Use ILIKE for case-insensitive partial matching
        statement = (
            select(Product)
            .where(
                col(Product.name).ilike(f"%{query}%")
                | col(Product.normalized_name).ilike(f"%{query}%")
            )
            .limit(limit)
        )
        return list(db.exec(statement).all())

    def get_by_category(
        self, db: Session, *, category: ProductCategory, skip: int = 0, limit: int = 100
    ) -> list[Product]:
        """Get products by category."""
        statement = (
            select(Product)
            .where(Product.category == category)
            .offset(skip)
            .limit(limit)
            .order_by(Product.name)
        )
        return list(db.exec(statement).all())

    def get_popular_products(
        self, db: Session, *, user_id: uuid.UUID | None = None, limit: int = 20
    ) -> list[Product]:
        """Get most frequently purchased products."""
        statement = select(Product).join(ProductPurchase)

        if user_id:
            statement = statement.where(ProductPurchase.user_id == user_id)

        statement = (
            statement.group_by(Product.id)
            .order_by(text("COUNT(productpurchase.id) DESC"))
            .limit(limit)
        )
        return list(db.exec(statement).all())

    def find_similar_products(
        self, db: Session, *, product_name: str, category: ProductCategory | None = None
    ) -> list[Product]:
        """Find products with similar names for matching suggestions."""
        # Simple similarity search - can be enhanced with more sophisticated algorithms
        words = product_name.lower().split()
        conditions = []

        for word in words:
            if len(word) > 2:  # Skip very short words
                conditions.append(col(Product.normalized_name).ilike(f"%{word}%"))

        if not conditions:
            return []

        statement = select(Product)

        # Combine conditions with OR
        if len(conditions) == 1:
            statement = statement.where(conditions[0])
        else:
            statement = statement.where(conditions[0])
            for condition in conditions[1:]:
                statement = statement.where(condition)

        if category:
            statement = statement.where(Product.category == category)

        statement = statement.limit(10)
        return list(db.exec(statement).all())


class CRUDProductPurchase(CRUDBase[ProductPurchase, dict, dict]):
    def get_by_user(
        self, db: Session, *, user_id: uuid.UUID, skip: int = 0, limit: int = 100
    ) -> list[ProductPurchase]:
        """Get user's product purchases."""
        from sqlalchemy.orm import selectinload

        statement = (
            select(ProductPurchase)
            .where(ProductPurchase.user_id == user_id)
            .options(selectinload(ProductPurchase.extracted_data))
            .offset(skip)
            .limit(limit)
            .order_by(ProductPurchase.purchase_date.desc())
        )
        return list(db.exec(statement).all())

    def get_by_product(
        self, db: Session, *, product_id: int, user_id: uuid.UUID | None = None
    ) -> list[ProductPurchase]:
        """Get purchases for a specific product."""
        statement = select(ProductPurchase).where(
            ProductPurchase.product_id == product_id
        )

        if user_id:
            statement = statement.where(ProductPurchase.user_id == user_id)

        statement = statement.order_by(ProductPurchase.purchase_date.desc())
        return list(db.exec(statement).all())

    def get_unmatched_items(
        self, db: Session, *, user_id: uuid.UUID, limit: int = 50
    ) -> list[dict]:
        """Get receipt items that haven't been matched to products yet."""
        # This would need to be implemented based on your ExtractedData structure
        # For now, return empty list
        return []

    def create_purchase(self, db: Session, *, purchase_data: dict) -> ProductPurchase:
        """Create a new product purchase record."""
        purchase = ProductPurchase(**purchase_data)
        db.add(purchase)
        db.commit()
        db.refresh(purchase)
        return purchase


class CRUDProductAlias(CRUDBase[ProductAlias, dict, dict]):
    def get_by_product(self, db: Session, *, product_id: int) -> list[ProductAlias]:
        """Get all aliases for a product."""
        statement = select(ProductAlias).where(ProductAlias.product_id == product_id)
        return list(db.exec(statement).all())

    def find_product_by_alias(self, db: Session, *, alias_name: str) -> Product | None:
        """Find product by alias name."""
        statement = (
            select(Product)
            .join(ProductAlias)
            .where(ProductAlias.normalized_alias.ilike(f"%{alias_name}%"))
        )
        return db.exec(statement).first()

    def create_alias(
        self,
        db: Session,
        *,
        product_id: int,
        alias_name: str,
        store_specific: str | None = None,
    ) -> ProductAlias:
        """Create a new product alias."""
        normalized_alias = alias_name.lower().strip()
        alias = ProductAlias(
            product_id=product_id,
            alias_name=alias_name,
            normalized_alias=normalized_alias,
            store_specific=store_specific,
        )
        db.add(alias)
        db.commit()
        db.refresh(alias)
        return alias


# Create instances
product = CRUDProduct(Product)
product_purchase = CRUDProductPurchase(ProductPurchase)
product_alias = CRUDProductAlias(ProductAlias)
