/**
 * Add an image to the Loader. Has been modified to enable to define width and height.
 * This is needed to work on server where no real images are used.
 *
 * @method Phaser.Loader#image
 * @param {string} key - Unique asset key of this image file.
 * @param {string} url - URL of image file.
 * @param {boolean} [overwrite=false] - If an unloaded file with a matching key already exists in the queue, this entry will overwrite it.
 * @param {number} width - width of the image.
 * @param {number} height - Height of the image.
 * @return {Phaser.Loader} This Loader instance.
 */
Phaser.Loader.prototype.image = function (key, url, overwrite, width, height) {

    if (typeof overwrite === "undefined") { overwrite = false; }

    if (overwrite)
    {
        this.replaceInFileList('image', key, url, {width: width, height: height});
    }
    else
    {
        this.addToFileList('image', key, url, {width: width, height: height});
    }

    return this;

};

/**
 * Load files. Private method ONLY used by loader.
 * Has been modified to add width and height properties on images.
 *
 * @method Phaser.Loader#loadFile
 * @private
 */
Phaser.Loader.prototype.loadFile = function () {

    if (!this._fileList[this._fileIndex])
    {
        console.warn('Phaser.Loader loadFile invalid index ' + this._fileIndex);
        return;
    }

    var file = this._fileList[this._fileIndex];
    var _this = this;

    this.onFileStart.dispatch(this.progress, file.key, file.url);

    //  Image or Data?
    switch (file.type)
    {
        case 'image':
        case 'spritesheet':
        case 'textureatlas':
        case 'bitmapfont':
            file.data = new Image();
            file.data.name = file.key;
            file.data.width = file.width;//Server needs to know width
            file.data.height = file.height;//Server needs to know height
            file.data.onload = function () {
                return _this.fileComplete(_this._fileIndex);
            };
            file.data.onerror = function () {
                return _this.fileError(_this._fileIndex);
            };
            if (this.crossOrigin)
            {
                file.data.crossOrigin = this.crossOrigin;
            }
            file.data.src = this.baseURL + file.url;
            break;

        case 'audio':
            file.url = this.getAudioURL(file.url);

            if (file.url !== null)
            {
                //  WebAudio or Audio Tag?
                if (this.game.sound.usingWebAudio)
                {
                    this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'arraybuffer', 'fileComplete', 'fileError');
                }
                else if (this.game.sound.usingAudioTag)
                {
                    if (this.game.sound.touchLocked)
                    {
                        //  If audio is locked we can't do this yet, so need to queue this load request. Bum.
                        file.data = new Audio();
                        file.data.name = file.key;
                        file.data.preload = 'auto';
                        file.data.src = this.baseURL + file.url;
                        this.fileComplete(this._fileIndex);
                    }
                    else
                    {
                        file.data = new Audio();
                        file.data.name = file.key;
                        file.data.onerror = function () {
                            return _this.fileError(_this._fileIndex);
                        };
                        file.data.preload = 'auto';
                        file.data.src = this.baseURL + file.url;
                        file.data.addEventListener('canplaythrough', function () { Phaser.GAMES[_this.game.id].load.fileComplete(_this._fileIndex); }, false);
                        file.data.load();
                    }
                }
            }
            else
            {
                this.fileError(this._fileIndex);
            }

            break;

        case 'json':

            if (this.useXDomainRequest && window.XDomainRequest)
            {
                this._ajax = new window.XDomainRequest();

                // XDomainRequest has a few quirks. Occasionally it will abort requests
                // A way to avoid this is to make sure ALL callbacks are set even if not used
                // More info here: http://stackoverflow.com/questions/15786966/xdomainrequest-aborts-post-on-ie-9
                this._ajax.timeout = 3000;

                this._ajax.onerror = function () {
                    return _this.dataLoadError(_this._fileIndex);
                };

                this._ajax.ontimeout = function () {
                    return _this.dataLoadError(_this._fileIndex);
                };

                this._ajax.onprogress = function() {};

                this._ajax.onload = function(){
                    return _this.jsonLoadComplete(_this._fileIndex);
                };

                this._ajax.open('GET', this.baseURL + file.url, true);

                //  Note: The xdr.send() call is wrapped in a timeout to prevent an issue with the interface where some requests are lost
                //  if multiple XDomainRequests are being sent at the same time.
                setTimeout(function () {
                    _this._ajax.send();
                }, 0);
            }
            else
            {
                this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'text', 'jsonLoadComplete', 'dataLoadError');
            }

            break;

        case 'xml':

            this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'text', 'xmlLoadComplete', 'dataLoadError');
            break;

        case 'tilemap':

            if (file.format === Phaser.Tilemap.TILED_JSON)
            {
                this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'text', 'jsonLoadComplete', 'dataLoadError');
            }
            else if (file.format === Phaser.Tilemap.CSV)
            {
                this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'text', 'csvLoadComplete', 'dataLoadError');
            }
            else
            {
                throw new Error("Phaser.Loader. Invalid Tilemap format: " + file.format);
            }
            break;

        case 'text':
        case 'script':
        case 'physics':
            this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'text', 'fileComplete', 'fileError');
            break;

        case 'binary':
            this.xhrLoad(this._fileIndex, this.baseURL + file.url, 'arraybuffer', 'fileComplete', 'fileError');
            break;
    }

};