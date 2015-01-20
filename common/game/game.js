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
    this.isSpectatorMode = false;

    //small fix on server to avoid update before create was called
    this.createDone = false;

    // Sprites assets ids for every player state
    this.assetIds = {
        hotpotatoe: 'red',
        currentPlayer: 'green',
        players: 'blue'
    };

    //TODO remove this hacky fix which tries to avoid running code defined in a looped event multiples times
    this.passedPrepareEnd = false;

    var mainState = {
        preload: function() {
            self.phaser.load.image(self.assetIds.hotpotatoe, 'assets/circle-red.png', false, 30, 30);
            self.phaser.load.image(self.assetIds.players, 'assets/circle-blue.png', false, 30, 30);
            self.phaser.load.image(self.assetIds.currentPlayer, 'assets/circle-green.png', false, 30, 30);
            self.phaser.load.image('pixel', 'assets/pixel.png', false, 5, 5);

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

                //Prepare particle emitter for final explosion
                self.finalExplosionEmitter = self.phaser.add.emitter(0, 0, 100);
                self.finalExplosionEmitter.makeParticles('pixel');
                self.finalExplosionEmitter.setYSpeed(-150, 150);
                self.finalExplosionEmitter.setXSpeed(-150, 150);
                self.finalExplosionEmitter.minParticleScale = 0.1;
                self.finalExplosionEmitter.maxParticleScale = 1;
                self.finalExplosionEmitter.minRotation = 0;
                self.finalExplosionEmitter.maxRotation = 90;
                self.finalExplosionEmitter.gravity = 0;

                //Sync players changes
                Tracker.autorun(GameInstance.updateSyncData);
            }

            if (Meteor.isClient) {
                if (self.isSpectatorMode) {
                    self.spectatorText = self.phaser.add.text(self.phaser.world.centerX, self.phaser.world.height - 15, "Spectator", {
                        font: "16px Arial",
                        fill: "#ffffff",
                        align: "center"
                    });
                    self.spectatorText.anchor.setTo(0.5, 0.5);
                } else {
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
            }

            //Display countdown
            if (Meteor.isClient) {
                var gameDb = GamesDb.findOne(self.id);
                self.countdownText = self.phaser.add.text(self.phaser.world.centerX, 15, GameInstance.formatSecondsForCountdown(gameDb.secondsLeft), {
                    font: "18px Arial",
                    fontWeight: "bold",
                    fill: "#ffffff",
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
                        if (!this.passedPrepareEnd) {
                            //Stop every player and mark loser
                            for (var i = 0; i < self.players.length; i++) {
                                self.players[i].canMove = false;
                                if (self.players[i].isHotPotatoe) {
                                    self.players[i].isLoser = true;
                                    self.players[i].sprite.kill();
                                }
                            }
                            //And wait a few seconds before switching to end state
                            self.phaser.time.events.add(Phaser.Timer.SECOND * 3, function() {
                                if (this.phaser.state.current != 'end') {
                                    this.phaser.state.start('end');
                                }
                            }, self);
                            this.passedPrepareEnd = true;
                        }
                    }
                }, self);
            } else {
                self.phaser.time.events.loop(Phaser.Timer.SECOND, function() {
                    var gameDb = GamesDb.findOne(this.id);
                    if (gameDb.secondsLeft == 0) {
                        if (this.phaser.state.current != 'end') {
                            if (!this.passedPrepareEnd) {

                                for (var i = 0; i < self.players.length; i++) {
                                    if (self.players[i].isHotPotatoe) {
                                        self.players[i].isLoser = true;
                                        this.finalExplosionEmitter.x = self.players[i].sprite.x;
                                        this.finalExplosionEmitter.y = self.players[i].sprite.y;
                                    }
                                }

                                this.finalExplosionEmitter.start(true, 2500, null, 100);

                                //After a few seconds we switch to end state
                                self.phaser.time.events.add(Phaser.Timer.SECOND * 3, function() {
                                    this.phaser.state.start('end');
                                }, self);

                                this.passedPrepareEnd = true;
                            }
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
                self.countdownText.setText(GameInstance.formatSecondsForCountdown(gameDb.secondsLeft));
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

                var loser = null;
                var currentRoom =  GameRooms.currentRoom();
                for (var i = 0; i < self.players.length; i++) {
                    if (self.players[i].isLoser) {
                        loser =_.findWhere(currentRoom.players, {id: self.players[i].id});
                    }
                }
                var loserText = game.add.text(game.world.centerX, game.world.centerY + 40, loser.name + " lost the game !", {
                    font: "16px Arial",
                    fill: "#ffffff",
                    align: "center"
                });
                loserText.anchor.set(0.5);

                if (self.isSpectatorMode) {
                    self.spectatorText = self.phaser.add.text(self.phaser.world.centerX, self.phaser.world.height - 15, "Spectator", {
                        font: "16px Arial",
                        fill: "#ffffff",
                        align: "center"
                    });
                    self.spectatorText.anchor.setTo(0.5, 0.5);
                }
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

    if (players.indexOf(GamePlayers.playerId()) == -1) {
        this.isSpectatorMode = true;
    }

    //Add players to game
    for (var i = 0; i < players.length; i++) {
        this.players.push(new HotPotatoe.Player(this, players[i]));
    }

    if (Meteor.isServer) {
        this.players[Math.floor(Math.random() * this.players.length)].setHotPotatoe(true);
    }

    if (Meteor.isClient && !this.isSpectatorMode) {
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
