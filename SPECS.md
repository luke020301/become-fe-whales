# SPECS — Whales Market Frontend Clone

> Internal competition — Cook Series | Supervisor: Lucas (CTO)

---

## 1. Objective

Build a **Whales Market** frontend clone — a dark-themed crypto pre-market DEX web app using React. The app must have multiple pages, client-side routing, interactive FE logic, and mock data. **No backend required.**

Success criteria: judges can sit down and use the app — navigate pages, click buttons, filter listings, open modals — everything responds. No dead UI.

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v6 |
| Build tool | Vite |
| Data | Mock JSON — no real API needed |

---

## 3. Design System

| Token | Value |
|-------|-------|
| Page background | `#0B0E17` |
| Card background | `#161B28` |
| Border | `#252D3D` |
| Primary accent | `#7C3AED` (purple) |
| Primary text | `#F1F5F9` |
| Muted text | `#64748B` |
| Success / Buy | `#22C55E` |
| Danger / Sell | `#EF4444` |

---

## 4. Pages

### 4.1 Home — `/`

**Layout:**
- Navbar: logo "🐋 WhalesMarket", nav links, Connect Wallet button (opens mock modal)
- Hero section: large headline, subtext, two CTA buttons ("Explore Markets", "Learn More")
- Stats bar: Total Volume, Active Listings, Supported Chains (mock numbers)
- Featured Listings: grid of 3 highlight cards
- Footer: nav links + supported chains list

**Interactions:**
- [ ] "Explore Markets" → navigate to `/marketplace`
- [ ] Click listing card → navigate to `/listing/:id`
- [ ] "Connect Wallet" → open ConnectWalletModal (mock, no real wallet)
- [ ] Navbar links → navigate to correct pages

---

### 4.2 Marketplace — `/marketplace`

**Layout:**
- Header: title + total listing count
- Search bar: real-time filter by token name
- Filter tabs: All / Pre-Market / OTC / Points
- Sort dropdown: Newest / Price High→Low / Volume
- Listing grid: 3 columns desktop, 1 column mobile
- Each `ListingCard`: token logo, name, type badge, price, chain, "View" button

**Interactions:**
- [ ] Search input → real-time filter by name
- [ ] Filter tabs → filter by listing type
- [ ] Sort dropdown → reorder listing list
- [ ] Click card or "View" button → navigate to `/listing/:id`

---

### 4.3 Listing Detail — `/listing/:id`

**Layout:**
- Breadcrumb: Home > Markets > TOKEN_NAME
- Token header: logo, name, type badge, current price, key stats (24h volume, total offers, chain)
- Tabs: Overview / Offers / Activity
  - **Overview**: project description, tokenomics, key info
  - **Offers**: table of open offers (price, amount, expiry, action button)
  - **Activity**: recent trade history
- Sidebar (desktop): current price + "Buy Now" button → opens BuyModal

**BuyModal:**
- Amount input
- Auto-calculated Total = amount × price
- "Confirm" button → closes modal + shows Toast "Order placed!"

**Interactions:**
- [ ] Tab switch → renders correct tab content
- [ ] "Buy Now" → opens BuyModal
- [ ] BuyModal: typing amount → total auto-updates
- [ ] Confirm → dismisses modal + shows toast
- [ ] Breadcrumb links → navigate correctly

---

### 4.4 Portfolio — `/portfolio`

**Layout:**
- Summary cards: Active Orders, Total Value, Unrealized P&L
- Tabs: Active Orders / History
- Active Orders table: token, type, amount, price, status, Cancel button
- History table: completed/cancelled orders

**Interactions:**
- [ ] Tab switch → swaps table content
- [ ] Cancel Order → removes item from Active Orders list (local state, no API)

---

## 5. Components

| Component | Description |
|-----------|-------------|
| `Navbar` | Logo + nav links + Connect Wallet button |
| `Footer` | Nav links + chain badges |
| `ListingCard` | Listing card used on Home + Marketplace |
| `StatusBadge` | Pill badge: Pre-Market / OTC / Points / Active / Filled |
| `BuyModal` | Amount input, auto-total, confirm action |
| `ConnectWalletModal` | Mock wallet selector (no real wallet integration) |
| `Toast` | Temporary notification (order placed, order cancelled) |
| `SearchInput` | Search input with icon |
| `FilterTabs` | Horizontal tab row for filtering |

---

## 6. Directory Structure

```
src/
├── pages/
│   ├── Home.tsx
│   ├── Marketplace.tsx
│   ├── ListingDetail.tsx
│   └── Portfolio.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ListingCard.tsx
│   ├── StatusBadge.tsx
│   ├── BuyModal.tsx
│   ├── ConnectWalletModal.tsx
│   ├── Toast.tsx
│   ├── SearchInput.tsx
│   └── FilterTabs.tsx
├── mock-data/
│   ├── listings.json
│   └── portfolio.json
├── App.tsx          ← routing setup
├── main.tsx
└── index.css        ← Tailwind directives

public/
└── (static assets)

ai-showcase/
└── *.png            ← AI prompt screenshots
```

---

## 7. Mock Data Shapes

### `listings.json` — 20 entries
```json
[
  {
    "id": "1",
    "name": "EigenLayer",
    "symbol": "EIGEN",
    "logo": "https://assets.coingecko.com/coins/images/33799/thumb/eigen.png",
    "type": "Pre-Market",
    "price": "3.25",
    "currency": "USDC",
    "chain": "Ethereum",
    "status": "active",
    "volume24h": "1250000",
    "totalOffers": 42,
    "expiry": "2025-03-15",
    "description": "EigenLayer is a restaking protocol built on Ethereum."
  }
]
```

### `portfolio.json`
```json
{
  "activeOrders": [
    {
      "id": "ord-1",
      "token": "EIGEN",
      "type": "Pre-Market",
      "amount": "500",
      "price": "3.25",
      "total": "1625",
      "status": "Pending",
      "date": "2025-02-20"
    }
  ],
  "history": []
}
```

---

## 8. Scoring Criteria

| Criteria | Points | How to score high |
|----------|--------|-------------------|
| **AI Utilization** | 30 | Iterate with AI multiple times, compelling AI Showcase with clear workflow |
| **Pixel Accuracy & FE Logic** | 25 | Dark theme layout accurate, filter/modal/toast all functional |
| **Completeness & Effort** | 20 | All 4 pages, full mock data, no empty placeholders |
| **Responsive & Interaction Polish** | 15 | Mobile responsive, hover states, smooth transitions |
| **Presentation** | 10 | Clear live demo, confident Q&A |
| **Total** | **100** | |

---

## 9. Quality Levels

### Minimum (everyone must reach)
- `npm run dev` runs without errors
- At least 3 pages render
- Navigation works between pages
- Dark theme layout visible

### Good
- All 4 pages implemented
- Search + filter tabs working
- BuyModal opens and auto-calculates total
- Toast notification on order confirm
- Basic mobile responsive

### Excellent
- Smooth transitions and animations
- ConnectWalletModal
- Portfolio cancel order removes from list
- Hover states on all cards and buttons
- Zero console errors

---

## 10. Pre-Presentation Checklist

- [ ] `npm run dev` runs without errors
- [ ] 4 pages render, routing works
- [ ] Real-time search works on Marketplace
- [ ] Filter tabs work
- [ ] BuyModal opens/closes, total auto-calculates
- [ ] Toast appears on order confirm
- [ ] Cancel order removes item from Portfolio list
- [ ] Mock data fully displayed — no empty placeholders
- [ ] GitHub repo is public and link sent to Telegram
- [ ] Code pushed at end of Day 1, 2, 3
- [ ] AI Showcase: 3–5 examples in `ai-showcase/`
- [ ] No console errors

---

## 11. Timeline

| Day | Goal |
|-----|------|
| **Day 1** | Install deps + setup routing + create mock data + Navbar/Footer |
| **Day 2** | Home page + Marketplace (search/filter) + ListingCard component |
| **Day 3** | ListingDetail + BuyModal + Portfolio + responsive polish |
| **Day 4** | Live demo + AI Showcase presentation |
