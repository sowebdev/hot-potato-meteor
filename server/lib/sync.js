Sync = {
    insertSprite: function (sprite, game) {
        sprite.id = Sprites.insert({
            game: game,
            syncId: sprite.syncId,
            width: sprite.width,
            height: sprite.height,
            x: sprite.x,
            y: sprite.y,
            angle: sprite.angle
        });
    },
    updateSprite: function (sprite) {
        Sprites.update(sprite.id, {
            $set: {
                width: sprite.width,
                height: sprite.height,
                x: sprite.x,
                y: sprite.y,
                angle: sprite.angle
            }
        });
    }
};