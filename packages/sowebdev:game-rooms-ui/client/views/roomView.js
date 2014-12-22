Template.roomView.helpers({
    isOwner: function () {
        return this.owner == GamePlayers.playerId();
    },
    gameExists: function() {
        var currentRoom = GameRooms.currentRoom();
        if (currentRoom && currentRoom.game) {
            return true;
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