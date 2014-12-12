Template.roomView.helpers({
    isOwner: function () {
        return this.owner == GamePlayers.playerId();
    }
});

Template.roomView.events({
    'click .startGame': function(){
        Meteor.call('startGame');
        return false;
    }
});