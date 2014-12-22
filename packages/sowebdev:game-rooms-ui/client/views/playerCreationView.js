Template.playerCreationView.events({
    'click #confirmPlayerCreation': function(){
        var name = jQuery('#createPlayerName').val();
        if (name) {
            GamePlayers.createPlayer(name);
        }
        return false;
    }
});