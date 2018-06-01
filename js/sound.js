/**
 * @module sound
 */
 
/**
 *
 */
export default class Sound {

	/**
	 *
	 */
	constructor(name, source) {
		this.name = name;
		this.assetType = "sound";
		this.instances = [new Audio(source)];
		this.ready = false;
		Sound.names.push(name);
		Sound.array.push(this);
		let test = this.instances[0];
		test.oncanplaythrough = () => {
			this.ready = true;
			test.oncanplaythrough = null;
		}
	}
	
	/**
	 * @param {object} opts object.
	 */
	play(opts = {}) {
		if (Sound.isEnabled) {
			
			// find an existing sound instance to play
			let playSound;
			for (var i=0, n=this.instances.length; i<n; i++) {
				let instance = this.instances[i];
				if (instance.paused) {
					playSound = instance;
					break;
				}
			}
			
			// create new instance of sound
			if (!playSound) {
				playSound = this.instances[0].cloneNode();
				this.instances.push(playSound);
			}
			
			//
			playSound.onError = function(err) {
				console.error(soundName, err);
			}
			
			// play the sound
			let promise = playSound.play();
			if ( promise !== undefined ) {
				promise.then( function() {
					
					// on end event
					playSound.onended = function() {
						
						// internal event stuff
						( ( Number( opts.loop || false ) )
							? _loop : _end ).call( this );
						
						// and custom event, if defined
						if (opts.onEnd) opts.onEnd();
							
					}
						
				}).catch((err) => {
					console.warn(err);
				});
			}
			
			//
			return playSound;
		}
		
		// sound is disabled
		return null;
	}
	
	/**
	 *
	 */
	stop() {
		for (var i=0, n=this.instances.length; i<n; i++) {
			let instance = this.instances[i];
			if (!instance.paused) {
				_end.call(instance);
			}
		}
	
	}
	
	/**
	 *
	 */
	static readyAll() {
		for (var i=0, n=Sound.array.length; i<n; i++) {
			if (!Sound.array[i].ready) {
				return false;
			}
		}
		return true;
	}
	
	/**
	 *
	 */
	static get(name) {
		if (typeof name === "object") return name;
		for ( var i=0, n=Sound.array.length; i<n; i++ ) {
			if (Sound.array[i].name === name) {
				return Sound.array[i];
			}
		}
		window.addConsoleText("#F00", "Unknown sound: "+ name);
		return null;
	}
	
	/**
	 *
	 */
	static enable(x) {
		Sound.isEnabled = x;
	}
	
	/** */
	static create(name, src) {
		return new Sound(name, src);
	}
	
	/** */
	static play(sound, opts = {}) {
		sound = Sound.get(sound);
		return Sound.prototype.play.call(sound, opts);
	}
	
	/** */
	static stop(sound) {
		sound = Sound.get(sound);
		Sound.prototype.stop.call(sound);
	}

}

Sound.isEnabled = true;
Sound.names = [];
Sound.array = [];

//
function _loop() {
	this.currentTime = 0;
	this.play();
}

//
function _end() {
	this.pause();
	this.currentTime = 0;
}