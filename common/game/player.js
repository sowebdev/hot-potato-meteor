if (typeof HotPotatoe === "undefined") {
    HotPotatoe = {};
}

/**
 * Player
 *
 * @param {HotPotatoe.Game} game
 * @param {string} id - A unique player ID
 * @param {boolean} [isCurrentPlayer=false] - Flag to indicate if this player is controlled by current user
 * @constructor
 */
HotPotatoe.Player = function (game, id, isCurrentPlayer) {
    this.parent = game;
    this.phaser = game.phaser;
    this.id = id;
    this.isCurrentPlayer = false;
    this.force = 15;
    this.maxVelocity = 200;
    this.isHotPotatoe = false;

    if (typeof isCurrentPlayer !== 'undefined') {
        this.isCurrentPlayer = isCurrentPlayer;
    }
};

/**
 * Pre-load player assets
 */
HotPotatoe.Player.prototype.preload = function() {
    this.assetId = this.parent.assetIds.players;
    if (this.isCurrentPlayer) {
        this.assetId = this.parent.assetIds.currentPlayer;
    }
};

/**
 * Create player
 */
HotPotatoe.Player.prototype.create = function() {
    var x = Math.floor((Math.random() * 700) + 1);
    var y = Math.floor((Math.random() * 500) + 1);
    this.sprite = this.phaser.add.sprite(x, y, this.assetId);
    if (Meteor.isClient) {
        //On client we hide players until their positions get synced
        this.sprite.visible = false;

        this.halo = this.phaser.add.graphics(x, y);
        this.halo.lineStyle(1, 0xffffff);
        this.halo.drawCircle(0, 0, 20);
        this.halo.visible = false;
        // with phaser 2.2, repeat value = -1 for unlimited repeat
        this.phaser.add.tween(this.halo.scale).to( { x: 1.5, y: 1.5 }, 600, Phaser.Easing.Linear.None, true, 0, 100, true);
    }
    this.sprite.playerId = this.id;

    if (Meteor.isServer) {
        // We need to enable physics on the player
        this.phaser.physics.p2.enable(this.sprite);
        this.sprite.body.setCircle(15);

        // Adding a collision event for player that is hot potato
        if(this.isHotPotatoe) {
            this.jumpingHotPotatoSignalBinding = this.sprite.body.onBeginContact.add(this.jumpingHotPotatoCallback, this);
        }
    } else {
        //We need to center anchor on client because
        //when we set a p2 physics body on this sprite on server
        //the anchor is centered implicitly
        this.sprite.anchor.setTo(0.5, 0.5);

        this.notifyText = this.phaser.add.text(0, 0, 'You are the Hot Potatoe !', {fill: 'white'});
        this.notifyText.visible = false;

        // Display player name
        var currentRoom =  GameRooms.currentRoom();
        var _player =_.findWhere(currentRoom.players, {id: this.id});
        this.playerNameText = this.phaser.add.text(x, y + 23 , _player.name.substring(0, 15), {
            font: "14px Arial",
            fill: "#ffffff",
            align: "center"
        });
        this.playerNameText.anchor.setTo(0.5, 0.5);
        this.playerNameText.visible = false;//will be displayed when player positions are synced
    }

    // If this player is controlled by the user
    // Camera should follow him
    if (this.isCurrentPlayer) {
        this.phaser.camera.follow(this.sprite);
    }
};

/**
 * Update player
 */
HotPotatoe.Player.prototype.update = function() {
    //Handle player input and update sprite sync
    if (Meteor.isServer) {
        if (UserActions[this.id].cursors.left.isDown) {
            this.sprite.body.data.force[0] += this.force;
        } else if (UserActions[this.id].cursors.right.isDown) {
            this.sprite.body.data.force[0] -= this.force;
        }
        if (UserActions[this.id].cursors.up.isDown) {
            this.sprite.body.data.force[1] += this.force;
        } else if (UserActions[this.id].cursors.down.isDown) {
            this.sprite.body.data.force[1] -= this.force;
        }
        // Apply max velocity
        if (this.sprite.body.velocity.x < -this.maxVelocity) {
            this.sprite.body.velocity.x = -this.maxVelocity;
        }
        if (this.sprite.body.velocity.x > this.maxVelocity) {
            this.sprite.body.velocity.x = this.maxVelocity;
        }
        if (this.sprite.body.velocity.y < -this.maxVelocity) {
            this.sprite.body.velocity.y = -this.maxVelocity;
        }
        if (this.sprite.body.velocity.y > this.maxVelocity) {
            this.sprite.body.velocity.y = this.maxVelocity;
        }
    }

    if (Meteor.isClient) {
        this.notifyText.visible = this.isHotPotatoe && this.isCurrentPlayer;
        this.playerNameText.x = this.sprite.x;
        this.playerNameText.y = this.sprite.y + 23;
        if (this.sprite.visible) {
            this.playerNameText.visible = true;
        }
        this.halo.visible = this.isHotPotatoe && this.sprite.visible;
        this.halo.x = this.sprite.x;
        this.halo.y = this.sprite.y;
    }
};

/**
 * Defines the hot potatoe flag attribute state,
 * and change sprite texture
 * @param {boolean} hotpotatoe
 */
HotPotatoe.Player.prototype.setHotPotatoe = function(hotpotatoe) {
    this.isHotPotatoe = hotpotatoe;
    if (this.sprite) {
        var newassetId = this.parent.assetIds.players;
        if (hotpotatoe) {
            newassetId = this.parent.assetIds.hotpotatoe;
        } else if (this.isCurrentPlayer) {
            newassetId = this.parent.assetIds.currentPlayer;
        }

        // change sprite texture
        if (this.assetId != newassetId) {
            this.assetId = newassetId;
            this.sprite.loadTexture(newassetId, 0);
        }

        // When a player is defined hot potato, a collision event is added after a delay
        // to make possible jumping the hot potato from player to player
        if (hotpotatoe && Meteor.isServer) {
            this.phaser.time.events.repeat(600, 1, function() {
                this.jumpingHotPotatoSignalBinding = this.sprite.body.onBeginContact.add(this.jumpingHotPotatoCallback, this);
            }, this);
        }
    }


};

/**
 * Callback which is called when a player collides with an object
 *
 * @param {Phaser.Physics.P2.Body} objectCollided
 */
HotPotatoe.Player.prototype.jumpingHotPotatoCallback = function(objectCollided) {
    if (objectCollided && objectCollided.sprite && objectCollided.sprite.playerId) {
        var _playerCollided = _.findWhere(this.parent.players, {id: objectCollided.sprite.playerId});
        _playerCollided.setHotPotatoe(true);
        this.setHotPotatoe(false);
        this.jumpingHotPotatoSignalBinding.detach();
    }
};