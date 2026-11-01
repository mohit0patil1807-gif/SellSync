"""
Data-driven configuration for SellSync seller personas, seller types, and channel catalogue rules.
All connectors in this prototype are SIMULATED (DEMO MODE).
"""
from typing import Dict, List, Any

# Seller Type definitions for onboarding and settings
SELLER_TYPES: List[Dict[str, Any]] = [
    {
        "id": "clothing",
        "title": "Clothing & fashion",
        "icon": "Shirt",
        "description": "Kurtas, dresses, sarees, streetwear, and tailored apparel",
        "default_persona": "boutique",
        "default_channels": ["instagram", "whatsapp", "meesho", "myntra", "direct"],
        "default_shipping": "courier"
    },
    {
        "id": "food_bakery",
        "title": "Food & bakery",
        "icon": "Cake",
        "description": "Artisan bread, cakes, meal kits, baked goods, and desserts",
        "default_persona": "baker",
        "default_channels": ["whatsapp", "instagram", "swiggy", "zomato", "direct"],
        "default_shipping": "both"
    },
    {
        "id": "handmade",
        "title": "Handmade & home decor",
        "icon": "Palette",
        "description": "Ceramics, candles, macrame, pottery, and art prints",
        "default_persona": "handmade",
        "default_channels": ["instagram", "whatsapp", "amazon", "direct"],
        "default_shipping": "courier"
    },
    {
        "id": "reselling",
        "title": "Reselling (mixed products)",
        "icon": "Repeat",
        "description": "Fast-moving accessories, lifestyle gadgets, and home utility items",
        "default_persona": "reseller",
        "default_channels": ["whatsapp", "meesho", "amazon", "flipkart", "direct"],
        "default_shipping": "courier"
    },
    {
        "id": "beauty",
        "title": "Beauty & personal care",
        "icon": "Sparkles",
        "description": "Organic soaps, serums, lip oils, and skincare blends",
        "default_persona": "handmade",
        "default_channels": ["instagram", "whatsapp", "amazon", "direct"],
        "default_shipping": "courier"
    },
    {
        "id": "accessories",
        "title": "Accessories & gifts",
        "icon": "Gift",
        "description": "Jewelry, bags, stationery, and customized gifting hampers",
        "default_persona": "handmade",
        "default_channels": ["instagram", "whatsapp", "meesho", "direct"],
        "default_shipping": "courier"
    },
    {
        "id": "other",
        "title": "Other / Custom",
        "icon": "Store",
        "description": "General merchandise and specialty micro-commerce",
        "default_persona": "reseller",
        "default_channels": ["whatsapp", "instagram", "direct"],
        "default_shipping": "courier"
    }
]

# Channel Catalogue Rules (Data-driven)
# - Always available: Instagram DM, WhatsApp, Direct / manual orders / phone call / walk-in.
# - Marketplaces: Meesho, Amazon, Flipkart for general products; Myntra only for fashion.
# - Food & Bakery ONLY: Swiggy and Zomato.
ALWAYS_AVAILABLE_CHANNELS = ["instagram", "whatsapp", "direct"]
GENERAL_MARKETPLACES = ["meesho", "amazon", "flipkart"]
FASHION_ONLY_CHANNELS = ["myntra"]
FOOD_ONLY_CHANNELS = ["swiggy", "zomato"]

def get_allowed_channel_codes(seller_type: str, show_all: bool = False) -> List[str]:
    """
    Returns the list of channel codes allowed for a given seller type.
    If show_all is True (advanced toggle in settings), returns all channels.
    """
    if show_all:
        return ALWAYS_AVAILABLE_CHANNELS + GENERAL_MARKETPLACES + FASHION_ONLY_CHANNELS + FOOD_ONLY_CHANNELS

    seller_type = (seller_type or "").lower().strip()

    if seller_type in ["food_bakery", "baker", "food", "bakery"]:
        # Food & bakery has chat channels, direct/walk-in, and food aggregators ONLY (no Meesho/Amazon/Myntra apparel)
        return ALWAYS_AVAILABLE_CHANNELS + FOOD_ONLY_CHANNELS
    
    if seller_type in ["clothing", "fashion", "boutique"]:
        # Fashion has chat, direct, general marketplaces + Myntra
        return ALWAYS_AVAILABLE_CHANNELS + GENERAL_MARKETPLACES + FASHION_ONLY_CHANNELS
    
    # All other general non-food sellers: chat, direct, general marketplaces (NO Swiggy, NO Zomato, NO Myntra)
    return ALWAYS_AVAILABLE_CHANNELS + GENERAL_MARKETPLACES


# 4 Comprehensive Demo Personas with realistic sample data
PERSONAS: Dict[str, Dict[str, Any]] = {
    "boutique": {
        "id": "boutique",
        "tag": "Boutique",
        "name": "Aura Fashion Studio",
        "seller_type": "clothing",
        "seller_type_label": "Clothing & fashion",
        "tagline": "Handcrafted Indian ethnic wear and pure linen essentials",
        "shipping_mode": "courier",
        "city": "Jaipur",
        "state": "Rajasthan",
        "currency": "INR",
        "upi_id": "aurastudio@upi",
        "channels": ["instagram", "whatsapp", "meesho", "myntra", "direct"],
        "products": [
            {
                "sku": "ITEM-KURTA-01",
                "name": "Handcrafted Indigo Khadi Kurta",
                "category": "Apparel & Fashion",
                "base_price": 2499.0,
                "stock_on_hand": 8,
                "reserved_stock": 2,
                "low_stock_threshold": 5,
                "description": "Artisanal hand-spun khadi cotton kurta with natural indigo dye. Hand-woven in Bengal.",
                "image_url": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "whatsapp", "direct"]
            },
            {
                "sku": "ITEM-SHIRT-02",
                "name": "Pure Linen Mandarin Collar Shirt",
                "category": "Apparel & Fashion",
                "base_price": 1899.0,
                "stock_on_hand": 24,
                "reserved_stock": 3,
                "low_stock_threshold": 6,
                "description": "100% breathable organic linen shirt with coconut shell buttons. Pre-washed.",
                "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "meesho", "myntra", "direct"]
            },
            {
                "sku": "ITEM-SAREE-03",
                "name": "Chanderi Silk Handloom Saree",
                "category": "Apparel & Fashion",
                "base_price": 3850.0,
                "stock_on_hand": 6,
                "reserved_stock": 1,
                "low_stock_threshold": 3,
                "description": "Lightweight Chanderi silk with golden zari border. Includes matching unstitched blouse piece.",
                "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "whatsapp", "myntra"]
            },
            {
                "sku": "ITEM-KURTI-04",
                "name": "Chikankari Hand-Embroidered Cotton Kurti",
                "category": "Apparel & Fashion",
                "base_price": 1450.0,
                "stock_on_hand": 14,
                "reserved_stock": 2,
                "low_stock_threshold": 5,
                "description": "Authentic Lucknowi shadow-work chikankari embroidery on soft mulmul cotton.",
                "image_url": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "whatsapp", "meesho", "direct"]
            },
            {
                "sku": "ITEM-DUPATTA-05",
                "name": "Bagru Hand Block Printed Dabu Dupatta",
                "category": "Apparel & Fashion",
                "base_price": 650.0,
                "stock_on_hand": 30,
                "reserved_stock": 2,
                "low_stock_threshold": 8,
                "description": "Traditional mud-resist block printing using vegetable dyes on Kota Doria fabric.",
                "image_url": "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80",
                "listings": ["whatsapp", "direct"]
            }
        ]
    },
    "baker": {
        "id": "baker",
        "tag": "Home baker",
        "name": "Crumb & Crust Bakery",
        "seller_type": "food_bakery",
        "seller_type_label": "Food & bakery",
        "tagline": "Artisan sourdough breads, dessert boxes, and custom cakes",
        "shipping_mode": "both", # Self-delivery and rider handover
        "city": "Bengaluru",
        "state": "Karnataka",
        "currency": "INR",
        "upi_id": "crumbandcrust@upi",
        "channels": ["whatsapp", "instagram", "swiggy", "zomato", "direct"],
        "products": [
            {
                "sku": "BAKE-SOURDOUGH-01",
                "name": "Artisan Country Sourdough Loaf (700g)",
                "category": "Bakery & Breads",
                "base_price": 320.0,
                "stock_on_hand": 18,
                "reserved_stock": 4,
                "low_stock_threshold": 5,
                "description": "36-hour wild-fermented sourdough with crispy blistered crust and open crumb.",
                "image_url": "https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?w=400&auto=format&fit=crop&q=80",
                "listings": ["swiggy", "zomato", "whatsapp", "direct"]
            },
            {
                "sku": "BAKE-BROWNIE-02",
                "name": "Belgian Fudgy Dark Chocolate Brownie Box (Pack of 4)",
                "category": "Desserts & Cakes",
                "base_price": 480.0,
                "stock_on_hand": 25,
                "reserved_stock": 5,
                "low_stock_threshold": 6,
                "description": "Dense, gooey brownies baked with 70% Callebaut dark chocolate and sea salt flakes.",
                "image_url": "https://images.unsplash.com/photo-1548741487-18d16a14b580?w=400&auto=format&fit=crop&q=80",
                "listings": ["swiggy", "zomato", "instagram", "whatsapp", "direct"]
            },
            {
                "sku": "BAKE-CHEESECAKE-03",
                "name": "Lotus Biscoff Baked Cheesecake Slice",
                "category": "Desserts & Cakes",
                "base_price": 260.0,
                "stock_on_hand": 12,
                "reserved_stock": 3,
                "low_stock_threshold": 4,
                "description": "Creamy New York style cheesecake with caramelized Biscoff spread and biscuit crumb.",
                "image_url": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&auto=format&fit=crop&q=80",
                "listings": ["swiggy", "zomato", "direct"]
            },
            {
                "sku": "BAKE-FOCACCIA-04",
                "name": "Rosemary & Roasted Garlic Focaccia (400g)",
                "category": "Bakery & Breads",
                "base_price": 290.0,
                "stock_on_hand": 10,
                "reserved_stock": 2,
                "low_stock_threshold": 3,
                "description": "Extra virgin olive oil drenched focaccia topped with fresh garden rosemary and confit garlic.",
                "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
                "listings": ["whatsapp", "direct"]
            },
            {
                "sku": "BAKE-BENTO-05",
                "name": "Korean Style Red Velvet Bento Cake (300g)",
                "category": "Desserts & Cakes",
                "base_price": 450.0,
                "stock_on_hand": 8,
                "reserved_stock": 2,
                "low_stock_threshold": 3,
                "description": "Mini celebration cake with cream cheese frosting in a compostable sugarcane bagasse box.",
                "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "whatsapp", "direct"]
            }
        ]
    },
    "reseller": {
        "id": "reseller",
        "tag": "Reseller",
        "name": "DailyDeals Hub",
        "seller_type": "reselling",
        "seller_type_label": "Reselling (mixed products)",
        "tagline": "Trending tech gadgets, phone gear, and lifestyle utility items",
        "shipping_mode": "courier",
        "city": "Surat",
        "state": "Gujarat",
        "currency": "INR",
        "upi_id": "dailydeals@upi",
        "channels": ["whatsapp", "meesho", "amazon", "flipkart", "direct"],
        "products": [
            {
                "sku": "TECH-EARBUDS-01",
                "name": "TWS True Wireless Earbuds with ENC Case",
                "category": "Consumer Electronics",
                "base_price": 899.0,
                "stock_on_hand": 40,
                "reserved_stock": 6,
                "low_stock_threshold": 10,
                "description": "Bluetooth 5.3 earbuds with 30-hour playback, environmental noise cancellation, and type-C fast charging.",
                "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=80",
                "listings": ["amazon", "flipkart", "meesho", "whatsapp", "direct"]
            },
            {
                "sku": "TECH-CASE-02",
                "name": "Matte Shockproof Bumper Case for iPhone / Samsung",
                "category": "Mobile Accessories",
                "base_price": 299.0,
                "stock_on_hand": 85,
                "reserved_stock": 10,
                "low_stock_threshold": 20,
                "description": "Military-grade drop tested hybrid case with anti-fingerprint frosted back panel.",
                "image_url": "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&auto=format&fit=crop&q=80",
                "listings": ["meesho", "whatsapp", "direct"]
            },
            {
                "sku": "TECH-CABLE-03",
                "name": "Magnetic 3-in-1 Fast Charging Nylon Braided Cable",
                "category": "Mobile Accessories",
                "base_price": 399.0,
                "stock_on_hand": 50,
                "reserved_stock": 4,
                "low_stock_threshold": 12,
                "description": "Includes Type-C, Lightning, and Micro-USB magnetic tips with blue LED indicator.",
                "image_url": "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80",
                "listings": ["amazon", "meesho", "whatsapp", "direct"]
            },
            {
                "sku": "LIFE-BOTTLE-04",
                "name": "Vacuum Insulated Stainless Steel Sipper Bottle (750ml)",
                "category": "Home & Kitchen",
                "base_price": 649.0,
                "stock_on_hand": 30,
                "reserved_stock": 3,
                "low_stock_threshold": 8,
                "description": "Keeps beverages 24h cold or 12h hot. BPA-free stainless steel 304 with powder-coat grip.",
                "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80",
                "listings": ["amazon", "flipkart", "direct"]
            },
            {
                "sku": "LIFE-DESKFAN-05",
                "name": "Rechargeable Quiet Mini USB Desk Fan",
                "category": "Home Utility",
                "base_price": 550.0,
                "stock_on_hand": 18,
                "reserved_stock": 2,
                "low_stock_threshold": 5,
                "description": "Compact desktop cooler with 3 speed modes, 180-degree tilt, and 2000mAh battery.",
                "image_url": "https://images.unsplash.com/photo-1618941716939-553df3c6c278?w=400&auto=format&fit=crop&q=80",
                "listings": ["meesho", "amazon", "direct"]
            }
        ]
    },
    "handmade": {
        "id": "handmade",
        "tag": "Handmade-goods shop",
        "name": "Clay & Knot Studio",
        "seller_type": "handmade",
        "seller_type_label": "Handmade & home decor",
        "tagline": "Small-batch ceramic wares, hand-poured candles, and boho fiber art",
        "shipping_mode": "courier",
        "city": "Pune",
        "state": "Maharashtra",
        "currency": "INR",
        "upi_id": "clayandknot@upi",
        "channels": ["instagram", "whatsapp", "amazon", "direct"],
        "products": [
            {
                "sku": "CRAFT-MUG-01",
                "name": "Hand-Glazed Ceramic Coffee Mug Set (Pack of 2)",
                "category": "Handmade Pottery",
                "base_price": 1199.0,
                "stock_on_hand": 20,
                "reserved_stock": 3,
                "low_stock_threshold": 5,
                "description": "Wheel-thrown stoneware mugs with speckled oatmeal matte glaze. Microwave and dishwasher safe.",
                "image_url": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "amazon", "direct"]
            },
            {
                "sku": "CRAFT-CANDLE-02",
                "name": "French Lavender Hand-Poured Soy Wax Candle (200g)",
                "category": "Home Fragrance",
                "base_price": 649.0,
                "stock_on_hand": 35,
                "reserved_stock": 4,
                "low_stock_threshold": 8,
                "description": "100% natural soy wax scented with therapeutic lavender essential oil and crackling wooden wick.",
                "image_url": "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "whatsapp", "direct"]
            },
            {
                "sku": "CRAFT-MACRAME-03",
                "name": "Bohemian Cotton Macrame Wall Hanging (18x30 inch)",
                "category": "Wall Decor",
                "base_price": 1450.0,
                "stock_on_hand": 9,
                "reserved_stock": 1,
                "low_stock_threshold": 4,
                "description": "Intricately hand-knotted 4mm natural twisted cotton cord mounted on treated reclaimed driftwood.",
                "image_url": "https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "whatsapp", "direct"]
            },
            {
                "sku": "CRAFT-PLANTER-04",
                "name": "Terracotta Fluted Planter Pot with Saucer",
                "category": "Handmade Pottery",
                "base_price": 580.0,
                "stock_on_hand": 15,
                "reserved_stock": 2,
                "low_stock_threshold": 5,
                "description": "Porous red earthenware with ribbed vertical texture. Breathable root support for indoor plants.",
                "image_url": "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop&q=80",
                "listings": ["instagram", "direct"]
            },
            {
                "sku": "CRAFT-COASTER-05",
                "name": "Braided Natural Jute Coaster Set of 4",
                "category": "Tableware",
                "base_price": 390.0,
                "stock_on_hand": 28,
                "reserved_stock": 2,
                "low_stock_threshold": 6,
                "description": "Eco-friendly handmade rustic coasters with stitched cotton contrast edge.",
                "image_url": "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400&auto=format&fit=crop&q=80",
                "listings": ["whatsapp", "direct"]
            }
        ]
    }
}
