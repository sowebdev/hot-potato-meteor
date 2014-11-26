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
        this.phaser.physics.arcade.enable(this.sprite);
        //  Player physics properties
        this.sprite.body.collideWorldBounds = true;
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
        //TODO handle player movement
        if (UserActions[this.id].cursors.left.isDown) {
            //  Move left
        } else if (UserActions[this.id].cursors.right.isDown) {
            //  Move right
        }
        if (UserActions[this.id].cursors.up.isDown) {
            //  Move up
        } else if (UserActions[this.id].cursors.down.isDown) {
            //  Move down
        }
        Sync.updateSprite(this.sprite);
    }
};