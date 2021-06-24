
const names = [];
const array = [];
let enabled = true;

/*
 *
 */
export class Sound
{
	constructor(name, source) {
		this.name = name;
		this.instances = [new Audio(source)];
		this.ready = false;
		this.volume = 1;
		names.push(name);
		array.push(this);
		readyTest(this);
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
}

Sound.enable = enable;
Sound.getByName = getByName;
Sound.create = create;
Sound.play = play;
Sound.preload = preload;
Sound.loop = loop;
Sound.readyAll = readyAll;
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
	if (!enabled) return undefined;

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
	if (!playSound) return undefined;

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
				if (Number(opts.loop ?? false))
					this.play();
				else
					this.pause();

				// Custom event, if defined.
				opts.onEnd?.();

			}

		}).catch((err) => {
			console.warn(err);
		});
	}

	return playSound;
}

/*
 * Shorthand for play with looping.
 */
export function loop(s, opts = {})
{
	play(s, {...opts, loop: true});
}

/*
 * Find the sound resource with the given name.
 */
export function getByName(name)
{
	return array.find(s => s.name === name);
}

/*
 * Tests whether the sound resource has an instance that is ready to play.
 * Generates a callback function that sets the resource's "ready" property.
 */
export function readyTest(t)
{
	const a = t.instances[0];
	a.oncanplaythrough = () => {
		t.ready = true;
		a.oncanplaythrough = null;
	}
}

/*
 * Preload a given number of sound instances for the given resource.
 */
export function preload({instances}, number)
{
	for (let n = 1; n < number; n++)
		instances.push(instances[0].cloneNode());
}

/*
 * Enables or disabled audio.
 */
export function enable(x)
{
	enabled = x;
}

/*
 * Returns wether all the sounds are ready.
 */
export function readyAll()
{
	return array.every(s => s.ready);
}
