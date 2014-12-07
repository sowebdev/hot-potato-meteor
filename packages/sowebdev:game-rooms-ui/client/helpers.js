Template.registerHelper('hasRoom', function(){
    if (GameRooms.currentRoomId()) {
        return true;
    }
    return false;
});

Template.registerHelper('hasPlayerProfile', function(){
    if (GamePlayers.playerId()) {
        return true;
    }
    return false;
});