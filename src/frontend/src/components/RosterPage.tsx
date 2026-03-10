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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera, Trash2, UserPlus, Users } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Player } from "../backend";
import {
  PositionType,
  useAddPlayer,
  useAllPlayerPhotos,
  useIsAdmin,
  usePlayers,
  useRemovePlayer,
  useSetPlayerPhoto,
} from "../hooks/useQueries";

const POSITION_LABELS: Record<PositionType, string> = {
  [PositionType.attack]: "Attack",
  [PositionType.midfield]: "Midfield",
  [PositionType.defense]: "Defense",
  [PositionType.goalie]: "Goalie",
};

const POSITION_COLORS: Record<PositionType, string> = {
  [PositionType.attack]: "bg-red-100 text-red-700 border-red-200",
  [PositionType.midfield]: "bg-blue-100 text-blue-700 border-blue-200",
  [PositionType.defense]: "bg-muted text-foreground border-foreground/20",
  [PositionType.goalie]: "bg-accent/20 text-accent-foreground border-accent/30",
};

function AddPlayerDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [position, setPosition] = useState<PositionType | "">("");
  const addPlayer = useAddPlayer();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !number || !position) return;
    try {
      await addPlayer.mutateAsync({
        name: name.trim(),
        number: Number.parseInt(number),
        position: position as PositionType,
      });
      toast.success(`${name} added to the roster!`);
      onClose();
    } catch {
      toast.error("Failed to add player. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
      <div className="space-y-1.5">
        <Label htmlFor="player-name">Player Name</Label>
        <Input
          id="player-name"
          placeholder="e.g. Jake Thompson"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-ocid="roster.player.input"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="jersey-number">Jersey Number</Label>
        <Input
          id="jersey-number"
          type="number"
          min="0"
          max="99"
          placeholder="e.g. 12"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          data-ocid="roster.number.input"
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label>Position</Label>
        <Select
          value={position}
          onValueChange={(v) => setPosition(v as PositionType)}
          required
        >
          <SelectTrigger data-ocid="roster.position.select">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PositionType.attack}>Attack</SelectItem>
            <SelectItem value={PositionType.midfield}>Midfield</SelectItem>
            <SelectItem value={PositionType.defense}>Defense</SelectItem>
            <SelectItem value={PositionType.goalie}>Goalie</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter className="pt-2">
        <Button
          type="submit"
          disabled={addPlayer.isPending}
          data-ocid="roster.add.submit_button"
          className="w-full bg-foreground hover:bg-foreground/90 text-background"
        >
          {addPlayer.isPending ? "Adding..." : "Add to Roster"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function PlayerAvatar({
  player,
  photoUrl,
  isAdmin,
  index,
}: {
  player: Player;
  photoUrl: string | undefined;
  isAdmin: boolean;
  index: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setPlayerPhoto = useSetPlayerPhoto();

  const handlePhotoClick = () => {
    if (!isAdmin) return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      handlePhotoClick();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      toast.warning("Photo is large (>500KB). Upload may be slow.");
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        await setPlayerPhoto.mutateAsync({ playerId: player.id, dataUrl });
        toast.success("Photo updated!");
      } catch {
        toast.error("Failed to upload photo.");
      }
    };
    reader.readAsDataURL(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  return (
    <div className="relative flex-shrink-0">
      <div
        role={isAdmin ? "button" : undefined}
        tabIndex={isAdmin ? 0 : undefined}
        className={`w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center ${
          photoUrl ? "" : "bg-foreground"
        } ${isAdmin ? "cursor-pointer" : ""} group relative`}
        onClick={handlePhotoClick}
        onKeyDown={handleKeyDown}
        data-ocid={`roster.player.upload_button.${index}`}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="stat-number text-background text-sm">
            #{player.number.toString()}
          </span>
        )}
        {isAdmin && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
            <Camera className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      {isAdmin && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
    </div>
  );
}

function PlayerRow({
  player,
  photoUrl,
  isAdmin,
  index,
}: {
  player: Player;
  photoUrl: string | undefined;
  isAdmin: boolean;
  index: number;
}) {
  const removePlayer = useRemovePlayer();

  const handleRemove = async () => {
    try {
      await removePlayer.mutateAsync(player.id);
      toast.success(`${player.name} removed from roster.`);
    } catch {
      toast.error("Failed to remove player.");
    }
  };

  return (
    <div
      data-ocid={`roster.player.item.${index}`}
      className="flex items-center justify-between p-3.5 sm:p-4 bg-card border border-border rounded-lg hover:border-foreground/20 hover:shadow-card transition-all"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <PlayerAvatar
          player={player}
          photoUrl={photoUrl}
          isAdmin={isAdmin}
          index={index}
        />
        <div>
          <p className="font-display font-semibold text-foreground leading-none mb-1">
            {player.name}
          </p>
          <Badge
            variant="outline"
            className={`text-xs ${POSITION_COLORS[player.position]}`}
          >
            {POSITION_LABELS[player.position]}
          </Badge>
        </div>
      </div>

      {isAdmin && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              data-ocid={`roster.player.delete_button.${index}`}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="roster.remove.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Player</AlertDialogTitle>
              <AlertDialogDescription>
                Remove <strong>{player.name}</strong> (#
                {player.number.toString()}) from the roster? This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="roster.remove.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemove}
                data-ocid="roster.remove.confirm_button"
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {removePlayer.isPending ? "Removing..." : "Remove"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

export default function RosterPage() {
  const { data: players, isLoading } = usePlayers();
  const { data: isAdmin } = useIsAdmin();
  const { data: photosMap } = useAllPlayerPhotos();
  const [dialogOpen, setDialogOpen] = useState(false);

  const groupedPlayers = {
    [PositionType.attack]:
      players?.filter((p) => p.position === PositionType.attack) ?? [],
    [PositionType.midfield]:
      players?.filter((p) => p.position === PositionType.midfield) ?? [],
    [PositionType.defense]:
      players?.filter((p) => p.position === PositionType.defense) ?? [],
    [PositionType.goalie]:
      players?.filter((p) => p.position === PositionType.goalie) ?? [],
  };

  let globalIndex = 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Team Roster
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {players?.length ?? 0} player{players?.length !== 1 ? "s" : ""} on
            the squad
          </p>
        </div>

        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-ocid="roster.add.open_modal_button"
                className="bg-foreground hover:bg-foreground/90 text-background"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="roster.add.dialog">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Add New Player
                </DialogTitle>
              </DialogHeader>
              <AddPlayerDialog onClose={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isAdmin && (
        <p className="text-xs text-muted-foreground">
          Tip: Click a player&apos;s avatar to upload a photo.
        </p>
      )}

      {/* Loading */}
      {isLoading && (
        <div data-ocid="roster.loading_state" className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!players || players.length === 0) && (
        <div
          data-ocid="roster.empty_state"
          className="text-center py-16 border-2 border-dashed border-border rounded-xl"
        >
          <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
          <p className="font-display font-semibold text-foreground">
            No players yet
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "Add players to build out the roster."
              : "Sign in as admin to add players."}
          </p>
        </div>
      )}

      {/* Players grouped by position */}
      {!isLoading && players && players.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedPlayers).map(([pos, posPlayers]) => {
            if (posPlayers.length === 0) return null;
            return (
              <div key={pos}>
                <h3 className="font-display font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-2 px-1">
                  {POSITION_LABELS[pos as PositionType]}
                  <span className="ml-2 text-xs font-normal">
                    ({posPlayers.length})
                  </span>
                </h3>
                <div className="space-y-2">
                  {posPlayers.map((player) => {
                    globalIndex += 1;
                    return (
                      <PlayerRow
                        key={player.id.toString()}
                        player={player}
                        photoUrl={photosMap?.get(player.id.toString())}
                        isAdmin={!!isAdmin}
                        index={globalIndex}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
