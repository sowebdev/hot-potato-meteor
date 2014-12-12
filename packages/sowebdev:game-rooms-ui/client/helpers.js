Template.registerHelper('currentRoom', function(){
    return GameRooms.currentRoom();
});

Template.registerHelper('currentPlayer', function(){
    return GamePlayers.player();
});