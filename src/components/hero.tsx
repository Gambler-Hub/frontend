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
                  Índice de Força
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
                      {formatMarketName(bet.market_name, bet.team_label)} — {formatBetLine(bet.side, bet.line)}
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
