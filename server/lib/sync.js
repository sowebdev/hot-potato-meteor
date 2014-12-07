Sync = {
    insertSprite: function (sprite, game, isHotPotatoe) {
        sprite.id = Sprites.insert({
            game: game,
            syncId: sprite.syncId,
            width: sprite.width,
            height: sprite.height,
            x: sprite.x,
            y: sprite.y,
            angle: sprite.angle,
            isHotPotatoe: isHotPotatoe
        });
    },
    updateSprite: function (sprite, isHotPotatoe) {
        Sprites.update(sprite.id, {
            $set: {
                width: sprite.width,
                height: sprite.height,
                x: sprite.x,
                y: sprite.y,
                angle: sprite.angle,
                isHotPotatoe: isHotPotatoe
            }
        });
    }
};