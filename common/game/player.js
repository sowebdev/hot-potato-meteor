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

    if (typeof isCurrentPlayer !== 'undefined') {
        this.isCurrentPlayer = isCurrentPlayer;
    }
};

/**
 * Pre-load player assets
 */
HotPotatoe.Player.prototype.preload = function() {
    var assetName = 'assets/circle-red.png';
    this.assetId = 'player' + this.id;
    this.phaser.load.image(this.assetId, assetName, false, 30, 30);
};

/**
 * Create player
 */
HotPotatoe.Player.prototype.create = function() {
    var x = Math.floor((Math.random() * 900) + 1);
    var y = Math.floor((Math.random() * 500) + 1);
    this.sprite = this.phaser.add.sprite(x, y, this.assetId);
    this.sprite.syncId = this.assetId;
    this.parent.sprites[this.sprite.syncId] = this.sprite;

    if (Meteor.isServer) {
        // We need to enable physics on the player
        this.phaser.physics.p2.enable(this.sprite);
        this.sprite.body.setCircle(15);
    } else {
        //We need to center anchor on client because
        //when we set a p2 physics body on this sprite on server
        //the anchor is centered implicitly
        this.sprite.anchor.setTo(0.5, 0.5);
    }

    // If this player is controlled by the user
    // Camera should follow him
    if (this.isCurrentPlayer) {
        this.phaser.camera.follow(this.sprite);
    }

    //Add sprite to synced collection
    if (Meteor.isServer) {
        Sync.insertSprite(this.sprite, this.parent.id);
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
        Sync.updateSprite(this.sprite);
    }
};