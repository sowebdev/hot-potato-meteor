UserActions = {};

Meteor.methods({
    keyDown: function (keyCode) {
        switch (keyCode) {
            case Phaser.Keyboard.LEFT:
                UserActions[this.connection.id].cursors.left.isDown = true;
                break;
            case Phaser.Keyboard.RIGHT:
                UserActions[this.connection.id].cursors.right.isDown = true;
                break;
            case Phaser.Keyboard.UP:
                UserActions[this.connection.id].cursors.up.isDown = true;
                break;
            case Phaser.Keyboard.DOWN:
                UserActions[this.connection.id].cursors.down.isDown = true;
                break;
            default:
                throw new Meteor.Error(500, 'Unsupported key code');
        }
    },
    keyUp: function (keyCode) {
        switch (keyCode) {
            case Phaser.Keyboard.LEFT:
                UserActions[this.connection.id].cursors.left.isDown = false;
                break;
            case Phaser.Keyboard.RIGHT:
                UserActions[this.connection.id].cursors.right.isDown = false;
                break;
            case Phaser.Keyboard.UP:
                UserActions[this.connection.id].cursors.up.isDown = false;
                break;
            case Phaser.Keyboard.DOWN:
                UserActions[this.connection.id].cursors.down.isDown = false;
                break;
            default:
                throw new Meteor.Error(500, 'Unsupported key code');
        }
    }
});