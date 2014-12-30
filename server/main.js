GamesDb = new Meteor.Collection('game');
// Live game data will be kept in memory only in order to minimize latency
Players = new Meteor.Collection('players', {connection: null});
//Store every server-side game instance in following array
GameInstances = [];

// Server publishes games where the client is registered
Meteor.publish('game', function (playerId) {
    return GamesDb.find({
        players: playerId
    });
});

// Server publishes player data for a given game
Meteor.publish('players', function (game) {
    return Players.find({
        gameId: game
    });
});

Meteor.startup(function(){
    GameRooms.startGameCallback = function(roomId){
        //Create game document in DB
        var room = GameRooms.rooms.findOne(roomId);
        var gamePlayers = [];
        _.each(room.players, function(elem){
            gamePlayers.push(elem.id);
        });
        var gameId = GamesDb.insert({
            status: 'pending',
            players: gamePlayers,
            secondsLeft: 30
        });

        //Create server-side phaser game instance
        var phaserConfig = {
            width: 700,
            height: 500
        };
        GameInstances[gameId] = new HotPotatoe.Game(new Phaser.Game(phaserConfig), gameId);

        //Initialize user actions
        _.each(gamePlayers, function(playerId){
            UserActions[playerId] = {
                cursors: {
                    left: {isDown: false},
                    right: {isDown: false},
                    up: {isDown: false},
                    down: {isDown: false}
                }
            };
        });

        //Run server-side game instance
        GameInstances[gameId].setUp(gamePlayers);
        GameInstances[gameId].start();

        GamesDb.update(gameId, {
            $set: {status: 'running'}
        });

        return gameId;
    };
});