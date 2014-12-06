#Phaser Meteor

Experimental package which makes essential parts of Phaser work on a Meteor server

##Updating the Phaser library

The phaser library can be found in the lib folder. The intro.js file initializes a Namespace which will contain the Phaser object.
Every time the library is updated, just past it as is in the lib folder with the name phaser.js and make initialization be called with the namespace PhaserMeteor as it's context.

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