import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
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
      if (p1.id < p2.id) {
        #less;
      } else if (p1.id > p2.id) {
        #greater;
      } else {
        #equal;
      };
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
      if (g1.id < g2.id) {
        #less;
      } else if (g1.id > g2.id) {
        #greater;
      } else {
        #equal;
      };
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

  public type PlayerGameStats = {
    playerId : Nat;
    gameId : Nat;
    stats : StatLine;
  };

  module PlayerGameStats {
    public func compare(s1 : PlayerGameStats, s2 : PlayerGameStats) : Order.Order {
      if (s1.playerId < s2.playerId) {
        #less;
      } else if (s1.playerId > s2.playerId) {
        #greater;
      } else {
        if (s1.gameId < s2.gameId) {
          #less;
        } else if (s1.gameId > s2.gameId) {
          #greater;
        } else {
          #equal;
        };
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  var nextPlayerId = 1;
  var nextGameId = 1;

  // Storage
  let players = Map.empty<Nat, Player>();
  let games = Map.empty<Nat, Game>();
  let playerStats = Map.empty<Nat, StatLine>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Access Control
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Player Management
  public shared ({ caller }) func addPlayer(name : Text, number : Nat, position : PositionType) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add players");
    };
    let player : Player = {
      id = nextPlayerId;
      name;
      number;
      position;
    };
    players.add(nextPlayerId, player);
    nextPlayerId += 1;
  };

  public shared ({ caller }) func removePlayer(playerId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can remove players");
    };
    if (not players.containsKey(playerId)) {
      Runtime.trap("Player does not exist");
    };
    players.remove(playerId);
    playerStats.remove(playerId);
  };

  public query ({ caller }) func getPlayers() : async [Player] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view players");
    };
    players.values().toArray().sort();
  };

  // Game Management
  public shared ({ caller }) func addGame(date : Time.Time, opponent : Text, ourScore : Nat, opponentScore : Nat, home : Bool) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add games");
    };
    let game : Game = {
      id = nextGameId;
      date;
      opponent;
      ourScore;
      opponentScore;
      home;
    };
    games.add(nextGameId, game);
    nextGameId += 1;
    game.id;
  };

  public query ({ caller }) func getGames() : async [Game] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view games");
    };
    games.values().toArray().sort();
  };

  // Player Stats Management
  public shared ({ caller }) func updatePlayerStats(playerId : Nat, stats : StatLine) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update player stats");
    };

    if (not players.containsKey(playerId)) {
      Runtime.trap("Player does not exist");
    };

    playerStats.add(playerId, stats);
  };

  public query ({ caller }) func getPlayerStats(playerId : Nat) : async StatLine {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view player stats");
    };
    switch (playerStats.get(playerId)) {
      case (null) { Runtime.trap("Player not found") };
      case (?stats) { stats };
    };
  };

  public query ({ caller }) func getAllStats() : async [(Nat, StatLine)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view all stats");
    };
    playerStats.toArray();
  };
};
