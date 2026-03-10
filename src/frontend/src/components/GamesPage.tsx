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
import { Calendar, CalendarPlus, TrendingDown, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Game } from "../backend";
import { useAddGame, useGames, useIsAdmin } from "../hooks/useQueries";

function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp));
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function GameCard({ game, index }: { game: Game; index: number }) {
  const isWin = game.ourScore > game.opponentScore;
  const isTie = game.ourScore === game.opponentScore;

  return (
    <div
      data-ocid={`games.game.item.${index}`}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-foreground/20 hover:shadow-card transition-all"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div
          className={`w-2 h-12 rounded-full flex-shrink-0 ${
            isWin
              ? "bg-foreground"
              : isTie
                ? "bg-muted-foreground"
                : "bg-destructive"
          }`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-display font-semibold text-foreground truncate">
              vs. {game.opponent}
            </p>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {game.home ? "Home" : "Away"}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {formatDate(game.date)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <div className="text-right">
          <div className="stat-number text-2xl leading-none">
            <span
              className={
                isWin
                  ? "text-foreground"
                  : isTie
                    ? "text-muted-foreground"
                    : "text-destructive"
              }
            >
              {game.ourScore.toString()}
            </span>
            <span className="text-muted-foreground/50 mx-1 text-lg">–</span>
            <span className="text-muted-foreground">
              {game.opponentScore.toString()}
            </span>
          </div>
        </div>
        <Badge
          className={`font-bold w-10 justify-center ${
            isWin
              ? "bg-foreground text-background"
              : isTie
                ? "bg-secondary text-secondary-foreground"
                : "bg-destructive text-destructive-foreground"
          }`}
        >
          {isWin ? "W" : isTie ? "T" : "L"}
        </Badge>
      </div>
    </div>
  );
}

function AddGameDialog({ onClose }: { onClose: () => void }) {
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [ourScore, setOurScore] = useState("");
  const [opponentScore, setOpponentScore] = useState("");
  const [home, setHome] = useState(true);
  const addGame = useAddGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !opponent.trim() || ourScore === "" || opponentScore === "")
      return;
    try {
      const timestamp = new Date(date).getTime();
      await addGame.mutateAsync({
        date: timestamp,
        opponent: opponent.trim(),
        ourScore: Number.parseInt(ourScore),
        opponentScore: Number.parseInt(opponentScore),
        home,
      });
      const won = Number.parseInt(ourScore) > Number.parseInt(opponentScore);
      toast.success(
        `Game logged! The Knights ${won ? "won" : "played"} vs ${opponent}.`,
      );
      onClose();
    } catch {
      toast.error("Failed to log game. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label htmlFor="game-date">Game Date</Label>
        <Input
          id="game-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          data-ocid="games.date.input"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="opponent">Opponent</Label>
        <Input
          id="opponent"
          placeholder="e.g. Eagle Ridge Warriors"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          data-ocid="games.opponent.input"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="our-score">Our Score</Label>
          <Input
            id="our-score"
            type="number"
            min="0"
            placeholder="0"
            value={ourScore}
            onChange={(e) => setOurScore(e.target.value)}
            data-ocid="games.our_score.input"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="their-score">Their Score</Label>
          <Input
            id="their-score"
            type="number"
            min="0"
            placeholder="0"
            value={opponentScore}
            onChange={(e) => setOpponentScore(e.target.value)}
            data-ocid="games.opp_score.input"
            required
          />
        </div>
      </div>
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Label htmlFor="home-away" className="cursor-pointer">
          <span className="font-medium">Home Game</span>
          <p className="text-xs text-muted-foreground">
            {home ? "Playing at home" : "Playing away"}
          </p>
        </Label>
        <Switch
          id="home-away"
          checked={home}
          onCheckedChange={setHome}
          data-ocid="games.home.switch"
        />
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="submit"
          disabled={addGame.isPending}
          data-ocid="games.add.submit_button"
          className="w-full bg-foreground hover:bg-foreground/90 text-background"
        >
          {addGame.isPending ? "Logging..." : "Log Game"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function GamesPage() {
  const { data: games, isLoading } = useGames();
  const { data: isAdmin } = useIsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);

  const wins = games?.filter((g) => g.ourScore > g.opponentScore).length ?? 0;
  const losses = games?.filter((g) => g.ourScore < g.opponentScore).length ?? 0;
  const ties = games?.filter((g) => g.ourScore === g.opponentScore).length ?? 0;

  const sortedGames = games
    ? [...games].sort((a, b) => Number(b.date) - Number(a.date))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Game Log
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {games?.length ?? 0} game{games?.length !== 1 ? "s" : ""} played
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="games.add.open_modal_button"
                className="bg-foreground hover:bg-foreground/90 text-background"
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Log Game
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="games.add.dialog">
              <DialogHeader>
                <DialogTitle className="font-display">Log New Game</DialogTitle>
              </DialogHeader>
              <AddGameDialog onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Win/Loss Quick Stats */}
      {games && games.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted border border-border rounded-lg p-3 text-center">
            <div className="stat-number text-2xl text-foreground">{wins}</div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              Wins
            </div>
          </div>
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
            <div className="stat-number text-2xl text-destructive">
              {losses}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              Losses
            </div>
          </div>
          <div className="bg-muted border border-border rounded-lg p-3 text-center">
            <div className="stat-number text-2xl text-muted-foreground">
              {ties}
            </div>
            <div className="text-xs text-muted-foreground font-medium mt-0.5">
              Ties
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div data-ocid="games.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!games || games.length === 0) && (
        <div
          data-ocid="games.empty_state"
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
        >
          <Trophy className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            No games logged yet
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "Log your first game to get started."
              : "Sign in as admin to log games."}
          </p>
        </div>
      )}

      {/* Games list */}
      {!isLoading && sortedGames.length > 0 && (
        <div className="space-y-2">
          {sortedGames.map((game, i) => (
            <GameCard key={game.id.toString()} game={game} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
