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

    if (Meteor.settings.env == "development") {
        if (!Meteor.users.findOne({email: 'johntest@test.com'})) {
            var id1 = GamePlayers.players.insert({name: 'JohnTest'});
            var id2 = GamePlayers.players.insert({name: 'WillTest'});
            var id3 = GamePlayers.players.insert({name: 'StephanTest'});
            var id4 = GamePlayers.players.insert({name: 'SteveTest'});
            var id5 = GamePlayers.players.insert({name: 'BriceTest'});
            var id6 = GamePlayers.players.insert({name: 'SamTest'});
            GameRooms.rooms.insert({
                name: 'TestRoom',
                owner: id1,
                players: [
                    {name: 'JohnTest', id: id1},
                    {name: 'WillTest', id: id2},
                    {name: 'StephanTest', id: id3},
                    {name: 'SteveTest', id: id4},
                    {name: 'BriceTest', id: id5},
                    {name: 'SamTest', id: id6}
                ]
            });
            var userId1 = Accounts.createUser({
                username: "johntest",
                email: "johntest@test.com",
                password: "password",
                profile: {
                    playerId: id1
                }
            });
            GamePlayers.players.update(id1, {$set: {associationId: userId1}});
            var userId2 = Accounts.createUser({
                username: "willtest",
                email: "willtest@test.com",
                password: "password",
                profile: {
                    playerId: id2
                }
            });
            GamePlayers.players.update(id2, {$set: {associationId: userId2}});
            var userId3 = Accounts.createUser({
                username: "stephantest",
                email: "stephantest@test.com",
                password: "password",
                profile: {
                    playerId: id3
                }
            });
            GamePlayers.players.update(id3, {$set: {associationId: userId3}});
            var userId4 = Accounts.createUser({
                username: "stevetest",
                email: "stevetest@test.com",
                password: "password",
                profile: {
                    playerId: id4
                }
            });
            GamePlayers.players.update(id4, {$set: {associationId: userId4}});
            var userId5 = Accounts.createUser({
                username: "bricetest",
                email: "bricetest@test.com",
                password: "password",
                profile: {
                    playerId: id5
                }
            });
            GamePlayers.players.update(id5, {$set: {associationId: userId5}});
            var userId6 = Accounts.createUser({
                username: "samtest",
                email: "samtest@test.com",
                password: "password",
                profile: {
                    playerId: id6
                }
            });
            GamePlayers.players.update(id6, {$set: {associationId: userId6}});
        }
    }

    Kadira.connect('jqJJjTLs66EKR7gLf', '78a72023-2e43-4bda-a158-2cb889645d01');

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
            secondsLeft: 30,
            room: roomId
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