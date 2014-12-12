/**
 * @namespace GameRooms
 * @summary Namespace for all rooms related methods.
 */
GameRooms = {};

/**
 * @summary A [Meteor.Collection] containing room documents.
 * @locus Anywhere
 * @type {Meteor.Collection}
 */
GameRooms.rooms = new Meteor.Collection("game_rooms");

/**
 * @summary ID of player's current room
 * @locus Anywhere
 */
GameRooms.currentRoomId = function () {
    var playerId = GamePlayers.playerId();
    if (!playerId) {
        return null;
    }
    var room =  GameRooms.rooms.findOne({
        players: {
            $elemMatch: {
                id: playerId
            }
        }
    });
    if (!room) {
        return null;
    }
    return room._id;
};

/**
 * @summary Player's current room
 * @locus Anywhere
 */
GameRooms.currentRoom = function () {
    var currentRoomId = this.currentRoomId();
    if (!currentRoomId) {
        return null;
    }
    return GameRooms.rooms.findOne(currentRoomId);
};

if (Meteor.isServer) {

    Meteor.publish(null, function() {
        //We publish all rooms
        return GameRooms.rooms.find();
    });

    var createRoom = function(name) {
        return GameRooms.rooms.insert({
            name: name,
            players: [],
            owner: null
        });
    };

    var addPlayerToRoom = function(playerId, roomId, isOwner){
        var player = GamePlayers.players.findOne(playerId);
        var addOptions = {
            $push: {
                players: {
                    id: player._id,
                    name: player.name
                }
            }
        };
        if (isOwner) {
            addOptions.$set = {
                owner: playerId
            };
        }
        GameRooms.rooms.update(roomId, addOptions);
    };

    var removePlayerFromRoom = function(playerId, roomId) {
        var removeOptions = {
            $pull: {
                players: {
                    $elemMatch: {
                        id: playerId
                    }
                }
            }
        };
        GameRooms.rooms.update(roomId, removeOptions);
        //TODO decide what to do if player is owner of the room, probably assign another user.
    };

    var setCurrentRoom = function(roomId) {
        var room = GameRooms.rooms.findOne(roomId);
        if (!room) {
            throw new Meteor.Error('Room does not exist');
        }
        var currentRoom = GameRooms.currentRoom();
        if (currentRoom) {
            removePlayerFromRoom(GamePlayers.playerId(), currentRoom._id);
        }
        addPlayerToRoom(GamePlayers.playerId(), room._id);
    };


    var createGameHook = new Hook();

    /**
     * @summary Registers a function which will start a new game instance
     * @locus Server
     * @param {Function} func Called whenever a game should be started
     */
    GameRooms.startGameCallback = function (func) {
        return createGameHook.register(func);
    };

    Meteor.methods({
        setCurrentRoom: setCurrentRoom,
        createRoom: function (name) {
            var roomId = createRoom(name);
            addPlayerToRoom(GamePlayers.playerId(), roomId, true);
        },
        startGame: function() {
            var player = GamePlayers.player();
            if (!player) {
                throw new Meteor.Error('User has no player profile');
            }
            var room = GameRooms.currentRoom();
            if (!room) {
                throw new Meteor.Error('Player is not in a room');
            }
            if (room.owner != player._id) {
                throw new Meteor.Error('Only the room owner can start the game');
            }
            createGameHook.each(function(callback){
                callback();
            });
        }
    });
}

if (Meteor.isClient) {
    /**
     * @summary Creates a room for current player
     * @param {string} name - Room's name
     * @locus Client
     */
    GameRooms.createRoom = function (name) {
        return Meteor.call('createRoom', name);
    };
    /**
     * @summary Makes current player join a room
     * @param {string} id - Room's ID
     * @locus Client
     */
    GameRooms.joinRoom = function (id) {
        return Meteor.call('setCurrentRoom', id);
    };
}