import Generator from "./generator";

/**
 * @author Jack Oatley
 */
class Sound {

	/**
	 * @param {string} name name for the resource.
	 * @param {string} source A path to an audio source, or a base64 encoded audio.
	 */
	constructor(name, source) {
		this.name = name;
		this.instances = [new Audio(source)];
		this.ready = false;
		this.volume = 1.0;
		Sound.names.push(name);
		Sound.array.push(this);
		this.__test();
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
		var a = this.instances;
		var n = number - a.length;
		while (n-- > 0) {
			a.push(a[0].cloneNode());
		}
	}

	/**
	 * @param {Object} [opts={}] object.
	 */
	play(opts = {}) {
		if (Sound.isEnabled) {

			// Find an existing sound instance to play.
			var playSound;
			var n = this.instances.length;
			while (n--) {
				var instance = this.instances[n];
				if (instance.paused) {
					playSound = instance;
					break;
				}
			}

			// Create new instance of sound.
			if (!playSound) {
				playSound = this.instances[0].cloneNode();
				this.instances.push(playSound);
			}

			//
			playSound.onError = (err) => {
				console.error(soundName, err);
			}

			// Play the sound.
			playSound.volume = this.volume;
			let promise = playSound.play();
			if (promise !== undefined) {
				promise.then(function() {

					// on end event
					playSound.onended = function() {

						// internal event stuff
						this.currentTime = 0;
						if (Number(opts.loop || false)) {
							this.play();
						} else {
							this.pause();
						}

						// Custom event, if defined.
						if (opts.onEnd) {
							opts.onEnd();
						}

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
	 * @return {void}
	 */
	stop() {
		var a = this.instances;
		var n = a.length;
		while (n--) {
			var i = a[n];
			if (!i.paused) {
				i._end();
			}
		}

	}

	/**
	 * Tests whether the Sound resource has an instance that is ready to play.
	 * Generates a callback function that sets the resource's "ready" property.
	 * @return {void}
	 */
	__test() {
		var i = this;
		let a = this.instances[0];
		a.oncanplaythrough = function() {
			i.ready = true;
			a.oncanplaythrough = null;
		}
	}

	/**
	 * @return {boolean}
	 */
	static readyAll() {
		var a = Sound.array;
		var n = a.length;
		while (n--) {
			if (!a[n].ready) {
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
	 * Gets the sound resource from the given string.
	 * If a sound resource is passed, it's returned immedietly.
	 * @param {*} name Name as string, or object.
	 * @return {Object}
	 */
	static get(name) {

		if (typeof name === "object") {
			return name;
		}

		var a = Sound.array;
		var n = a.length;
		while (n--) {
			if (a[n].name === name) {
				return a[n];
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

// Export.
export default Sound;
