import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Player, StatLine } from "../backend";
import {
  PositionType,
  useAllStats,
  useIsAdmin,
  usePlayerStats,
  usePlayers,
  useUpdateStats,
} from "../hooks/useQueries";

const POSITION_LABELS: Record<PositionType, string> = {
  [PositionType.attack]: "ATK",
  [PositionType.midfield]: "MID",
  [PositionType.defense]: "DEF",
  [PositionType.goalie]: "GK",
};

const EMPTY_STATS: StatLine = {
  goals: BigInt(0),
  assists: BigInt(0),
  shots: BigInt(0),
  groundBalls: BigInt(0),
  saves: BigInt(0),
  turnovers: BigInt(0),
};

function EditStatsDialog({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const { data: currentStats } = usePlayerStats(player.id);
  const updateStats = useUpdateStats();

  const stats = currentStats ?? EMPTY_STATS;

  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [shots, setShots] = useState("");
  const [groundBalls, setGroundBalls] = useState("");
  const [saves, setSaves] = useState("");
  const [turnovers, setTurnovers] = useState("");

  const initialized = currentStats !== undefined;

  const getVal = (fieldVal: string, statVal: bigint) =>
    fieldVal === "" && initialized ? statVal.toString() : fieldVal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newStats: StatLine = {
        goals: BigInt(
          goals !== "" ? Number.parseInt(goals) : Number(stats.goals),
        ),
        assists: BigInt(
          assists !== "" ? Number.parseInt(assists) : Number(stats.assists),
        ),
        shots: BigInt(
          shots !== "" ? Number.parseInt(shots) : Number(stats.shots),
        ),
        groundBalls: BigInt(
          groundBalls !== ""
            ? Number.parseInt(groundBalls)
            : Number(stats.groundBalls),
        ),
        saves: BigInt(
          saves !== "" ? Number.parseInt(saves) : Number(stats.saves),
        ),
        turnovers: BigInt(
          turnovers !== ""
            ? Number.parseInt(turnovers)
            : Number(stats.turnovers),
        ),
      };
      await updateStats.mutateAsync({ playerId: player.id, stats: newStats });
      toast.success(`Stats updated for ${player.name}.`);
      onClose();
    } catch {
      toast.error("Failed to update stats.");
    }
  };

  const fields = [
    {
      key: "goals",
      label: "Goals",
      val: getVal(goals, stats.goals),
      set: setGoals,
      ocid: "stats.goals.input",
    },
    {
      key: "assists",
      label: "Assists",
      val: getVal(assists, stats.assists),
      set: setAssists,
      ocid: "stats.assists.input",
    },
    {
      key: "shots",
      label: "Shots",
      val: getVal(shots, stats.shots),
      set: setShots,
      ocid: "stats.shots.input",
    },
    {
      key: "groundBalls",
      label: "Ground Balls",
      val: getVal(groundBalls, stats.groundBalls),
      set: setGroundBalls,
      ocid: "stats.ground_balls.input",
    },
    {
      key: "saves",
      label: "Saves",
      val: getVal(saves, stats.saves),
      set: setSaves,
      ocid: "stats.saves.input",
    },
    {
      key: "turnovers",
      label: "Turnovers",
      val: getVal(turnovers, stats.turnovers),
      set: setTurnovers,
      ocid: "stats.turnovers.input",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium text-foreground">{player.name}</p>
        <p className="text-xs text-muted-foreground">
          #{player.number.toString()} · {POSITION_LABELS[player.position]}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`stat-${f.key}`} className="text-xs">
              {f.label}
            </Label>
            <Input
              id={`stat-${f.key}`}
              type="number"
              min="0"
              placeholder={f.val}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              data-ocid={f.ocid}
            />
          </div>
        ))}
      </div>
      <DialogFooter className="mt-4">
        <Button
          type="submit"
          disabled={updateStats.isPending}
          data-ocid="stats.update.submit_button"
          className="w-full bg-foreground hover:bg-foreground/90 text-background"
        >
          {updateStats.isPending ? "Saving..." : "Save Stats"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function StatsPage() {
  const { data: players, isLoading: playersLoading } = usePlayers();
  const { data: allStats, isLoading: statsLoading } = useAllStats();
  const { data: isAdmin } = useIsAdmin();
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const isLoading = playersLoading || statsLoading;

  const statsMap = new Map<string, StatLine>();
  if (allStats) {
    for (const [id, stat] of allStats) {
      statsMap.set(id.toString(), stat);
    }
  }

  const getStats = (playerId: bigint): StatLine =>
    statsMap.get(playerId.toString()) ?? EMPTY_STATS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Player Stats
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Cumulative season statistics
          </p>
        </div>
      </div>

      {isLoading && (
        <div data-ocid="stats.loading_state" className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {!isLoading && (!players || players.length === 0) && (
        <div
          data-ocid="stats.empty_state"
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
        >
          <BarChart3 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            No stats yet
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Add players to the roster and log their stats here.
          </p>
        </div>
      )}

      {!isLoading && players && players.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table data-ocid="stats.table">
              <TableHeader>
                <TableRow className="bg-muted/60 border-border">
                  <TableHead className="font-display font-semibold text-foreground w-10">
                    #
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground">
                    Player
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    POS
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    G
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    A
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    SH
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    GB
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    SV
                  </TableHead>
                  <TableHead className="font-display font-semibold text-foreground text-center">
                    TO
                  </TableHead>
                  {isAdmin && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player, i) => {
                  const s = getStats(player.id);
                  return (
                    <TableRow
                      key={player.id.toString()}
                      data-ocid={`stats.player.row.${i + 1}`}
                      className="border-border hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <span className="stat-number text-sm text-foreground font-bold">
                          {player.number.toString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-display font-semibold text-foreground">
                          {player.name}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold"
                        >
                          {POSITION_LABELS[player.position]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center stat-number text-foreground font-bold">
                        {s.goals.toString()}
                      </TableCell>
                      <TableCell className="text-center stat-number">
                        {s.assists.toString()}
                      </TableCell>
                      <TableCell className="text-center stat-number">
                        {s.shots.toString()}
                      </TableCell>
                      <TableCell className="text-center stat-number">
                        {s.groundBalls.toString()}
                      </TableCell>
                      <TableCell className="text-center stat-number">
                        {s.saves.toString()}
                      </TableCell>
                      <TableCell className="text-center stat-number text-destructive/70">
                        {s.turnovers.toString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPlayer(player)}
                            data-ocid={`stats.player.edit_button.${i + 1}`}
                            className="h-8 w-8 p-0 hover:bg-muted hover:text-foreground"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              G = Goals · A = Assists · SH = Shots · GB = Ground Balls · SV =
              Saves · TO = Turnovers
            </p>
          </div>
        </div>
      )}

      <Dialog
        open={!!editingPlayer}
        onOpenChange={(o) => !o && setEditingPlayer(null)}
      >
        <DialogContent data-ocid="stats.edit.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">
              Update Player Stats
            </DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <EditStatsDialog
              player={editingPlayer}
              onClose={() => setEditingPlayer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
