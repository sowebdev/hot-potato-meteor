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

    //small fix on server to avoid update before create was called
    this.createDone = false;

    // Sprites assets ids for every player state
    this.assetIds = {
        hotpotatoe: 'red',
        currentPlayer: 'green',
        players: 'blue'
    };

    var mainState = {
        preload: function() {
            self.phaser.load.image(self.assetIds.hotpotatoe, 'assets/circle-red.png', false, 30, 30);
            self.phaser.load.image(self.assetIds.players, 'assets/circle-blue.png', false, 30, 30);
            self.phaser.load.image(self.assetIds.currentPlayer, 'assets/circle-green.png', false, 30, 30);

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
                //Sync players changes
                Tracker.autorun(GameInstance.updateSyncData);
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

            //Display countdown
            if (Meteor.isClient) {
                var gameDb = GamesDb.findOne(self.id);
                self.countdownText = self.phaser.add.text(self.phaser.world.centerX, self.phaser.world.centerY, gameDb.secondsLeft + " seconds left !", {
                    font: "26px Arial",
                    fill: "#ff0044",
                    align: "center"
                });

                self.countdownText.anchor.setTo(0.5, 0.5);
            }

            if (Meteor.isServer) {
                self.phaser.time.events.loop(Phaser.Timer.SECOND, function() {
                    var gameDb = GamesDb.findOne(this.id);
                    if (gameDb.secondsLeft > 0) {
                        GamesDb.update(this.id, {
                            $inc: {secondsLeft: -1}
                        });
                    } else {
                        if (this.phaser.state.current != 'end') {
                            this.phaser.state.start('end');
                        }
                    }
                }, self);
            } else {
                self.phaser.time.events.loop(Phaser.Timer.SECOND, function() {
                    var gameDb = GamesDb.findOne(this.id);
                    if (gameDb.secondsLeft == 0) {
                        if (this.phaser.state.current != 'end') {
                            this.phaser.state.start('end');
                        }
                    }
                }, self);
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

            //Update countdown
            if (Meteor.isClient) {
                var gameDb = GamesDb.findOne(self.id);
                self.countdownText.setText(gameDb.secondsLeft + " seconds left !");
            }
        }
    };

    this.phaser.state.add('main', mainState);

    var endState = {
        create: function() {
            if (Meteor.isClient) {
                var style = {font: "65px Arial", fill: "#ff0044", align: "center"};
                var text = game.add.text(game.world.centerX, game.world.centerY, "Game Over", style);
                text.anchor.set(0.5);
            }

            if (Meteor.isServer) {
                //Terminate game
                self.phaser.time.events.add(Phaser.Timer.SECOND * 10, function() {
                    var gameId = self.id;
                    Players.remove({gameId: gameId});
                    GamesDb.update(gameId, {
                        $set: {status: 'end'}
                    });
                    GameInstances.splice(gameId, 1);
                    GameInstances[gameId].phaser.destroy();
                    GameRooms.rooms.update({game: gameId}, {
                        $set: {
                            game: null
                        }
                    });
                    console.log('Game ' + gameId + ' was destroyed');
                }, self);
            }
        }
    };

    this.phaser.state.add('end', endState);
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
            if (this.players[j].id == GamePlayers.playerId()) {
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