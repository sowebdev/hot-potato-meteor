Template.listRoomsView.helpers({
    gameRooms: function () {
        return GameRooms.rooms.find();
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