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
