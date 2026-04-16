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
  EUROPA_LEAGUE:       'Europa League',
  CONFERENCE_LEAGUE:   'Conference League',
  LIGUE_1:             'Ligue 1',
  LIBERTADORES:        'Copa Libertadores',
  SULAMERICANA:        'Copa Sul-Americana',
  LIGA_PROFESIONAL:    'Liga Profesional',
  CHAMPIONSHIP:        'Championship',
  EREDIVISIE:          'Eredivisie',
  PRIMEIRA_LIGA:       'Primeira Liga',
  SUPER_LIG:           'Süper Lig',
}

// Maps tournament IDs to flagcdn.com country codes.
// null = supranational competition (no country flag) → show globe icon as fallback.
const TOURNAMENT_FLAG_CODES: Record<string, string | null> = {
  BRASILEIRAO_SERIE_A: 'br',
  BRASILEIRAO_SERIE_B: 'br',
  PREMIER_LEAGUE:      'gb-eng',
  CHAMPIONSHIP:        'gb-eng',
  LA_LIGA:             'es',
  BUNDESLIGA:          'de',
  LIGUE_1:             'fr',
  SERIE_A:             'it',
  CHAMPIONS_LEAGUE:    'eu',
  EUROPA_LEAGUE:       'eu',
  CONFERENCE_LEAGUE:   'eu',
  LIBERTADORES:        null,   // CONMEBOL — sem bandeira padrão
  SULAMERICANA:        null,   // CONMEBOL — sem bandeira padrão
  LIGA_PROFESIONAL:    'ar',
  EREDIVISIE:          'nl',
  PRIMEIRA_LIGA:       'pt',
  SUPER_LIG:           'tr',
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

/**
 * Returns a flagcdn.com image URL for the tournament's country flag,
 * or null for supranational competitions (Champions League excluded —
 * it uses the EU flag). Use a Globe icon as fallback when null.
 */
export function getTournamentFlagUrl(id: string): string | null {
  if (!(id in TOURNAMENT_FLAG_CODES)) return null
  const code = TOURNAMENT_FLAG_CODES[id]
  return code ? `https://flagcdn.com/w40/${code}.png` : null
}
