# हॉटेल विस्पुते (Hotel Vispute) – QR Table Ordering PWA

> **Full-Stack Restaurant QR Ordering & Management Web Application (PWA)**  
> Built for a real Indian restaurant in Maharashtra, India.  
> Stack: **Next.js 16 (App Router) + Tailwind CSS + MongoDB Atlas + Web Audio API + 80mm Thermal Print**.

---

## 🌟 Key Features Across Roles

### 1. 📱 Customer Table Menu (`/t/<table-token>`)
- **Default Marathi (Devanagari)** typography with language switcher (`मराठी` / `हिंदी` / `English`).
- **Cryptographically secure table tokens** (prevents URL guessing).
- **174 Authentic Dishes** across 14 categories (Papad, Momos, Soup, Beverages, Indian Starter, Tandoor Starter, Chinese Starter, Noodles, Chinese Rice, Veg Bahar, Special Veg, Paneer Special, Roti, Biryani and Rice).
- **Sticky category filter tabs** with icons.
- **Pure Veg & Special indicator dot** on each dish card.
- **Sticky bottom cart bar**: `३ वस्तू · ₹४५० · ऑर्डर द्या`.
- **Cart modal**: Quantity steppers, custom cooking notes (*"कमी तिखट, जास्त चटणी..."*), double-tap protection.
- **Live order status tracking** polling every 3.5s:
  - `तयार होत आहे` (Preparing) → `तयार आहे` (Ready) → `सर्व्ह केले` (Served).
- **"वेटरला बोलवा" (Call Waiter)** button with instant alert.
- **"आणखी ऑर्डर करा" (Order More items)** always visible to add items to existing table session.

### 2. 🍳 Kitchen Display System (KDS) (`/kitchen`)
- **Dark, high-contrast theme** (`#111827`) optimized for kitchen tablets and TVs.
- **Huge table numbers** (*"टेबल ५"*).
- **Order cards sorted by time** with live elapsed timer (*"२ मि. आधी"*).
- **Web Audio API Synthesizer**:
  - `1 Ring` for a new order.
  - `3 Rings` for added dishes on an existing table session.
- **"किचन मोड सुरू करा" (Start Kitchen Mode)**: Unlocks audio and activates the **Screen Wake Lock API** so screens never sleep.
- **Status workflow**: `तयार करणे सुरू करा` (Start Preparing) → `तयार आहे` (Ready).

### 3. 🛎️ Waiter Panel (`/waiter`)
- **10 Tables Grid** with live status (🟢 Free / 🟠 Occupied).
- **Pending Customer Call alerts** with 1-tap `समजले ✓` acknowledge.
- **Ready-to-serve food alerts** from the kitchen.
- **Waiter order taking mode**: Select table, tap dishes, send order tagged `placed_by: "waiter"`.

### 4. 💰 Cashier / Billing Counter (`/billing`)
- **Active table sessions list** with live aggregated totals.
- **Itemized receipt**: Aggregates multiple orders from the table session into one clean bill.
- **Discount input** (₹).
- **5% Restaurant GST** auto-calculated.
- **MANDATORY 10-digit Indian Mobile Number** validation (`^[6-9]\d{9}$`).
- **WhatsApp Offers Consent checkbox** (DPDP Act compliance).
- **Payment mode selector**: Cash / UPI / Card.
- **80mm Thermal Receipt Layout** (`@media print` CSS formatted for thermal printer rolls).
- **"पेमेंट पूर्ण & टेबल बंद करा" (Close Table)** button freeing the table for new customers.

### 5. ⚙️ Owner / Admin Dashboard (`/admin`)
- **Live Analytics**: Today's sales, active tables, total orders, total CRM customers.
- **Menu Management**: In-place price edits, instant "Sold Out" toggle, add/delete dishes.
- **AI Menu Importer (Google Gemini)**: Upload menu photo or paste menu text → AI extracts dishes → review table → 1-click save to MongoDB.
- **Table QR Code Manager**: Generates high-res QR codes for all 10 tables using `qrcode` library, printable in 1-click.
- **Customer CRM**: Mobile numbers, visit counts, total spent, and **1-click CSV export**.
- **Staff PINs**: Quick reference for 4-digit PIN logins.

### 6. 🔒 Staff Fast Login (`/login`)
- 4-digit PIN numeric keypad for fast tablet login:
  - **Admin**: `1234`
  - **Cashier**: `2345`
  - **Waiter**: `3456`
  - **Kitchen**: `4567`

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript | High performance, single PWA codebase |
| **Styling** | Tailwind CSS v4 + Design Tokens | Warm Indian palette (turmeric/saffron, cream, chilli red) |
| **Typography** | Mukta + Noto Sans Devanagari | Authentic Marathi & clean numbers |
| **Database** | MongoDB Atlas (Vispute cluster) | High-speed document database & connection pooling |
| **Sound** | Web Audio API Oscillator | Offline chime rings without external MP3s |
| **Print** | 80mm Thermal Print CSS | Browser-native receipt printing |
| **QR Codes** | `qrcode` npm library | On-the-fly table token QR generation |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.k0bkmub.mongodb.net/vispute?retryWrites=true&w=majority
MONGODB_DB=vispute
NEXT_PUBLIC_APP_URL=http://localhost:3000
GEMINI_API_KEY=
```

### 3. Run Production Build & Start
```bash
npm run build
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🧪 Testing Suite

Run the full end-to-end integration test suite:
```bash
node scripts/test-e2e.js
```
Tests all 14 core flows including QR token validation, ordering, kitchen queue, status updates, waiter alerts, billing, 5% GST, DPDP compliance, and table release.
