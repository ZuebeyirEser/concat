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
        # Check for specific REWE payment patterns from your receipt
        if 'Contactless' in text and 'DEBIT MASTERCARD' in text:
            return 'Contactless Debit Mastercard'
        elif 'DEBIT MASTERCARD' in text:
            return 'Debit Mastercard'
        elif 'Geg. Mastercard' in text:
            return 'Mastercard'
        
        # Look for card number patterns
        card_pattern = r'Nr\.############(\d{4})'
        card_match = re.search(card_pattern, text)
        if card_match:
            last_four = card_match.group(1)
            if 'MASTERCARD' in text.upper():
                return f'Mastercard ending in {last_four}'
            elif 'VISA' in text.upper():
                return f'Visa ending in {last_four}'

        payment_methods = {
            'EC-Karte': ['EC-Karte', 'Girocard', 'Debitkarte'],
            'Kreditkarte': ['Kreditkarte', 'VISA', 'Mastercard', 'AMEX'],
            'Bargeld': ['Bar', 'Bargeld', 'Cash'],
            'Kontaktlos': ['Kontaktlos', 'NFC', 'Tap', 'Contactless'],
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

        # Split text into lines for better parsing
        lines = text.split('\n')
        
        # Find the start and end of items section
        start_idx = 0
        end_idx = len(lines)
        
        for i, line in enumerate(lines):
            # Look for start of items (after store info)
            if 'EUR' in line and any(char.isdigit() for char in line):
                start_idx = max(0, i - 5)  # Start a bit before first price
                break
        
        for i, line in enumerate(lines):
            # Look for end of items (before summary)
            if any(keyword in line.upper() for keyword in ['SUMME', '======', '------', 'GESAMTBETRAG']):
                end_idx = i
                break
        
        # Process lines in the items section
        for i in range(start_idx, end_idx):
            line = lines[i].strip()
            if not line:
                continue
                
            # Skip header/address lines
            if any(skip in line.upper() for skip in ['HOCHZOLLER', 'AUGSBURG', 'UID NR', 'REWE MARKT']):
                continue
                
            # Pattern for REWE items: "ITEM_NAME PRICE TAX_CODE"
            # Handle cases like "SW-NACKEN. PAPRI3,99 B" or "AVOCADO VORGER.1,29 B"
            item_match = re.match(r'^([A-ZÄÖÜ][A-ZÄÖÜ\s\.\!\-\/]+?)(\d+[,\.]\d{2})\s*([AB])$', line)
            
            if item_match:
                item_name = item_match.group(1).strip()
                price_str = item_match.group(2).replace(',', '.')
                tax_code = item_match.group(3)
                
                # Clean up item name (remove trailing dots, etc.)
                item_name = re.sub(r'[\.\s]+$', '', item_name)
                
                try:
                    price = Decimal(price_str)
                    
                    # Check for discount lines (negative prices)
                    is_discount = False
                    if i + 1 < len(lines):
                        next_line = lines[i + 1].strip()
                        if 'rabatt' in next_line.lower() and '-' in next_line:
                            discount_match = re.search(r'-(\d+[,\.]\d{2})', next_line)
                            if discount_match:
                                discount_amount = float(discount_match.group(1).replace(',', '.'))
                                # Add discount as separate item
                                items.append({
                                    'name': f"{item_name} - Rabatt",
                                    'price': -discount_amount,
                                    'quantity': 1,
                                    'tax_code': tax_code,
                                    'unit_type': 'discount',
                                    'is_discount': True
                                })
                    
                    item = {
                        'name': item_name,
                        'price': float(price),
                        'quantity': 1,
                        'tax_code': tax_code,
                        'unit_type': 'pieces',
                        'is_discount': False
                    }
                    
                    items.append(item)
                    
                except (InvalidOperation, ValueError):
                    continue
            
            # Handle special cases like "PFAND 0,25 EURO0,25 A"
            elif 'PFAND' in line.upper():
                pfand_match = re.search(r'PFAND.*?(\d+[,\.]\d{2})\s*([AB])', line)
                if pfand_match:
                    price_str = pfand_match.group(1).replace(',', '.')
                    tax_code = pfand_match.group(2)
                    
                    try:
                        price = Decimal(price_str)
                        items.append({
                            'name': 'Pfand',
                            'price': float(price),
                            'quantity': 1,
                            'tax_code': tax_code,
                            'unit_type': 'deposit'
                        })
                    except (InvalidOperation, ValueError):
                        continue

        # Post-process to handle discounts that appear on separate lines
        processed_items = []
        i = 0
        while i < len(items):
            item = items[i]
            
            # Check if next item is a discount for this item
            if (i + 1 < len(items) and 
                'rabatt' in items[i + 1]['name'].lower() and 
                items[i + 1]['price'] < 0):
                
                # Combine the item with its discount
                discount_item = items[i + 1]
                item['original_price'] = item['price']
                item['discount_amount'] = abs(discount_item['price'])
                item['price'] = item['price'] + discount_item['price']  # discount_item['price'] is negative
                processed_items.append(item)
                i += 2  # Skip the discount item
            else:
                processed_items.append(item)
                i += 1

        return processed_items

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