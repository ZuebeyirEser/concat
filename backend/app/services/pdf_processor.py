import logging
import re
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from io import BytesIO
from typing import Any, Dict, List, Optional, Tuple

from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


class GermanReceiptProcessor:
    """
    Specialized processor for German grocery receipts.
    Handles common German supermarket chains and receipt formats.
    """

    # Common German supermarket chains
    GERMAN_STORES = [
        "REWE", "EDEKA", "ALDI", "LIDL", "PENNY", "NETTO", "KAUFLAND", 
        "REAL", "GLOBUS", "TEGUT", "FAMILA", "MARKTKAUF", "HIT", "COMBI"
    ]

    # German currency patterns
    CURRENCY_PATTERNS = [
        r'(\d+[,\.]\d{2})\s*€',
        r'€\s*(\d+[,\.]\d{2})',
        r'EUR\s*(\d+[,\.]\d{2})',
        r'(\d+[,\.]\d{2})\s*EUR'
    ]

    # Date patterns (German format)
    DATE_PATTERNS = [
        r'(\d{1,2})[\.\/](\d{1,2})[\.\/](\d{2,4})',  # DD.MM.YYYY or DD/MM/YYYY
        r'(\d{2,4})[\.\/](\d{1,2})[\.\/](\d{1,2})',  # YYYY.MM.DD or YYYY/MM/DD
    ]

    # Time patterns
    TIME_PATTERNS = [
        r'(\d{1,2}):(\d{2}):(\d{2})',  # HH:MM:SS
        r'(\d{1,2}):(\d{2})',          # HH:MM
    ]

    def __init__(self):
        pass

    def extract_text_from_pdf(self, pdf_content: bytes) -> str:
        """Extract text from PDF content."""
        try:
            # Use PyPDF2 for text extraction
            reader = PdfReader(BytesIO(pdf_content))
            text = ""

            for page in reader.pages:
                text += page.extract_text() + "\n"

            return text.strip()

        except Exception as e:
            logger.error(f"Error extracting text from PDF: {e}")
            raise

    def process_receipt(self, pdf_content: bytes) -> Dict[str, Any]:
        """Process a German grocery receipt and extract structured data."""
        try:
            raw_text = self.extract_text_from_pdf(pdf_content)

            extracted_data = {
                'raw_text': raw_text,
                'store_name': self._extract_store_name(raw_text),
                'store_address': self._extract_store_address(raw_text),
                'store_phone': self._extract_phone_number(raw_text),
                'receipt_number': self._extract_receipt_number(raw_text),
                'cashier_id': self._extract_cashier_id(raw_text),
                'register_number': self._extract_register_number(raw_text),
                'transaction_date': self._extract_date(raw_text),
                'transaction_time': self._extract_time(raw_text),
                'subtotal': self._extract_subtotal(raw_text),
                'tax_amount': self._extract_tax_amount(raw_text),
                'total_amount': self._extract_total_amount(raw_text),
                'payment_method': self._extract_payment_method(raw_text),
                'items': self._extract_items(raw_text),
                'tax_breakdown': self._extract_tax_breakdown(raw_text),
                'extraction_confidence': self._calculate_confidence(raw_text),
                'extra_metadata': {
                    'processing_timestamp': datetime.utcnow().isoformat(),
                    'processor_version': '1.0.0',
                    'language': 'de',
                    'store_chain': 'REWE' if 'REWE' in raw_text else 'unknown'
                }
            }

            return extracted_data

        except Exception as e:
            logger.error(f"Error processing receipt: {e}")
            raise

    def _extract_store_name(self, text: str) -> Optional[str]:
        """Extract store name from receipt text."""
        lines = text.split('\n')[:10]  # Check first 10 lines

        for line in lines:
            line_upper = line.strip().upper()
            for store in self.GERMAN_STORES:
                if store in line_upper:
                    return line.strip()

        # Fallback: look for common patterns
        for line in lines:
            if any(word in line.upper() for word in ['MARKT', 'SUPERMARKT', 'LEBENSMITTEL']):
                return line.strip()

        return None

    def _extract_store_address(self, text: str) -> Optional[str]:
        """Extract store address from receipt text."""
        lines = text.split('\n')
        address_lines = []

        # Look for address patterns (German postal codes, street names)
        postal_code_pattern = r'\b\d{5}\b'
        street_pattern = r'[A-Za-zäöüÄÖÜß\s]+(?:str\.|straße|platz|weg|gasse|allee)\s*\d*'

        for i, line in enumerate(lines[:15]):  # Check first 15 lines
            line = line.strip()
            if re.search(postal_code_pattern, line) or re.search(street_pattern, line, re.IGNORECASE):
                # Include this line and potentially the next one
                address_lines.append(line)
                if i + 1 < len(lines) and len(lines[i + 1].strip()) > 0:
                    next_line = lines[i + 1].strip()
                    if not any(char.isdigit() for char in next_line[:3]):  # Not a price line
                        address_lines.append(next_line)
                break

        return ' '.join(address_lines) if address_lines else None

    def _extract_phone_number(self, text: str) -> Optional[str]:
        """Extract phone number from receipt text."""
        phone_patterns = [
            r'Tel\.?\s*:?\s*(\+49\s*\d+[\s\-\d]+)',
            r'Telefon\s*:?\s*(\+49\s*\d+[\s\-\d]+)',
            r'(\+49\s*\d+[\s\-\d]+)',
            r'(\d{4,5}[\s\-]\d+[\s\-\d]*)'
        ]

        for pattern in phone_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        return None

    def _extract_receipt_number(self, text: str) -> Optional[str]:
        """Extract receipt/transaction number."""
        patterns = [
            r'Beleg[:\s]*(\d+)',
            r'Bon[:\s]*(\d+)',
            r'Quittung[:\s]*(\d+)',
            r'Trans[:\s]*(\d+)',
            r'Nr[:\s]*(\d+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)

        return None

    def _extract_cashier_id(self, text: str) -> Optional[str]:
        """Extract cashier ID."""
        patterns = [
            r'Kasse[:\s]*(\d+)',
            r'Kassier[:\s]*(\d+)',
            r'Bed[:\s]*(\d+)',
            r'Bedienung[:\s]*(\d+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)

        return None

    def _extract_register_number(self, text: str) -> Optional[str]:
        """Extract register/terminal number."""
        patterns = [
            r'Terminal[:\s]*(\d+)',
            r'Kasse[:\s]*(\d+)',
            r'Reg[:\s]*(\d+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)

        return None

    def _extract_date(self, text: str) -> Optional[date]:
        """Extract transaction date."""
        for pattern in self.DATE_PATTERNS:
            matches = re.findall(pattern, text)
            for match in matches:
                try:
                    if len(match[2]) == 2:  # Two-digit year
                        year = 2000 + int(match[2])
                    else:
                        year = int(match[2])

                    # Try DD.MM.YYYY format first
                    try:
                        return date(year, int(match[1]), int(match[0]))
                    except ValueError:
                        # Try YYYY.MM.DD format
                        return date(int(match[0]), int(match[1]), int(match[2]))

                except (ValueError, IndexError):
                    continue

        return None

    def _extract_time(self, text: str) -> Optional[str]:
        """Extract transaction time."""
        for pattern in self.TIME_PATTERNS:
            match = re.search(pattern, text)
            if match:
                return match.group(0)

        return None

    def _extract_currency_amount(self, text: str, keywords: List[str]) -> Optional[Decimal]:
        """Extract currency amount near specific keywords."""
        for keyword in keywords:
            # Look for keyword followed by amount
            pattern = rf'{keyword}[:\s]*([0-9]+[,\.]\d{{2}})'
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '.')
                try:
                    return Decimal(amount_str)
                except InvalidOperation:
                    continue

        return None

    def _extract_subtotal(self, text: str) -> Optional[Decimal]:
        """Extract subtotal amount."""
        keywords = ['Zwischensumme', 'Netto', 'Subtotal', 'Summe']
        return self._extract_currency_amount(text, keywords)

    def _extract_tax_amount(self, text: str) -> Optional[Decimal]:
        """Extract tax amount."""
        # Look for REWE tax summary pattern
        tax_pattern = r'Gesamtbetrag\s+[\d,\.]+\s+(\d+[,\.]\d{2})\s+[\d,\.]+$'
        match = re.search(tax_pattern, text, re.MULTILINE)
        if match:
            try:
                return Decimal(match.group(1).replace(',', '.'))
            except InvalidOperation:
                pass

        # Fallback to general patterns
        keywords = ['MwSt', 'USt', 'Steuer', 'Tax', 'VAT']
        return self._extract_currency_amount(text, keywords)

    def _extract_tax_breakdown(self, text: str) -> Dict[str, Any]:
        """Extract detailed tax breakdown from REWE receipt."""
        tax_info = {}

        # Pattern for tax lines: "A= 19,0% 0,84 0,16 1,00"
        tax_pattern = r'([AB])=\s*(\d+[,\.]\d+)%\s+(\d+[,\.]\d+)\s+(\d+[,\.]\d+)\s+(\d+[,\.]\d+)'

        matches = re.findall(tax_pattern, text)
        for match in matches:
            tax_code = match[0]
            tax_rate = float(match[1].replace(',', '.'))
            net_amount = float(match[2].replace(',', '.'))
            tax_amount = float(match[3].replace(',', '.'))
            gross_amount = float(match[4].replace(',', '.'))

            tax_info[f'tax_{tax_code.lower()}'] = {
                'code': tax_code,
                'rate_percent': tax_rate,
                'net_amount': net_amount,
                'tax_amount': tax_amount,
                'gross_amount': gross_amount
            }

        return tax_info

    def _extract_total_amount(self, text: str) -> Optional[Decimal]:
        """Extract total amount."""
        # Look for REWE specific patterns first
        rewe_patterns = [
            r'SUMME EUR\s+(\d+[,\.]\d{2})',
            r'Gesamtbetrag\s+[\d,\.]+\s+[\d,\.]+\s+(\d+[,\.]\d{2})',
            r'Betrag EUR\s+(\d+[,\.]\d{2})'
        ]

        for pattern in rewe_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    return Decimal(match.group(1).replace(',', '.'))
                except InvalidOperation:
                    continue

        # Fallback to general patterns
        keywords = ['Summe', 'Total', 'Gesamt', 'Betrag']
        return self._extract_currency_amount(text, keywords)

    def _extract_payment_method(self, text: str) -> Optional[str]:
        """Extract payment method."""
        # Check for specific REWE payment patterns
        if 'Contactless' in text and 'DEBIT MASTERCARD' in text:
            return 'Contactless Debit Mastercard'
        elif 'DEBIT MASTERCARD' in text:
            return 'Debit Mastercard'
        elif 'Geg. Mastercard' in text:
            return 'Mastercard'

        payment_methods = {
            'EC': ['EC-Karte', 'Girocard', 'Debitkarte'],
            'Credit Card': ['Kreditkarte', 'VISA', 'Mastercard', 'AMEX'],
            'Cash': ['Bar', 'Bargeld', 'Cash'],
            'Contactless': ['Kontaktlos', 'NFC', 'Tap'],
        }

        text_upper = text.upper()
        for method, keywords in payment_methods.items():
            for keyword in keywords:
                if keyword.upper() in text_upper:
                    return method

        return None

    def _extract_items(self, text: str) -> List[Dict[str, Any]]:
        """Extract individual items from receipt."""
        items = []

        # The text appears to be concatenated, so let's use regex to find item patterns
        # Pattern: ITEM_NAME PRICE TAX_CODE
        item_pattern = r'([A-ZÄÖÜ][A-ZÄÖÜ\s\.\!]+?)\s+(\d+[,\.]\d{2})\s+([AB])'

        # Find all potential items
        matches = re.findall(item_pattern, text)

        for match in matches:
            item_name = match[0].strip()
            price_str = match[1].replace(',', '.')
            tax_code = match[2]

            # Skip if this looks like a summary line
            if any(skip in item_name.upper() for skip in ['SUMME', 'GESAMT', 'STEUER', 'NETTO', 'BRUTTO', 'GESAMTBETRAG']):
                continue

            # Skip address/header info
            if any(skip in item_name.upper() for skip in ['HOCHZOLLER', 'AUGSBURG', 'UID NR']):
                continue

            try:
                price = Decimal(price_str)
                item = {
                    'name': item_name,
                    'price': float(price),
                    'quantity': 1,
                    'tax_code': tax_code,
                    'unit_type': 'pieces'
                }

                items.append(item)

            except (InvalidOperation, ValueError):
                continue

        # Now try to match weight and quantity information
        # Look for weight patterns: "0,744 kg x 1,99 EUR/kg"
        weight_pattern = r'(\d+[,\.]\d+)\s*kg\s*x\s*(\d+[,\.]\d+)\s*EUR/kg'
        weight_matches = re.findall(weight_pattern, text)

        # Look for quantity patterns: "2 Stk x 1,79"
        qty_pattern = r'(\d+)\s*Stk\s*x\s*(\d+[,\.]\d+)'
        qty_matches = re.findall(qty_pattern, text)

        # Try to match additional info to items (this is approximate)
        weight_idx = 0
        qty_idx = 0

        for item in items:
            # Check if this item might have weight info
            if weight_idx < len(weight_matches):
                weight_info = weight_matches[weight_idx]
                weight = float(weight_info[0].replace(',', '.'))
                price_per_kg = float(weight_info[1].replace(',', '.'))

                # If the calculated price is close to the item price, assign weight info
                calculated_price = weight * price_per_kg
                if abs(calculated_price - item['price']) < 0.01:
                    item['weight_kg'] = weight
                    item['price_per_kg'] = price_per_kg
                    item['unit_type'] = 'weight'
                    weight_idx += 1

            # Check if this item might have quantity info
            elif qty_idx < len(qty_matches):
                qty_info = qty_matches[qty_idx]
                quantity = int(qty_info[0])
                unit_price = float(qty_info[1].replace(',', '.'))

                # If the calculated price is close to the item price, assign quantity info
                calculated_price = quantity * unit_price
                if abs(calculated_price - item['price']) < 0.01:
                    item['quantity'] = quantity
                    item['unit_price'] = unit_price
                    item['unit_type'] = 'pieces'
                    qty_idx += 1

        return items

    def _calculate_confidence(self, text: str) -> float:
        """Calculate extraction confidence based on found elements."""
        confidence_factors = []

        # Check if we found a known store
        if any(store in text.upper() for store in self.GERMAN_STORES):
            confidence_factors.append(0.3)

        # Check if we found currency symbols
        if any(re.search(pattern, text) for pattern in self.CURRENCY_PATTERNS):
            confidence_factors.append(0.2)

        # Check if we found date patterns
        if any(re.search(pattern, text) for pattern in self.DATE_PATTERNS):
            confidence_factors.append(0.2)

        # Check if text contains German words
        german_words = ['und', 'der', 'die', 'das', 'mit', 'für', 'von', 'zu', 'auf', 'ist', 'sind']
        if any(word in text.lower() for word in german_words):
            confidence_factors.append(0.1)

        # Check text length (longer text usually means better extraction)
        if len(text) > 500:
            confidence_factors.append(0.1)
        elif len(text) > 200:
            confidence_factors.append(0.05)

        # Check if we found structured data
        if re.search(r'\d+[,\.]\d{2}', text):  # Found prices
            confidence_factors.append(0.1)

        return min(sum(confidence_factors), 1.0)


# Global processor instance
pdf_processor = GermanReceiptProcessor()