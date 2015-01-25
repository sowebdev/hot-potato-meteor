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
    gameExists: function() {
        var currentRoom = GameRooms.currentRoom();
        if (currentRoom && currentRoom.game) {
            return true;
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
    }
});