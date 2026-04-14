"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { formatMarketName, formatTournament, getTournamentFlag } from "@/lib/format";
import type { ValueBet } from "@/lib/strapi";
import { addDays as dfAddDays, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X } from "lucide-react";

// ── Date utilities ───────────────────────────────────────────

const TZ = "America/Sao_Paulo";

function toLocalDateStr(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "yyyy-MM-dd");
}

function todayStr(): string {
  return formatInTimeZone(new Date(), TZ, "yyyy-MM-dd");
}

function addDays(dateStr: string, n: number): string {
  return formatInTimeZone(
    dfAddDays(parseISO(dateStr + "T12:00:00"), n),
    TZ,
    "yyyy-MM-dd",
  );
}

function formatQuickLabel(dateStr: string, today: string): string {
  const tomorrow = addDays(today, 1);
  if (dateStr === today) return "Hoje";
  if (dateStr === tomorrow) return "Amanhã";
  const d = parseISO(dateStr + "T12:00:00");
  const label = formatInTimeZone(d, TZ, "EEE, dd MMM", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatDateHeader(dateStr: string, today: string): string {
  const tomorrow = addDays(today, 1);
  if (dateStr === today) return "Hoje";
  if (dateStr === tomorrow) return "Amanhã";
  const d = parseISO(dateStr + "T12:00:00");
  const label = formatInTimeZone(d, TZ, "EEEE, dd 'de' MMMM", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function matchTime(iso: string): string {
  return formatInTimeZone(new Date(iso), TZ, "HH:mm");
}

// ── Pick utilities ───────────────────────────────────────────

function bestFeaturedBet(markets: ValueBet[]): ValueBet | undefined {
  return markets
    .filter((m) => m.featured && m.approved)
    .sort((a, b) => b.edge - a.edge)[0];
}

function powerScore(bet: ValueBet): string {
  return Math.min(bet.prob_model * 10, 10).toFixed(1);
}

function scoreBorderClass(score: number): string {
  if (score >= 8.5) return "border-secondary";
  if (score >= 7.0) return "border-primary";
  return "border-outline-variant/30";
}

function scoreTextClass(score: number): string {
  if (score >= 8.5) return "text-secondary";
  if (score >= 7.0) return "text-primary";
  return "text-on-surface";
}

// ── Types ────────────────────────────────────────────────────

type SearchForm = { search: string };

// ── Component ────────────────────────────────────────────────

export default function CalendarView() {
  const trpc = useTRPC();
  const { data: picks } = useSuspenseQuery(
    trpc.matchPicks.getAll.queryOptions(),
  );

  const today = todayStr();

  const { register, watch } = useForm<SearchForm>({ defaultValues: { search: "" } });
  const searchQuery = watch("search");

  // null = all dates; string = specific date filter
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Dates that have at least one match, sorted ascending, starting from today
  const datesWithMatches = useMemo(() => {
    const dateSet = new Set(picks.map((p) => toLocalDateStr(p.match_date)));
    return Array.from(dateSet)
      .filter((d) => d >= today)
      .sort();
  }, [picks, today]);

  // Up to 4 quick-filter buttons
  const quickDates = useMemo(() => datesWithMatches.slice(0, 4), [datesWithMatches]);

  const availableLeagues = useMemo(
    () => Array.from(new Set(picks.map((p) => p.tournament))),
    [picks],
  );

  const filtered = useMemo(() => {
    return picks.filter((pick) => {
      if (selectedDate && toLocalDateStr(pick.match_date) !== selectedDate)
        return false;
      if (selectedLeague && pick.tournament !== selectedLeague) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !pick.home_team.toLowerCase().includes(q) &&
          !pick.away_team.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [picks, selectedDate, selectedLeague, searchQuery]);

  // Group by date, then by tournament
  const grouped = useMemo(() => {
    const result = new Map<string, Map<string, typeof picks>>();
    for (const pick of filtered) {
      const dateStr = toLocalDateStr(pick.match_date);
      if (!result.has(dateStr)) result.set(dateStr, new Map());
      const byLeague = result.get(dateStr)!;
      const list = byLeague.get(pick.tournament) ?? [];
      list.push(pick);
      byLeague.set(pick.tournament, list);
    }
    return result;
  }, [filtered]);

  function handleQuickDate(date: string) {
    setSelectedDate((prev) => (prev === date ? null : date));
  }

  function handlePickerDate(date: Date | undefined) {
    if (!date) return;
    const dateStr = formatInTimeZone(date, TZ, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    setPickerOpen(false);
  }

  function clearDateFilter() {
    setSelectedDate(null);
  }

  // Convert selectedDate string to Date object for the Calendar component
  const pickerValue = selectedDate
    ? parseISO(selectedDate + "T12:00:00")
    : undefined;

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
            {...register("search")}
            type="text"
            placeholder="Equipe ou time..."
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
                    ? "bg-surface-container-high text-on-surface"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span>Todas as Ligas</span>
              </button>
              {availableLeagues.map((league) => (
                <button
                  key={league}
                  onClick={() =>
                    setSelectedLeague(league === selectedLeague ? null : league)
                  }
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    selectedLeague === league
                      ? "bg-surface-container-high text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                  }`}
                >
                  <span>{formatTournament(league)}</span>
                  <span
                    className={`text-base px-1 rounded ${
                      selectedLeague === league ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    {getTournamentFlag(league)}
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
        {/* Date filter bar */}
        <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-lg flex-wrap">
            {quickDates.map((date) => (
              <button
                key={date}
                onClick={() => handleQuickDate(date)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                  selectedDate === date
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {formatQuickLabel(date, today)}
              </button>
            ))}
          </div>

          {/* Date picker */}
          <div className="flex items-center gap-1">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger>
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    selectedDate && !quickDates.includes(selectedDate)
                      ? "border-primary/40 bg-primary-container text-on-primary-container"
                      : "border-outline-variant/10 bg-surface-container-low text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  {selectedDate && !quickDates.includes(selectedDate)
                    ? formatQuickLabel(selectedDate, today)
                    : "Outra data"}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={pickerValue}
                  onSelect={handlePickerDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {selectedDate && (
              <button
                onClick={clearDateFilter}
                className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-all"
                aria-label="Limpar filtro de data"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Grouped matches */}
        {grouped.size === 0 ? (
          <p className="text-on-surface-variant text-center py-20">
            Nenhuma partida disponível.
          </p>
        ) : (
          Array.from(grouped.entries()).map(([dateStr, byLeague]) => (
            <div key={dateStr} className="space-y-8">
              {/* Date header */}
              <div className="flex items-center gap-3">
                <span className="font-headline text-xs font-bold text-primary tracking-widest uppercase">
                  {formatDateHeader(dateStr, today)}
                </span>
                <div className="flex-1 h-px bg-outline-variant/10" />
              </div>

              {Array.from(byLeague.entries()).map(([tournament, tournamentPicks]) => (
                <section key={tournament} className="space-y-4">
                  {/* League header */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant/20">
                      <span className="text-base leading-none">
                        {getTournamentFlag(tournament)}
                      </span>
                    </div>
                    <h2 className="font-headline text-lg font-bold text-on-surface tracking-tight">
                      {formatTournament(tournament)}
                    </h2>
                  </div>

                  {/* Match rows */}
                  {tournamentPicks.map((pick) => {
                    const bet = bestFeaturedBet(pick.markets);
                    const score = bet ? parseFloat(powerScore(bet)) : 0;

                    return (
                      <Link
                        key={pick.id}
                        href={`/partidas/${pick.slug}`}
                        className="glass-card p-6 rounded-xl flex flex-col md:flex-row items-center gap-6 hover:shadow-[0_0_30px_rgba(83,221,252,0.05)] hover:border-primary/20 border border-transparent transition-all"
                      >
                        {/* Time */}
                        <div className="flex flex-col items-center md:items-start min-w-[80px]">
                          <span className="font-headline text-2xl font-bold text-primary">
                            {matchTime(pick.match_date)}
                          </span>
                          <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                            {formatQuickLabel(toLocalDateStr(pick.match_date), today)}
                          </span>
                        </div>

                        {/* Teams */}
                        <div className="flex flex-1 items-center justify-between w-full gap-2 min-w-0">
                          <div className="flex flex-1 items-center justify-end gap-2 text-right min-w-0">
                            <span className="font-headline text-base md:text-lg font-bold truncate min-w-0">
                              {pick.home_team}
                            </span>
                            {pick.home_team_logo ? (
                              <Image
                                src={pick.home_team_logo}
                                alt={pick.home_team}
                                width={40}
                                height={40}
                                className="object-contain shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center border border-outline-variant/10 shrink-0">
                                <span className="text-xs font-bold text-on-surface-variant uppercase">
                                  {pick.home_team.slice(0, 3)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="px-2 text-on-surface-variant font-headline font-bold italic opacity-20 text-lg shrink-0">
                            VS
                          </div>
                          <div className="flex flex-1 items-center justify-start gap-2 min-w-0">
                            {pick.away_team_logo ? (
                              <Image
                                src={pick.away_team_logo}
                                alt={pick.away_team}
                                width={40}
                                height={40}
                                className="object-contain shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center border border-outline-variant/10 shrink-0">
                                <span className="text-xs font-bold text-on-surface-variant uppercase">
                                  {pick.away_team.slice(0, 3)}
                                </span>
                              </div>
                            )}
                            <span className="font-headline text-base md:text-lg font-bold truncate min-w-0">
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
                                IA ÍNDICE DE FORÇA
                              </span>
                              <span
                                className={`font-headline text-sm font-bold ${scoreTextClass(score)}`}
                              >
                                {powerScore(bet)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-on-surface-variant">
                                TREND
                              </span>
                              <span className="text-[10px] font-bold text-on-surface truncate max-w-[110px]">
                                {bet.side.toUpperCase()} {bet.line} —{" "}
                                {formatMarketName(bet.market_name, bet.team_label)
                                  .slice(0, 10)
                                  .toUpperCase()}
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
                      </Link>
                    );
                  })}
                </section>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
