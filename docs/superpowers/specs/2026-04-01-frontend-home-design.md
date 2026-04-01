# Frontend Home Page — Design Spec
**Date:** 2026-04-01
**Project:** Portal do Apostador — `gamblerhub/frontend`

---

## Overview

Implement the home page (`/`) of the Portal do Apostador frontend using Next.js 16 App Router, tRPC v11, React Query (TanStack Query v5), shadcn/ui, and Tailwind v4. Data is sourced from Strapi v5 (`match-picks` collection) via a typed tRPC layer. The page uses ISR with 1-hour revalidation.

Reference design: Stitch project `3414455881543528869`, screen `c5a1e46f730047d78603865ec3ab4d6f` ("Home - Portal do Apostador (Sincero)").

---

## Design System

Matches the Stitch "Precision Intelligence Framework" exactly:

- **Background:** `#060e20` (surface)
- **Primary:** `#53ddfc` (electric cyan) — headlines, CTAs, AI highlights
- **Secondary:** `#69f6b8` (emerald green) — confidence/success indicators
- **Surface layers:** `#091328` → `#0f1930` → `#141f38` → `#192540` (tonal elevation)
- **Text:** `#dee5ff` (on-surface), `#a3aac4` (on-surface-variant)
- **Fonts:** Space Grotesk (headlines), Inter (body/labels)
- **Borders:** no solid 1px dividers — use tonal shifts and `outline-variant` at low opacity
- **Glass cards:** `rgba(15,25,48,0.6)` background + `backdrop-blur: 12px`

All tokens go into `globals.css` as CSS custom properties and are referenced in `tailwind.config.ts`. shadcn components inherit these automatically.

---

## Architecture

### Data flow

```
Strapi v5 REST API
  └── lib/strapi.ts          (raw typed fetch, revalidate: 3600)
        └── server/api/routers/match-picks.ts  (tRPC procedures)
              ├── RSC pages  (server-side direct call, no HTTP)
              └── Client components  (trpc.matchPicks.useQuery())
```

### File structure

```
src/
  app/
    layout.tsx                      # root layout: fonts, dark class, Navbar + Footer
    page.tsx                        # home RSC — fetches picks server-side via tRPC
    globals.css                     # design tokens as CSS custom properties
    api/trpc/[trpc]/route.ts        # tRPC HTTP handler (for client-side calls)
  server/
    api/
      trpc.ts                       # tRPC init + context (no auth yet)
      root.ts                       # AppRouter — merges all sub-routers
      routers/
        match-picks.ts              # getAll, getBySlug procedures
  lib/
    strapi.ts                       # Strapi REST client — MatchPick type + fetch fns
    trpc/
      client.ts                     # createTRPCClient for RSC / server usage
      react.tsx                     # createTRPCReact — hook factory for client components
  components/
    providers.tsx                   # TRPCProvider + QueryClientProvider wrapper
    navbar.tsx                      # fixed top bar — wordmark only
    hero.tsx                        # featured match section
    match-card.tsx                  # single match card
    trust-section.tsx               # static "Por que confiar" block
    footer.tsx                      # static footer with compliance disclaimer
```

### Key packages

| Package | Purpose |
|---|---|
| `@trpc/server` `@trpc/client` | tRPC core |
| `@trpc/react-query` | React Query integration |
| `@tanstack/react-query` | Client-side caching + future mutations |
| `zod` | Input validation on tRPC procedures |
| `superjson` | Serialization (dates, etc.) |
| shadcn/ui | `Button`, `Badge`, `Card`, `Progress` primitives |

---

## Components

### Navbar
- Fixed, full-width, `z-50`
- Background: `surface` (`#060e20`) with `border-b border-outline-variant/10`
- Content: `Portal do Apostador` wordmark — Space Grotesk bold, cyan, uppercase, tracking-tighter
- **No nav links** — other pages do not exist yet

### Hero
- Full-width section, min-height ~700px, dark gradient background (no external images)
- **Left (7/12 cols):** tournament badge pill, large headline `HOME vs AWAY` (Space Grotesk, 5xl–7xl, tracking-tighter), subtext about the match, disabled CTA button
- **Right (5/12 cols):** glassmorphism card containing:
  - Team name left vs team name right
  - "Power Index" label in secondary green
  - Top featured market label (e.g., `MATCH_TOTAL_FOULS OVER 26.5`)
  - Bookmaker odd
  - Confidence bar: `prob_model * 100`%  width, secondary green fill
- **Data source:** match-pick with the highest approved `edge` among today's featured bets (filtered by `match_date` ≥ today 00:00 UTC)
- If no picks exist today, hero renders a static placeholder state

### Match Card (`MatchCard`)
Props: `matchPick: MatchPick`

Structure:
- Header row: `tournament` (font-mono, xs) + badge if any `featured=true` bets exist ("AI Hot Tip" in secondary)
- Teams row: `home_team` × `away_team`, bold, centered
- Insight block: best featured market by edge — `market_name` + `bookmaker_odd` + confidence bar
- Footer: "Análise Completa" `Button` — disabled, links to `/partidas/[slug]` (page not yet built)

### "Partidas do Dia" grid
- Section heading: "Partidas do Dia" + subtitle
- "Ver Calendário Completo" link — disabled for now
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Renders one `MatchCard` per match-pick returned from `matchPicks.getAll`
- Picks filtered to today's date, sorted by `match_date` ascending

### Trust Section (static)
Three columns: Data-driven · Transparent Methodology · Secure. Icons from Material Symbols. No dynamic data.

### Footer (static)
- Portal do Apostador wordmark
- Copyright line
- Responsible gambling disclaimer (small, muted)
- Compliance links: Gambling Therapy, CONAR, +18

---

## Data types

```ts
// lib/strapi.ts
export type ValueBet = {
  id: number
  market_name: string
  line: number
  side: 'over' | 'under'
  bookmaker_odd: number
  edge: number
  kelly_fraction: number
  prob_model: number
  approved: boolean
  featured: boolean
}

export type MatchPick = {
  id: number
  documentId: string
  event_id: string
  home_team: string
  away_team: string
  tournament: string
  match_date: string   // ISO datetime
  slug: string
  markets: ValueBet[]
}
```

---

## tRPC procedures

**`matchPicks.getAll`**
- No input
- Fetches all published match-picks from Strapi, populated with `markets`
- Filtered to picks where `match_date` ≥ today (done in Strapi query)
- Sorted by `match_date` ascending
- Returns `MatchPick[]`

**`matchPicks.getBySlug`** (stub — needed later for detail page)
- Input: `z.object({ slug: z.string() })`
- Returns single `MatchPick | null`

---

## Environment variables

```
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=<token from Strapi admin>
```

Both are server-only — used exclusively in `lib/strapi.ts`, never exposed to the browser. No `NEXT_PUBLIC_` prefix needed.

---

## Out of scope

- Auth / user accounts
- Match detail page (`/partidas/[slug]`)
- Calendar page
- Match result tracking / ROI history
- Mobile responsive polish (basic responsiveness only)
