GamesDb = new Meteor.Collection('game');
Players = new Meteor.Collection('players');

//A room owner can start a game if there are enough players
GameRooms.authorizeGameStartCallback = function (roomId) {
    var room = GameRooms.rooms.findOne(roomId);
    if (room) {
        return room.players.length >= 2;
    }
    return false;
};

// Client receives games of the room
Tracker.autorun(function(){
    Meteor.subscribe('game', GameRooms.currentRoomId());
});

// Observe game status change
GameInstance.observeGameStatus();