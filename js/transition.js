
import draw from "./draw.js";

const noop = () => {};

export default class Transition {
	
	/**
	* @param {object} opts
	*/
	constructor(opts = {}) {
		console.log("transition created!");
		this.type = opts.type || "fade";
		this.time = opts.time || 1000;
		this.color = opts.color || "#000000";
		this.callback = opts.callback || noop;
		this.direction = 1;
		this.alpha = 0;
		this.delta = 1/60;
		Transition.allInstances.push(this);
	}
	
	/** */
	update() {
		if (this.direction) {
			this.alpha += this.delta;
			if (this.alpha >= 1) {
				this.callback();
				this.direction = 0;
			}
		} else {
			this.alpha -= this.delta;
			if (this.alpha <= 0) {
				this.destroy();
			}
		}
	}
	
	/** */
	draw() {
		var canvas = draw.getTarget();
		var ctx = canvas.getContext("2d");
		ctx.globalAlpha = this.alpha;
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	
	/** */
	destroy() {
		let x = Transition.allInstances.indexOf(this);
		Transition.allInstances.splice(x, 1);
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