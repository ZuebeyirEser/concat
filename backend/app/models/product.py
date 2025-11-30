import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .extracted_data import ExtractedData
    from .user import User


class ProductCategory(str, Enum):
    """Product categories for classification"""

    FRUITS = "fruits"
    VEGETABLES = "vegetables"
    DAIRY = "dairy"
    MEAT_FISH = "meat_fish"
    BAKERY = "bakery"
    PANTRY = "pantry"  # pasta, rice, canned goods
    BEVERAGES = "beverages"
    SNACKS = "snacks"
    FROZEN = "frozen"
    HOUSEHOLD = "household"
    PERSONAL_CARE = "personal_care"
    OTHER = "other"


class ProductBase(SQLModel):
    name: str = Field(index=True)
    normalized_name: str = Field(index=True)  # For matching variations
    category: ProductCategory
    brand: str | None = None
    barcode: str | None = Field(default=None, index=True)
    description: str | None = None

    # Nutritional information (per 100g/100ml)
    calories_per_100g: float | None = None
    protein_per_100g: float | None = None
    carbs_per_100g: float | None = None
    fat_per_100g: float | None = None
    fiber_per_100g: float | None = None
    sugar_per_100g: float | None = None
    sodium_per_100g: float | None = None

    # Product details
    typical_unit: str | None = None  # "piece", "kg", "liter", "pack"
    typical_weight_g: float | None = None
    image_url: str | None = None

    # Metadata
    is_organic: bool = Field(default=False)
    is_vegan: bool = Field(default=False)
    is_vegetarian: bool = Field(default=False)
    is_gluten_free: bool = Field(default=False)

    # Data quality
    data_source: str | None = None  # "manual", "api", "scraped"
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class Product(ProductBase, table=True):
    id: int = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    purchases: list["ProductPurchase"] = Relationship(back_populates="product")


class ProductPurchase(SQLModel, table=True):
    """Links extracted receipt items to products"""

    id: int = Field(default=None, primary_key=True)

    # Foreign keys
    product_id: int = Field(foreign_key="product.id", index=True)
    extracted_data_id: int = Field(foreign_key="extracteddata.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)

    # Purchase details from receipt
    receipt_item_name: str  # Original name from receipt
    quantity: float = Field(default=1.0)
    unit_price: float
    total_price: float
    unit_type: str | None = None  # "pieces", "kg", "liter"
    weight_kg: float | None = None

    # Matching confidence
    match_confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    is_manual_match: bool = Field(default=False)

    # Timestamps
    purchase_date: datetime  # From receipt
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    product: Product = Relationship(back_populates="purchases")
    extracted_data: "ExtractedData" = Relationship()
    user: "User" = Relationship()


class ProductAlias(SQLModel, table=True):
    """Alternative names for products to improve matching"""

    id: int = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.id", index=True)
    alias_name: str = Field(index=True)
    normalized_alias: str = Field(index=True)
    store_specific: str | None = None  # "REWE", "EDEKA", etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Pydantic models for API
class ProductCreate(ProductBase):
    pass


class ProductRead(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ProductUpdate(SQLModel):
    name: str | None = None
    category: ProductCategory | None = None
    brand: str | None = None
    barcode: str | None = None
    description: str | None = None
    calories_per_100g: float | None = None
    protein_per_100g: float | None = None
    carbs_per_100g: float | None = None
    fat_per_100g: float | None = None
    image_url: str | None = None
    is_organic: bool | None = None
    is_vegan: bool | None = None
    is_vegetarian: bool | None = None
    is_gluten_free: bool | None = None


class ProductPurchaseRead(SQLModel):
    id: int
    product_id: int
    extracted_data_id: int
    receipt_item_name: str
    quantity: float
    unit_price: float
    total_price: float
    unit_type: str | None
    weight_kg: float | None
    match_confidence: float
    is_manual_match: bool
    purchase_date: datetime
    created_at: datetime
    product: ProductRead


class ExtractedDataSummary(SQLModel):
    """Summary of extracted data for purchase history"""

    id: int
    document_id: int
    store_name: str | None
    store_address: str | None
    receipt_number: str | None
    transaction_date: str | None
    transaction_time: str | None
    subtotal: float | None
    tax_amount: float | None
    total_amount: float | None
    payment_method: str | None
    created_at: datetime
    updated_at: datetime


class ProductPurchaseWithBillRead(SQLModel):
    id: int
    product_id: int
    extracted_data_id: int
    receipt_item_name: str
    quantity: float
    unit_price: float
    total_price: float
    unit_type: str | None
    weight_kg: float | None
    match_confidence: float
    is_manual_match: bool
    purchase_date: datetime
    created_at: datetime
    product: ProductRead
    extracted_data: ExtractedDataSummary | None = None
