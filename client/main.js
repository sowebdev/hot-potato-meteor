GamesDb = new Meteor.Collection('game');
Players = new Meteor.Collection('players');

var phaserConfig = {
    width: 900,
    height: 500,
    renderer: Phaser.AUTO,
    parent: 'gameContainer',
    //Disable game pause when browser loses focus
    disableVisibilityChange: true
};

var game = null;

// Client receives games he is allowed to see
Meteor.subscribe('game');

Session.setDefault('isGameRunning', false);

// When the client connects, store his connection ID
Deps.autorun(function () {
    var status = Meteor.status();
    if (status.connected) {
        Meteor.call('getSessionId', function (error, result) {
            if (!error) {
                Session.set('userId', result);
            }
        });
    }
});

// Observe game status change
Deps.autorun(function () {
    var gameDb = GamesDb.findOne({
        status: 'running'
    });
    if (gameDb) {
        //Subscribe to players sync for current game
        Meteor.subscribe('players', gameDb._id);
        if (Session.get('isGameRunning') === false) {
            //Run the game
            game = new HotPotatoe.Game(new Phaser.Game(phaserConfig), gameDb._id);
            game.setUp(gameDb.players);
            game.start();
            Session.set('isGameRunning', true);
        }
    }
});

//Sync players changes
Deps.autorun(function() {
    var playersDb = Players.find();
    playersDb.forEach(function(playerDb) {
        if (game) {
            var _player = _.findWhere(game.players, {id: playerDb.id});
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
        }
    });
});