import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.product import Product

class ChatParserService:
    INDIAN_CITIES = [
        "mumbai", "delhi", "bengaluru", "bangalore", "hyderabad", "chennai", "kolkata",
        "pune", "ahmedabad", "jaipur", "surat", "lucknow", "kanpur", "nagpur", "indore",
        "thane", "bhopal", "visakhapatnam", "patna", "vadodara", "ghaziabad", "ludhiana",
        "agra", "nashik", "faridabad", "meerut", "rajkot", "varanasi", "srinagar", "aurangabad",
        "dhanbad", "amritsar", "navi mumbai", "allahabad", "prayagraj", "ranchi", "howrah",
        "coimbatore", "jabalpur", "gwalior", "vijayawada", "jodhpur", "madurai", "raipur",
        "kota", "guwahati", "chandigarh", "solapur", "hubli", "dharwad", "bareilly", "moradabad",
        "mysore", "mysuru", "gurgaon", "gurugram", "aligarh", "jalandhar", "tiruchirappalli",
        "bhubaneswar", "salem", "mira-bhayandar", "warangal", "thiruvananthapuram", "guntur",
        "bhiwandi", "saharanpur", "gorakhpur", "bikaner", "amravati", "noida", "jamshedpur",
        "bhilai", "cuttack", "firozabad", "kochi", "cochin", "dehradun", "mangalore", "mangaluru"
    ]

    @staticmethod
    def parse_chat_message(chat_text: str, db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Rule-based parser for WhatsApp / Instagram customer chat messages.
        Extracts:
        - Customer Name
        - 10-digit Indian Mobile Number (validates format)
        - 6-digit Pincode (validates format)
        - Delivery Address & City
        - Items & Quantities matched against local product catalog
        No third-party AI or network APIs are used.
        """
        if not chat_text or not chat_text.strip():
            return {
                "customer_name": "",
                "customer_phone": "",
                "phone_valid": False,
                "delivery_address": "",
                "delivery_city": "",
                "delivery_pincode": "",
                "pincode_valid": False,
                "items": [],
                "raw_chat": chat_text,
                "notes": "Empty chat provided"
            }

        lines = [line.strip() for line in chat_text.strip().split("\n") if line.strip()]
        full_text = " ".join(lines)

        # 1. Extract 10-digit Indian mobile number
        # Matches: +91 98201 12345, +91-9876543210, 9876543210, etc.
        phone = ""
        phone_formatted = ""
        phone_valid = False
        phone_match = re.search(r'(?:(?:\+?91[\s\-]?)|\b0)?([6-9](?:[\s\-]?[0-9]){9})\b', full_text)
        if phone_match:
            raw_digits = re.sub(r'\D', '', phone_match.group(1))
            if len(raw_digits) == 10:
                phone = raw_digits
                phone_formatted = f"+91 {raw_digits[:5]} {raw_digits[5:]}"
                phone_valid = True


        # 2. Extract 6-digit Indian PIN code
        pincode = ""
        pincode_valid = False
        pincode_match = re.search(r'\b([1-9][0-9]{5})\b', full_text)
        if pincode_match:
            pincode = pincode_match.group(1)
            pincode_valid = True

        # 3. Detect city from text
        delivery_city = ""
        lower_text = full_text.lower()
        for city in ChatParserService.INDIAN_CITIES:
            # Check whole word match
            if re.search(rf'\b{re.escape(city)}\b', lower_text):
                delivery_city = city.title()
                break

        # 4. Extract Customer Name
        customer_name = ""
        name_patterns = [
            (r'(?:name|customer|buyer|client|naam)\s*[:=\-]\s*([^\r\n,\(\)\d]+)', True),
            (r'(?:i am|this is|myself)\s+([^\r\n,\(\)\d]+)', True),
            (r'\b(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\b', False),
        ]
        address_noise_words = {
            "flat", "plot", "road", "street", "building", "floor", "near", "opposite",
            "lane", "nagar", "delhi", "mumbai", "kolkata", "chennai", "bengaluru", "pune"
        }
        for pat, ignore_case in name_patterns:
            flags = re.IGNORECASE if ignore_case else 0
            m = re.search(pat, full_text, flags)
            if m:
                extracted = m.group(1).strip()
                extracted = re.split(r'(?i)\b(?:phone|mobile|mob|contact|address|addr|item|qty|pincode|pin)\b', extracted)[0].strip()
                extracted = re.split(r'[\n,\(\)\d]', extracted)[0].strip()
                tokens = [t.lower() for t in extracted.split()]
                if not any(t in address_noise_words for t in tokens):
                    if len(extracted) >= 2 and 1 <= len(tokens) <= 4:
                        customer_name = extracted.title()
                        break


        if not customer_name:
            # Fallback heuristic: check early lines that look like person names
            # (2 to 3 words, all alphabetic, no address keywords or greetings)
            disallowed_words = {
                "hi", "hello", "hey", "dear", "sir", "madam", "order", "items", "item", "please",
                "pls", "want", "need", "booking", "address", "phone", "mobile", "pincode", "flat",
                "plot", "road", "street", "delhi", "mumbai", "india", "payment", "upi", "gpay", "paytm"
            }
            for line in lines[:4]:
                clean_line = re.sub(r'[^a-zA-Z\s]', '', line).strip()
                tokens = clean_line.split()
                if 1 <= len(tokens) <= 3:
                    if not any(t.lower() in disallowed_words for t in tokens):
                        customer_name = clean_line.title()
                        break

        # 5. Extract Delivery Address
        delivery_address = ""
        addr_match = re.search(r'(?:address|addr|delivery address|ship to|deliver to|location|pata)\s*[:=\-]\s*([^\n\r]+(?:\n[^\n\r]+)?)', chat_text, re.IGNORECASE)
        if addr_match:
            delivery_address = addr_match.group(1).strip()
            # Clean trailing phone or pincode from address if present
            if phone:
                delivery_address = delivery_address.replace(phone, "").strip()
            if pincode:
                delivery_address = delivery_address.replace(pincode, "").strip()
        else:
            # Look for lines containing address indicators
            addr_keywords = ["flat", "apartment", "apt", "house", "h.no", "plot", "sector", "road", "rd", "street", "st", "nagar", "layout", "cross", "colony", "enclave", "villa", "floor", "near", "opp", "behind"]
            candidate_lines = []
            for line in lines:
                lower_line = line.lower()
                if any(k in lower_line for k in addr_keywords):
                    candidate_lines.append(line)
            if candidate_lines:
                delivery_address = ", ".join(candidate_lines)

        # 6. Extract Items & Quantities
        parsed_items: List[Dict[str, Any]] = []

        # Available products in DB for matching if session provided
        available_products: List[Product] = []
        if db:
            available_products = db.query(Product).filter(Product.is_active == True).all()

        # Item parsing regex patterns
        # e.g., "2x Kurti", "1 Linen Shirt", "3 pcs Sourdough Loaf", "Handcrafted Khadi Kurta - 2"
        item_patterns = [
            r'(?:^|\n|\*|\-|\•)\s*(\d+)\s*(?:x|nos?|pcs?|units?|pieces?|pkts?|boxes?)\s+([^\n,\d]+)',
            r'(?:^|\n|\*|\-|\•)\s*([^\n,\d]+?)\s*[-:]\s*(\d+)\s*(?:x|nos?|pcs?|units?|pieces?|pkts?|boxes?)',
            r'(?:^|\n|\*|\-|\•)\s*(\d+)\s+([A-Za-z][^\n,]+?)(?=\s*(?:,|\n|$))',
        ]

        found_item_strings = []
        for line in lines:
            line_lower = line.lower()
            # Skip lines that are purely name, phone, or address
            if phone and phone.replace(" ", "") in line.replace(" ", ""):
                continue
            if pincode and pincode in line:
                continue
            if re.match(r'^(?:name|phone|address|city|pin|pincode)\s*[:=\-]', line_lower):
                continue

            matched_line = False
            for pat in item_patterns:
                matches = re.findall(pat, line, re.IGNORECASE)
                for m in matches:
                    if len(m) == 2:
                        val1, val2 = m[0].strip(), m[1].strip()
                        if val1.isdigit():
                            qty = int(val1)
                            title = val2
                        elif val2.isdigit():
                            qty = int(val2)
                            title = val1
                        else:
                            continue

                        # Filter out numbers that look like pincodes or phone fragments
                        if qty > 50:
                            continue

                        title_clean = re.sub(r'^(?:item|items|product|products|order|booking)\s*[:=\-]\s*', '', title, flags=re.IGNORECASE).strip()
                        if len(title_clean) >= 3 and not any(w in title_clean.lower() for w in ["phone", "pincode", "address", "mumbai", "delhi"]):
                            found_item_strings.append((qty, title_clean))
                            matched_line = True
                            break
                if matched_line:
                    break

        # Match identified items against catalog
        for qty, raw_title in found_item_strings:
            matched_product: Optional[Product] = None
            raw_lower = raw_title.lower()

            for p in available_products:
                p_lower = p.name.lower()
                # Check direct containment
                if p_lower in raw_lower or raw_lower in p_lower:
                    matched_product = p
                    break
                # Check token overlap
                p_tokens = set(p_lower.split()) - {"set", "pack", "of", "with", "pure", "and", "&"}
                raw_tokens = set(raw_lower.split())
                if len(p_tokens.intersection(raw_tokens)) >= 2:
                    matched_product = p
                    break

            if matched_product:
                parsed_items.append({
                    "product_id": matched_product.id,
                    "sku": matched_product.sku,
                    "title": matched_product.name,
                    "quantity": qty,
                    "unit_price": matched_product.base_price,
                    "total_price": round(qty * matched_product.base_price, 2),
                    "matched": True
                })
            else:
                # Unmatched custom item
                parsed_items.append({
                    "product_id": None,
                    "sku": "CUSTOM-ITEM",
                    "title": raw_title.title(),
                    "quantity": qty,
                    "unit_price": 0.0,
                    "total_price": 0.0,
                    "matched": False
                })

        # Fallback if no specific quantity lines found: search catalog items in full text
        if not parsed_items and available_products:
            for p in available_products:
                if p.name.lower() in full_text.lower():
                    parsed_items.append({
                        "product_id": p.id,
                        "sku": p.sku,
                        "title": p.name,
                        "quantity": 1,
                        "unit_price": p.base_price,
                        "total_price": p.base_price,
                        "matched": True
                    })

        confidence = "HIGH" if (phone_valid and pincode_valid and len(parsed_items) > 0) else ("MEDIUM" if phone_valid or pincode_valid else "LOW")

        result = {
            "customer_name": customer_name or "New Customer",
            "customer_phone": phone_formatted or phone,
            "phone": phone,

            "phone_valid": phone_valid,
            "delivery_address": delivery_address or "Address pending confirmation",
            "shipping_address": delivery_address or "Address pending confirmation",
            "delivery_city": delivery_city or "Mumbai",
            "city": delivery_city or "Mumbai",
            "delivery_pincode": pincode,
            "pincode": pincode,
            "pin_code": pincode,
            "pincode_valid": pincode_valid,
            "items": parsed_items,
            "confidence": confidence,
            "raw_chat": chat_text
        }
        return result

    parse_chat_text = parse_chat_message

