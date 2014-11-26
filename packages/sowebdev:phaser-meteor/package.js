Package.describe({
    summary: "Phaser on Meteor",
    version: "0.1.1"
});

Package.onUse(function (api) {
    api.versionsFrom('0.9.1.1');
    api.addFiles('server/lib/stubs.js', 'server');
    api.addFiles('lib/intro.js');
    api.addFiles('lib/phaser.js');
    api.addFiles('server/phaser/core/Game.js', 'server');
    api.addFiles('server/phaser/loader/Loader.js', 'server');
    api.addFiles('server/phaser/system/Device.js', 'server');
    api.addFiles('server/phaser/system/RequestAnimationFrame.js', 'server');
    api.export('Phaser');
});