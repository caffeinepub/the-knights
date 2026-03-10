import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ScheduledGame,
  useAddScheduledGame,
  useIsAdmin,
  useRemoveScheduledGame,
  useScheduledGames,
} from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSoon(timestamp: bigint): boolean {
  const now = Date.now();
  const gameMs = Number(timestamp);
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return gameMs >= now && gameMs <= now + sevenDays;
}

function isPast(timestamp: bigint): boolean {
  return Number(timestamp) < Date.now();
}

function AddScheduleDialog({ onClose }: { onClose: () => void }) {
  const [opponent, setOpponent] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("12:00");
  const [home, setHome] = useState(true);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const addScheduledGame = useAddScheduledGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponent.trim() || !dateStr) return;
    const dateTime = new Date(`${dateStr}T${timeStr}`);
    if (Number.isNaN(dateTime.getTime())) {
      toast.error("Invalid date/time.");
      return;
    }
    try {
      await addScheduledGame.mutateAsync({
        date: dateTime.getTime(),
        opponent: opponent.trim(),
        home,
        location: location.trim() || null,
        notes: notes.trim() || null,
      });
      toast.success("Game added to schedule!");
      onClose();
    } catch {
      toast.error("Failed to add game.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label htmlFor="sched-opponent">Opponent</Label>
        <Input
          id="sched-opponent"
          placeholder="e.g. Westfield Eagles"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          data-ocid="schedule.opponent.input"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="sched-date">Date</Label>
          <Input
            id="sched-date"
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            data-ocid="schedule.date.input"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sched-time">Time</Label>
          <Input
            id="sched-time"
            type="time"
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            data-ocid="schedule.time.input"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          id="sched-home"
          checked={home}
          onCheckedChange={setHome}
          data-ocid="schedule.home.switch"
        />
        <Label htmlFor="sched-home">{home ? "Home" : "Away"} game</Label>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sched-location">Location (optional)</Label>
        <Input
          id="sched-location"
          placeholder="e.g. Knights Field, Riverside Park"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          data-ocid="schedule.location.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="sched-notes">Notes (optional)</Label>
        <Textarea
          id="sched-notes"
          placeholder="Any additional info..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          data-ocid="schedule.notes.textarea"
          rows={2}
        />
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="submit"
          disabled={addScheduledGame.isPending}
          data-ocid="schedule.add.submit_button"
          className="w-full bg-foreground hover:bg-foreground/90 text-background"
        >
          {addScheduledGame.isPending ? "Saving..." : "Add to Schedule"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ScheduleCard({
  game,
  isAdmin,
  index,
}: {
  game: ScheduledGame;
  isAdmin: boolean;
  index: number;
}) {
  const removeScheduledGame = useRemoveScheduledGame();
  const soon = isSoon(game.date);
  const past = isPast(game.date);

  const handleRemove = async () => {
    try {
      await removeScheduledGame.mutateAsync(game.id);
      toast.success("Game removed from schedule.");
    } catch {
      toast.error("Failed to remove game.");
    }
  };

  return (
    <div
      data-ocid={`schedule.game.item.${index}`}
      className={`relative flex items-start gap-4 p-4 sm:p-5 bg-card border rounded-xl transition-all ${
        soon
          ? "border-accent/50 shadow-[0_0_0_1px_oklch(0.55_0.17_148/0.2)] bg-accent/5"
          : past
            ? "border-border opacity-60"
            : "border-border hover:border-foreground/20 hover:shadow-card"
      }`}
    >
      {/* Date column */}
      <div className="flex-shrink-0 w-14 text-center">
        <div
          className={`rounded-lg py-1.5 px-1 ${
            soon
              ? "bg-accent text-accent-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider leading-none">
            {new Date(Number(game.date)).toLocaleDateString("en-US", {
              month: "short",
            })}
          </p>
          <p className="stat-number text-2xl leading-tight">
            {new Date(Number(game.date)).getDate()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="font-display font-bold text-foreground">
            vs. {game.opponent}
          </h3>
          <Badge
            variant="outline"
            className={
              game.home
                ? "bg-muted text-foreground border-border text-xs"
                : "bg-muted text-muted-foreground border-border text-xs"
            }
          >
            {game.home ? "Home" : "Away"}
          </Badge>
          {soon && (
            <Badge className="bg-accent text-accent-foreground text-xs">
              Soon
            </Badge>
          )}
          {past && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Past
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(game.date)} &bull; {formatTime(game.date)}
        </p>
        {game.location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {game.location}
          </p>
        )}
        {game.notes && (
          <p className="text-sm text-muted-foreground mt-1 italic">
            {game.notes}
          </p>
        )}
      </div>

      {isAdmin && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              data-ocid={`schedule.game.delete_button.${index}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="schedule.remove.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Scheduled Game</AlertDialogTitle>
              <AlertDialogDescription>
                Remove the game vs. <strong>{game.opponent}</strong> on{" "}
                {formatDate(game.date)} from the schedule?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="schedule.remove.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                data-ocid="schedule.remove.confirm_button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {removeScheduledGame.isPending ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export default function SchedulePage() {
  const { data: games, isLoading } = useScheduledGames();
  const { data: isAdmin } = useIsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);

  const sortedGames = games
    ? [...games].sort((a, b) => Number(a.date) - Number(b.date))
    : [];

  const upcomingGames = sortedGames.filter((g) => !isPast(g.date));
  const pastGames = sortedGames.filter((g) => isPast(g.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Schedule
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {upcomingGames.length} upcoming game
            {upcomingGames.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="schedule.add.open_modal_button"
                className="bg-foreground hover:bg-foreground/90 text-background"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="schedule.add.dialog">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Add Scheduled Game
                </DialogTitle>
              </DialogHeader>
              <AddScheduleDialog onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div data-ocid="schedule.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedGames.length === 0 && (
        <div
          data-ocid="schedule.empty_state"
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
        >
          <CalendarDays className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            No games scheduled
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "Add upcoming games to the schedule."
              : "No upcoming games have been scheduled yet."}
          </p>
        </div>
      )}

      {/* Upcoming games */}
      {!isLoading && upcomingGames.length > 0 && (
        <section>
          <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
            Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingGames.map((game, i) => (
              <ScheduleCard
                key={game.id.toString()}
                game={game}
                isAdmin={!!isAdmin}
                index={i + 1}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past games */}
      {!isLoading && pastGames.length > 0 && (
        <section>
          <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">
            Past
          </h3>
          <div className="space-y-3">
            {pastGames.map((game, i) => (
              <ScheduleCard
                key={game.id.toString()}
                game={game}
                isAdmin={!!isAdmin}
                index={i + 1}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
