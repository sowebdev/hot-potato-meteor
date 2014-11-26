GamesDb = new Meteor.Collection('game');
Sprites = new Meteor.Collection('sprite');

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
        //Subscribe to sprite sync for current game
        Meteor.subscribe('sprite', gameDb._id);
        if (Session.get('isGameRunning') === false) {
            //Run the game
            console.log('TODO : setup and run game');
            Session.set('isGameRunning', true);
        }
    }
});

//Sync sprite changes
Deps.autorun(function(){
    var spriteDb = Sprites.find();
    spriteDb.forEach(function(spriteDb){
        if (game) {
            var sprite = _.findWhere(game.sprites, {syncId: spriteDb.syncId});
            if (sprite) {
                sprite.x = spriteDb.x;
                sprite.y = spriteDb.y;
                sprite.width = spriteDb.width;
                sprite.height = spriteDb.height;
                sprite.angle = spriteDb.angle;
            }
        }
    });
});