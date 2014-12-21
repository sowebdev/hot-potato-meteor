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
    this.speed = 200;
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
    var x = Math.floor((Math.random() * 900) + 1);
    var y = Math.floor((Math.random() * 500) + 1);
    this.sprite = this.phaser.add.sprite(x, y, this.assetId);

    if (Meteor.isServer) {
        // We need to enable physics on the player
        this.phaser.physics.p2.enable(this.sprite);
        this.sprite.body.setCircle(15);
    } else {
        //We need to center anchor on client because
        //when we set a p2 physics body on this sprite on server
        //the anchor is centered implicitly
        this.sprite.anchor.setTo(0.5, 0.5);

        this.notifyText = this.phaser.add.text(0, 0, 'You are the Hot Potatoe !', {fill: 'white'});
        this.notifyText.visible = false;
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
            this.sprite.body.velocity.x = -this.speed;
        } else if (UserActions[this.id].cursors.right.isDown) {
            this.sprite.body.velocity.x = this.speed;
        } else {
            this.sprite.body.velocity.x = 0;
        }
        if (UserActions[this.id].cursors.up.isDown) {
            this.sprite.body.velocity.y = -this.speed;
        } else if (UserActions[this.id].cursors.down.isDown) {
            this.sprite.body.velocity.y = this.speed;
        } else {
            this.sprite.body.velocity.y = 0;
        }
    }

    if (Meteor.isClient) {
        if (this.isHotPotatoe && this.isCurrentPlayer) {
            this.notifyText.visible = true;
        }
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
    }
};