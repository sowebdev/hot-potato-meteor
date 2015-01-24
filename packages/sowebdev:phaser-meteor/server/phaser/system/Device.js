/**
 * Add a device-ready handler and ensure the device ready sequence is started.
 *
 * Phaser.Device will _not_ activate or initialize until at least one `whenReady` handler is added,
 * which is normally done automatically be calling `new Phaser.Game(..)`.
 *
 * The callback is invoked when the device is considered "ready", which may be immediately
 * if the device is already "ready". See {@link Phaser.Device#deviceReadyAt deviceReadyAt}.
 *
 * @method
 * @param {function} callback - Callback to invoke when the device is ready. It is invoked with the given context the Phaser.Device object is supplied as the first argument.
 * @param {object} [context] - Context in which to invoke the handler
 * @param {boolean} [nonPrimer=false] - If true the device ready check will not be started.
 */
Phaser.Device.whenReady = function (callback, context, nonPrimer) {

    var readyCheck = this._readyCheck;

    if (this.deviceReadyAt || !readyCheck)
    {
        callback.call(context, this);
    }
    else if (readyCheck._monitor || nonPrimer)
    {
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);
    }
    else
    {
        readyCheck._monitor = readyCheck.bind(this);
        readyCheck._queue = readyCheck._queue || [];
        readyCheck._queue.push([callback, context]);

        var cordova = typeof window.cordova !== 'undefined';
        var cocoonJS = navigator['isCocoonJS'];

        if (document.readyState === 'complete' || document.readyState === 'interactive')
        {
            // Why is there an additional timeout here?
            Meteor.setTimeout(readyCheck._monitor, 0);//Use Meteor.setTimeout
        }
        else if (cordova && !cocoonJS)
        {
            // Ref. http://docs.phonegap.com/en/3.5.0/cordova_events_events.md.html#deviceready
            //  Cordova, but NOT Cocoon?
            document.addEventListener('deviceready', readyCheck._monitor, false);
        }
        else
        {
            document.addEventListener('DOMContentLoaded', readyCheck._monitor, false);
            window.addEventListener('load', readyCheck._monitor, false);
        }
    }

};

/**
 * Internal method to initialize the capability checks.
 * This function is removed from Phaser.Device once the device is initialized.
 * We disable all checks on a Meteor server to define our own values.
 *
 * @method
 * @private
 */
Phaser.Device._initialize = function () {

    var device = this;
    device.desktop = true;//We simulate a desktop browser
    device.canvas = true;//Phaser needs canvas
};