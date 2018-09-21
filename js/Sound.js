import Generator from "./generator";

/**
 * @author Jack Oatley
 */
class Sound {

	/**
	 * @param {string} name name for the resource.
	 * @param {string} source A path to an audio source, or a base64 encoded audio.
	 * @return {void}
	 */
	constructor(name, source) {
		this.name = name;
		this.instances = [new Audio(source)];
		this.ready = false;
		this.volume = 1.0;
		Sound.names.push(name);
		Sound.array.push(this);
		let test = this.instances[0];
		test.oncanplaythrough = () => {
			this.ready = true;
			test.oncanplaythrough = null;
		}
	}


	/**
	 * Returns the asset type, this can't/shouldn't be overwitten.
	 * @return {string}
	 */
	get assetType() {
		return "sound";
	}

	/**
	 * @param {number} number
	 * @return {void}
	 */
	preload(number) {
		let n = number - this.instances.length;
		while (n-- > 0) {
			let newSound = this.instances[0].cloneNode();
			this.instances.push(newSound);
		}
	}

	/**
	 * @param {Object} [opts={}] object.
	 */
	play(opts = {}) {
		if (Sound.isEnabled) {

			// Find an existing sound instance to play.
			let playSound;
			for (var i=0, n=this.instances.length; i<n; i++) {
				let instance = this.instances[i];
				if (instance.paused) {
					playSound = instance;
					break;
				}
			}

			// Create new instance of sound.
			if (!playSound) {
				playSound = this.instances[0].cloneNode();
				this.instances.push(playSound);
				//console.log("Created sound, " + this.name + ", on demand.");
			}

			//
			playSound.onError = (err) => {
				console.error(soundName, err);
			}

			// Play the sound.
			playSound.volume = this.volume;
			let promise = playSound.play();
			if ( promise !== undefined ) {
				promise.then( function() {

					// on end event
					playSound.onended = function() {

						// internal event stuff
						((Number(opts.loop || false))
							? _loop : _end).call(this);

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
	 * Stop all instances of the sound from playing.
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
	 * @return {boolean}
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
	 * @param {boolean} x
	 * @return {void}
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

// Export.
export default Sound;
