SyncPlayer = {
    insert: function (gameId, player) {
        player.syncId = Players.insert({
            gameId: gameId,
            isHotPotatoe: player.isHotPotatoe,
            canMove: player.canMove,
            id: player.id,
            sprite: {
                x: player.sprite.x,
                y: player.sprite.y,
                width: player.sprite.width,
                height: player.sprite.height,
                angle: player.sprite.angle
            }
        });
    },
    update: function (player) {
        Players.update(player.syncId, {
            $set: {
                isHotPotatoe: player.isHotPotatoe,
                canMove: player.canMove,
                sprite: {
                    x: player.sprite.x,
                    y: player.sprite.y,
                    width: player.sprite.width,
                    height: player.sprite.height,
                    angle: player.sprite.angle
                }
            }
        });
    }
};