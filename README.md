# SellSync — Unified Commerce Cockpit for Indian Micro-Sellers

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-blue?style=for-the-badge&logo=render)](https://sellsync-o3kv.onrender.com/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> **Tagline:** One simple cockpit. Every sales chat & channel. Zero stockouts.  
> **Course / Context:** Developed for the **MDMIE01 Entrepreneurship Project**.  
> 🌐 **Live Deployed Application:** **[https://sellsync-o3kv.onrender.com/](https://sellsync-o3kv.onrender.com/)**

---

## 🌟 Live Demo & Quick Links

| Service | Link | Description |
|---|---|---|
| 🚀 **Live Production App** | **[sellsync-o3kv.onrender.com](https://sellsync-o3kv.onrender.com/)** | Fully deployed and interactive cloud version hosted on Render |
| 💻 **Local Web UI** | `http://127.0.0.1:5173` | Local Vite + React frontend |
| 📑 **API Documentation** | `http://127.0.0.1:8000/docs` | Interactive Swagger API docs (FastAPI) |

---

## 📖 What is SellSync?

**SellSync** is a unified, lightweight commerce operating cockpit engineered specifically for **Indian micro-sellers**: Instagram boutiques, home bakers, social commerce thrift resellers, and handmade artisan studios who operate their businesses primarily through WhatsApp, Instagram DMs, regional marketplaces, and direct UPI transfers.

### The Problem It Solves
Indian micro-sellers are informal, solopreneur, or family-run businesses. They do not have dedicated IT staff or complex enterprise ERP training. Instead, they juggle:
1. Fragmented customer conversations across WhatsApp and Instagram DMs
2. Unmatched UPI payments and bank SMS notifications
3. Accidental double-booking and out-of-stock overselling
4. Manual copy-pasting of delivery addresses into courier apps
5. Chaos during day-end reconciliation of cash and bank settlements

SellSync replaces that chaos with a transparent, low-cognitive-load cockpit designed to run effortlessly on desktop and mobile.

---

## 🚀 Key Features

### 1. 💬 Deterministic WhatsApp Chat-to-Order Parser
* Converts unstructured, messy customer messages into structured orders with 1 click.
* **Regex-Powered Local Extraction**: Detects Indian phone numbers (`+91`, 10 digits), 6-digit Indian PIN codes, destination cities, customer names, and catalog item SKUs.
* **100% Local & Private**: Runs directly on the device with zero cloud API dependencies or customer data leakage.

### 2. 📦 Single-Source-of-Truth Inventory Engine
* Connects all sales channels (WhatsApp, Instagram, Meesho, Direct) back to a unified stock pool:
  $$\text{Available Stock} = \text{Stock on Hand} - \text{Reserved Stock}$$
* Stock is automatically reserved upon order creation and committed upon dispatch.
* Fast 1-tap `+` / `-` stock steppers for immediate physical stock counts from mobile devices.

### 3. 💳 UPI Reconciliation & Dynamic QR Generator
* **Payment Match Helper**: Cross-checks bank SMS amounts and UTR reference numbers against pending orders to flag exact matches, shortfalls, or overpayments.
* **NPCI-Compliant QR Codes**: Dynamically generates `upi://pay` QR codes with custom order references and pre-filled amounts.
* **WhatsApp Deep Links**: Formats instant payment reminder messages that open customer WhatsApp chats directly.

### 4. 🚚 Dual Fulfillment Routing
* **Parcel Couriers (Delhivery, BlueDart, India Post, Porter)**: One-click standardized address clipboard copying and printable 4x6" shipping label generation.
* **Food & Fresh Delivery (Swiggy / Zomato)**: Dedicated kitchen prep states and rider handover OTP confirmation.

### 5. 📊 Day-End Close Reconciliation
* Summarizes total collected revenue, pending payments, dispatched parcels, and daily order volumes.
* One-click download of the day's financial transaction ledger in CSV format.

### 6. 🌐 Bilingual English & Hindi Support
* Instant toggleable interface between **English** and **Hindi (`[EN | हिंदी]`)** with localized terminology tailored for everyday Indian retail workflows.

---

## 👥 Realistic Micro-Seller Personas

SellSync comes pre-configured with 4 distinct micro-seller personas. Switch between them instantly using the **Persona Switcher** in the navigation bar:

| Persona | Business Name | Category | Primary Channels | Fulfillment Type |
|---|---|---|---|---|
| **`boutique`** | Ananya Sarees & Kurtis (Kolkata/Jaipur) | Ethnic Wear & Sarees | Instagram Direct, WhatsApp, Meesho | Courier Parcel (Delhivery / BlueDart) |
| **`baker`** | SweetWhisk Studio (Bandra, Mumbai) | Home Bakery & Desserts | WhatsApp Business, Swiggy, Zomato | Fresh Delivery / Rider OTP Handover |
| **`reseller`** | Pooja Closet Finds (Indore) | Curated Thrift & Jewelry | Instagram Direct, WhatsApp, Meesho | Courier Parcel (India Post / Porter) |
| **`handmade`** | Mitti Magic Studio (Khurja/Delhi) | Terracotta Pottery | Instagram Direct, WhatsApp, Amazon | Heavy/Fragile Parcel Box |

> **Channel Isolation Rule**: Food aggregators (*Swiggy* & *Zomato*) are strictly restricted to food businesses (`baker`) and never appear for apparel, craft, or reseller accounts.

---

## 🏗️ Technology Stack

### Frontend
* **Framework:** React 18 with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS with rich slate/navy theme tokens
* **Icons:** Lucide React
* **Charts:** Recharts
* **Internationalization:** Custom English/Hindi i18n Context (`frontend/src/i18n`)
* **Responsive Design:** Touch-friendly mobile bottom navigation bar (`< 768px`)

### Backend
* **Language & Framework:** Python 3.11+ / FastAPI
* **Database & ORM:** SQLite with SQLAlchemy 2.0
* **Data Validation:** Pydantic v2
* **Server:** Uvicorn ASGI Server
* **Testing:** Pytest (comprehensive test suite covering business logic and edge cases)

---

## 📁 Repository Structure

```
SellSync_Local/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint & lifespan
│   │   ├── config/                     # Personas, business logic & channel configurations
│   │   ├── db/                         # SQLite session & database models
│   │   ├── models/                     # SQLAlchemy models (Order, Product, Channel, Payment)
│   │   ├── schemas/                    # Pydantic validation schemas
│   │   ├── services/                   # Business logic (inventory, payments, parser, etc.)
│   │   └── api/                        # REST API endpoints
│   ├── tests/                          # 24 automated unit & integration tests
│   ├── requirements.txt                # Python backend dependencies
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/client.ts               # Fully-typed API client
│   │   ├── components/                 # UI components, modals, and layout
│   │   ├── pages/                      # Page views (Today, Orders, Products, Payments, etc.)
│   │   ├── i18n/                       # English and Hindi localization dictionaries
│   │   └── types/                      # TypeScript definitions
│   ├── package.json                    # Node dependencies & build scripts
│   ├── vite.config.ts                  # Vite configuration
│   └── tailwind.config.js              # Tailwind styling config
├── run.bat                             # One-click Windows starter script
├── run.ps1                             # PowerShell starter script
├── run.sh                              # Linux/macOS launcher script
├── START_HERE.txt                      # Quick start guide
└── README.md                           # Documentation & project overview
```

---

## 💻 Local Setup & Development

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & `npm`
* **Git**

### One-Click Launch (Windows)
Double-click `run.bat` or run in PowerShell:
```powershell
.\run.ps1
```
This automatically sets up the Python virtual environment, installs backend and frontend packages, starts both services, and launches the website in your browser.

### Manual Setup

#### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* API runs at: `http://127.0.0.1:8000`
* Interactive API docs: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* Frontend runs at: `http://127.0.0.1:5173`

---

## 🧪 Automated Testing

The backend includes 24 automated unit and integration tests verifying inventory math, order state transitions, payment validation, and chat extraction.

Run the test suite from the `backend/` folder:
```bash
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```

---

## 🌐 Deployment (Render)

SellSync is deployed and accessible on Render:
* **Production URL:** [https://sellsync-o3kv.onrender.com/](https://sellsync-o3kv.onrender.com/)

---

## 🤝 Academic & Entrepreneurship Integrity

SellSync was built for the **MDMIE01 Entrepreneurship Project** under strict integrity principles:
* **Local Privacy First:** No external third-party tracking or customer data leakage.
* **Transparent Integrations:** Clear distinction between local direct features and simulated marketplace connectors (`DEMO MODE`).
* **Zero Fabricated Metrics:** The customer discovery tracker features authentic logs and untested hypothesis tags for real-world validation.
