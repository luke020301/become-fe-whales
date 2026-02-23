# Project Spec — BECOME FE: Figma to Live Code (Whales Market)

## 1) Overview
**Goal:** Convert the Whales Market Figma design into a real, runnable **React + Tailwind** web app using AI-assisted coding. The app must have **multiple pages**, **routing/navigation**, **interactive front-end logic**, and **mock data**. No backend required. :contentReference[oaicite:1]{index=1}

This is a build-an-app exercise (not static HTML screenshots). Any button/link that does nothing is considered not passing minimum requirements. :contentReference[oaicite:2]{index=2}

## 2) In Scope
### 2.1 Mandatory Technical Requirements
- React
- Tailwind CSS :contentReference[oaicite:3]{index=3}
- Local runnable dev flow: `npm run dev` starts the app and opens in browser :contentReference[oaicite:4]{index=4}

### 2.2 Mandatory Product Requirements
- Multiple pages (at least 3 recommended) :contentReference[oaicite:5]{index=5}
- Routing/navigation between pages (React Router or equivalent) :contentReference[oaicite:6]{index=6}
- Interactive FE logic works:
  - click handlers (buttons/links)
  - filters/toggles/tabs/modals
  - form inputs
  - search/sort (at least one) :contentReference[oaicite:7]{index=7}
- Data displayed via mock data (JSON/hardcode), no real API required :contentReference[oaicite:8]{index=8}

### 2.3 Visual Requirements
- Pixel-accuracy compared to Figma:
  - layout
  - spacing
  - typography
  - colors
  - responsive behavior :contentReference[oaicite:9]{index=9}

## 3) Out of Scope
- Backend services, databases, auth server, real trading logic
- Real API integration (optional; not required)
- Production deployment (optional; local demo is required)

## 4) Deliverables (What must be submitted)
### 4.1 Live Demo App (Local)
- App runs locally: `npm run dev`
- Browser shows the app
- Multiple pages render and navigation works
- No “dead” UI: clicking must produce an action (navigate, open modal, toggle, filter, etc.)
- Mock data displays correctly
- Judges can interact directly during demo :contentReference[oaicite:10]{index=10}

### 4.2 Figma vs Output Comparison
- Present with Figma side-by-side (left) and browser (right)
- Judges assess pixel accuracy and responsive behavior :contentReference[oaicite:11]{index=11}

### 4.3 AI Showcase (Minimum 3–5 examples)
Provide screenshots or links of your best AI prompts/conversations showing:
- environment/project setup prompt
- converting Figma → React components
- iteration loop: feedback → AI fix → improved result
- AI solving a difficult bug/layout issue
- workflow and tool usage (Antigravity/Cursor/Claude Code + optionally Figma MCP) :contentReference[oaicite:12]{index=12}

## 5) Quality Bar (Rubric Levels)
### 5.1 Minimum (Everyone must reach)
- Multiple pages
- Routing works
- Layout is close to Figma (desktop view)
- App runs locally and is demo-able :contentReference[oaicite:13]{index=13}

### 5.2 Good
- Pixel-accurate UI
- Functional interactions (filter/toggle/modal/tab)
- Mock data correct
- Mobile responsive :contentReference[oaicite:14]{index=14}

### 5.3 Excellent
- Complete flow like a real app
- Smooth transitions/animations
- Strong responsive behavior
- Nearly production-ready FE (still no BE) :contentReference[oaicite:15]{index=15}

## 6) Scoring Criteria
- AI utilization: 30
- Pixel accuracy & FE logic: 25
- Completeness & effort: 20
- Responsive & interaction polish: 15
- Presentation: 10 :contentReference[oaicite:16]{index=16}

## 7) Repository Requirements
- Public GitHub repository
- Push progress daily (Day 1–3) :contentReference[oaicite:17]{index=17}
- Suggested structure: :contentReference[oaicite:18]{index=18}
  - `src/pages/`
  - `src/components/`
  - `src/mock-data/`
  - `src/App.tsx` (routing)
  - `public/` (assets)
  - `ai-showcase/` (screenshots)

## 8) Timeline Expectations (4 days)
- Day 1: setup environment + repo + app runs locally :contentReference[oaicite:19]{index=19}
- Day 2: convert main pages + routing + mock data :contentReference[oaicite:20]{index=20}
- Day 3: polish pixel accuracy + add FE logic + responsive + prepare demo & AI showcase :contentReference[oaicite:21]{index=21}
- Day 4: presentation + live demo + Q&A :contentReference[oaicite:22]{index=22}

## 9) Pre-Presentation Checklist (Acceptance Criteria)
- [ ] `npm run dev` runs without errors and renders the app :contentReference[oaicite:23]{index=23}
- [ ] Multiple pages exist and navigation works :contentReference[oaicite:24]{index=24}
- [ ] No dead buttons/links; interactions produce feedback :contentReference[oaicite:25]{index=25}
- [ ] Mock data is displayed (no empty placeholders) :contentReference[oaicite:26]{index=26}
- [ ] FE logic works (filter/search/modal/tab/etc.) :contentReference[oaicite:27]{index=27}
- [ ] Figma vs browser comparison ready (layout/spacing/typography/colors) :contentReference[oaicite:28]{index=28}
- [ ] GitHub repo is public and link shared :contentReference[oaicite:29]{index=29}
- [ ] Daily pushes completed (Day 1–3) :contentReference[oaicite:30]{index=30}
- [ ] AI showcase prepared (3–5 strong examples) :contentReference[oaicite:31]{index=31}
- [ ] Responsive mobile behavior (if implemented) :contentReference[oaicite:32]{index=32}
- [ ] No browser console errors :contentReference[oaicite:33]{index=33}
- [ ] Ready to share screen and demo live :contentReference[oaicite:34]{index=34}