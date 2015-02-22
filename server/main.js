GamesDb = new Meteor.Collection('game');
// Live game data will be kept in memory only in order to minimize latency
Players = new Meteor.Collection('players', {connection: null});
//Store every server-side game instance in following array
GameInstances = [];

// Server publishes games of the player's room
Meteor.publish('game', function (roomId) {
    return GamesDb.find({
        room: roomId
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
        //Create server-side phaser game instance
        var phaserConfig = {
            width: 700,
            height: 500
        };

        //Create game document in DB
        var room = GameRooms.rooms.findOne(roomId);
        var gamePlayers = [];
        _.each(room.players, function(elem){
            gamePlayers.push(elem.id);
        });

        var gameId = room.game;
        if (!gameId) {
            gameId = GamesDb.insert({
                status: 'pending',
                room: roomId
            });
        }
        if (!GameInstances[gameId]) {
            GameInstances[gameId] = new HotPotatoe.Game(new Phaser.Game(phaserConfig), gameId);
        }

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
        GameInstances[gameId].setUp(gamePlayers, gameId);
        GameInstances[gameId].start();

        GamesDb.update(gameId, {
            $set: {
                status: 'running',
                secondsLeft: 10,
                players: gamePlayers
            }
        });

        return gameId;
    };
});