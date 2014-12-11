if (typeof HotPotatoe === "undefined") {
    HotPotatoe = {};
}

/**
 * Main game object
 *
 * @param {Phaser.Game} game
 * @param {string} id
 * @constructor
 */
HotPotatoe.Game = function(game, id) {
    var self = this;

    this.phaser = game;
    this.id = id;

    this.players = [];

    //Will hold every sprites by their syncId
    this.sprites = {};

    //small fix on server to avoid update before create was called
    this.createDone = false;

    var mainState = {
        preload: function() {
            for (var i = 0; i < self.players.length; i++) {
                self.players[i].preload();
            }
        },
        create: function() {
            if (Meteor.isServer) {
                self.phaser.physics.startSystem(Phaser.Physics.P2JS);
            }
            self.phaser.stage.backgroundColor = '#2d2d2d';

            for (var i = 0; i < self.players.length; i++) {
                self.players[i].create();
                if (Meteor.isServer) {
                    SyncPlayer.insert(self.id, self.players[i]);
                }
            }

            if (Meteor.isClient) {
                //Handling input sent to server
                self.cursors = self.phaser.input.keyboard.createCursorKeys();
                self.cursors.left.onDown.add(InputManager.keyDown, self.cursors.left);
                self.cursors.left.onUp.add(InputManager.keyUp, self.cursors.left);
                self.cursors.right.onDown.add(InputManager.keyDown, self.cursors.right);
                self.cursors.right.onUp.add(InputManager.keyUp, self.cursors.right);
                self.cursors.up.onDown.add(InputManager.keyDown, self.cursors.up);
                self.cursors.up.onUp.add(InputManager.keyUp, self.cursors.up);
                self.cursors.down.onDown.add(InputManager.keyDown, self.cursors.down);
                self.cursors.down.onUp.add(InputManager.keyUp, self.cursors.down);
            }
            self.createDone = true;
        },
        update: function() {
            if (!self.createDone) {
                return;
            }

            for (var i = 0; i < self.players.length; i++) {
                self.players[i].update();
                if (Meteor.isServer) {
                    SyncPlayer.update(self.players[i]);
                }
            }
        }
    };

    this.phaser.state.add('main', mainState);
};

/**
 * Configure game with players
 *
 * @param {string[]} players
 */
HotPotatoe.Game.prototype.setUp = function(players) {
    //Add players to game
    for (var i = 0; i < players.length; i++) {
        this.players.push(new HotPotatoe.Player(this, players[i]));
    }

    if (Meteor.isServer) {
        this.players[new Phaser.RandomDataGenerator().between(0, this.players.length - 1)].setHotPotatoe(true);
    }

    if (Meteor.isClient) {
        //Flag user's player
        for (var j = 0; j < this.players.length; j++) {
            if (this.players[j].id == Session.get('userId')) {
                this.players[j].isCurrentPlayer = true;
            }
        }
    }
};

/**
 * Start game
 */
HotPotatoe.Game.prototype.start = function() {
    this.phaser.state.start('main');
};