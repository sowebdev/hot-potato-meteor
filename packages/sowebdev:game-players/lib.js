/**
 * @namespace GamePlayers
 * @summary Namespace for all player related methods.
 */
GamePlayers = {};

/**
 * @summary A [Meteor.Collection] containing player documents.
 * @locus Anywhere
 * @type {Meteor.Collection}
 */
GamePlayers.players = new Meteor.Collection("game_players");

/**
 * @summary ID of user's player profile
 * @locus Anywhere
 */
GamePlayers.playerId = function () {
    var userId = null;
    try {
        userId = Meteor.userId();
    } catch (error) {
        return null;
    }
    if (!userId) {
        return null;
    }
    var player = GamePlayers.players.findOne({associationId: userId});
    if (!player) {
        return null;
    }
    return player._id;
};

/**
 * @summary User's player profile
 * @locus Anywhere
 */
GamePlayers.player = function () {
    var playerId = this.playerId();
    if (!playerId) {
        return null;
    }
    return GamePlayers.players.findOne(playerId);
};

if (Meteor.isServer) {
    // Publish the current user's player profile to the client.
    Meteor.publish(null, function() {
        if (GamePlayers.playerId()) {
            return GamePlayers.players.find(
                {_id: GamePlayers.playerId()}
            );
        } else {
            return null;
        }
    });

    /**
     * @summary Creates a player profile
     * @param {string} name - Player's name
     * @param {string} associationId - User's real ID
     * @locus Server
     */
    GamePlayers.create = function (name, associationId) {
        var player = GamePlayers.players.findOne({associationId: associationId});
        if (player) {
            throw new Error('User already has a player profile');
        }
        return GamePlayers.players.insert({
            name: name,
            associationId: associationId
        });
    };

    //Expose player creation
    Meteor.methods({
        createPlayer: function(name) {
            var userId = null;
            if (!this.userId) {
                throw new Meteor.Error('User must be logged in to create a player profile');
            }
            userId = this.userId;
            return GamePlayers.create(name, userId);
        }
    });
}

if (Meteor.isClient) {
    /**
     * @summary Creates a player profile for current user
     * @param {string} name - Player's name
     * @locus Client
     */
    GamePlayers.createPlayer = function (name) {
        return Meteor.call('createPlayer', name);
    };
}
