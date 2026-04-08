// src/lib/strapi.ts
import 'server-only'
import { subMinutes, addDays, endOfDay } from 'date-fns'

const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

// ── Types ───────────────────────────────────────────────────

export type ValueBet = {
  id: number
  market_name: string
  team_label: string | null
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
  home_team_logo: string | null
  away_team_logo: string | null
  tournament: string
  match_date: string   // ISO datetime
  slug: string
  markets: ValueBet[]
  team_moment: string | null
  game_scenario: string | null
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

function cutoffISO(): string {
  return subMinutes(new Date(), 90).toISOString()
}

function endOfDayISO(daysFromNow: number): string {
  return endOfDay(addDays(new Date(), daysFromNow)).toISOString()
}

// ── Fetch functions ──────────────────────────────────────────

export async function fetchMatchPicks(): Promise<MatchPick[]> {
  const params = new URLSearchParams({
    populate: 'markets',
    'sort[0]': 'match_date:asc',
    'filters[match_date][$gte]': cutoffISO(),
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

export async function fetchMatchPicksUpcoming(days = 7): Promise<MatchPick[]> {
  const params = new URLSearchParams({
    populate: 'markets',
    'sort[0]': 'match_date:asc',
    'filters[match_date][$gte]': cutoffISO(),
    'filters[match_date][$lte]': endOfDayISO(days),
    'filters[publishedAt][$notNull]': 'true',
    'pagination[pageSize]': '100',
  })

  const res = await fetch(`${STRAPI_URL}/api/match-picks?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })

  if (!res.ok) throw new Error(`Strapi fetchMatchPicksUpcoming failed: ${res.status}`)

  const json: StrapiList<MatchPick> = await res.json()
  return json.data
}

export async function fetchMatchPickSlugs(): Promise<string[]> {
  const params = new URLSearchParams({
    'fields[0]': 'slug',
    'filters[publishedAt][$notNull]': 'true',
    'sort[0]': 'createdAt:desc',
    'pagination[pageSize]': '500',
  })
  const res = await fetch(`${STRAPI_URL}/api/match-picks?${params}`, {
    headers: headers(),
    next: { revalidate: 3600 },
  })
  if (!res.ok) return []
  const json = await res.json() as { data: { slug: string }[] }
  return json.data.map((item) => item.slug)
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
