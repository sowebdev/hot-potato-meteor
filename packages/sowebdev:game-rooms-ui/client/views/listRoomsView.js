Template.listRoomsView.helpers({
    gameRooms: function () {
        return GameRooms.rooms.find();
    },
    countPlayers: function () {
        return this.players.length;
    },
    formatPlayerCount: function (count) {
        var countString = count + ' player';
        if (count > 1) {
            countString += 's';
        }
        return countString;
    }
});

Template.listRoomsView.events({
    'click #confirmRoomCreation': function(){
        var name = jQuery('#createRoom').val();
        if (name) {
            GameRooms.createRoom(name);
        }
        return false;
    },
    'click .chooseRoom': function(){
        GameRooms.joinRoom(this._id);
        return false;
    }
});