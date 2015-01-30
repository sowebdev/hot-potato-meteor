#Phaser Meteor

Experimental package which makes essential parts of Phaser work on a Meteor server

##API changes

On the server we are not really loading assets, but in order to use sprites, we need to tell Phaser
the dimensions of each asset. To be able to do this, Phaser.Loader.image() takes two additional
parameters : width and height of an asset.

    phaserInstance.load.image('someId', 'someUrlWeDontCareAboutOnServer', false, 30, 30);

##Updating the Phaser library

The phaser library can be found in the lib folder. The intro.js file initializes a Namespace which will contain the Phaser object.
Every time the library needs an upgrade, paste it as is in the lib folder with the name phaser.js and make initialization be called with the namespace PhaserMeteor as it's context.

    if (typeof exports !== 'undefined') {
            if (typeof module !== 'undefined' && module.exports) {
                exports = module.exports = Phaser;
            }
            exports.Phaser = Phaser;
        } else if (typeof define !== 'undefined' && define.amd) {
            define('Phaser', (function() { return root.Phaser = Phaser; }) ());
        } else {
            root.Phaser = Phaser;
        }
    }).call(PhaserMeteor);//You will need this
    Phaser = PhaserMeteor.Phaser;//and this

In order to make it work on a server, some stubs have been defined in server/lib/stubs.js.
The idea is to simulate a browser environment in a way that a minimum of Phaser components need to be rewritten.

The server/phaser folder contains all Phaser components need a rewrite in order to make our
game work on a server.