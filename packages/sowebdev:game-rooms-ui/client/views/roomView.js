Template.roomView.helpers({
    isOwner: function () {
        return this.owner == GamePlayers.playerId();
    }
});

Template.roomView.events({
    'click .startGame': function(){
        alert('TODO : Start the game');
        return false;
    }
});