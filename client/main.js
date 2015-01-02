GamesDb = new Meteor.Collection('game');
Players = new Meteor.Collection('players');

// Client receives games where he is a player
Tracker.autorun(function(){
    Meteor.subscribe('game', GamePlayers.playerId());
});

// Observe game status change
GameInstance.observeGameStatus();