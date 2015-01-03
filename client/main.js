GamesDb = new Meteor.Collection('game');
Players = new Meteor.Collection('players');

// Client receives games of the room
Tracker.autorun(function(){
    Meteor.subscribe('game', GameRooms.currentRoomId());
});

// Observe game status change
GameInstance.observeGameStatus();