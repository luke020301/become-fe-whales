# SPECS — BECOME FE: Whales Market (React + Tailwind)

> **Cuộc thi nội bộ — Cook Series** | Supervisor: Lucas (CTO)
> Tài liệu nội bộ — không chia sẻ ra bên ngoài.

---

## 1. Mục tiêu

Chuyển đổi design Figma của **Whales Market** thành một web app React chạy được thật — nhiều trang, có điều hướng, có logic tương tác FE, hiển thị mock data. **Không cần backend.**

Tiêu chí thành công: BGK có thể ngồi thao tác trực tiếp trên app — navigate các trang, bấm nút, filter, search — mọi thứ đều có phản hồi. Không có "nút chết".

---

## 2. Stack kỹ thuật bắt buộc

| Thành phần | Yêu cầu |
|-----------|---------|
| Framework | **React** (Vite template) |
| Styling | **Tailwind CSS** |
| Routing | React Router v6 (hoặc tương đương) |
| Language | TypeScript (khuyến nghị) hoặc JavaScript |
| Dev server | `npm run dev` → mở trên browser |
| Data | Mock data JSON/hardcode — không cần API thật |

---

## 3. Các trang (Pages) cần xây dựng

### 3.1 Trang bắt buộc (Minimum)

| # | Trang | Route | Mô tả |
|---|-------|-------|-------|
| 1 | **Landing / Home** | `/` | Trang chào mừng, hero section, featured markets |
| 2 | **Markets** | `/markets` | Danh sách tất cả pre-market tokens, filter/search |
| 3 | **Market Detail** | `/markets/:id` | Chi tiết một token — giá, orderbook, thông tin |

### 3.2 Trang nên có (Good → Excellent)

| # | Trang | Route | Mô tả |
|---|-------|-------|-------|
| 4 | **Portfolio / Dashboard** | `/portfolio` | Tổng quan tài sản người dùng, orders, P&L |
| 5 | **Points / Leaderboard** | `/points` | Bảng xếp hạng điểm thưởng, ranking người dùng |
| 6 | **Trade** | `/trade/:id` | Form mua/bán, đặt lệnh, chọn amount |

---

## 4. Chi tiết tính năng từng trang

### 4.1 Landing / Home (`/`)

**Layout:**
- Navbar: logo, menu links, connect wallet button (mock)
- Hero section: headline, subtext, CTA button "Explore Markets"
- Featured Markets: grid/list hiển thị 3–6 token nổi bật (mock data)
- Stats section: Total Volume, Active Markets, số lượng traders (mock numbers)
- Footer: links, social icons

**Interactions:**
- [ ] CTA button → navigate to `/markets`
- [ ] Click vào featured market card → navigate to `/markets/:id`
- [ ] Connect Wallet button → mở modal (mock, không cần wallet thật)
- [ ] Navbar links → navigate đúng page

**Mock data cần:**
```json
{
  "featuredMarkets": [
    { "id": "1", "name": "TOKEN_A", "price": "0.045 USDC", "change": "+12.5%", "volume": "2.3M" }
  ],
  "stats": { "totalVolume": "$45.2M", "activeMarkets": 48, "traders": "12,400" }
}
```

---

### 4.2 Markets (`/markets`)

**Layout:**
- Header: tiêu đề, số lượng markets
- Search bar: tìm kiếm theo tên token
- Filter bar: All / Active / Upcoming / Ended (tabs hoặc dropdown)
- Sort: Price, Volume, Change (dropdown hoặc column header click)
- Market list/grid: cards hoặc table rows
- Pagination hoặc "Load more" (nếu nhiều items)

**Market Card gồm:**
- Token logo + tên
- Giá hiện tại
- % thay đổi (xanh/đỏ)
- Volume 24h
- Trạng thái: Active / Upcoming / Ended
- Button "Trade" → navigate to `/trade/:id`

**Interactions:**
- [ ] Search → filter danh sách theo tên token (real-time)
- [ ] Filter tabs (All/Active/Upcoming/Ended) → filter danh sách
- [ ] Sort dropdown → sắp xếp danh sách
- [ ] Click card → navigate to `/markets/:id`
- [ ] Click "Trade" → navigate to `/trade/:id`

**Mock data cần:**
```json
[
  {
    "id": "1",
    "name": "EIGEN",
    "symbol": "EIGEN",
    "logo": "/logos/eigen.png",
    "price": "0.045",
    "currency": "USDC",
    "change24h": "+12.5",
    "volume24h": "2300000",
    "status": "active",
    "totalSupply": "1000000000"
  }
]
```

---

### 4.3 Market Detail (`/markets/:id`)

**Layout:**
- Breadcrumb: Home > Markets > TOKEN_NAME
- Token header: logo, tên, giá, % change, volume
- Tabs: Overview / Orderbook / Trades / Info
- **Tab Overview:** price chart area (mock static chart hoặc simple bars), key stats
- **Tab Orderbook:** bảng Buy orders và Sell orders (mock data)
- **Tab Trades:** lịch sử giao dịch gần đây (mock data)
- **Tab Info:** mô tả token, tokenomics, links
- Sidebar (desktop): quick trade widget

**Orderbook Mock:**
```json
{
  "bids": [
    { "price": "0.044", "amount": "5000", "total": "220" }
  ],
  "asks": [
    { "price": "0.046", "amount": "3200", "total": "147.2" }
  ]
}
```

**Interactions:**
- [ ] Tabs switch → hiển thị đúng nội dung tab
- [ ] "Buy" / "Sell" button trong sidebar → navigate to `/trade/:id` hoặc mở modal
- [ ] Breadcrumb links → navigate đúng

---

### 4.4 Portfolio / Dashboard (`/portfolio`)

**Layout:**
- Summary cards: Total Value, Total P&L, Active Orders
- Tabs: Holdings / Open Orders / Order History
- **Holdings tab:** bảng các token đang giữ (mock)
- **Open Orders tab:** bảng lệnh đang chờ khớp (mock)
- **Order History tab:** lịch sử lệnh đã thực hiện (mock)

**Interactions:**
- [ ] Tab switch → đổi nội dung bảng
- [ ] "Cancel Order" button → xóa item khỏi Open Orders list (state update)
- [ ] Click token name → navigate to `/markets/:id`

---

### 4.5 Points / Leaderboard (`/points`)

**Layout:**
- Header: Your Points, Your Rank
- Leaderboard table: rank, avatar, address (short), points, volume
- Pagination: 10–20 rows/page

**Interactions:**
- [ ] Pagination → đổi trang danh sách
- [ ] Hiển thị highlight row của "current user" (mock)

---

### 4.6 Trade (`/trade/:id`)

**Layout:**
- Token info header
- Buy / Sell toggle tabs
- Form: Amount input, Price input (limit/market toggle), Total tự tính
- Submit button: "Place Buy Order" / "Place Sell Order"
- Recent trades sidebar

**Interactions:**
- [ ] Buy/Sell toggle → đổi màu form (xanh/đỏ) và label button
- [ ] Amount input + Price input → tự tính Total
- [ ] Limit/Market toggle → ẩn/hiện Price input field
- [ ] Submit button → hiện toast notification "Order placed!" (mock, không gửi API)
- [ ] Form validation: không cho submit khi amount = 0 hoặc rỗng

---

## 5. Components tái sử dụng

| Component | Mô tả |
|-----------|-------|
| `Navbar` | Logo + links + Connect Wallet button |
| `Footer` | Links + socials |
| `MarketCard` | Card hiển thị token info |
| `TokenBadge` | Logo + symbol nhỏ |
| `PriceTag` | Giá + màu xanh/đỏ theo % change |
| `StatusBadge` | Active / Upcoming / Ended pill |
| `DataTable` | Bảng dữ liệu tái sử dụng (orderbook, history) |
| `Modal` | Overlay modal (Connect Wallet, confirm, ...) |
| `Toast` | Thông báo tạm thời (order placed, error) |
| `SearchInput` | Input tìm kiếm với icon |
| `FilterTabs` | Row các tab filter |
| `Skeleton` | Loading placeholder (nếu muốn polish) |

---

## 6. Cấu trúc thư mục

```
src/
├── pages/
│   ├── Home.tsx
│   ├── Markets.tsx
│   ├── MarketDetail.tsx
│   ├── Portfolio.tsx
│   ├── Points.tsx
│   └── Trade.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MarketCard.tsx
│   ├── Modal.tsx
│   ├── Toast.tsx
│   └── ...
├── mock-data/
│   ├── markets.json
│   ├── orderbook.json
│   ├── trades.json
│   ├── portfolio.json
│   └── leaderboard.json
├── App.tsx          ← routing
├── main.tsx
└── index.css        ← Tailwind directives

public/
└── logos/           ← token logos

ai-showcase/
└── *.png            ← screenshot các prompt AI hay
```

---

## 7. Yêu cầu visual (Pixel Accuracy)

- Layout khớp Figma: grid, spacing, padding, margin
- Typography đúng: font-size, font-weight, line-height
- Colors đúng: primary, secondary, success (xanh), danger (đỏ), background, border
- Responsive: desktop (1280px+) và mobile (375px) — ít nhất desktop phải đúng
- Hover states: buttons, links, cards phải có hover effect
- Transitions: mượt khi switch tab, mở modal

---

## 8. Tiêu chí chấm điểm

| Tiêu chí | Điểm | Cách đạt điểm cao |
|----------|------|------------------|
| **Khả năng tận dụng AI** | 30 | Show workflow tư duy cùng AI, iterate nhiều lần, AI Showcase thuyết phục |
| **Pixel Accuracy & Logic FE** | 25 | Layout khớp Figma, filter/search/modal/tab hoạt động, mock data đúng |
| **Hoàn thiện & Nhiệt huyết** | 20 | Càng nhiều pages + features đúng scope càng cao điểm |
| **Responsive & Interaction Polish** | 15 | Mobile responsive, hover states, animation, transition |
| **Trình bày** | 10 | Present rõ, demo mượt, trả lời Q&A tự tin |
| **Tổng** | **100** | |

---

## 9. Mức độ hoàn thiện

### Minimum (bắt buộc mọi người phải đạt)
- `npm run dev` chạy không lỗi
- Ít nhất 3 pages render được
- Navigate giữa các trang hoạt động
- Layout desktop gần đúng Figma
- Không có nút chết — bấm phải có phản hồi

### Good
- Pixel-accurate với Figma
- Search và filter hoạt động
- Ít nhất 1 modal
- Mock data hiển thị đúng
- Responsive mobile cơ bản

### Excellent
- Tất cả 6 pages đầy đủ tính năng
- Smooth transitions/animations
- Toast notifications hoạt động
- Form validation
- Responsive hoàn chỉnh cả desktop lẫn mobile
- Gần như dùng được thật (chỉ thiếu BE)

---

## 10. AI Showcase — Cần chuẩn bị

Tối thiểu **3–5 ví dụ** gồm:

1. **Setup prompt** — nhờ AI khởi tạo project React + Tailwind + React Router
2. **Figma → Component** — cách mô tả design Figma cho AI viết component
3. **Iterate loop** — feedback → AI sửa → kết quả tốt hơn (show before/after)
4. **Bug fix** — AI giúp giải quyết 1 vấn đề layout/logic khó
5. **Workflow** — Figma MCP + AI tool phối hợp như thế nào

Lưu screenshot vào thư mục `ai-showcase/`.

---

## 11. Deliverables khi present

- [ ] `npm run dev` chạy không lỗi, browser hiện app
- [ ] Ít nhất 3 pages, navigate hoạt động
- [ ] Không có nút chết — click đều có phản hồi
- [ ] Mock data hiển thị, không có placeholder rỗng
- [ ] Ít nhất 1 filter/search hoạt động
- [ ] Ít nhất 1 modal hoạt động
- [ ] So sánh Figma vs browser sẵn sàng
- [ ] GitHub repo public, link đã gửi vào Telegram
- [ ] Push code cuối ngày 1, 2, 3
- [ ] AI Showcase 3–5 ví dụ sẵn sàng
- [ ] Không có lỗi console trong browser

---

## 12. Timeline

| Ngày | Mục tiêu cuối ngày |
|------|-------------------|
| **Day 1** | Project khởi chạy (`npm run dev` OK) + repo GitHub public + link gửi vào group |
| **Day 2** | Các pages chính chạy + routing + mock data hiển thị + push GitHub |
| **Day 3** | Filter/search/modal/tab hoạt động + pixel accuracy + responsive + push GitHub |
| **Day 4** | Demo live trước BGK + AI Showcase + Q&A |

---

## 13. Tài nguyên

- **Figma design:** Whales Market (xem link được cấp từ Ban Tổ chức)
- **AI Tools:** Antigravity / Cursor / Claude Code (credit được cấp theo yêu cầu)
- **Figma MCP:** kết nối AI tool đọc trực tiếp design từ Figma
- **Hỗ trợ kỹ thuật:** Lucas (CTO) — DM Telegram
- **Hỗ trợ AI Tool:** Arthur — DM Telegram
- **Hỗ trợ Product/UX:** Akemi — DM Telegram
