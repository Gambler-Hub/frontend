'use client'

import Image from 'next/image'
import { BarChart2 } from 'lucide-react'
import { useTRPC } from '@/lib/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Progress } from '@/components/ui/progress'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { formatMarketName, formatBetLine, formatTournament } from '@/lib/format'
import type { MatchPick, ValueBet } from '@/lib/strapi'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'

// ── Utilities ────────────────────────────────────────────────

function matchDateTime(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  const tz = 'America/Sao_Paulo'
  return {
    date: formatInTimeZone(d, tz, "EEEE, dd 'de' MMMM", { locale: ptBR }),
    time: formatInTimeZone(d, tz, 'HH:mm'),
  }
}

function powerScore(bet: ValueBet): number {
  return Math.min(bet.prob_model * 10, 10)
}

function edgeColor(edge: number): string {
  if (edge >= 0.1) return 'text-secondary'
  if (edge >= 0.05) return 'text-primary'
  return 'text-on-surface-variant'
}

// ── Sub-components ────────────────────────────────────────────

function TeamBadge({ name, side, logoUrl }: { name: string; side: 'home' | 'away'; logoUrl?: string | null }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${side === 'home' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'}`}
    >
      {logoUrl ? (
        <Image src={logoUrl} alt={name} width={80} height={80} className="object-contain shrink-0" />
      ) : (
        <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center border border-outline-variant/20 shrink-0">
          <span className="text-xl font-black text-on-surface-variant uppercase font-headline">
            {name.slice(0, 3)}
          </span>
        </div>
      )}
      <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
        {name}
      </h2>
    </div>
  )
}


function FeaturedMarketCard({ bet }: { bet: ValueBet }) {
  const confidence = Math.round(bet.prob_model * 100)
  const score = powerScore(bet)
  const borderClass =
    score >= 8.5 ? 'border-secondary/40' : score >= 7 ? 'border-primary/40' : 'border-outline-variant/20'

  return (
    <div
      className={`glass-card rounded-xl p-5 border-t-2 ${borderClass} hover:bg-surface-container-high transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 pr-3">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">
            {formatMarketName(bet.market_name, bet.team_label)}
          </span>
          <h5 className="font-headline text-lg font-bold leading-tight">
            {formatBetLine(bet.side, bet.line)}
          </h5>
        </div>
        <div className="bg-secondary-container/30 text-on-secondary-container px-3 py-1 rounded-md font-bold font-headline text-sm shrink-0">
          {bet.bookmaker_odd.toFixed(2)}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-on-surface-variant">
          <span>Índice de Confiança</span>
          <span className="text-secondary font-bold">{confidence}%</span>
        </div>
        <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full"
            style={{ width: `${confidence}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant pt-1">
          <span>Edge: <span className={`font-bold ${edgeColor(bet.edge)}`}>+{(bet.edge * 100).toFixed(1)}%</span></span>
          <span>Kelly: <span className="font-bold text-on-surface">{(bet.kelly_fraction * 100).toFixed(1)}%</span></span>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────

function MatchDetailContent({ slug }: { slug: string }) {
  const trpc = useTRPC()
  const { data: pick } = useSuspenseQuery(trpc.matchPicks.getBySlug.queryOptions({ slug }))

  if (!pick) {
    return (
      <div className="max-w-screen-2xl mx-auto px-6 py-32 text-center">
        <p className="font-headline text-2xl text-on-surface-variant">Partida não encontrada.</p>
      </div>
    )
  }

  const { date, time } = matchDateTime(pick.match_date)
  const approvedMarkets = pick.markets.filter((m) => m.approved).sort((a, b) => b.edge - a.edge)
  const featuredMarkets = approvedMarkets.filter((m) => m.featured)
  const allOtherMarkets = approvedMarkets.filter((m) => !m.featured)
  const topBet = featuredMarkets[0]
  const topScore = topBet ? powerScore(topBet) : 0

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-10">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative mb-12 overflow-hidden rounded-2xl bg-surface-container-low p-8 md:p-12 border border-outline-variant/10">
        <div className="absolute inset-0 ai-glow pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 items-center gap-8">
          {/* Home team */}
          <TeamBadge name={pick.home_team} side="home" logoUrl={pick.home_team_logo} />

          {/* Center: match info */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-surface-container px-4 py-1 rounded-full text-xs font-bold tracking-widest text-primary uppercase border border-primary/20">
              {formatTournament(pick.tournament)}
            </div>
            <div className="font-headline text-5xl font-black text-primary italic">VS</div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xl font-bold font-headline">{time}</span>
              <span className="text-on-surface-variant text-sm font-medium uppercase tracking-widest capitalize">
                {date}
              </span>
            </div>
            {topBet && (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`text-2xl font-black font-headline ${topScore >= 8.5 ? 'text-secondary' : topScore >= 7 ? 'text-primary' : 'text-on-surface'}`}
                >
                  {topScore.toFixed(1)}
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-bold text-primary tracking-widest uppercase leading-none">
                    IA Índice
                  </p>
                  <p className="text-[9px] font-bold text-primary tracking-widest uppercase leading-none">
                    de Força
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Away team */}
          <TeamBadge name={pick.away_team} side="away" logoUrl={pick.away_team_logo} />
        </div>
      </section>

      {/* ── Content grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Right: featured cards + disclaimer — comes first in DOM so it renders above all-markets on mobile */}
        <div className="lg:col-span-4 lg:col-start-9">
          <div className="sticky top-24 space-y-6">
            <h3 className="font-headline text-xl font-bold flex items-center gap-2">
              <span className="text-secondary">✦</span>
              Mercados Recomendados
            </h3>

            {featuredMarkets.length > 0 ? (
              featuredMarkets.map((bet) => (
                <FeaturedMarketCard key={bet.id} bet={bet} />
              ))
            ) : (
              <div className="glass-card rounded-xl p-6 text-center">
                <p className="text-sm text-on-surface-variant">Sem picks em destaque.</p>
              </div>
            )}

            {/* Odds disclaimer */}
            <p className="text-[10px] text-on-surface-variant/50 leading-relaxed px-1">
              As odds exibidas são as disponíveis no momento da análise e podem sofrer alterações.
              Verifique a odd atual antes de apostar.
            </p>

            {/* AI Oracle insight (derived from data) */}
            {topBet && (
              <div className="bg-surface-container-highest rounded-xl p-5 relative overflow-hidden border border-outline-variant/10">
                <h4 className="font-headline text-sm font-bold text-primary mb-3 uppercase tracking-wider">
                  Oracle AI Insight
                </h4>
                <p className="text-xs italic text-on-surface-variant leading-relaxed">
                  "O modelo detectou edge positivo de{' '}
                  <span className="text-secondary font-semibold not-italic">
                    +{(topBet.edge * 100).toFixed(1)}%
                  </span>{' '}
                  no mercado de{' '}
                  <span className="text-on-surface font-semibold not-italic">
                    {formatMarketName(topBet.market_name)}
                  </span>
                  . Probabilidade do modelo:{' '}
                  <span className="text-primary font-semibold not-italic">
                    {Math.round(topBet.prob_model * 100)}%
                  </span>
                  ."
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Left: narrative + markets — second in DOM but placed left on desktop via col-start-1 */}
        <div className="lg:col-span-8 lg:col-start-1 lg:row-start-1 space-y-8">
          {/* Team moment narrative */}
          {pick.team_moment && (
            <div className="space-y-4">
              <h3 className="font-headline text-xl font-bold flex items-center gap-3">
                <BarChart2 className="w-5 h-5 text-primary" />
                Contexto &amp; Análise Profissional
              </h3>
              <div className="bg-surface-container-low rounded-xl p-6 border-t border-primary/20">
                <h4 className="font-headline text-sm font-bold text-primary mb-3 uppercase tracking-wider">
                  O Momento das Equipes
                </h4>
                <p className="text-on-surface-variant leading-relaxed font-body whitespace-pre-line">
                  {pick.team_moment}
                </p>
              </div>
            </div>
          )}

          {/* All other approved markets */}
          {allOtherMarkets.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-headline text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
                Análise Quantitativa — Todos os Mercados
              </h3>
              <div className="bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
                <Table>
                  <TableHeader className="bg-surface-container [&_tr]:border-0">
                    <TableRow className="border-0">
                      <TableHead className="text-on-surface-variant">Mercado</TableHead>
                      <TableHead className="text-right text-on-surface-variant">Confiança</TableHead>
                      <TableHead className="text-right text-on-surface-variant">Edge</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&_tr]:border-0">
                    {allOtherMarkets.map((bet) => {
                      const confidence = Math.round(bet.prob_model * 100)
                      return (
                        <TableRow key={bet.id} className="border-0">
                          <TableCell>
                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {formatMarketName(bet.market_name, bet.team_label)}
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                {formatBetLine(bet.side, bet.line)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="space-y-1">
                              <div className="text-secondary font-bold text-sm">{confidence}%</div>
                              <Progress
                                value={confidence}
                                className="h-1 bg-surface-container-highest [&>div]:bg-secondary"
                              />
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <p className={`text-sm font-bold ${edgeColor(bet.edge)}`}>
                              +{(bet.edge * 100).toFixed(1)}%
                            </p>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {approvedMarkets.length === 0 && (
            <div className="bg-surface-container-low rounded-xl p-12 text-center border border-outline-variant/10">
              <p className="text-on-surface-variant">Nenhum mercado aprovado disponível para esta partida.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MatchDetail({ slug }: { slug: string }) {
  return <MatchDetailContent slug={slug} />
}
