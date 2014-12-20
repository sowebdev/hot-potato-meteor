Package.describe({
    name: 'sowebdev:game-rooms',
    summary: 'A simple game rooms system for Meteor',
    version: '0.1.0'
});

Package.onUse(function (api) {
    api.versionsFrom('1.0');
    api.use('sowebdev:game-players');
    api.addFiles('lib.js');
    api.export('GameRooms');
});
