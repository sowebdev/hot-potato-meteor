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
    this.isMainStateRunning = false;
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

            // Todo improve this, cause redondant code
            if (Meteor.isServer) {
                self.countdownLoopEvent = self.phaser.time.events.loop(Phaser.Timer.SECOND, function() {
                    var gameDb = GamesDb.findOne(this.id);
                    if (gameDb.secondsLeft > 0) {
                        GamesDb.update(this.id, {
                            $inc: {secondsLeft: -1}
                        });
                    } else {
                        self.endGame();
                    }
                }, self);
            } else {
                self.countdownLoopEvent = self.phaser.time.events.loop(Phaser.Timer.SECOND, function() {
                    var gameDb = GamesDb.findOne(this.id);
                    if (gameDb.secondsLeft == 0) {
                        self.endGame();
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

    var pendingState = {
        preload: function() {
            if (Meteor.isClient) {
                self.phaser.load.image('logo', 'assets/hotpotato_min.jpg', false, 400, 479);
            }
        },
        create: function() {
            if (Meteor.isClient) {
                self.phaser.stage.backgroundColor = '#ffffff';
                self.phaser.add.sprite(200, 20, 'logo');
            }
        }
    };

    this.phaser.state.add('main', mainState);
    this.phaser.state.add('pending', pendingState);
};

/**
 * Configure game with players
 *
 * @param {string[]} players
 * @param {string} gameId
 */
HotPotatoe.Game.prototype.setUp = function(players, gameId) {
    this.id = gameId;
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
    this.isMainStateRunning = true;
};

/**
 * Pending game
 */
HotPotatoe.Game.prototype.switchToPending = function() {
    this.phaser.state.start('pending');
    this.isMainStateRunning = false;
};

/**
 * End game
 */
HotPotatoe.Game.prototype.endGame = function() {
    // Stop countdown loop when the game ending
    this.phaser.time.events.remove(this.countdownLoopEvent);

    if (Meteor.isServer) {
        //Stop every player and mark loser
        for (var i = 0; i < this.players.length; i++) {
            this.players[i].canMove = false;
            if (this.players[i].isHotPotatoe) {
                this.players[i].isLoser = true;
                this.players[i].sprite.visible = false;
                this.players[i].sprite.kill();
            }
        }

        // Final server-side game stopping
        this.phaser.time.events.add(Phaser.Timer.SECOND * 6, function() {
            var gameId = this.id;
            Players.remove({gameId: gameId});
            GamesDb.update(gameId, {
                $set: {status: 'pending'}
            });

            // On server, we need to destroy the phaser instance
            GameInstances[gameId].phaser.destroy();
            delete GameInstances[gameId];

            console.log('Game ' + gameId + ' was destroyed');
        }, this);

    } else {
        var loser = null;
        var currentRoom =  GameRooms.currentRoom();
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].isHotPotatoe) {
                this.players[i].isLoser = true;
                this.finalExplosionEmitter.x = this.players[i].sprite.x;
                this.finalExplosionEmitter.y = this.players[i].sprite.y;
                this.players[i].sprite.visible = false;
                loser =_.findWhere(currentRoom.players, {id: this.players[i].id});
            }
        }
        this.finalExplosionEmitter.start(true, 5000, null, 100);
        this.displayEndGameTexts(loser.name);
    }
};

/**
 * Displays the 'Game over' text and the loser name
 *
 * @param {String} loserName
 */
HotPotatoe.Game.prototype.displayEndGameTexts = function(loserName) {
    var style = {font: "65px Arial", fill: "#ff0044", align: "center"};
    var gameOverText = this.phaser.add.text(this.phaser.world.centerX, this.phaser.world.centerY, "Game Over", style);
    gameOverText.anchor.set(0.5);

    var loserText = this.phaser.add.text(this.phaser.world.centerX, this.phaser.world.centerY + 40, loserName + " lost the game !", {
        font: "16px Arial",
        fill: "#ffffff",
        align: "center"
    });
    loserText.anchor.set(0.5);
};