Package.describe({
    name: 'sowebdev:game-rooms-ui',
    summary: 'UI for the game rooms package',
    version: '0.1.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0');
    api.use('templating', 'client');
    api.use('sowebdev:game-rooms');
    api.addFiles([
        'client/views/playerCreationView.html',
        'client/views/playerCreationView.js',
        'client/helpers.js'], 'client');
});
