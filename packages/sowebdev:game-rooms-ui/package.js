Package.describe({
    name: 'sowebdev:game-rooms-ui',
    summary: 'UI for the game rooms package',
    version: '0.3.0'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0');
    api.use('templating', 'client');
    api.use('sowebdev:game-rooms');
    api.addFiles([
        'client/views/gameRoomsContainer.html',
        'client/views/gameRoomsContainer.js',
        'client/views/playerCreationView.html',
        'client/views/playerCreationView.js',
        'client/views/listRoomsView.html',
        'client/views/listRoomsView.js',
        'client/views/roomView.html',
        'client/views/roomView.js',
        'client/helpers.js'], 'client');
});
