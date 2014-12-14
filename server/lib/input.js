UserActions = {};

Meteor.methods({
    keyDown: function (keyCode) {
        switch (keyCode) {
            case Phaser.Keyboard.LEFT:
                UserActions[GamePlayers.playerId()].cursors.left.isDown = true;
                break;
            case Phaser.Keyboard.RIGHT:
                UserActions[GamePlayers.playerId()].cursors.right.isDown = true;
                break;
            case Phaser.Keyboard.UP:
                UserActions[GamePlayers.playerId()].cursors.up.isDown = true;
                break;
            case Phaser.Keyboard.DOWN:
                UserActions[GamePlayers.playerId()].cursors.down.isDown = true;
                break;
            default:
                throw new Meteor.Error(500, 'Unsupported key code');
        }
    },
    keyUp: function (keyCode) {
        switch (keyCode) {
            case Phaser.Keyboard.LEFT:
                UserActions[GamePlayers.playerId()].cursors.left.isDown = false;
                break;
            case Phaser.Keyboard.RIGHT:
                UserActions[GamePlayers.playerId()].cursors.right.isDown = false;
                break;
            case Phaser.Keyboard.UP:
                UserActions[GamePlayers.playerId()].cursors.up.isDown = false;
                break;
            case Phaser.Keyboard.DOWN:
                UserActions[GamePlayers.playerId()].cursors.down.isDown = false;
                break;
            default:
                throw new Meteor.Error(500, 'Unsupported key code');
        }
    }
});