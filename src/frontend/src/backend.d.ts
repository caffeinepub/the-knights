export interface Player {
    id: bigint;
    name: string;
    number: bigint;
    position: PositionType;
}
export interface StatLine {
    groundBalls: bigint;
    assists: bigint;
    turnovers: bigint;
    saves: bigint;
    shots: bigint;
    goals: bigint;
}
export type Time = bigint;
export interface Game {
    id: bigint;
    date: Time;
    opponentScore: bigint;
    home: boolean;
    ourScore: bigint;
    opponent: string;
}
export interface ScheduledGame {
    id: bigint;
    date: Time;
    opponent: string;
    home: boolean;
    location: string | null;
    notes: string | null;
}
export enum PositionType {
    goalie = "goalie",
    midfield = "midfield",
    defense = "defense",
    attack = "attack"
}
export interface backendInterface {
    addGame(date: Time, opponent: string, ourScore: bigint, opponentScore: bigint, home: boolean): Promise<bigint>;
    addPlayer(name: string, number: bigint, position: PositionType): Promise<void>;
    getAllStats(): Promise<Array<[bigint, StatLine]>>;
    getGames(): Promise<Array<Game>>;
    getPlayerStats(playerId: bigint): Promise<StatLine>;
    getPlayers(): Promise<Array<Player>>;
    removePlayer(playerId: bigint): Promise<void>;
    updatePlayerStats(playerId: bigint, stats: StatLine): Promise<void>;
    setPlayerPhoto(playerId: bigint, dataUrl: string): Promise<void>;
    getAllPlayerPhotos(): Promise<Array<[bigint, string]>>;
    addScheduledGame(date: Time, opponent: string, home: boolean, location: string | null, notes: string | null): Promise<bigint>;
    removeScheduledGame(gameId: bigint): Promise<void>;
    getScheduledGames(): Promise<Array<ScheduledGame>>;
}
