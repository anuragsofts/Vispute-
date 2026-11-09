# विस्पुते फूड कोर्ट (Vispute Food Court) - Hotel Management System

A full-stack modern Hotel & Restaurant Management Web Application designed for **Vispute Food Court**, featuring:
- 📱 **QR Table Ordering**: Customers scan table QR code, browse dishes in Marathi/English with realistic dish photos, and place orders. Supports multiple order rounds (Round 1, Round 2, Round 3...) on the same bill until final checkout.
- 👨‍🍳 **Kitchen Display System (KDS)**: Real-time kitchen screen with status progression: Preparing ➔ Prepared ➔ Waiter Takeaway, accompanied by live chime notifications.
- 🤵 **Waiter Manual POS**: Fast touch POS for taking manual orders from customers unable to use smartphones, plus takeaway pickup alerts.
- 💳 **Billing Counter**: PIN-protected (`432156`), 100% keyboard-navigable (`1-9` select table, `C` Cash, `U` UPI QR, `D` Card, `Enter` Settle, `P` Print, `L` Lock, `Esc` Close), GST 5% calculation, change return calculator, and printable thermal receipt.
- 🗺️ **2D Live Floor Plan**: Interactive restaurant status layout matching the physical layout (Open Kitchen, Cashier station, Tables 1-12 with chairs).
- 🍛 **174 Official Menu Items**: Full bilingual Marathi & English menu across 14 categories (Papad, Momos, Soups, Chaas, Starters, Tandoor, Chinese, Noodles, Veg Bahar, Special Veg, Paneer Special, Roti, Biryani & Rice) with high-resolution food images.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Canvas Confetti, HTML5 Audio, QR Code generator.
- **Backend**: Node.js, Express 5, Socket.io (WebSocket real-time updates), MongoDB Atlas Mongoose + local resilient fallback.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   cd client && npm install && npm run build
   cd ..
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Run the application:
   ```bash
   npm start
   ```

4. Open in browser:
   - **Main App**: `http://localhost:5000`
   - **Billing Counter**: `http://localhost:5000/?tab=billing` (PIN: `432156`)
   - **Kitchen Screen**: `http://localhost:5000/?tab=kitchen`
   - **Waiter POS**: `http://localhost:5000/?tab=waiter`
   - **Customer QR (Table 1)**: `http://localhost:5000/?tab=customer&table=1`
   - **Menu Manager**: `http://localhost:5000/?tab=menu`
