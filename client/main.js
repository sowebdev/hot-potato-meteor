GamesDb = new Meteor.Collection('game');
Players = new Meteor.Collection('players');

// Client receives games where he is a player
Deps.autorun(function(){
    Meteor.subscribe('game', GamePlayers.playerId());
});

var phaserConfig = {
    width: 700,
    height: 500,
    renderer: Phaser.AUTO,
    parent: 'gameContainer',
    //Disable game pause when browser loses focus
    disableVisibilityChange: true
};

GameInstance = {};
GameInstance.game = null;
GameInstance.createGame = function (id) {
    //Subscribe to players sync for current game
    Meteor.subscribe('players', id);
    if (!GameInstance.game) {
        //Run the game
        var gameDb = GamesDb.findOne(id);
        GameInstance.game = new HotPotatoe.Game(new Phaser.Game(phaserConfig), id);
        GameInstance.game.setUp(gameDb.players);
        GameInstance.game.start();
        //Sync players changes
        Deps.autorun(updateSyncData);
    }
};
GameInstance.destroyGame = function () {
    if (GameInstance.game) {
        GameInstance.game.phaser.destroy();
        GameInstance.game = null;
    }
};
GameInstance.observeGameStatus = function () {
    var gamesDb = GamesDb.find();
    gamesDb.observe({
        added: function(doc){
            if (doc.status == 'running') {
                GameInstance.createGame(doc._id);
            }
        },
        changed: function(newDoc, oldDoc){
            if (newDoc.status == 'running' && oldDoc.status != 'running') {
                GameInstance.createGame(newDoc._id);
            }
            if (newDoc.status == 'end' && oldDoc.status != 'end') {
                GameInstance.destroyGame();
            }
        }
    });
};

var updateSyncData = function () {
    var playersDb = Players.find();
    if (GameInstance.game) {
        playersDb.forEach(function(playerDb) {
            var _player = _.findWhere(GameInstance.game.players, {id: playerDb.id});
            if (_player) {
                _player.setHotPotatoe(playerDb.isHotPotatoe);
                if (_player.sprite) {
                    _player.sprite.x = playerDb.sprite.x;
                    _player.sprite.y = playerDb.sprite.y;
                    _player.sprite.width = playerDb.sprite.width;
                    _player.sprite.height = playerDb.sprite.height;
                    _player.sprite.angle = playerDb.sprite.angle;
                }
            }
        });
    }
};

// Observe game status change
GameInstance.observeGameStatus();