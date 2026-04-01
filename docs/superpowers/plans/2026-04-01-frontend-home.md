# Frontend Home Page — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Portal do Apostador home page — a dark-themed betting analytics portal that fetches today's match picks from Strapi via tRPC and displays them in a glassmorphism hero + match card grid.

**Architecture:** Next.js 16 App Router with ISR (1h revalidation). tRPC v11 provides a typed API layer over Strapi CMS. Server components prefetch data via `createTRPCOptionsProxy`; client components hydrate via `useTRPC()` + `HydrationBoundary` with no visible loading states.

**Tech Stack:** Next.js 16, tRPC v11 + `@trpc/tanstack-react-query`, TanStack React Query v5, shadcn/ui (new-york style), Tailwind CSS v4, Zod, Space Grotesk + Inter fonts

**Spec:** `docs/superpowers/specs/2026-04-01-frontend-home-design.md`

---

## File Map

| File | Purpose |
|---|---|
| `src/app/globals.css` | Design tokens via `@theme inline`; replaces default scaffold |
| `src/app/layout.tsx` | Root layout: fonts, `dark` class, Navbar + Footer, TRPCReactProvider |
| `src/app/page.tsx` | Home RSC: prefetches picks server-side, wraps in HydrationBoundary |
| `src/app/api/trpc/[trpc]/route.ts` | tRPC HTTP handler for client-side calls |
| `src/server/api/trpc.ts` | `initTRPC`, `createTRPCContext`, router/procedure factories |
| `src/server/api/root.ts` | `AppRouter` merging all sub-routers |
| `src/server/api/routers/match-picks.ts` | `getAll`, `getBySlug` procedures |
| `src/lib/strapi.ts` | Strapi REST client: typed `MatchPick` types + fetch functions |
| `src/lib/format.ts` | Market name formatter (`MATCH_TOTAL_FOULS` → `"Total de Faltas"`) |
| `src/lib/trpc/query-client.ts` | `makeQueryClient` factory |
| `src/lib/trpc/server.ts` | `createTRPCOptionsProxy` for RSC; `getQueryClient` |
| `src/lib/trpc/client.tsx` | `TRPCReactProvider`, `useTRPC` export (client-only) |
| `src/components/navbar.tsx` | Fixed nav bar, wordmark only |
| `src/components/hero.tsx` | Featured match hero (client component) |
| `src/components/match-card.tsx` | Single match card, presentational |
| `src/components/match-grid.tsx` | "Partidas do Dia" section (client component) |
| `src/components/trust-section.tsx` | Static trust pillars |
| `src/components/footer.tsx` | Static footer with compliance disclaimer |
| `.env.local` | `STRAPI_URL` + `STRAPI_API_TOKEN` |

---

## Task 1: Install dependencies and create .env.local

**Files:**
- Modify: `package.json` (via pnpm add)
- Create: `.env.local`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd frontend
pnpm add @trpc/server @trpc/client @trpc/tanstack-react-query @tanstack/react-query zod server-only client-only
```

Expected: packages added, no peer dependency errors.

- [ ] **Step 2: Create .env.local**

```bash
cat > .env.local << 'EOF'
STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=f56ab3acf7595dfb7fba2c776d6e2d68e12a8acb75e8711cc47edc1ee79ccc001cea56828d3c3e58d732b4c70c650657fb471c9a5b8e25d2529236b34aecd76bf7aabb92e35111a671a0995355edd7a2e755c81c4fb1f36d32472a8fdfc2d1e820ee7ec9fcf904c8b40310b3bd531dc48884dc4c26a054f02fe99bb19beca94f
EOF
```

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: install tRPC, React Query, Zod deps"
```

---

## Task 2: Design tokens in globals.css

**Files:**
- Modify: `src/app/globals.css`

Replace the generated scaffold entirely. Tailwind v4 uses `@theme inline` inside CSS — no `tailwind.config.ts` needed.

- [ ] **Step 1: Replace globals.css**

```css
/* src/app/globals.css */
@import "tailwindcss";

/* ── Design tokens ─────────────────────────────────────────── */
:root {
  --background:                #060e20;
  --surface:                   #060e20;
  --surface-dim:               #060e20;
  --surface-container-lowest:  #000000;
  --surface-container-low:     #091328;
  --surface-container:         #0f1930;
  --surface-container-high:    #141f38;
  --surface-container-highest: #192540;
  --surface-bright:            #1f2b49;
  --surface-variant:           #192540;

  --on-surface:                #dee5ff;
  --on-surface-variant:        #a3aac4;
  --on-background:             #dee5ff;

  --primary:                   #53ddfc;
  --primary-dim:               #40ceed;
  --primary-container:         #21bedc;
  --on-primary:                #004b58;
  --on-primary-container:      #00343e;

  --secondary:                 #69f6b8;
  --secondary-dim:             #58e7ab;
  --secondary-container:       #006c49;
  --on-secondary:              #005a3c;
  --on-secondary-container:    #e1ffec;

  --outline:                   #6d758c;
  --outline-variant:           #40485d;

  --error:                     #ff716c;
  --error-container:           #9f0519;
}

/* ── Tailwind v4 theme registration ────────────────────────── */
@theme inline {
  /* Backgrounds */
  --color-background:                var(--background);
  --color-surface:                   var(--surface);
  --color-surface-dim:               var(--surface-dim);
  --color-surface-container-lowest:  var(--surface-container-lowest);
  --color-surface-container-low:     var(--surface-container-low);
  --color-surface-container:         var(--surface-container);
  --color-surface-container-high:    var(--surface-container-high);
  --color-surface-container-highest: var(--surface-container-highest);
  --color-surface-bright:            var(--surface-bright);
  --color-surface-variant:           var(--surface-variant);

  /* Text */
  --color-on-surface:                var(--on-surface);
  --color-on-surface-variant:        var(--on-surface-variant);
  --color-on-background:             var(--on-background);

  /* Primary (cyan) */
  --color-primary:                   var(--primary);
  --color-primary-dim:               var(--primary-dim);
  --color-primary-container:         var(--primary-container);
  --color-on-primary:                var(--on-primary);
  --color-on-primary-container:      var(--on-primary-container);

  /* Secondary (green) */
  --color-secondary:                 var(--secondary);
  --color-secondary-dim:             var(--secondary-dim);
  --color-secondary-container:       var(--secondary-container);
  --color-on-secondary:              var(--on-secondary);
  --color-on-secondary-container:    var(--on-secondary-container);

  /* Borders */
  --color-outline:                   var(--outline);
  --color-outline-variant:           var(--outline-variant);

  /* Error */
  --color-error:                     var(--error);
  --color-error-container:           var(--error-container);

  /* Fonts — variables injected by next/font into <html> */
  --font-headline: var(--font-space-grotesk), sans-serif;
  --font-body:     var(--font-inter), sans-serif;
}

/* ── Base ──────────────────────────────────────────────────── */
body {
  background-color: var(--background);
  color: var(--on-surface);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* ── Glass card utility ────────────────────────────────────── */
.glass-card {
  background: rgba(15, 25, 48, 0.6);
  backdrop-filter: blur(12px);
}

/* ── AI glow utility ───────────────────────────────────────── */
.ai-glow {
  background: radial-gradient(
    circle at center,
    rgba(83, 221, 252, 0.06) 0%,
    transparent 70%
  );
}
```

- [ ] **Step 2: Verify Tailwind parses tokens**

```bash
pnpm dev
```

Open `http://localhost:3000`. Background should be dark navy (`#060e20`), not white. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add design system tokens to globals.css"
```

---

## Task 3: Update layout.tsx with fonts and dark class

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Portal do Apostador',
  description: 'Análise preditiva de apostas esportivas baseada em dados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-on-surface font-body antialiased">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Verify**

```bash
pnpm dev
```

`localhost:3000` should show dark navy background with the default Next.js page content. Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: configure Space Grotesk + Inter fonts, dark layout"
```

---

## Task 4: Init shadcn and add UI primitives

**Files:**
- Create: `components.json`, `src/lib/utils.ts`, `src/components/ui/button.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/card.tsx`, `src/components/ui/progress.tsx`

- [ ] **Step 1: Run shadcn init**

```bash
pnpm dlx shadcn@latest init -d
```

When prompted (or via defaults `-d`):
- Style: new-york
- Base color: neutral
- CSS variables: yes

This creates `components.json` and `src/lib/utils.ts`. It will also modify `globals.css` — we'll overwrite it back in the next step.

- [ ] **Step 2: Restore our globals.css**

shadcn init may have inserted shadcn color vars into `globals.css`. Replace the entire file with the content from Task 2 again (the design token CSS above), but **add** this import at the top that shadcn needs:

```css
/* src/app/globals.css */
@import "tailwindcss";

/* shadcn base reset */
*, *::before, *::after { box-sizing: border-box; }

/* ── Design tokens ─────────────────────────────────────── */
/* ... (same as Task 2 — all :root vars and @theme inline) ... */
```

The full file is exactly the same as Task 2's content. No changes needed if shadcn didn't modify it.

- [ ] **Step 3: Add UI components**

```bash
pnpm dlx shadcn@latest add button badge card progress
```

- [ ] **Step 4: Commit**

```bash
git add components.json src/lib/utils.ts src/components/ui/
git commit -m "feat: init shadcn/ui, add Button, Badge, Card, Progress"
```

---

## Task 5: tRPC server infrastructure

**Files:**
- Create: `src/server/api/trpc.ts`
- Create: `src/server/api/root.ts`

- [ ] **Step 1: Create src/server/api/trpc.ts**

```typescript
// src/server/api/trpc.ts
import { initTRPC } from '@trpc/server'

const t = initTRPC.create()

export const createTRPCContext = () => ({})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
```

- [ ] **Step 2: Create src/server/api/root.ts** (stub — router added in Task 7)

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({})

export type AppRouter = typeof appRouter
```

- [ ] **Step 3: Commit**

```bash
git add src/server/
git commit -m "feat: scaffold tRPC server infrastructure"
```

---

## Task 6: Strapi client and types

**Files:**
- Create: `src/lib/strapi.ts`

- [ ] **Step 1: Create src/lib/strapi.ts**

```typescript
// src/lib/strapi.ts
import 'server-only'

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

// ── Types ───────────────────────────────────────────────────

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
  match_date: string
  slug: string
  markets: ValueBet[]
}

type StrapiList<T> = {
  data: T[]
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number }
  }
}

// ── Helpers ─────────────────────────────────────────────────

function headers(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  }
}

function todayISO(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

// ── Fetch functions ──────────────────────────────────────────

export async function fetchMatchPicks(): Promise<MatchPick[]> {
  const params = new URLSearchParams({
    populate: 'markets',
    'sort[0]': 'match_date:asc',
    'filters[match_date][$gte]': todayISO(),
    'filters[publishedAt][$notNull]': 'true',
  })

  const res = await fetch(`${STRAPI_URL}/api/match-picks?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Strapi fetchMatchPicks failed: ${res.status}`)

  const json: StrapiList<MatchPick> = await res.json()
  return json.data
}

export async function fetchMatchPickBySlug(slug: string): Promise<MatchPick | null> {
  const params = new URLSearchParams({
    populate: 'markets',
    'filters[slug][$eq]': slug,
  })

  const res = await fetch(`${STRAPI_URL}/api/match-picks?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Strapi fetchMatchPickBySlug failed: ${res.status}`)

  const json: StrapiList<MatchPick> = await res.json()
  return json.data[0] ?? null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/strapi.ts
git commit -m "feat: Strapi REST client with MatchPick types"
```

---

## Task 7: Match picks tRPC router

**Files:**
- Create: `src/server/api/routers/match-picks.ts`
- Modify: `src/server/api/root.ts`

- [ ] **Step 1: Create src/server/api/routers/match-picks.ts**

```typescript
// src/server/api/routers/match-picks.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { fetchMatchPicks, fetchMatchPickBySlug } from '@/lib/strapi'

export const matchPicksRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return fetchMatchPicks()
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return fetchMatchPickBySlug(input.slug)
    }),
})
```

- [ ] **Step 2: Register router in root.ts**

```typescript
// src/server/api/root.ts
import { createTRPCRouter } from './trpc'
import { matchPicksRouter } from './routers/match-picks'

export const appRouter = createTRPCRouter({
  matchPicks: matchPicksRouter,
})

export type AppRouter = typeof appRouter
```

- [ ] **Step 3: Commit**

```bash
git add src/server/api/routers/ src/server/api/root.ts
git commit -m "feat: matchPicks tRPC router (getAll, getBySlug)"
```

---

## Task 8: tRPC query client and server proxy

**Files:**
- Create: `src/lib/trpc/query-client.ts`
- Create: `src/lib/trpc/server.ts`

- [ ] **Step 1: Create src/lib/trpc/query-client.ts**

```typescript
// src/lib/trpc/query-client.ts
import {
  QueryClient,
  defaultShouldDehydrateQuery,
} from '@tanstack/react-query'

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
    },
  })
}
```

- [ ] **Step 2: Create src/lib/trpc/server.ts**

```typescript
// src/lib/trpc/server.ts
import 'server-only'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache } from 'react'
import { makeQueryClient } from './query-client'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
})
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/trpc/query-client.ts src/lib/trpc/server.ts
git commit -m "feat: tRPC query client factory and server RSC proxy"
```

---

## Task 9: tRPC React provider and HTTP handler

**Files:**
- Create: `src/lib/trpc/client.tsx`
- Create: `src/app/api/trpc/[trpc]/route.ts`

- [ ] **Step 1: Create src/lib/trpc/client.tsx**

```tsx
// src/lib/trpc/client.tsx
'use client'

import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink } from '@trpc/client'
import { createTRPCContext } from '@trpc/tanstack-react-query'
import { useState } from 'react'
import type { AppRouter } from '@/server/api/root'
import { makeQueryClient } from './query-client'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function TRPCReactProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [httpBatchLink({ url: '/api/trpc' })],
    }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Create src/app/api/trpc/[trpc]/route.ts**

```typescript
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  })

export { handler as GET, handler as POST }
```

- [ ] **Step 3: Add TRPCReactProvider to layout.tsx**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { TRPCReactProvider } from '@/lib/trpc/client'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Portal do Apostador',
  description: 'Análise preditiva de apostas esportivas baseada em dados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-on-surface font-body antialiased">
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: Smoke-test the tRPC layer**

```bash
pnpm dev
```

Visit `http://localhost:3000/api/trpc/matchPicks.getAll`. You should get a JSON response (array of picks from Strapi, or empty array). Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/lib/trpc/client.tsx src/app/api/ src/app/layout.tsx
git commit -m "feat: tRPC React provider, HTTP handler, wire into layout"
```

---

## Task 10: Market name formatter

**Files:**
- Create: `src/lib/format.ts`

- [ ] **Step 1: Create src/lib/format.ts**

```typescript
// src/lib/format.ts

const MARKET_LABELS: Record<string, string> = {
  MATCH_TOTAL_FOULS:      'Total de Faltas',
  MATCH_CARDS_OU:         'Cartões O/U',
  MATCH_CORNERS_OU:       'Escanteios O/U',
  TOTAL_GOALS_OVER_UNDER: 'Gols O/U',
  MATCH_TOTAL_SHOTS:      'Chutes O/U',
  MATCH_SOT_OU:           'Chutes a Gol O/U',
  MATCH_OFFSIDES_OU:      'Impedimentos O/U',
  MATCH_SAVES_OU:         'Defesas O/U',
  MATCH_WOODWORK_OU:      'Trave O/U',
  TEAM_TOTAL_FOULS:       'Faltas do Time',
  TEAM_TOTAL_SHOTS:       'Chutes do Time',
  TEAM_SOT_OU:            'Chutes a Gol do Time',
  TEAM_CORNERS_OU:        'Escanteios do Time',
  TEAM_CARDS_OU:          'Cartões do Time',
  TEAM_TOTAL_GOALS:       'Gols do Time',
}

const TOURNAMENT_LABELS: Record<string, string> = {
  BRASILEIRAO_SERIE_A: 'Brasileirão Série A',
  BRASILEIRAO_SERIE_B: 'Brasileirão Série B',
  PREMIER_LEAGUE:      'Premier League',
  LA_LIGA:             'La Liga',
  BUNDESLIGA:          'Bundesliga',
  SERIE_A:             'Serie A',
  CHAMPIONS_LEAGUE:    'Champions League',
}

/**
 * Formats a raw market name (e.g. "MATCH_TOTAL_FOULS [HOME]")
 * into a human-readable Portuguese label.
 */
export function formatMarketName(raw: string): string {
  // Strip team side suffix like " [HOME]" or " [AWAY]"
  const [base, side] = raw.split(' [')
  const label = MARKET_LABELS[base] ?? base.replace(/_/g, ' ').toLowerCase()
  if (side) {
    const teamSide = side.replace(']', '') === 'HOME' ? 'Casa' : 'Fora'
    return `${label} (${teamSide})`
  }
  return label
}

/** Returns a readable side label: "over X" or "under X" */
export function formatBetLine(side: 'over' | 'under', line: number): string {
  return `${side === 'over' ? 'Acima' : 'Abaixo'} de ${line}`
}

/** Formats tournament ID to display name */
export function formatTournament(id: string): string {
  return TOURNAMENT_LABELS[id] ?? id.replace(/_/g, ' ')
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/format.ts
git commit -m "feat: market name + tournament formatter helpers"
```

---

## Task 11: Navbar component

**Files:**
- Create: `src/components/navbar.tsx`

- [ ] **Step 1: Create src/components/navbar.tsx**

```tsx
// src/components/navbar.tsx
export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center">
        <span className="font-headline font-bold text-xl text-primary uppercase tracking-tighter">
          Portal do Apostador
        </span>
      </div>
    </nav>
  )
}
```

- [ ] **Step 2: Add Navbar to layout.tsx**

In `src/app/layout.tsx`, import Navbar and add it before `{children}`:

```tsx
import Navbar from '@/components/navbar'

// inside <body>:
<TRPCReactProvider>
  <Navbar />
  <main className="pt-16">{children}</main>
</TRPCReactProvider>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/navbar.tsx src/app/layout.tsx
git commit -m "feat: Navbar component, fixed top with wordmark"
```

---

## Task 12: MatchCard component

**Files:**
- Create: `src/components/match-card.tsx`

- [ ] **Step 1: Create src/components/match-card.tsx**

```tsx
// src/components/match-card.tsx
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatMarketName, formatBetLine, formatTournament } from '@/lib/format'
import type { MatchPick, ValueBet } from '@/lib/strapi'

function bestFeaturedBet(markets: ValueBet[]): ValueBet | undefined {
  return markets
    .filter((m) => m.featured && m.approved)
    .sort((a, b) => b.edge - a.edge)[0]
}

function matchTime(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

export default function MatchCard({ pick }: { pick: MatchPick }) {
  const bet = bestFeaturedBet(pick.markets)
  const confidence = bet ? Math.round(bet.prob_model * 100) : 0
  const hasFeatured = !!bet

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/5 hover:bg-surface-container transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <span className="text-xs font-mono text-on-surface-variant">
          {matchTime(pick.match_date)} · {formatTournament(pick.tournament)}
        </span>
        {hasFeatured && (
          <Badge className="text-[10px] font-bold uppercase tracking-tighter bg-secondary-container/20 text-secondary border border-secondary/20 px-2 py-0.5">
            AI Hot Tip
          </Badge>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
            <span className="text-xs font-bold text-on-surface-variant uppercase">
              {pick.home_team.slice(0, 3)}
            </span>
          </div>
          <span className="text-sm font-bold text-center">{pick.home_team}</span>
        </div>
        <span className="text-lg font-black text-outline-variant px-4">×</span>
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center">
            <span className="text-xs font-bold text-on-surface-variant uppercase">
              {pick.away_team.slice(0, 3)}
            </span>
          </div>
          <span className="text-sm font-bold text-center">{pick.away_team}</span>
        </div>
      </div>

      {/* AI Insight */}
      {bet ? (
        <div className="bg-surface-container-highest/50 rounded-xl p-4 mb-6 border-t border-primary/10">
          <p className="text-xs font-black uppercase text-on-surface-variant tracking-widest mb-1">
            IA Insight
          </p>
          <p className="text-sm font-semibold text-on-surface mb-3">
            {formatMarketName(bet.market_name)} — {formatBetLine(bet.side, bet.line)} @ {bet.bookmaker_odd.toFixed(2)}
          </p>
          <div className="flex justify-between text-xs text-on-surface-variant mb-1">
            <span>Confiança</span>
            <span className="text-secondary font-bold">{confidence}%</span>
          </div>
          <Progress
            value={confidence}
            className="h-1.5 bg-surface-container-highest [&>div]:bg-secondary"
          />
        </div>
      ) : (
        <div className="bg-surface-container-highest/30 rounded-xl p-4 mb-6">
          <p className="text-xs text-on-surface-variant text-center">Sem picks destacados</p>
        </div>
      )}

      {/* CTA */}
      <Button
        disabled
        variant="outline"
        className="w-full border-outline-variant/20 text-on-surface bg-surface-container-high hover:border-primary/40 text-sm"
      >
        Análise Completa
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/match-card.tsx
git commit -m "feat: MatchCard presentational component"
```

---

## Task 13: Hero component

**Files:**
- Create: `src/components/hero.tsx`

The hero is a client component. It reads the prefetched data via `useTRPC()` + `useSuspenseQuery`, picks the match with the highest approved featured edge, and renders it.

- [ ] **Step 1: Create src/components/hero.tsx**

```tsx
// src/components/hero.tsx
'use client'

import { useTRPC } from '@/lib/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Progress } from '@/components/ui/progress'
import { formatMarketName, formatBetLine, formatTournament } from '@/lib/format'
import type { MatchPick, ValueBet } from '@/lib/strapi'

function topFeaturedBet(pick: MatchPick): ValueBet | undefined {
  return pick.markets
    .filter((m) => m.featured && m.approved)
    .sort((a, b) => b.edge - a.edge)[0]
}

function featuredPick(picks: MatchPick[]): MatchPick | undefined {
  return [...picks]
    .filter((p) => p.markets.some((m) => m.featured && m.approved))
    .sort((a, b) => {
      const edgeA = topFeaturedBet(a)?.edge ?? 0
      const edgeB = topFeaturedBet(b)?.edge ?? 0
      return edgeB - edgeA
    })[0]
}

function HeroContent() {
  const trpc = useTRPC()
  const { data: picks } = useSuspenseQuery(trpc.matchPicks.getAll.queryOptions())

  const pick = featuredPick(picks)
  const bet = pick ? topFeaturedBet(pick) : undefined
  const confidence = bet ? Math.round(bet.prob_model * 100) : 0

  if (!pick) {
    return (
      <section className="relative w-full min-h-[500px] flex items-center justify-center px-6">
        <p className="text-on-surface-variant font-headline text-2xl">
          Nenhuma partida disponível hoje.
        </p>
      </section>
    )
  }

  return (
    <section className="relative w-full min-h-[700px] flex items-center justify-center overflow-hidden px-6">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-container-low to-surface pointer-events-none" />
      <div className="ai-glow absolute inset-0 pointer-events-none" />

      <div className="relative z-10 max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left: match info */}
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest border border-primary/20 mb-6">
            <span className="text-xs font-bold tracking-widest uppercase text-primary">
              {formatTournament(pick.tournament)}
            </span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-none">
            {pick.home_team}
            <br />
            <span className="text-primary">vs {pick.away_team}</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-xl mb-8 leading-relaxed">
            Análise baseada em modelos probabilísticos com dados históricos e tendências táticas.
          </p>
        </div>

        {/* Right: glass card */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-3xl p-8 border border-outline-variant/15 relative overflow-hidden">
            <div className="ai-glow absolute inset-0 pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-6">
              {/* Teams */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="text-sm font-bold text-on-surface uppercase">
                      {pick.home_team.slice(0, 3)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-on-surface uppercase">
                    {pick.home_team.split(' ')[0]}
                  </span>
                </div>
                <span className="text-2xl font-black text-on-surface-variant italic">VS</span>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                    <span className="text-sm font-bold text-on-surface uppercase">
                      {pick.away_team.slice(0, 3)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-on-surface uppercase">
                    {pick.away_team.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="h-px bg-outline-variant/20" />

              {/* Power Index */}
              <div className="text-center">
                <p className="text-3xl font-headline font-black text-secondary tracking-tighter uppercase mb-1">
                  Power Index
                </p>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Análise de Potencial
                </p>
              </div>

              {/* Top bet */}
              {bet && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant">Mercado Sugerido</span>
                    <span className="text-primary font-bold text-right max-w-[60%]">
                      {formatMarketName(bet.market_name)} — {formatBetLine(bet.side, bet.line)}
                    </span>
                  </div>
                  <Progress
                    value={confidence}
                    className="h-2 bg-surface-container-highest [&>div]:bg-secondary"
                  />
                  <p className="text-xs text-on-surface-variant text-right">
                    Confiança: <span className="text-secondary font-bold">{confidence}%</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Hero() {
  return (
    <HeroContent />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/hero.tsx
git commit -m "feat: Hero component with featured match + Power Index card"
```

---

## Task 14: MatchGrid component

**Files:**
- Create: `src/components/match-grid.tsx`

- [ ] **Step 1: Create src/components/match-grid.tsx**

```tsx
// src/components/match-grid.tsx
'use client'

import { useTRPC } from '@/lib/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import MatchCard from './match-card'

export default function MatchGrid() {
  const trpc = useTRPC()
  const { data: picks } = useSuspenseQuery(trpc.matchPicks.getAll.queryOptions())

  return (
    <section className="max-w-screen-2xl mx-auto px-6 py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="font-headline text-4xl font-bold tracking-tighter mb-2">
            Partidas do Dia
          </h2>
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-medium">
            Predições de alta precisão baseadas em Big Data
          </p>
        </div>
        <button
          disabled
          className="text-primary/40 text-sm font-bold flex items-center gap-1 cursor-not-allowed"
        >
          Ver Calendário Completo →
        </button>
      </div>

      {picks.length === 0 ? (
        <p className="text-on-surface-variant text-center py-20">
          Nenhuma partida disponível hoje.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {picks.map((pick) => (
            <MatchCard key={pick.id} pick={pick} />
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/match-grid.tsx
git commit -m "feat: MatchGrid — Partidas do Dia section"
```

---

## Task 15: TrustSection and Footer

**Files:**
- Create: `src/components/trust-section.tsx`
- Create: `src/components/footer.tsx`

- [ ] **Step 1: Create src/components/trust-section.tsx**

```tsx
// src/components/trust-section.tsx
const pillars = [
  {
    icon: '📊',
    title: 'Data-driven',
    description:
      'Decisões baseadas em histórico estatístico profundo e múltiplas ligas monitoradas.',
  },
  {
    icon: '⚙️',
    title: 'Transparent Methodology',
    description:
      'Modelos matemáticos auditáveis com lógica probabilística pura e sem caixas-pretas.',
  },
  {
    icon: '🔒',
    title: 'Secure Transactions',
    description:
      'Seus dados e acesso protegidos com protocolos de segurança rigorosos.',
  },
]

export default function TrustSection() {
  return (
    <section className="py-24 border-t border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-headline text-4xl font-bold tracking-tighter mb-4">
            Por que confiar no Portal?
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Não somos um site de apostas. Somos uma plataforma de inteligência.
            Transparência e dados são nossos únicos pilares.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {pillars.map((p) => (
            <div key={p.title} className="flex flex-col items-center text-center px-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-6 border border-outline-variant/10 text-3xl">
                {p.icon}
              </div>
              <h3 className="font-headline text-xl font-bold mb-3">{p.title}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create src/components/footer.tsx**

```tsx
// src/components/footer.tsx
export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/15 bg-surface mt-20">
      <div className="max-w-screen-2xl mx-auto px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-headline text-xl font-black text-primary uppercase tracking-tighter">
              Portal do Apostador
            </span>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant opacity-70">
              © 2025 Portal do Apostador. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-8 h-8 rounded-full border-2 border-outline-variant bg-surface-container flex items-center justify-center">
                <span className="text-xs font-black text-on-surface">18+</span>
              </div>
              <span className="text-[10px] font-bold border border-outline px-1.5 py-0.5 rounded text-outline uppercase tracking-wider">
                Proibido para menores
              </span>
            </div>
          </div>
          <div className="flex gap-8 text-xs uppercase tracking-widest">
            <a
              href="https://gamblingtherapy.org/"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Gambling Therapy
            </a>
            <a
              href="http://www.conar.org.br/"
              target="_blank"
              rel="noreferrer"
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              CONAR
            </a>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-outline-variant/10 text-center">
          <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
            Apostas esportivas envolvem risco. Jogue com responsabilidade. O Portal do Apostador
            fornece apenas insights analíticos baseados em modelos probabilísticos e não garante
            resultados financeiros.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/trust-section.tsx src/components/footer.tsx
git commit -m "feat: TrustSection and Footer static components"
```

---

## Task 16: Wire up page.tsx and add Footer to layout

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace src/app/page.tsx**

```tsx
// src/app/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import Hero from '@/components/hero'
import MatchGrid from '@/components/match-grid'
import TrustSection from '@/components/trust-section'

export default async function HomePage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(trpc.matchPicks.getAll.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Hero />
      <MatchGrid />
      <TrustSection />
    </HydrationBoundary>
  )
}
```

- [ ] **Step 2: Add Footer to layout.tsx**

Add `Footer` import and render it after `<main>`:

```tsx
// src/app/layout.tsx  (full file)
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { TRPCReactProvider } from '@/lib/trpc/client'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Portal do Apostador',
  description: 'Análise preditiva de apostas esportivas baseada em dados',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-on-surface font-body antialiased">
        <TRPCReactProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </TRPCReactProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Final verification**

```bash
pnpm dev
```

Open `http://localhost:3000`. Verify:
- Background is dark navy
- "Portal do Apostador" appears in cyan in the top-left nav
- Hero section shows a match (or "Nenhuma partida disponível hoje" if Strapi is empty)
- "Partidas do Dia" grid shows match cards with tournament, teams, and AI insight
- "Por que confiar no Portal?" section visible below
- Footer with 18+ badge at the bottom

- [ ] **Step 4: Final commit**

```bash
git add src/app/page.tsx src/app/layout.tsx
git commit -m "feat: wire up home page — Hero, MatchGrid, TrustSection, Footer"
```
