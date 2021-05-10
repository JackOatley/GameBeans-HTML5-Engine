import * as draw from "./draw.js";
import { NOOP } from "./constants.js";

/**
 *
 */
class Transition {

	/**
	* @param {object} opts Options.
	* @param {string} opts.type
	* @param {string} opts.time Time in steps the tranistion will last per stage (in/out).
	* @param {string} opts.color Color of the transition.
	* @param {string} opts.callback Function to execute mid-transition.
	*/
	constructor(opts = {}) {
		this.type = opts.type || "fade";
		this.time = opts.time || 60;
		this.color = opts.color || "#000000";
		this.callback = opts.callback || NOOP;
		if (opts.prefab) Object.assign(this, opts.prefab);
		this.direction = 1;
		this.alpha = 0;
		this.delta = 1/this.time;
		Transition.allInstances.push(this);

		// Check transition type exists and log warning otherwise
		if (!Transition.prefabs.hasOwnProperty(this.type)) {
			window.addConsoleText("#F00", "Unknown transition type: " + this.type);
			this.type = "fade";
		}
	}

	/** */
	update() {
		if (Transition.prefabs.hasOwnProperty(this.type))
			Transition.prefabs[this.type].update.call(this);
	}

	/** */
	draw() {
		if (Transition.prefabs.hasOwnProperty(this.type))
			Transition.prefabs[this.type].draw.call(this);
	}

	/** */
	destroy() {
		let x = Transition.allInstances.indexOf(this);
		Transition.allInstances.splice(x, 1);
	}

	/** */
	static create(opts) {
		return new Transition(opts);
	}

	/** */
	static updateAll() {
		Transition.allInstances.forEach((t) => {
			t.update();
		});
	}

	/** */
	static drawAll() {
		Transition.allInstances.forEach((t) => {
			t.draw();
		});
	}

}

//
Transition.allInstances = [];

/**
 * @namespace
 */
Transition.prefabs = {

	"fade": {
		update: function() {
			this.alpha += this.direction ? this.delta : -this.delta;
			if (this.alpha >= 1) {
				this.callback();
				this.direction = 0;
			} else if (this.alpha <= 0) {
				this.destroy();
			}
		},
		draw: function() {
			var ctx = draw.context;
			ctx.globalAlpha = this.alpha;
			ctx.fillStyle = this.color;
			ctx.fillRect(0, 0, 9999999, 9999999);
		}
	}

}

export default Transition;
