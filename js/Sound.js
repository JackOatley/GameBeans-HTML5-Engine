import Generator from "./generator.js";

/**
 * @author Jack Oatley
 */
export class Sound {

	assetType = "sound";

	/**
	 * @type {function(string, string):Sound}
	 */
	constructor(name, source) {
		this.name = name;
		this.instances = [new Audio(source)];
		this.ready = false;
		this.volume = 1;
		Sound.names.push(name);
		Sound.array.push(this);
		this.__test();
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
		if (!Sound.isEnabled) return null;

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

		// If no free instance was found.
		if (!playSound) return null;

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

					// Internal event stuff.
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
				i.currentTime = 0;
				i.pause();
			}
		}

	}

	/**
	 * Tests whether the Sound resource has an instance that is ready to play.
	 * Generates a callback function that sets the resource's "ready" property.
	 * @return {void}
	 */
	__test() {
		const a = this.instances[0];
		a.oncanplaythrough = () => {
			this.ready = true;
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
