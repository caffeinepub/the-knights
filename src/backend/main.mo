import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  public type PositionType = {
    #attack;
    #midfield;
    #defense;
    #goalie;
  };

  public type Player = {
    id : Nat;
    name : Text;
    number : Nat;
    position : PositionType;
  };

  module Player {
    public func compare(p1 : Player, p2 : Player) : Order.Order {
      if (p1.id < p2.id) { #less } else if (p1.id > p2.id) { #greater } else { #equal };
    };
  };

  public type Game = {
    id : Nat;
    date : Time.Time;
    opponent : Text;
    ourScore : Nat;
    opponentScore : Nat;
    home : Bool;
  };

  module Game {
    public func compare(g1 : Game, g2 : Game) : Order.Order {
      if (g1.id < g2.id) { #less } else if (g1.id > g2.id) { #greater } else { #equal };
    };
  };

  public type StatLine = {
    goals : Nat;
    assists : Nat;
    shots : Nat;
    groundBalls : Nat;
    saves : Nat;
    turnovers : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  public type ScheduledGame = {
    id : Nat;
    date : Time.Time;
    opponent : Text;
    home : Bool;
    location : ?Text;
    notes : ?Text;
  };

  module ScheduledGame {
    public func compare(g1 : ScheduledGame, g2 : ScheduledGame) : Order.Order {
      if (g1.id < g2.id) { #less } else if (g1.id > g2.id) { #greater } else { #equal };
    };
  };

  var nextPlayerId = 1;
  var nextGameId = 1;
  var nextScheduledGameId = 1;

  let players = Map.empty<Nat, Player>();
  let games = Map.empty<Nat, Game>();
  let playerStats = Map.empty<Nat, StatLine>();
  let playerPhotos = Map.empty<Nat, Text>();
  let scheduledGames = Map.empty<Nat, ScheduledGame>();

  // Preserved for upgrade compatibility -- not used for auth
  let userProfiles = Map.empty<Principal, UserProfile>();
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Player Management
  public shared func addPlayer(name : Text, number : Nat, position : PositionType) : async () {
    let player : Player = { id = nextPlayerId; name; number; position };
    players.add(nextPlayerId, player);
    nextPlayerId += 1;
  };

  public shared func removePlayer(playerId : Nat) : async () {
    if (not players.containsKey(playerId)) {
      Runtime.trap("Player does not exist");
    };
    players.remove(playerId);
    playerStats.remove(playerId);
    playerPhotos.remove(playerId);
  };

  public query func getPlayers() : async [Player] {
    players.values().toArray().sort();
  };

  // Player Photos
  public shared func setPlayerPhoto(playerId : Nat, dataUrl : Text) : async () {
    playerPhotos.add(playerId, dataUrl);
  };

  public query func getAllPlayerPhotos() : async [(Nat, Text)] {
    playerPhotos.toArray();
  };

  // Game Management
  public shared func addGame(date : Time.Time, opponent : Text, ourScore : Nat, opponentScore : Nat, home : Bool) : async Nat {
    let game : Game = { id = nextGameId; date; opponent; ourScore; opponentScore; home };
    games.add(nextGameId, game);
    nextGameId += 1;
    game.id;
  };

  public query func getGames() : async [Game] {
    games.values().toArray().sort();
  };

  // Player Stats
  public shared func updatePlayerStats(playerId : Nat, stats : StatLine) : async () {
    if (not players.containsKey(playerId)) {
      Runtime.trap("Player does not exist");
    };
    playerStats.add(playerId, stats);
  };

  public query func getPlayerStats(playerId : Nat) : async StatLine {
    switch (playerStats.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?stats) { stats };
    };
  };

  public query func getAllStats() : async [(Nat, StatLine)] {
    playerStats.toArray();
  };

  // Scheduled Games
  public shared func addScheduledGame(date : Time.Time, opponent : Text, home : Bool, location : ?Text, notes : ?Text) : async Nat {
    let game : ScheduledGame = { id = nextScheduledGameId; date; opponent; home; location; notes };
    scheduledGames.add(nextScheduledGameId, game);
    nextScheduledGameId += 1;
    game.id;
  };

  public shared func removeScheduledGame(gameId : Nat) : async () {
    scheduledGames.remove(gameId);
  };

  public query func getScheduledGames() : async [ScheduledGame] {
    scheduledGames.values().toArray().sort();
  };
};
