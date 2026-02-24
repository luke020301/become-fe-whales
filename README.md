# Whales Market — Frontend Clone

Convert the **Whales Market** Figma design into a fully working React web app using AI tools.

> Not static HTML — every button and link must trigger a meaningful action. See [SPECS.md](./SPECS.md) for full details.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | React Router DOM v6 |
| Build tool | Vite |
| Data | Mock JSON — no backend required |

## Getting Started

```bash
git clone https://github.com/<your-username>/become-fe-whales.git
cd become-fe-whales
npm install
npm run dev
```

Open `http://localhost:5173`.

## Pages

| Route | Page |
|-------|------|
| `/` | Home |
| `/marketplace` | Marketplace |
| `/listing/:id` | Listing Detail |
| `/portfolio` | Portfolio |
| `/profile` | Profile |
| `/create` | Create Listing |

## Project Structure

```
src/
├── pages/          # One .tsx file per page
├── components/     # Shared components
├── mock-data/      # JSON mock data
└── App.tsx         # Routing
public/
ai-showcase/        # AI prompt screenshots (min 3–5)
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run linter |
| `npm run preview` | Preview production build |

---

*Become FE — Cook Series — Built with AI*
