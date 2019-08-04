import Generator from "./generator";
import Transition from "./transition";
import instance from "./instance";
import Sprite from "./sprite";
import draw from "./draw";

/**
 *
 */
class Room {

	/**
	 * @param {string} name
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(name, width, height) {
		this.name = name;
		this.width = Number(width);
		this.height = Number(height);
		this.background = null;
		this.backgroundFrame = 0;
		this.backgroundAnimate = false;
		this.backgroundAnimateSpeed = 1;
		this.backgroundMethod = "no-repeat";
		this.backgroundColor = "#FF0000";
		this.instances = [];
		Room.names.push(name);
		Room.array.push(this);
		if (Room.current === null)
			Room.current = this;
	}

	/**
	 * @param {string} spr
	 * @return {void}
	 */
	setBackground(spr) {
		this.background = spr;
	}

	/**
	 * @param {string} inst Name of the instance to add.
	 * @param {number} x
	 * @param {number} y
	 * @return {void}
	 */
	addInstance(inst, x, y) {
		if (typeof inst === "object") inst = inst.objectName;
		this.instances.push({
			name: inst, x: x, y: y
		});
	}

	/**
	 * @param {object} [opts={}]
	 * @return {void}
	 */
	enter(opts = {}) {

		if (opts.transition) {
			new Transition({
				prefab: opts.transition,
				callback: Room.enter.bind(null, this)
			});
			return;
		}

		// leave room event
		instance.executeEventAll("roomleave");

		// clear current instances
		instance.instanceArray.forEach(function(i) {
			if (!i.persistent) {
				instance.uninstantiate(i);
			}
		});

		// goto new room and create new instances
		Room.current = this;
		this.instances.forEach(function(inst) {
			instance.create(inst.name, inst.x, inst.y);
		});
		instance.doDepthSort = true;

		// enter room event
		instance.executeEventAll("roomenter");

	}

	/**
	 * @return {void}
	 */
	draw() {
		var canvas = draw.target.domElement;
		var ctx = draw.context;
		draw.clear(this.backgroundColor);
		var spr = Sprite.get(this.background);
		if (spr !== null) {

			if (!(ctx instanceof CanvasRenderingContext2D)) {
				window.addConsoleText("#F00", "Room background images are currently only supported in Canvas 2D!");
				window._GB_stop();
				return;
			}

			const frame = this.backgroundFrame;
			const animate = this.backgroundAnimate;
			let index = frame;
			if (animate) {
				this.backgroundFrame += this.backgroundAnimateSpeed;
				index = ~~(this.backgroundFrame % spr.images.length);
			}

			const image = spr.images[index].img;

			if (this.backgroundMethod === "stretch" ) {
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			}

			// Iso patterns.
			else if (this.backgroundMethod.indexOf("iso-") !== -1) {
				let pattern = this.backgroundMethod.replace("iso-", "");

				// First.
				ctx.fillStyle = ctx.createPattern(image, pattern);
				ctx.fillRect(0, 0, canvas.width, canvas.height);

				// Second.
				ctx.rect(0, 0, canvas.width, canvas.height);
				ctx.save();
				ctx.translate(spr.width/2, spr.height/2);
				ctx.fill();
				ctx.restore();
			}

			// Regular patterns.
			else {
				ctx.fillStyle = ctx.createPattern(image, this.backgroundMethod);
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

		}
	}

	/** */
	static next() {
		const index = Room.array.indexOf(Room.current);
		Room.enter(Room.array[index+1]);
	}

	/** */
	static previous() {
		const index = Room.array.indexOf(Room.current);
		Room.enter(Room.array[index-1]);
	}

	/**
	 *
	 */
	static get(name) {
		if (typeof name === "object") return name;
		for (var n=0; n<Room.array.length; n++) {
			if ( Room.array[n]["name"] === name ) {
				return Room.array[n];
			}
		}
		return null;
	}

}

Room.prototype.assetType = "room";
Room.names = [];
Room.array = [];
Room.current = null;
Generator.classStaticMatch(Room);

export default Room;
