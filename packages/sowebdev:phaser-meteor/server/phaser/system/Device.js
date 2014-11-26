/**
 * Since we are on a server we disable all browser features.
 * Only canvas is enable because it has been stubbed and is needed by Phaser.
 */

/**
 * Check whether the host environment support 3D CSS.
 * @method Phaser.Device#_checkCSS3D
 * @private
 */
Phaser.Device.prototype._checkCSS3D = function() {
    this.css3D = false;
};

/**
 * Check HTML5 features of the host environment.
 * @method Phaser.Device#_checkFeatures
 * @private
 */
Phaser.Device.prototype._checkFeatures = function () {
    this.canvas = true;
    this.localStorage = false;
    this.file = false;
    this.fileSystem = false;
    this.webGL = false;
    this.worker = false;
    this.touch = false;
    this.mspointer = false;
    this.pointerLock = false;
    this.quirksMode = false;
    this.getUserMedia = false;
};