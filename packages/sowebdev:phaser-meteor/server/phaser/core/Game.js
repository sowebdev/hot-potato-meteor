/**
 * Replaced every call to setTimeout with the meteor equivalent : Meteor.setTimeout
 * Phaser.HEADLESS is default render type
 * enableDebug is set to false
 * forceSetTimeOut is set to true
 * test for raf.isRunning in update() to prevent one last iteration after phaser instance is destroyed
 */

//Store prototype to restore it after constructor override
var prototype = Phaser.Game.prototype;

/**
 * This is where the magic happens. The Game object is the heart of your game,
 * providing quick access to common functions and handling the boot process.
 *
 * "Hell, there are no rules here - we're trying to accomplish something."
 *                                                       Thomas A. Edison
 *
 * @class Phaser.Game
 * @constructor
 * @param {number|string} [width=800] - The width of your game in game pixels. If given as a string the value must be between 0 and 100 and will be used as the percentage width of the parent container, or the browser window if no parent is given.
 * @param {number|string} [height=600] - The height of your game in game pixels. If given as a string the value must be between 0 and 100 and will be used as the percentage height of the parent container, or the browser window if no parent is given.
 * @param {number} [renderer=Phaser.AUTO] - Which renderer to use: Phaser.AUTO will auto-detect, Phaser.WEBGL, Phaser.CANVAS or Phaser.HEADLESS (no rendering at all).
 * @param {string|HTMLElement} [parent=''] - The DOM element into which this games canvas will be injected. Either a DOM ID (string) or the element itself.
 * @param {object} [state=null] - The default state object. A object consisting of Phaser.State functions (preload, create, update, render) or null.
 * @param {boolean} [transparent=false] - Use a transparent canvas background or not.
 * @param {boolean} [antialias=true] - Draw all image textures anti-aliased or not. The default is for smooth textures, but disable if your game features pixel art.
 * @param {object} [physicsConfig=null] - A physics configuration object to pass to the Physics world on creation.
 */
Phaser.Game = function (width, height, renderer, parent, state, transparent, antialias, physicsConfig) {

    /**
     * @property {number} id - Phaser Game ID (for when Pixi supports multiple instances).
     * @readonly
     */
    this.id = Phaser.GAMES.push(this) - 1;

    /**
     * @property {object} config - The Phaser.Game configuration object.
     */
    this.config = null;

    /**
     * @property {object} physicsConfig - The Phaser.Physics.World configuration object.
     */
    this.physicsConfig = physicsConfig;

    /**
     * @property {string|HTMLElement} parent - The Games DOM parent.
     * @default
     */
    this.parent = '';

    /**
     * The current Game Width in pixels.
     *
     * _Do not modify this property directly:_ use {@link Phaser.ScaleManager#setGameSize} - eg. `game.scale.setGameSize(width, height)` - instead.
     *
     * @property {integer} width
     * @readonly
     * @default
     */
    this.width = 800;

    /**
     * The current Game Height in pixels.
     *
     * _Do not modify this property directly:_ use {@link Phaser.ScaleManager#setGameSize} - eg. `game.scale.setGameSize(width, height)` - instead.
     *
     * @property {integer} height
     * @readonly
     * @default
     */
    this.height = 600;

    /**
     * @property {integer} _width - Private internal var.
     * @private
     */
    this._width = 800;

    /**
     * @property {integer} _height - Private internal var.
     * @private
     */
    this._height = 600;

    /**
     * @property {boolean} transparent - Use a transparent canvas background or not.
     * @default
     */
    this.transparent = false;

    /**
     * @property {boolean} antialias - Anti-alias graphics. By default scaled images are smoothed in Canvas and WebGL, set anti-alias to false to disable this globally.
     * @default
     */
    this.antialias = true;

    /**
     * @property {boolean} preserveDrawingBuffer - The value of the preserveDrawingBuffer flag affects whether or not the contents of the stencil buffer is retained after rendering.
     * @default
     */
    this.preserveDrawingBuffer = false;

    /**
     * @property {PIXI.CanvasRenderer|PIXI.WebGLRenderer} renderer - The Pixi Renderer.
     * @protected
     */
    this.renderer = null;

    /**
     * @property {number} renderType - The Renderer this game will use. Either Phaser.AUTO, Phaser.CANVAS or Phaser.WEBGL.
     * @readonly
     */
    this.renderType = Phaser.HEADLESS;//On server we use HEADLESS

    /**
     * @property {Phaser.StateManager} state - The StateManager.
     */
    this.state = null;

    /**
     * @property {boolean} isBooted - Whether the game engine is booted, aka available.
     * @readonly
     */
    this.isBooted = false;

    /**
     * @property {boolean} isRunning - Is game running or paused?
     * @readonly
     */
    this.isRunning = false;

    /**
     * @property {Phaser.RequestAnimationFrame} raf - Automatically handles the core game loop via requestAnimationFrame or setTimeout
     * @protected
     */
    this.raf = null;

    /**
     * @property {Phaser.GameObjectFactory} add - Reference to the Phaser.GameObjectFactory.
     */
    this.add = null;

    /**
     * @property {Phaser.GameObjectCreator} make - Reference to the GameObject Creator.
     */
    this.make = null;

    /**
     * @property {Phaser.Cache} cache - Reference to the assets cache.
     */
    this.cache = null;

    /**
     * @property {Phaser.Input} input - Reference to the input manager
     */
    this.input = null;

    /**
     * @property {Phaser.Loader} load - Reference to the assets loader.
     */
    this.load = null;

    /**
     * @property {Phaser.Math} math - Reference to the math helper.
     */
    this.math = null;

    /**
     * @property {Phaser.Net} net - Reference to the network class.
     */
    this.net = null;

    /**
     * @property {Phaser.ScaleManager} scale - The game scale manager.
     */
    this.scale = null;

    /**
     * @property {Phaser.SoundManager} sound - Reference to the sound manager.
     */
    this.sound = null;

    /**
     * @property {Phaser.Stage} stage - Reference to the stage.
     */
    this.stage = null;

    /**
     * @property {Phaser.Time} time - Reference to the core game clock.
     */
    this.time = null;

    /**
     * @property {Phaser.TweenManager} tweens - Reference to the tween manager.
     */
    this.tweens = null;

    /**
     * @property {Phaser.World} world - Reference to the world.
     */
    this.world = null;

    /**
     * @property {Phaser.Physics} physics - Reference to the physics manager.
     */
    this.physics = null;

    /**
     * @property {Phaser.RandomDataGenerator} rnd - Instance of repeatable random data generator helper.
     */
    this.rnd = null;

    /**
     * @property {Phaser.Device} device - Contains device information and capabilities.
     */
    this.device = Phaser.Device;

    /**
     * @property {Phaser.Camera} camera - A handy reference to world.camera.
     */
    this.camera = null;

    /**
     * @property {HTMLCanvasElement} canvas - A handy reference to renderer.view, the canvas that the game is being rendered in to.
     */
    this.canvas = null;

    /**
     * @property {CanvasRenderingContext2D} context - A handy reference to renderer.context (only set for CANVAS games, not WebGL)
     */
    this.context = null;

    /**
     * @property {Phaser.Utils.Debug} debug - A set of useful debug utilitie.
     */
    this.debug = null;

    /**
     * @property {Phaser.Particles} particles - The Particle Manager.
     */
    this.particles = null;

    /**
     * If `false` Phaser will automatically render the display list every update. If `true` the render loop will be skipped.
     * You can toggle this value at run-time to gain exact control over when Phaser renders. This can be useful in certain types of game or application.
     * Please note that if you don't render the display list then none of the game object transforms will be updated, so use this value carefully.
     * @property {boolean} lockRender
     * @default
     */
    this.lockRender = false;

    /**
     * @property {boolean} stepping - Enable core loop stepping with Game.enableStep().
     * @default
     * @readonly
     */
    this.stepping = false;

    /**
     * @property {boolean} pendingStep - An internal property used by enableStep, but also useful to query from your own game objects.
     * @default
     * @readonly
     */
    this.pendingStep = false;

    /**
     * @property {number} stepCount - When stepping is enabled this contains the current step cycle.
     * @default
     * @readonly
     */
    this.stepCount = 0;

    /**
     * @property {Phaser.Signal} onPause - This event is fired when the game pauses.
     */
    this.onPause = null;

    /**
     * @property {Phaser.Signal} onResume - This event is fired when the game resumes from a paused state.
     */
    this.onResume = null;

    /**
     * @property {Phaser.Signal} onBlur - This event is fired when the game no longer has focus (typically on page hide).
     */
    this.onBlur = null;

    /**
     * @property {Phaser.Signal} onFocus - This event is fired when the game has focus (typically on page show).
     */
    this.onFocus = null;

    /**
     * @property {boolean} _paused - Is game paused?
     * @private
     */
    this._paused = false;

    /**
     * @property {boolean} _codePaused - Was the game paused via code or a visibility change?
     * @private
     */
    this._codePaused = false;

    /**
     * The ID of the current/last logic update applied this render frame, starting from 0.
     *
     * The first update is `currentUpdateID === 0` and the last update is `currentUpdateID === updatesThisFrame.`
     * @property {integer} currentUpdateID
     * @protected
     */
    this.currentUpdateID = 0;

    /**
     * Number of logic updates expected to occur this render frame;
     * will be 1 unless there are catch-ups required (and allowed).
     * @property {integer} updatesThisFrame
     * @protected
     */
    this.updatesThisFrame = 1;

    /**
     * @property {number} _deltaTime - accumulate elapsed time until a logic update is due
     * @private
     */
    this._deltaTime = 0;

    /**
     * @property {number} _lastCount - remember how many 'catch-up' iterations were used on the logicUpdate last frame
     * @private
     */
    this._lastCount = 0;

    /**
     * @property {number} _spiralling - if the 'catch-up' iterations are spiralling out of control, this counter is incremented
     * @private
     */
    this._spiralling = 0;

    /**
     * If the game is struggling to maintain the desired FPS, this signal will be dispatched.
     * The desired/chosen FPS should probably be closer to the {@link Phaser.Time#suggestedFps} value.
     * @property {Phaser.Signal} fpsProblemNotifier
     * @public
     */
    this.fpsProblemNotifier = new Phaser.Signal();

    /**
     * @property {boolean} forceSingleUpdate - Should the game loop force a logic update, regardless of the delta timer? Set to true if you know you need this. You can toggle it on the fly.
     */
    this.forceSingleUpdate = false;

    /**
     * @property {number} _nextNotification - the soonest game.time.time value that the next fpsProblemNotifier can be dispatched
     * @private
     */
    this._nextFpsNotification = 0;

    //  Parse the configuration object (if any)
    if (arguments.length === 1 && typeof arguments[0] === 'object')
    {
        this.parseConfig(arguments[0]);
    }
    else
    {
        this.config = { enableDebug: true };

        if (typeof width !== 'undefined')
        {
            this._width = width;
        }

        if (typeof height !== 'undefined')
        {
            this._height = height;
        }

        if (typeof renderer !== 'undefined')
        {
            this.renderType = renderer;
        }

        if (typeof parent !== 'undefined')
        {
            this.parent = parent;
        }

        if (typeof transparent !== 'undefined')
        {
            this.transparent = transparent;
        }

        if (typeof antialias !== 'undefined')
        {
            this.antialias = antialias;
        }

        this.rnd = new Phaser.RandomDataGenerator([(Date.now() * Math.random()).toString()]);

        this.state = new Phaser.StateManager(this, state);
    }

    this.device.whenReady(this.boot, this);

    return this;

};

//Restore prototype
Phaser.Game.prototype = prototype;


/**
 * Parses a Game configuration object.
 *
 * @method Phaser.Game#parseConfig
 * @protected
 */
Phaser.Game.prototype.parseConfig = function (config) {

    this.config = config;

    this.config.enableDebug = false;//On server we should not enable this
    this.config.forceSetTimeOut = true;//Use Meteor.setTimeout instead of RequestAnimationFrame

    if (config['width'])
    {
        this._width = config['width'];
    }

    if (config['height'])
    {
        this._height = config['height'];
    }

    if (config['renderer'])
    {
        this.renderType = config['renderer'];
    }

    if (config['parent'])
    {
        this.parent = config['parent'];
    }

    if (config['transparent'])
    {
        this.transparent = config['transparent'];
    }

    if (config['antialias'])
    {
        this.antialias = config['antialias'];
    }

    if (config['preserveDrawingBuffer'])
    {
        this.preserveDrawingBuffer = config['preserveDrawingBuffer'];
    }

    if (config['physicsConfig'])
    {
        this.physicsConfig = config['physicsConfig'];
    }

    var seed = [(Date.now() * Math.random()).toString()];

    if (config['seed'])
    {
        seed = config['seed'];
    }

    this.rnd = new Phaser.RandomDataGenerator(seed);

    var state = null;

    if (config['state'])
    {
        state = config['state'];
    }

    this.state = new Phaser.StateManager(this, state);

};

/**
 * Displays a Phaser version debug header in the console.
 *
 * @method Phaser.Game#showDebugHeader
 * @protected
 */
Phaser.Game.prototype.showDebugHeader = function () {
    console.log('PhaserMeteor | Phaser v' + Phaser.VERSION + ' | Pixi.js ' + PIXI.VERSION);
};


/**
 * The core game loop.
 *
 * @method Phaser.Game#update
 * @protected
 * @param {number} time - The current time as provided by RequestAnimationFrame.
 */
Phaser.Game.prototype.update = function (time) {

    this.time.update(time);

    if (!this.raf.isRunning) {
        //small hack on meteor server to prevent running one last update after phaser instance was destroyed
        return;
    }

    // if the logic time is spiraling upwards, skip a frame entirely
    if (this._spiralling > 1 && !this.forceSingleUpdate)
    {
        // cause an event to warn the program that this CPU can't keep up with the current desiredFps rate
        if (this.time.time > this._nextFpsNotification)
        {
            // only permit one fps notification per 10 seconds
            this._nextFpsNotification = this.time.time + 1000 * 10;

            // dispatch the notification signal
            this.fpsProblemNotifier.dispatch();
        }

        // reset the _deltaTime accumulator which will cause all pending dropped frames to be permanently skipped
        this._deltaTime = 0;
        this._spiralling = 0;

        // call the game render update exactly once every frame
        this.updateRender(this.time.slowMotion * this.time.desiredFps);
    }
    else
    {
        // step size taking into account the slow motion speed
        var slowStep = this.time.slowMotion * 1000.0 / this.time.desiredFps;

        // accumulate time until the slowStep threshold is met or exceeded... up to a limit of 3 catch-up frames at slowStep intervals
        this._deltaTime += Math.max(Math.min(slowStep * 3, this.time.elapsed), 0);

        // call the game update logic multiple times if necessary to "catch up" with dropped frames
        // unless forceSingleUpdate is true
        var count = 0;

        this.updatesThisFrame = Math.floor(this._deltaTime / slowStep);

        if (this.forceSingleUpdate)
        {
            this.updatesThisFrame = Math.min(1, this.updatesThisFrame);
        }

        while (this._deltaTime >= slowStep)
        {
            this._deltaTime -= slowStep;
            this.currentUpdateID = count;

            this.updateLogic(1.0 / this.time.desiredFps);
            //  Sync the scene graph after _every_ logic update to account for moved game objects
            this.stage.updateTransform();

            count++;

            if (this.forceSingleUpdate && count === 1)
            {
                break;
            }
        }

        // detect spiraling (if the catch-up loop isn't fast enough, the number of iterations will increase constantly)
        if (count > this._lastCount)
        {
            this._spiralling++;
        }
        else if (count < this._lastCount)
        {
            // looks like it caught up successfully, reset the spiral alert counter
            this._spiralling = 0;
        }

        this._lastCount = count;

        // call the game render update exactly once every frame unless we're playing catch-up from a spiral condition
        this.updateRender(this._deltaTime / slowStep);
    }

};