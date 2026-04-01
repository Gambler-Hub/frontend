'use client'

import { useState, useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTRPC } from '@/lib/trpc/client'
import { formatMarketName, formatTournament } from '@/lib/format'
import type { ValueBet } from '@/lib/strapi'

// ── Date utilities ───────────────────────────────────────────

function toLocalDateStr(iso: string): string {
  // Parse the ISO string and extract local date YYYY-MM-DD
  const d = new Date(iso)
  return d.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
}

function todayStr(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString('sv-SE')
}

function formatTabLabel(dateStr: string, today: string): string {
  const tomorrow = addDays(today, 1)
  if (dateStr === today) return 'Hoje'
  if (dateStr === tomorrow) return 'Amanhã'
  const d = new Date(dateStr + 'T12:00:00')
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
  const day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)}, ${day}`
}

function matchTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  })
}

// ── Pick utilities ───────────────────────────────────────────

function bestFeaturedBet(markets: ValueBet[]): ValueBet | undefined {
  return markets
    .filter((m) => m.featured && m.approved)
    .sort((a, b) => b.edge - a.edge)[0]
}

function powerScore(bet: ValueBet): string {
  return Math.min(bet.prob_model * 10, 10).toFixed(1)
}

function volumeLabel(kelly: number): { label: string; className: string } {
  if (kelly > 0.1) return { label: 'MAX', className: 'text-secondary' }
  if (kelly > 0.05) return { label: 'HIGH', className: 'text-primary' }
  if (kelly > 0.02) return { label: 'MEDIUM', className: 'text-on-surface' }
  return { label: 'LOW', className: 'text-on-surface-variant' }
}

function scoreBorderClass(score: number): string {
  if (score >= 8.5) return 'border-secondary'
  if (score >= 7.0) return 'border-primary'
  return 'border-outline-variant/30'
}

function scoreTextClass(score: number): string {
  if (score >= 8.5) return 'text-secondary'
  if (score >= 7.0) return 'text-primary'
  return 'text-on-surface'
}

// ── Constants ────────────────────────────────────────────────

const TOURNAMENT_COUNTRY: Record<string, string> = {
  BRASILEIRAO_SERIE_A: 'BRASIL',
  BRASILEIRAO_SERIE_B: 'BRASIL',
  PREMIER_LEAGUE: 'INGLATERRA',
  LA_LIGA: 'ESPANHA',
  BUNDESLIGA: 'ALEMANHA',
  SERIE_A: 'ITÁLIA',
  CHAMPIONS_LEAGUE: 'EUROPA',
}

// ── Component ────────────────────────────────────────────────

export default function CalendarView() {
  const trpc = useTRPC()
  const { data: picks } = useSuspenseQuery(trpc.matchPicks.getUpcoming.queryOptions())

  const today = todayStr()
  const dateTabs = useMemo(() => [0, 1, 2, 3, 4].map((n) => addDays(today, n)), [today])

  const [selectedDate, setSelectedDate] = useState(today)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null)

  const availableLeagues = useMemo(
    () => Array.from(new Set(picks.map((p) => p.tournament))),
    [picks],
  )

  const filtered = useMemo(() => {
    return picks.filter((pick) => {
      if (toLocalDateStr(pick.match_date) !== selectedDate) return false
      if (selectedLeague && pick.tournament !== selectedLeague) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !pick.home_team.toLowerCase().includes(q) &&
          !pick.away_team.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [picks, selectedDate, selectedLeague, searchQuery])

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const pick of filtered) {
      const list = map.get(pick.tournament) ?? []
      list.push(pick)
      map.set(pick.tournament, list)
    }
    return map
  }, [filtered])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── Sidebar ─────────────────────────────── */}
      <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
        {/* Search */}
        <div className="space-y-3">
          <label className="font-headline text-xs font-bold text-primary tracking-widest uppercase block">
            Busca Técnica
          </label>
          <input
            type="text"
            placeholder="Equipe ou Liga..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-on-surface placeholder:text-on-surface-variant"
          />
        </div>

        {/* League filter */}
        {availableLeagues.length > 0 && (
          <div className="space-y-3">
            <label className="font-headline text-xs font-bold text-primary tracking-widest uppercase block">
              Principais Ligas
            </label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setSelectedLeague(null)}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedLeague === null
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <span>Todas as Ligas</span>
              </button>
              {availableLeagues.map((league) => (
                <button
                  key={league}
                  onClick={() => setSelectedLeague(league === selectedLeague ? null : league)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedLeague === league
                      ? 'bg-surface-container-high text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span>{formatTournament(league)}</span>
                  <span
                    className={`text-[10px] px-1.5 rounded ${
                      selectedLeague === league
                        ? 'text-primary bg-primary/10'
                        : 'text-on-surface-variant/50 bg-outline-variant/10'
                    }`}
                  >
                    {(TOURNAMENT_COUNTRY[league] ?? 'INT').slice(0, 3)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AI Confidence indicator */}
        <div className="space-y-3">
          <label className="font-headline text-xs font-bold text-primary tracking-widest uppercase block">
            AI Confidence
          </label>
          <div className="space-y-2">
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-4/5" />
            </div>
            <p className="text-[10px] text-on-surface-variant">
              Exibindo apenas eventos com edge confirmado
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────── */}
      <div className="flex-1 space-y-8">
        {/* Date tabs */}
        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg flex-wrap">
            {dateTabs.map((date) => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  selectedDate === date
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {formatTabLabel(date, today)}
              </button>
            ))}
          </div>
        </div>

        {/* Grouped matches */}
        {grouped.size === 0 ? (
          <p className="text-on-surface-variant text-center py-20">
            Nenhuma partida disponível para este dia.
          </p>
        ) : (
          Array.from(grouped.entries()).map(([tournament, tournamentPicks]) => (
            <section key={tournament} className="space-y-4">
              {/* League header */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant/20">
                  <span className="text-[9px] font-bold text-primary font-headline leading-none text-center">
                    {(TOURNAMENT_COUNTRY[tournament] ?? 'IT').slice(0, 2)}
                  </span>
                </div>
                <h2 className="font-headline text-lg font-bold text-on-surface tracking-tight">
                  {formatTournament(tournament).toUpperCase()}
                  <span className="text-on-surface-variant text-sm font-normal ml-2">
                    — {TOURNAMENT_COUNTRY[tournament] ?? 'INTERNACIONAL'}
                  </span>
                </h2>
              </div>

              {/* Match rows */}
              {tournamentPicks.map((pick) => {
                const bet = bestFeaturedBet(pick.markets)
                const score = bet ? parseFloat(powerScore(bet)) : 0
                const vol = bet ? volumeLabel(bet.kelly_fraction) : null

                return (
                  <div
                    key={pick.id}
                    className="glass-card p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 hover:shadow-[0_0_30px_rgba(83,221,252,0.05)] transition-all"
                  >
                    {/* Time */}
                    <div className="flex flex-col items-center md:items-start min-w-[80px]">
                      <span className="font-headline text-2xl font-bold text-primary">
                        {matchTime(pick.match_date)}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                        {formatTabLabel(toLocalDateStr(pick.match_date), today)}
                      </span>
                    </div>

                    {/* Teams */}
                    <div className="flex flex-1 items-center justify-between w-full gap-4">
                      <div className="flex flex-1 items-center justify-end gap-4 text-right">
                        <span className="font-headline text-base md:text-lg font-bold">
                          {pick.home_team}
                        </span>
                        <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center border border-outline-variant/10 shrink-0">
                          <span className="text-xs font-bold text-on-surface-variant uppercase">
                            {pick.home_team.slice(0, 3)}
                          </span>
                        </div>
                      </div>
                      <div className="px-4 text-on-surface-variant font-headline font-bold italic opacity-20 text-lg">
                        VS
                      </div>
                      <div className="flex flex-1 items-center justify-start gap-4">
                        <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center border border-outline-variant/10 shrink-0">
                          <span className="text-xs font-bold text-on-surface-variant uppercase">
                            {pick.away_team.slice(0, 3)}
                          </span>
                        </div>
                        <span className="font-headline text-base md:text-lg font-bold">
                          {pick.away_team}
                        </span>
                      </div>
                    </div>

                    {/* AI Power Index */}
                    {bet ? (
                      <div
                        className={`w-full md:w-56 bg-surface-container-highest/40 rounded-lg p-3 space-y-2 border-l-2 ${scoreBorderClass(score)}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-primary tracking-tighter">
                            AI POWER INDEX
                          </span>
                          <span
                            className={`font-headline text-sm font-bold ${scoreTextClass(score)}`}
                          >
                            {powerScore(bet)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-on-surface-variant">TREND</span>
                          <span className="text-[10px] font-bold text-on-surface truncate max-w-[110px]">
                            {bet.side.toUpperCase()} {bet.line} —{' '}
                            {formatMarketName(bet.market_name).slice(0, 10).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-on-surface-variant">VOLUME</span>
                          <span className={`text-[10px] font-bold ${vol?.className}`}>
                            {vol?.label}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full md:w-56 bg-surface-container-highest/40 rounded-lg p-3 border-l-2 border-outline-variant/20">
                        <p className="text-[10px] text-on-surface-variant text-center py-2">
                          Sem análise disponível
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </section>
          ))
        )}
      </div>
    </div>
  )
}
