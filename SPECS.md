# SPECS: Whales Market — React App (Become FE)

> **For AI tools (Antigravity / Cursor / Claude Code)**
> Specifications for building a React app from the Whales Market Figma design.
> No backend required — all data uses mocks (JSON/hardcode).

---

## 1. Tech Stack & Setup

### Required Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v6 |
| State | useState / useContext (no Redux) |
| Mock Data | JSON files in `src/mock-data/` |
| Build tool | Vite |

### Project Structure

```
become-fe-whales/
├── src/
│   ├── pages/          # Each page is one .tsx file
│   ├── components/     # Shared components (Navbar, Button, Modal...)
│   ├── mock-data/      # JSON files for each entity
│   ├── hooks/          # Custom hooks if needed
│   └── App.tsx         # Routing config
├── public/
├── ai-showcase/        # Screenshots of good AI prompts
├── README.md
└── package.json
```

### Setup Commands

```bash
npm create vite@latest become-fe-whales -- --template react-ts
cd become-fe-whales
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install react-router-dom
npm run dev
```

### Tailwind Config (`tailwind.config.js`)

```js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

---

## 2. Pages & Components

### 2.1 Page List

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing / Home | Introduction to Whales Market |
| `/marketplace` | Marketplace | Listings for buying/selling |
| `/listing/:id` | Listing Detail | Single listing details |
| `/portfolio` | Portfolio / Dashboard | User asset overview |
| `/profile` | Profile | User information |
| `/create` | Create Listing | Form for new listings |

> ⚠️ Adjust routes if Figma design differs — ask AI to read Figma MCP for confirmation.

---

### 2.2 Shared Components

#### `<Navbar />`
- Logo Whales Market (left)
- Navigation links: Home / Marketplace / Portfolio
- Wallet connect button (right) — mock, no real wallet needed
- Mobile: hamburger menu

#### `<Button />`
```tsx
// Props: variant ("primary" | "secondary" | "ghost"), size ("sm" | "md" | "lg"),
// onClick, disabled, children
```

#### `<Card />`
- Container with border-radius, shadow, padding
- Used for listing cards, portfolio items

#### `<Badge />`
- Status badge: Active / Pending / Completed / Cancelled
- Colors match each status

#### `<Modal />`
- Overlay + centered container
- Props: isOpen, onClose, title, children
- Close on overlay click or X button

#### `<Table />`
- Sortable table for data lists
- Props: columns, data

#### `<EmptyState />`
- Display when no data exists
- Icon + message + optional CTA button

---

### 2.3 Page Details

#### `/` — Landing / Home

**Purpose:** Introduce the platform and drive users to the marketplace.

**Sections:**
- Hero: headline + subtext + "Go to Marketplace" button
- Stats bar: Total Volume / Active Listings / Traders (hardcoded numbers)
- Featured Listings: 3-card grid from mock data
- How it works: 3-step process with icons + text

**Interactions:**
- Click "Go to Marketplace" → navigate `/marketplace`
- Click listing card → navigate `/listing/:id`

---

#### `/marketplace` — Marketplace

**Purpose:** View and filter all listings.

**Layout:** Filter sidebar (left) + Listing grid (right)

**Filter Sidebar:**
- Filter by Type: All / Buy / Sell (radio/tab)
- Filter by Token: dropdown (mock: ETH, BTC, SOL, BNB...)
- Filter by Price Range: two number inputs (min/max)
- Filter by Status: Active / Completed / Pending (checkboxes)
- "Reset Filters" button

**Listing Grid:**
- 3-column grid (desktop), 1-column (mobile)
- Each card: token icon + name, price, amount, type badge (Buy/Sell), status, "View Detail" button
- Sort bar: Sort by Price / Volume / Date (dropdown)
- Result count: "Showing 12 of 48 listings"
- Pagination or "Load more" button

**Interactions:**
- Change filter → instantly update list (filter mock data)
- Sort → re-sort list
- Click card / "View Detail" → navigate `/listing/:id`

---

#### `/listing/:id` — Listing Detail

**Purpose:** View listing details and execute trades (mock).

**Layout:** 2 columns — listing info (left) + action panel (right)

**Listing Info (left):**
- Token name + icon + network badge
- Price, Amount, Total Value
- Type: Buy or Sell (colored badge)
- Status: Active / Completed...
- Seller info: avatar placeholder + abbreviated wallet (0x1234...abcd)
- Created at, Expires at
- Description / notes

**Action Panel (right):**
- If type = "Sell": "Buy Now" button → open confirm modal
- If type = "Buy": "Sell to This Order" button → open confirm modal
- Input for transaction amount (if partial fill allowed)
- Summary: you pay / receive amounts

**Confirm Modal:**
- Title "Confirm Transaction"
- Transaction summary
- 2 buttons: "Cancel" + "Confirm" (mock — shows "Transaction submitted!" toast)

**Interactions:**
- Click Buy/Sell → open modal
- Confirm modal → success toast + close modal
- Breadcrumb: Marketplace → Listing Detail

---

#### `/portfolio` — Portfolio / Dashboard

**Purpose:** View asset overview and transaction history.

**Sections:**

*Stats Cards (top):*
- Total Value (USD)
- Active Listings
- Completed Trades
- P&L (mock number)

*My Listings tab:*
- Table: Token | Type | Price | Amount | Status | Action
- Action: "Cancel" (for Active listings) → confirm modal → status update
- Filter tab: All / Active / Completed / Cancelled

*Transaction History tab:*
- Table: Date | Token | Type | Amount | Price | Total | Status
- Sort by Date (newest first by default)

**Interactions:**
- Switch tab → display corresponding data
- Cancel listing → confirm modal → status becomes "Cancelled"
- Click listing row → navigate `/listing/:id`

---

#### `/profile` — Profile

**Purpose:** User information page.

**Content:**
- Avatar (placeholder)
- Wallet address (mock: 0xAbCd...1234)
- Username (editable)
- Join date
- Stats: Total trades, Volume, Rating
- Edit Profile button → inline form or modal (username editable)

**Interactions:**
- Edit → show form input → Save → update display (local state)

---

#### `/create` — Create Listing

**Purpose:** Create a new listing.

**Form Fields:**
- Token: dropdown (ETH, BTC, SOL, BNB, USDT...)
- Type: Buy / Sell (toggle/radio)
- Price per unit: number input (USD)
- Amount: number input
- Total Value: auto-calculated = Price × Amount (readonly)
- Min fill amount: number input (optional)
- Expiry date: date picker
- Notes: textarea (optional)

**Validation:**
- Price, Amount required and > 0
- Expiry date cannot be in the past
- Show inline error messages under fields

**Submit:**
- "Create Listing" button → validate → if OK show preview modal
- Preview modal: listing summary → "Confirm & Submit"
- Submit → toast "Listing created!" → navigate `/marketplace`

---

## 3. Mock Data

### `src/mock-data/listings.json`

```json
[
  {
    "id": "1",
    "token": "ETH",
    "tokenIcon": "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    "network": "Ethereum",
    "type": "sell",
    "price": 2450.00,
    "amount": 5.5,
    "totalValue": 13475.00,
    "status": "active",
    "seller": "0xAbCd...1234",
    "createdAt": "2024-01-15T10:00:00Z",
    "expiresAt": "2024-02-15T10:00:00Z",
    "description": "Selling ETH at market price"
  }
]
```

> Create at least 20 listings with varied tokens, types, and statuses.

### `src/mock-data/transactions.json`

```json
[
  {
    "id": "tx1",
    "listingId": "1",
    "token": "ETH",
    "type": "buy",
    "amount": 1.0,
    "price": 2450.00,
    "total": 2450.00,
    "status": "completed",
    "date": "2024-01-16T14:30:00Z"
  }
]
```

### `src/mock-data/portfolio.json`

```json
{
  "totalValue": 45230.50,
  "activeListings": 3,
  "completedTrades": 12,
  "pnl": 1230.00,
  "assets": [
    { "token": "ETH", "amount": 2.5, "valueUSD": 6125.00 },
    { "token": "BTC", "amount": 0.1, "valueUSD": 4350.00 }
  ]
}
```

---

## 4. User Flows & Interactions

### Flow 1: Buy a Listing

```
Marketplace → [click card] → Listing Detail
→ [click "Buy Now"] → Confirm Modal appears
→ [enter amount] → [click Confirm]
→ Toast "Transaction submitted!" → Modal closes
→ Listing status changes to "Pending" (local state)
```

### Flow 2: Create a New Listing

```
Navbar → [click "+ Create"] → /create
→ [fill form] → [validate]
→ [click "Create Listing"] → Preview Modal
→ [click "Confirm & Submit"]
→ Toast "Listing created!" → redirect /marketplace
→ New listing appears at top of list
```

### Flow 3: Manage Listing (Portfolio)

```
/portfolio → "My Listings" tab
→ [click "Cancel"] on Active listing
→ Confirm modal "Cancel this listing?"
→ [click "Yes, Cancel"]
→ Status changes to "Cancelled" → row updates immediately
```

### Flow 4: Filter Marketplace

```
/marketplace → sidebar filter
→ Select Token = "ETH" → grid self-filters
→ Select Type = "Sell" → additional filtering
→ Drag price range → filter by price
→ [click Reset] → return to full list
```

---

## 5. UI / UX Guidelines

### Colors (from Whales Market Figma)

Use colors from Figma design. If no Figma MCP available, use these temporarily:

| Token | Value |
|-------|-------|
| Background | `#0A0B0D` (dark theme) |
| Card bg | `#13151A` |
| Border | `#1F2329` |
| Primary | `#0066FF` |
| Text primary | `#FFFFFF` |
| Text secondary | `#8A919E` |
| Success / Buy | `#22C55E` |
| Danger / Sell | `#EF4444` |

### Typography
- Font: Inter (or font from Figma)
- Heading: bold, white
- Body: regular, `text-secondary`

### Responsive

| Viewport | Layout |
|----------|--------|
| Desktop ≥ 1280px | Full layout, 3-column grid, sidebar visible |
| Tablet 768–1279px | Sidebar collapses, 2-column grid |
| Mobile < 768px | 1-column, bottom nav replaces sidebar |

### States Required

| State | Behavior |
|-------|----------|
| Hover | Visual feedback on buttons, cards, table rows |
| Loading | Spinner when "processing" (use setTimeout 1–2s mock) |
| Empty | `<EmptyState />` when no data |
| Error | Inline error messages under form fields |

---

## 6. Pre-Demo Checklist

- [ ] `npm run dev` runs without errors
- [ ] All routes navigate correctly
- [ ] No dead buttons/links — every action has a response
- [ ] Mock data fully displayed — no empty placeholders
- [ ] Filter/sort on Marketplace works
- [ ] Confirm modals work (open, close, submit)
- [ ] Toast notifications appear after actions
- [ ] Create Listing form has validation
- [ ] Portfolio tabs switch correctly
- [ ] Mobile responsive (no layout breaks)
- [ ] No console errors in browser
- [ ] AI Showcase: ≥3 screenshots of good prompts

---

*Built with AI — Become FE — Whales Market*
