InputManager = {
    keyDown: function () {
        Meteor.call('keyDown', this.keyCode);
    },
    keyUp: function () {
        Meteor.call('keyUp', this.keyCode);
    }
};