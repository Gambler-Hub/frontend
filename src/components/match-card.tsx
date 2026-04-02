// src/components/match-card.tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
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
            {formatMarketName(bet.market_name, bet.team_label)} — {formatBetLine(bet.side, bet.line)} @ {bet.bookmaker_odd.toFixed(2)}
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
      <Link
        href={`/partidas/${pick.slug}`}
        className="block w-full text-center border border-outline-variant/20 text-on-surface bg-surface-container-high hover:border-primary/40 hover:text-primary rounded-md py-2 px-4 text-sm font-medium transition-colors"
      >
        Análise Completa
      </Link>
    </div>
  )
}
