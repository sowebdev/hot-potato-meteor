//GamesDb = new Meteor.Collection('game');
//// Live game data will be kept in memory only in order to minimize latency
//Sprites = new Meteor.Collection('sprite', {connection: null});
////Store every server-side game instance in following array
//GameInstances = [];
//
//// Server publishes games where the client is registered
//Meteor.publish('game', function () {
//    return GamesDb.find({
//        players: this.connection.id
//    });
//});
//
//// Server publishes sprite data for a given game
//Meteor.publish('sprite', function (game) {
//    return Sprites.find({
//        game: game
//    });
//});
//
//// When a user connects
//// find him a pending game or create a new one
//Meteor.onConnection(function (connection) {
//    var game = GamesDb.findOne({
//        status: 'pending'
//    });
//    if (game) {
//        GamesDb.update(game._id, {
//            $push: {
//                players: connection.id
//            }
//        });
//    } else {
//        var gameId = GamesDb.insert({
//            status: 'pending',
//            players: [connection.id]
//        });
//        //Create server-side phaser game instance
//        var phaserConfig = {
//            width: 900,
//            height: 500
//        };
//        GameInstances[gameId] = new HotPotatoe.Game(new Phaser.Game(phaserConfig), gameId);
//    }
//    //Initialize user actions
//    UserActions[connection.id] = {
//        cursors: {
//            left: {isDown: false},
//            right: {isDown: false},
//            up: {isDown: false},
//            down: {isDown: false}
//        }
//    };
//});
//
//Meteor.methods({
//    // Enable a user to get it's connection ID
//    getSessionId: function () {
//        return this.connection.id;
//    }
//});
//
//// If a pending game has enough players, then run it
//var games = GamesDb.find({
//    status: 'pending'
//});
//games.observe({
//    changed: function (newDocument, oldDocument) {
//        if (newDocument.players.length === 2) {
//            //Update game status
//            GamesDb.update(newDocument._id, {
//                $set: {
//                    status: 'running'
//                }
//            });
//            //Run server-side game
//            GameInstances[newDocument._id].setUp(newDocument.players);
//            GameInstances[newDocument._id].start();
//        }
//    }
//});