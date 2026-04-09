// src/lib/format.ts

// Keys are FootballMarket enum VALUES (stored in Strapi), not member names.
const MARKET_LABELS: Record<string, string> = {
  // Mercados de partida (match-level)
  'O/U':              'Total de Gols',
  'MATCH_FOULS_OU':   'Total de Faltas',
  'MATCH_CARDS_OU':   'Total de Cartões',
  'MATCH_CORNERS_OU': 'Total de Escanteios',
  'MATCH_SHOTS_OU':   'Total de Chutes',
  'MATCH_SOT_OU':     'Chutes no Gol',
  'MATCH_OFFSIDES_OU':'Total de Impedimentos',
  'MATCH_SAVES_OU':   'Total de Defesas',
  'MATCH_WOODWORK_OU':'Acertos na Trave',
  // Mercados de time (team-level) — combinados com team_label: "Gols (Botafogo)"
  'TEAM_OU':          'Gols',
  'TEAM_FOULS_OU':    'Faltas',
  'TEAM_SHOTS_OU':    'Chutes',
  'TEAM_SOT_OU':      'Chutes no Gol',
  'TEAM_CORNERS_OU':  'Escanteios',
  'TEAM_CARDS_OU':    'Cartões',
}

const TOURNAMENT_LABELS: Record<string, string> = {
  BRASILEIRAO_SERIE_A: 'Brasileirão Série A',
  BRASILEIRAO_SERIE_B: 'Brasileirão Série B',
  PREMIER_LEAGUE:      'Premier League',
  LA_LIGA:             'La Liga',
  BUNDESLIGA:          'Bundesliga',
  SERIE_A:             'Serie A',
  CHAMPIONS_LEAGUE:    'Champions League',
  LIGUE_1:             'Ligue 1',
  LIBERTADORES:        'Copa Libertadores',
  SULAMERICANA:        'Copa Sul-Americana',
}

/**
 * Formats a market name into a human-readable Portuguese label.
 * Pass `teamLabel` (the actual team name) for TEAM_* markets.
 */
export function formatMarketName(raw: string, teamLabel?: string | null): string {
  const label = MARKET_LABELS[raw] ?? raw.replace(/_/g, ' ').toLowerCase()
  if (teamLabel) return `${label} (${teamLabel})`
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
