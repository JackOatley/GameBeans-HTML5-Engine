import Generator from "./generator.js";
import Transition from "./transition.js";
import instance from "./instance.js";
import Sprite from "./sprite.js";
import draw from "./draw.js";

/**
 * @author Jack Oatley
 */
export default class Room {

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
	 */
	setBackground(spr) {
		this.background = spr;
	}

	/**
	 * @param {string} inst Name of the instance to add.
	 * @param {number} x
	 * @param {number} y
	 */
	addInstance(inst, x, y) {
		if (typeof inst === "object") inst = inst.objectName;
		this.instances.push({
			name: inst, x: x, y: y
		});
	}

	/**
	 * @param {object} [opts={}]
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
			instance.destroy(i, false);
		});

		// goto new room and create new instances
		Room.current = this;
		this.instances.forEach(function(inst) {
			instance.create(inst.name, inst.x, inst.y);
		});
		
		// enter room event
		instance.executeEventAll("roomenter");

	}
	
	/**
	 *
	 */
	draw() {
		var canvas = draw.target.domElement;
		var ctx = draw.context;
		draw.clear(this.backgroundColor);
		let spr = Sprite.get(this.background);
		if (spr !== null) {
			let image = spr.images[0].img;
			if (this.backgroundMethod === "stretch") {
				ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
			} else {
				let ptrn = ctx.createPattern(image, this.backgroundMethod);
				ctx.fillStyle = ptrn;
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