import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PositionType, type StatLine } from "../backend";
import { useAdmin } from "../contexts/AdminContext";
import { useActor } from "./useActor";

export { PositionType };

export function usePlayers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPlayers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGames() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGames();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allStats"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { isAdmin } = useAdmin();
  return { data: isAdmin };
}

export function useAddPlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      number,
      position,
    }: {
      name: string;
      number: number;
      position: PositionType;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addPlayer(name, BigInt(number), position);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useRemovePlayer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (playerId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removePlayer(playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["allStats"] });
    },
  });
}

export function useAddGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      opponent,
      ourScore,
      opponentScore,
      home,
    }: {
      date: number;
      opponent: string;
      ourScore: number;
      opponentScore: number;
      home: boolean;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addGame(
        BigInt(date),
        opponent,
        BigInt(ourScore),
        BigInt(opponentScore),
        home,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
  });
}

export function useUpdateStats() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerId,
      stats,
    }: {
      playerId: bigint;
      stats: StatLine;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updatePlayerStats(playerId, stats);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allStats"] });
    },
  });
}

export function usePlayerStats(playerId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playerStats", playerId?.toString()],
    queryFn: async () => {
      if (!actor || playerId === null) return null;
      return actor.getPlayerStats(playerId);
    },
    enabled: !!actor && !isFetching && playerId !== null,
  });
}

// Player Photos
export function useAllPlayerPhotos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["playerPhotos"],
    queryFn: async () => {
      if (!actor) return new Map<string, string>();
      const entries = await (actor as any).getAllPlayerPhotos();
      const map = new Map<string, string>();
      for (const [id, url] of entries) {
        map.set(id.toString(), url);
      }
      return map;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetPlayerPhoto() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerId,
      dataUrl,
    }: { playerId: bigint; dataUrl: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).setPlayerPhoto(playerId, dataUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerPhotos"] });
    },
  });
}

// Scheduled Games
export interface ScheduledGame {
  id: bigint;
  date: bigint;
  opponent: string;
  home: boolean;
  location: string | null;
  notes: string | null;
}

export function useScheduledGames() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["scheduledGames"],
    queryFn: async () => {
      if (!actor) return [] as ScheduledGame[];
      return (actor as any).getScheduledGames() as Promise<ScheduledGame[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddScheduledGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      date,
      opponent,
      home,
      location,
      notes,
    }: {
      date: number;
      opponent: string;
      home: boolean;
      location: string | null;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).addScheduledGame(
        BigInt(date),
        opponent,
        home,
        location,
        notes,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledGames"] });
    },
  });
}

export function useRemoveScheduledGame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gameId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).removeScheduledGame(gameId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledGames"] });
    },
  });
}
