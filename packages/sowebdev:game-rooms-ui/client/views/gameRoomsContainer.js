Template.gameRoomsContainer.helpers({
    panelHeading: function() {
        var title = '';
        var currentRoom = GameRooms.currentRoom();
        if (currentRoom) {
            title = currentRoom.name;
        } else {
            var currentPlayer = GamePlayers.player();
            if (currentPlayer) {
                title = 'Choose a room';
            } else {
                title = 'Create a player';
            }
        }
        return title;
    }
});