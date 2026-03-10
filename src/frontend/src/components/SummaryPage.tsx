import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Target, TrendingUp, Trophy, Users, Zap } from "lucide-react";
import type { StatLine } from "../backend";
import {
  PositionType,
  useAllStats,
  useGames,
  usePlayers,
} from "../hooks/useQueries";

const POSITION_LABELS: Record<PositionType, string> = {
  [PositionType.attack]: "Attack",
  [PositionType.midfield]: "Midfield",
  [PositionType.defense]: "Defense",
  [PositionType.goalie]: "Goalie",
};

const EMPTY_STATS: StatLine = {
  goals: BigInt(0),
  assists: BigInt(0),
  shots: BigInt(0),
  groundBalls: BigInt(0),
  saves: BigInt(0),
  turnovers: BigInt(0),
};

function StatCard({
  icon,
  label,
  value,
  subValue,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`relative p-5 rounded-xl border transition-all hover:shadow-card ${
        accent
          ? "bg-foreground text-background border-foreground"
          : "bg-card border-border"
      }`}
    >
      <div
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg mb-3 ${
          accent ? "bg-background/15" : "bg-muted"
        }`}
      >
        <span className={accent ? "text-background" : "text-foreground"}>
          {icon}
        </span>
      </div>
      <div
        className={`stat-number text-3xl font-bold leading-none mb-1 ${
          accent ? "text-background" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div
        className={`text-sm font-medium ${
          accent ? "text-background/80" : "text-muted-foreground"
        }`}
      >
        {label}
      </div>
      {subValue && (
        <div
          className={`text-xs mt-0.5 ${
            accent ? "text-background/60" : "text-muted-foreground/70"
          }`}
        >
          {subValue}
        </div>
      )}
    </div>
  );
}

export default function SummaryPage() {
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: games, isLoading: gamesLoading } = useGames();
  const { data: allStats, isLoading: statsLoading } = useAllStats();

  const isLoading = playersLoading || gamesLoading || statsLoading;

  const wins = games?.filter((g) => g.ourScore > g.opponentScore).length ?? 0;
  const losses = games?.filter((g) => g.ourScore < g.opponentScore).length ?? 0;
  const ties = games?.filter((g) => g.ourScore === g.opponentScore).length ?? 0;
  const totalGames = games?.length ?? 0;
  const winPct = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const totalGoalsScored =
    games?.reduce((sum, g) => sum + Number(g.ourScore), 0) ?? 0;
  const totalGoalsAllowed =
    games?.reduce((sum, g) => sum + Number(g.opponentScore), 0) ?? 0;

  const statsMap = new Map<string, StatLine>();
  if (allStats) {
    for (const [id, stat] of allStats) {
      statsMap.set(id.toString(), stat);
    }
  }

  let topScorer: {
    name: string;
    goals: number;
    position: PositionType;
  } | null = null;
  if (players && statsMap.size > 0) {
    let maxGoals = -1;
    for (const p of players) {
      const s = statsMap.get(p.id.toString()) ?? EMPTY_STATS;
      const g = Number(s.goals);
      if (g > maxGoals) {
        maxGoals = g;
        topScorer = { name: p.name, goals: g, position: p.position };
      }
    }
    if (topScorer && (topScorer as { goals: number }).goals === 0)
      topScorer = null;
  }

  let topAssister: { name: string; assists: number } | null = null;
  if (players && statsMap.size > 0) {
    let maxAssists = -1;
    for (const p of players) {
      const s = statsMap.get(p.id.toString()) ?? EMPTY_STATS;
      const a = Number(s.assists);
      if (a > maxAssists) {
        maxAssists = a;
        topAssister = { name: p.name, assists: a };
      }
    }
    if (topAssister && (topAssister as { assists: number }).assists === 0)
      topAssister = null;
  }

  const totalSaves =
    allStats?.reduce((sum, [, s]) => sum + Number(s.saves), 0) ?? 0;

  const positionCounts: Record<PositionType, number> = {
    [PositionType.attack]: 0,
    [PositionType.midfield]: 0,
    [PositionType.defense]: 0,
    [PositionType.goalie]: 0,
  };
  if (players) {
    for (const p of players) {
      positionCounts[p.position] += 1;
    }
  }

  if (isLoading) {
    return (
      <div
        data-ocid="summary.loading_state"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  const hasData =
    (games && games.length > 0) || (players && players.length > 0);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-foreground rounded-2xl p-6 sm:p-8 field-pattern">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <img
              src="/assets/generated/knights-logo-transparent.dim_120x120.png"
              alt="Knights Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-background leading-none">
                The Knights
              </h2>
              <p className="text-background/70 text-sm mt-0.5">
                Season Overview
              </p>
            </div>
          </div>

          {totalGames > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <div className="stat-number text-4xl font-bold text-accent leading-none">
                  {wins}
                </div>
                <div className="text-background/70 text-xs mt-0.5">Wins</div>
              </div>
              <div className="text-background/40 text-2xl font-light">-</div>
              <div className="text-center">
                <div className="stat-number text-4xl font-bold text-background/60 leading-none">
                  {losses}
                </div>
                <div className="text-background/70 text-xs mt-0.5">Losses</div>
              </div>
              {ties > 0 && (
                <>
                  <div className="text-background/40 text-2xl font-light">
                    -
                  </div>
                  <div className="text-center">
                    <div className="stat-number text-4xl font-bold text-background/50 leading-none">
                      {ties}
                    </div>
                    <div className="text-background/70 text-xs mt-0.5">
                      Ties
                    </div>
                  </div>
                </>
              )}
              <div className="ml-auto text-right">
                <div className="stat-number text-2xl font-bold text-accent leading-none">
                  {winPct}%
                </div>
                <div className="text-background/70 text-xs mt-0.5">
                  Win Rate
                </div>
              </div>
            </div>
          )}

          {totalGames === 0 && players && players.length === 0 && (
            <p className="text-background/60 text-sm mt-2">
              Sign in as admin to start adding players and logging games.
            </p>
          )}
        </div>
      </div>

      {hasData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Players"
            value={String(players?.length ?? 0)}
            subValue={`${positionCounts[PositionType.attack]}A · ${positionCounts[PositionType.midfield]}M · ${positionCounts[PositionType.defense]}D · ${positionCounts[PositionType.goalie]}GK`}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Games Played"
            value={String(totalGames)}
            subValue={
              totalGames > 0
                ? `${wins}W–${losses}L${ties > 0 ? `–${ties}T` : ""}`
                : undefined
            }
            accent
          />
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Goals Scored"
            value={String(totalGoalsScored)}
            subValue={
              totalGames > 0
                ? `${(totalGoalsScored / totalGames).toFixed(1)} per game`
                : undefined
            }
          />
          <StatCard
            icon={<Shield className="w-5 h-5" />}
            label="Goals Allowed"
            value={String(totalGoalsAllowed)}
            subValue={
              totalGames > 0
                ? `${(totalGoalsAllowed / totalGames).toFixed(1)} per game`
                : undefined
            }
          />
          {totalSaves > 0 && (
            <StatCard
              icon={<Shield className="w-5 h-5" />}
              label="Total Saves"
              value={String(totalSaves)}
            />
          )}
          {topScorer && (
            <StatCard
              icon={<Zap className="w-5 h-5" />}
              label="Top Scorer"
              value={String((topScorer as { goals: number }).goals)}
              subValue={`${(topScorer as { name: string }).name} · ${POSITION_LABELS[(topScorer as { position: PositionType }).position]}`}
              accent
            />
          )}
          {topAssister && (
            <StatCard
              icon={<TrendingUp className="w-5 h-5" />}
              label="Top Assists"
              value={String((topAssister as { assists: number }).assists)}
              subValue={(topAssister as { name: string }).name}
            />
          )}
        </div>
      )}

      {!hasData && (
        <div
          data-ocid="summary.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <p className="font-display text-lg font-semibold">
            Season hasn&apos;t started yet
          </p>
          <p className="text-sm mt-1">
            Add players and log games to see team stats here.
          </p>
        </div>
      )}
    </div>
  );
}
