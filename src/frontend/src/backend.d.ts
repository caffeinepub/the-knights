import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface UserProfile {
    name: string;
}
export enum PositionType {
    goalie = "goalie",
    midfield = "midfield",
    defense = "defense",
    attack = "attack"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addGame(date: Time, opponent: string, ourScore: bigint, opponentScore: bigint, home: boolean): Promise<bigint>;
    addPlayer(name: string, number: bigint, position: PositionType): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllStats(): Promise<Array<[bigint, StatLine]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGames(): Promise<Array<Game>>;
    getPlayerStats(playerId: bigint): Promise<StatLine>;
    getPlayers(): Promise<Array<Player>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removePlayer(playerId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updatePlayerStats(playerId: bigint, stats: StatLine): Promise<void>;
}
