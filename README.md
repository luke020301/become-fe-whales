# Whales Market — Frontend Clone

Convert the **Whales Market** Figma design into a fully runnable web app using **React + TypeScript + Tailwind CSS v4 + Vite**.

> This is a real app-building exercise — not static HTML. Every button/link must trigger a meaningful action.

## Tech Stack

| Layer     | Technology                 |
| --------- | -------------------------- |
| Framework | React 19 + TypeScript      |
| Styling   | Tailwind CSS 4             |
| Bundler   | Vite 7                     |
| Lint      | ESLint 9 + typescript-eslint |
| Data      | Mock data (JSON / hardcoded) |

## Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/become-fe-whales.git
cd become-fe-whales

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open your browser at `http://localhost:5173`.

## Project Structure

```
src/
├── pages/          # Main pages (≥ 3 pages)
├── components/     # Reusable components
├── mock-data/      # Mock/fake data
└── App.tsx         # Main routing
public/             # Static assets (images, icons)
ai-showcase/        # AI prompt screenshots & examples
```

## Key Features

- **Multi-page routing** — navigate between pages seamlessly
- **Interactive UI** — tabs, filters, modals, toggles, search/sort
- **Mock data** — displays hardcoded data, no backend required
- **Pixel-accurate** — closely matches the Figma design (layout, spacing, typography, colors)
- **Responsive** — supports both mobile & desktop

## Scripts

| Command            | Description           |
| ------------------ | --------------------- |
| `npm run dev`      | Start dev server      |
| `npm run build`    | Production build      |
| `npm run lint`     | Run linter            |
| `npm run preview`  | Preview production build |

## Scoring Criteria

| Criteria                         | Weight |
| -------------------------------- | ------ |
| AI utilization                   | 30%    |
| Pixel accuracy & FE logic        | 25%    |
| Completeness & effort            | 20%    |
| Responsive & interaction polish  | 15%    |
| Presentation                     | 10%    |

## License

Private project — for educational purposes only.
