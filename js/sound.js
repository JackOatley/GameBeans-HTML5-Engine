import Generator from "./generator.js";

/**
 * @author Jack Oatley
 */
export default class Sound {

	/**
	 * @param {string} String name for the resource.
	 * @param {string} A path to an audio source, or a base64 encoded audio.
	 */
	constructor(name, source) {
		this.name = name;
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
	 * @param {object} [opts={}] object.
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
			playSound.onError = (err) => {
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
	
	/** Stop all instances of the sound from playing. */
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
	static enable(x) {
		Sound.isEnabled = x;
	}
	
	/**
	 *
	 */
	static get(name) {
		if (typeof name === "object") return name;
		for (var i=0, n=Sound.array.length; i<n; i++) {
			if (Sound.array[i].name === name) {
				return Sound.array[i];
			}
		}
		window.addConsoleText("#F00", "Unknown sound: "+ name);
		return null;
	}
	
}

Generator.classStaticMatch(Sound);
Sound.prototype.assetType = "sound";
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