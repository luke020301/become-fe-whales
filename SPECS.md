# SPECS: Whales Market — React App (Become FE)

> **For AI tools (Antigravity / Cursor / Claude Code)**
> Build a React app from the Whales Market Figma design. No backend required — all data uses mocks (JSON/hardcode).

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
| AI Tools | Antigravity / Cursor / Claude Code |

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
├── ai-showcase/        # Screenshots of good AI prompts (min 3–5)
├── README.md
└── package.json
```

### Setup Commands

```bash
npm create vite@latest become-fe-whales -- --template react-ts
cd become-fe-whales
npm install
npm install react-router-dom
npm run dev
```

---

## 2. Pages & Components

### 2.1 Page List

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page introducing the platform |
| `/marketplace` | Marketplace | Filterable listing grid |
| `/listing/:id` | Listing Detail | Single listing with buy/sell action |
| `/portfolio` | Portfolio | User asset overview + transaction history |
| `/profile` | Profile | User info + settings |
| `/create` | Create Listing | Form to create a new listing |

---

### 2.2 Shared Components

#### `<Navbar />`
- Logo on left
- Nav links: Home / Marketplace / Portfolio
- "Connect Wallet" button on right — mock, no real wallet needed
- Mobile: hamburger menu

#### `<Button />`
```tsx
// Props: variant ("primary" | "secondary" | "ghost")
//        size ("sm" | "md" | "lg")
//        onClick, disabled, children
```

#### `<Card />`
- Container with border-radius, dark background, padding
- Used for listing cards, portfolio items, stat summaries

#### `<Badge />`
- Status pill: Active / Pending / Completed / Cancelled / Pre-Market / OTC
- Each status has a distinct color

#### `<Modal />`
```tsx
// Props: isOpen, onClose, title, children
// Close on overlay click or X button
```

#### `<Table />`
```tsx
// Props: columns, data
// Supports sorting by column
```

#### `<EmptyState />`
- Shown when no data matches filters
- Icon + message + optional CTA button

---

### 2.3 Page Details

#### `/` — Home

**Sections:**
- Hero: headline + subtext + "Explore Markets" button
- Stats bar: Total Volume / Active Listings / Supported Chains (hardcoded)
- Featured Listings: 3-card grid from mock data
- Footer: nav links + supported chains

**Interactions:**
- "Explore Markets" → navigate `/marketplace`
- Click listing card → navigate `/listing/:id`
- "Connect Wallet" → open `ConnectWalletModal` (mock)

---

#### `/marketplace` — Marketplace

**Layout:** Filter sidebar (left) + Listing grid (right)

**Filter Sidebar:**
- Filter by Type: All / Pre-Market / OTC / Points (tab/radio)
- Filter by Token: dropdown (ETH, BTC, SOL, BNB...)
- Filter by Price Range: min/max number inputs
- Filter by Status: Active / Completed / Pending (checkboxes)
- "Reset Filters" button

**Listing Grid:**
- 3-column (desktop), 1-column (mobile)
- Each card: token icon, name, price, amount, type badge, status, "View" button
- Sort bar: by Price / Volume / Date
- Result count: "Showing 12 of 20 listings"

**Interactions:**
- Change filter → instantly update list (filter mock data, no API)
- Sort → re-sort list
- Click card / "View" → navigate `/listing/:id`

---

#### `/listing/:id` — Listing Detail

**Layout:** 2 columns — listing info (left) + action panel (right)

**Listing Info (left):**
- Token name + icon + network badge
- Price, Amount, Total Value
- Type: Buy / Sell (colored badge)
- Status badge
- Seller: avatar placeholder + abbreviated wallet `0x1234...abcd`
- Created at, Expires at
- Tabs: Overview / Offers / Activity

**Action Panel (right):**
- "Buy Now" button → opens `BuyModal`
- Amount input + auto-calculated Total = amount × price (readonly)

**BuyModal:**
- Transaction summary
- "Cancel" + "Confirm" buttons
- Confirm → success toast "Order placed!" + modal closes

**Interactions:**
- Tab switch → renders correct tab content
- "Buy Now" → open modal
- Typing amount → total auto-updates
- Confirm → dismiss modal + show toast
- Breadcrumb: Home > Markets > TOKEN_NAME

---

#### `/portfolio` — Portfolio

**Sections:**

*Stats Cards (top):*
- Total Value / Active Listings / Completed Trades / P&L (mock numbers)

*My Active Orders tab:*
- Table: Token | Type | Amount | Price | Status | Action
- "Cancel" on Active items → confirm modal → status becomes "Cancelled"

*Transaction History tab:*
- Table: Date | Token | Type | Amount | Price | Total | Status
- Sorted by date (newest first)

**Interactions:**
- Switch tab → display corresponding data
- Cancel order → confirm modal → item removed from Active list (local state)
- Click row → navigate `/listing/:id`

---

#### `/profile` — Profile

**Content:**
- Avatar (placeholder)
- Mock wallet address: `0xAbCd...1234`
- Username (editable)
- Join date
- Stats: Total Trades / Volume / Rating
- "Edit Profile" button → inline form or modal

**Interactions:**
- Edit → show form input → Save → update display (local state)

---

#### `/create` — Create Listing

**Form Fields:**
- Token: dropdown (ETH, BTC, SOL, BNB, USDT...)
- Type: Buy / Sell (toggle)
- Price per unit: number input (USD)
- Amount: number input
- Total Value: auto-calculated = Price × Amount (readonly)
- Expiry date: date picker
- Notes: textarea (optional)

**Validation:**
- Price and Amount required and > 0
- Expiry date cannot be in the past
- Inline error messages under fields

**Submit Flow:**
- "Create Listing" → validate → open preview modal
- Preview modal: listing summary → "Confirm & Submit"
- Submit → toast "Listing created!" → navigate `/marketplace`
- New listing appears at top of list

---

## 3. Mock Data

### `src/mock-data/listings.json` — 20 entries

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

> Create at least 20 listings with varied tokens, types (Pre-Market / OTC / Points), and statuses.

### `src/mock-data/portfolio.json`

```json
{
  "totalValue": 45230.50,
  "activeListings": 3,
  "completedTrades": 12,
  "pnl": 1230.00,
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

## 4. User Flows & Interactions

### Flow 1: Buy a Listing

```
/marketplace → [click card] → /listing/:id
→ [click "Buy Now"] → BuyModal opens
→ [enter amount] → total auto-updates
→ [click "Confirm"]
→ Toast "Order placed!" → modal closes
```

### Flow 2: Create a Listing

```
Navbar → [click "+ Create"] → /create
→ [fill form] → [validate on submit]
→ [click "Create Listing"] → preview modal
→ [click "Confirm & Submit"]
→ Toast "Listing created!" → redirect /marketplace
→ New listing appears at top
```

### Flow 3: Cancel an Order (Portfolio)

```
/portfolio → "Active Orders" tab
→ [click "Cancel"] on an order
→ Confirm modal "Cancel this order?"
→ [click "Yes, Cancel"]
→ Item removed from Active Orders list (local state)
```

### Flow 4: Filter Marketplace

```
/marketplace → filter sidebar
→ Select Type = "Pre-Market" → grid filters instantly
→ Select Token = "ETH" → additional filter applied
→ [click Reset] → full list restored
```

---

## 5. Design System

### Colors

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

### Typography
- Font: Inter (or match Figma)
- Heading: font-bold, text-white
- Body: font-normal, text-slate-400

### Responsive Breakpoints

| Viewport | Layout |
|----------|--------|
| Desktop ≥ 1280px | Full layout, 3-column grid, filter sidebar visible |
| Tablet 768–1279px | 2-column grid, sidebar collapses |
| Mobile < 768px | 1-column, stack layout, bottom nav |

### Interactive States (all required)

| State | Behavior |
|-------|----------|
| Hover | Visual feedback on cards, buttons, table rows |
| Loading | Spinner + `setTimeout` 1–2s mock delay |
| Empty | `<EmptyState />` when no data matches filter |
| Error | Inline error messages under form fields |

---

## 6. Scoring Criteria

| Criteria | Points | How to score high |
|----------|--------|-------------------|
| **AI Utilization** | 30 | Real workflow: prompt → review → feedback → iterate. Show the process in AI Showcase. |
| **Pixel Accuracy & FE Logic** | 25 | Layout matches Figma. Filter, modal, toast, search all functional. |
| **Completeness & Effort** | 20 | All pages built, full mock data, no empty placeholders. |
| **Responsive & Interaction** | 15 | Mobile works, hover states, smooth transitions. |
| **Presentation** | 10 | Clear live demo, confident Q&A. |
| **Total** | **100** | |

---

## 7. Timeline

| Day | Goal | Deadline |
|-----|------|----------|
| **Day 1** | Setup environment, init project with AI, explore Figma, create GitHub repo | End of day: `npm run dev` works + repo link in Telegram |
| **Day 2** | Build Home + Marketplace + routing + mock data | End of day: pages navigate + push to GitHub |
| **Day 3** | FE logic (filter, modal, toast, tabs) + pixel polish + responsive | End of day: functional app + push to GitHub |
| **Day 4** | Live presentation + AI Showcase + Q&A | App ready before presenting |

---

## 8. AI Showcase Guide

Judges want to see **how** you used AI, not just the result.

**Prepare (min 3–5 examples):**
- Screenshot or link of your first prompt to set up the project
- How you described the Figma design to AI
- How you iterated: feedback → AI fixes → better result
- A moment where AI unblocked a hard problem
- Your workflow combining Figma MCP + AI tool

> Score higher for asking the right questions and iterating — not copy-pasting a single prompt.

---

## 9. Pre-Presentation Checklist

- [ ] `npm run dev` runs without errors
- [ ] All routes navigate correctly
- [ ] No dead buttons/links — every action has a response
- [ ] Mock data fully displayed — no empty placeholders
- [ ] Marketplace filter + sort work
- [ ] `BuyModal` opens, total auto-calculates, confirm shows toast
- [ ] Create Listing form validates + submits
- [ ] Portfolio tabs switch, cancel order removes item
- [ ] Figma vs browser comparison looks accurate
- [ ] GitHub repo is public + link sent to Telegram
- [ ] Code pushed at end of Day 1, 2, 3
- [ ] AI Showcase: 3–5 screenshots or conversation links ready
- [ ] Mobile responsive (no layout breaks)
- [ ] Zero console errors

---

*Become FE — Cook Series — Build with AI, ship like a pro.*
