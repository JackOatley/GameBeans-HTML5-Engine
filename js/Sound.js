
/**
 *
 */
export class Sound {

	/**
	 *
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

	play(opts) {
		play(this, opts);
	}

	loop(opts) {
		loop(this, opts)
	}

	stop() {
		stop(this);
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
}

Sound.getByName = getByName;
Sound.create = create;
Sound.play = play;
Sound.loop = loop;
Sound.stop = stop;

Sound.prototype.assetType = "sound";

export function create(name, source)
{
	return new Sound(name, source);
}

export function stop(s)
{
	var a = s.instances;
	var n = a.length;
	while (n--) {
		var i = a[n];
		if (!i.paused) {
			i.currentTime = 0;
			i.pause();
		}
	}
}

export function play(s, opts = {})
{
	if (!Sound.isEnabled) return null;

	// Find an existing sound instance to play.
	var playSound;
	var n = s.instances.length;
	while (n--) {
		var instance = s.instances[n];
		if (instance.paused) {
			playSound = instance;
			break;
		}
	}

	// If no free instance was found.
	if (!playSound) return null;

	//
	playSound.onError = (err) => {
		console.error(s.name, err);
	}

	// Play the sound.
	playSound.volume = s.volume;
	let promise = playSound.play();
	if (promise !== undefined) {
		promise.then(function() {

			// on end event
			playSound.onended = function() {

				// Internal event stuff.
				s.currentTime = 0;
				if (Number(opts.loop || false))
					this.play();
				else
					this.pause();

				// Custom event, if defined.
				if (opts.onEnd) {
					opts.onEnd();
				}

			}

		}).catch((err) => {
			console.warn(err);
		});
	}

	return playSound;
}

export function loop(s, opts = {})
{
	play(s, {...opts, ...{loop: true}});
}

export function getByName(name)
{
	return Sound.array.find(s => s.name === name);
}

Sound.isEnabled = true;
Sound.names = [];
Sound.array = [];
