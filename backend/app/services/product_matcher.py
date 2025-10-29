import re
from difflib import SequenceMatcher
from typing import Optional, Tuple

from sqlmodel import Session

from app.crud.crud_product import product, product_alias
from app.models.product import Product, ProductCategory


class ProductMatcher:
    """Service for matching receipt items to products in the database."""
    
    def __init__(self):
        # Common German product name patterns and their categories
        self.category_patterns = {
            ProductCategory.FRUITS: [
                r'\b(apfel|äpfel|banane|orange|birne|traube|erdbeere|kirsche|pfirsich|pflaume)\b',
                r'\b(avocado|mango|ananas|kiwi|melone|beere|himbeere|blaubeere)\b'
            ],
            ProductCategory.VEGETABLES: [
                r'\b(tomate|gurke|karotte|möhre|zwiebel|kartoffel|paprika|salat)\b',
                r'\b(brokkoli|blumenkohl|spinat|zucchini|aubergine|radieschen)\b'
            ],
            ProductCategory.DAIRY: [
                r'\b(milch|käse|joghurt|quark|butter|sahne|frischkäse)\b',
                r'\b(mozzarella|gouda|camembert|feta|ricotta)\b'
            ],
            ProductCategory.MEAT_FISH: [
                r'\b(fleisch|wurst|schinken|salami|hähnchen|rind|schwein|lamm)\b',
                r'\b(fisch|lachs|thunfisch|forelle|garnele|muschel)\b'
            ],
            ProductCategory.BAKERY: [
                r'\b(brot|brötchen|croissant|kuchen|torte|keks|zwieback)\b',
                r'\b(vollkorn|weizen|roggen|dinkel|semmel)\b'
            ],
            ProductCategory.PANTRY: [
                r'\b(pasta|nudel|reis|mehl|zucker|salz|öl|essig|gewürz)\b',
                r'\b(dose|konserve|sauce|ketchup|senf|marmelade|honig)\b'
            ],
            ProductCategory.BEVERAGES: [
                r'\b(wasser|saft|limonade|cola|bier|wein|kaffee|tee)\b',
                r'\b(mineralwasser|apfelsaft|orangensaft|sprite|fanta)\b'
            ],
            ProductCategory.SNACKS: [
                r'\b(chips|schokolade|bonbon|gummibär|nuss|mandel)\b',
                r'\b(keks|cracker|popcorn|pretzel|riegel)\b'
            ],
            ProductCategory.HOUSEHOLD: [
                r'\b(reiniger|waschmittel|spülmittel|toilettenpapier|küchentuch)\b',
                r'\b(seife|shampoo|zahnpasta|deo|creme)\b'
            ]
        }
        
        # Common German measurement units
        self.unit_patterns = {
            'kg': r'(\d+[,.]?\d*)\s*kg',
            'g': r'(\d+[,.]?\d*)\s*g(?!r)',  # g but not gr
            'l': r'(\d+[,.]?\d*)\s*l(?!i)',  # l but not li
            'ml': r'(\d+[,.]?\d*)\s*ml',
            'stück': r'(\d+)\s*st[üu]?ck?',
            'pack': r'(\d+)\s*pack',
        }

    def normalize_product_name(self, name: str) -> str:
        """Normalize product name for better matching."""
        # Convert to lowercase
        normalized = name.lower().strip()
        
        # Remove common German articles and prepositions
        articles = ['der', 'die', 'das', 'ein', 'eine', 'einen', 'vom', 'zur', 'mit']
        words = normalized.split()
        words = [word for word in words if word not in articles]
        
        # Remove special characters but keep umlauts
        normalized = ' '.join(words)
        normalized = re.sub(r'[^\w\säöüß]', ' ', normalized)
        
        # Remove extra whitespace
        normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        return normalized

    def extract_quantity_and_unit(self, item_name: str) -> Tuple[Optional[float], Optional[str]]:
        """Extract quantity and unit from item name."""
        for unit, pattern in self.unit_patterns.items():
            match = re.search(pattern, item_name.lower())
            if match:
                try:
                    quantity = float(match.group(1).replace(',', '.'))
                    return quantity, unit
                except ValueError:
                    continue
        return None, None

    def predict_category(self, item_name: str) -> ProductCategory:
        """Predict product category based on name patterns."""
        normalized_name = self.normalize_product_name(item_name)
        
        for category, patterns in self.category_patterns.items():
            for pattern in patterns:
                if re.search(pattern, normalized_name, re.IGNORECASE):
                    return category
        
        return ProductCategory.OTHER

    def calculate_similarity(self, name1: str, name2: str) -> float:
        """Calculate similarity between two product names."""
        norm1 = self.normalize_product_name(name1)
        norm2 = self.normalize_product_name(name2)
        
        # Use SequenceMatcher for basic similarity
        similarity = SequenceMatcher(None, norm1, norm2).ratio()
        
        # Boost similarity if key words match
        words1 = set(norm1.split())
        words2 = set(norm2.split())
        
        if words1 and words2:
            word_overlap = len(words1.intersection(words2)) / len(words1.union(words2))
            similarity = max(similarity, word_overlap)
        
        return similarity

    def find_best_match(
        self, db: Session, item_name: str, confidence_threshold: float = 0.7
    ) -> Tuple[Optional[Product], float]:
        """Find the best matching product for a receipt item."""
        
        # First, try exact normalized name match
        normalized_name = self.normalize_product_name(item_name)
        exact_match = product.get_by_normalized_name(db, normalized_name=normalized_name)
        if exact_match:
            return exact_match, 1.0
        
        # Try alias matching
        alias_match = product_alias.find_product_by_alias(db, alias_name=normalized_name)
        if alias_match:
            return alias_match, 0.95
        
        # Search for similar products
        predicted_category = self.predict_category(item_name)
        similar_products = product.find_similar_products(
            db, product_name=item_name, category=predicted_category
        )
        
        best_match = None
        best_similarity = 0.0
        
        for prod in similar_products:
            similarity = self.calculate_similarity(item_name, prod.name)
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = prod
        
        # Only return match if above threshold
        if best_similarity >= confidence_threshold:
            return best_match, best_similarity
        
        return None, 0.0

    def create_product_from_item(
        self, db: Session, item_name: str, price: float, quantity: float = 1.0
    ) -> Product:
        """Create a new product from a receipt item."""
        normalized_name = self.normalize_product_name(item_name)
        category = self.predict_category(item_name)
        
        # Extract quantity and unit information
        extracted_qty, unit = self.extract_quantity_and_unit(item_name)
        
        # Estimate typical weight based on category and price
        typical_weight = self._estimate_weight(category, price, extracted_qty, unit)
        
        from app.models.product import Product
        
        new_product = Product(
            name=item_name.title(),
            normalized_name=normalized_name,
            category=category,
            typical_unit=unit or 'piece',
            typical_weight_g=typical_weight,
            data_source='receipt_auto',
            confidence_score=0.6  # Medium confidence for auto-created products
        )
        
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product

    def _estimate_weight(
        self, category: ProductCategory, price: float, quantity: Optional[float], unit: Optional[str]
    ) -> Optional[float]:
        """Estimate typical weight based on category and other factors."""
        
        # If we have weight information, use it
        if unit == 'kg' and quantity:
            return quantity * 1000  # Convert to grams
        elif unit == 'g' and quantity:
            return quantity
        
        # Category-based estimates (in grams)
        category_weights = {
            ProductCategory.FRUITS: 200,  # Average apple/banana
            ProductCategory.VEGETABLES: 300,  # Average vegetable
            ProductCategory.DAIRY: 500,  # Average dairy product
            ProductCategory.MEAT_FISH: 400,  # Average meat portion
            ProductCategory.BAKERY: 500,  # Average bread/pastry
            ProductCategory.PANTRY: 500,  # Average pantry item
            ProductCategory.BEVERAGES: 1000,  # Average bottle
            ProductCategory.SNACKS: 150,  # Average snack package
        }
        
        return category_weights.get(category, 300)  # Default 300g


# Global instance
product_matcher = ProductMatcher()