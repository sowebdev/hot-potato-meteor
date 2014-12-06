Package.describe({
    name: 'sowebdev:game-players',
    summary: 'A simple game players system for Meteor',
    version: '0.1.0'
});

Package.onUse(function (api) {
    api.versionsFrom('1.0');
    api.use('accounts-base');
    api.addFiles('lib.js');
    api.export('GamePlayers');
});