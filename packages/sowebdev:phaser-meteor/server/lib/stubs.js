/**
 * This file contains stubs to enable Phaser to work on server side.
 * It should be loaded before anything else.
 */

window = {
    addEventListener: function(type,listener,useCapture) {},
    removeEventListener: function(type,listener,useCapture) {}
};

// When p2 physics library is loaded. It adds itself to the window object
// We want p2 to be a global on the server (server's global context is not window)
Object.defineProperty(window, 'p2', {
    set: function (value) {
        p2 = value;
    }
});

document = {
    body: {},
    readyState: 'complete',
    createElement: function(tagName) {
        var element = null;
        if (tagName === 'canvas') {
            element = {
                style: {},
                getContext: function(contextId) {
                    return {
                        fillRect: function(x, y, w, h) {},
                        getImageData: function(sx, sy, sw, sh) {
                            return {
                                width: 0,
                                height: 0,
                                data: []
                            };
                        },
                        createImageData: function(imagedata_or_sw,sh) {
                            return {};
                        },
                        setTransform: function(m11, m12, m21, m22, dx, dy) {},
                        drawImage: function(img_elem,dx_or_sx,dy_or_sy,dw_or_sw,dh_or_sh,dx,dy,dw,dh) {},
                        clearRect: function(x, y, width, height){}
                    };
                },
                getBoundingClientRect: function () {
                    return {
                        bottom: 0,
                        height: 0,
                        left: 0,
                        right: 0,
                        top: 0,
                        width: 0,
                        x: 0,
                        y: 0
                    };
                },
                addEventListener: function(type,listener,useCapture) {}
            };
        }
        return element;
    },
    addEventListener: function(type,listener,useCapture) {},
    removeEventListener: function(type,listener,useCapture) {}
};

navigator = {
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0'
};

Image = function() {
    // When a callback is assigned to the onload property
    // We trigger it almost immediately
    Object.defineProperty(this, 'onload', {
        set: function (callback) {
            var self = this;
            Meteor.setTimeout(function() {
                self.complete = true;
                callback();
            }, 100);
        }
    });
};

XMLHttpRequest = function() {};