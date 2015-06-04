Template.roomView.helpers({
    isOwner: function (contextRoom, playerId) {
        if(typeof contextRoom === 'undefined') {
            contextRoom = this;
        }
        if(typeof playerId === 'undefined') {
            playerId = GamePlayers.playerId();
        }
        return contextRoom.owner == playerId;
    },
    isCurrentPlayerOwner: function (contextRoom) {
        if(typeof contextRoom === 'undefined') {
            contextRoom = this;
        }
        return GamePlayers.playerId() == contextRoom.owner;
    },
    gameRunning: function() {
        var currentRoom = GameRooms.currentRoom();
        if (currentRoom && currentRoom.game) {
            var game = GamesDb.findOne(currentRoom.game);
            if (game && game.status == 'running') {
                return true;
            }
        }
        return false;
    },
    gameCanStart: function() {
        var currentRoomId = GameRooms.currentRoomId();
        if (currentRoomId) {
            return GameRooms.authorizeGameStartCallback(currentRoomId);
        }
        return false;
    }
});

Template.roomView.events({
    'click .startGame': function(){
        Meteor.call('startGame');
        return false;
    },
    'click .leave': function(){
        GameRooms.leaveRoom();
        return false;
    },
    'click .kickPlayer': function() {
        GameRooms.kickPlayer(this.id);
        return false;
    }
});