import event from "./event.js";
import * as instance from "./instance.js";
import objectVars from "./objectVars.js";
import Pool from "./utils/pool.js";
import Generator from "./generator.js"

/**
 *
 */
export class GameObject {

	/**
	 * @param {string} name
	 * @param {number} sprite
	 */
	constructor(name, sprite) {

		/**
		 * Create new constructor.
		 * @param {number=} x
		 * @param {number=} y
		 * @return {!Object}
		 */
		var obj = function(x = 0, y = 0, opts) {
			var inst = obj.pool.get(this);
			instance.setup(inst, obj, x, y, opts);
			obj.instances.push(inst);
			return inst;
		};

		//Object.assign(obj, GameObject.prototype);
		obj.eventAddAction = this.eventAddAction;
		obj.find = this.find;

		objectVars.set(obj.prototype);
		obj.objectName = name || "object_" + obj.id;
		obj.prototype.sprite = sprite || null;
		obj.pool = new Pool(obj);
		obj.instances = [];
		GameObject.names.push(obj.objectName);
		GameObject.array.push(obj);
		return obj;

	}

	/**
	 * @param {number=} index
	 * @return {?Object}
	 */
	find(index=0) {
		return instance.find(this, index);
	}

	/**
	 * @return {!number}
	 */
	count() {
		return instance.count(this);
	}

	/**
	 * Add an action with variable parameters to an event of an object.
	 * @param {*} object Can be an object constructor or integer ID.
	 * @param {*} event
	 * @param {*} action
	 * @return {void}
	 */
	eventAddAction(event, action) {

		if (action === undefined) {
			console.warn("tried to add an undefined action to an event!");
		}

		// If flow action, get flow tag.
		let flow = "";
		if (typeof action === "string") {
			flow = action;
		}

		// Create a new event if not yet defined.
		if (!this.prototype.events[event]) {

			this.prototype.events[event] = [];

			//
			if (event === "outsideroom") {
				GameObject.addListener(this, "outsideroom");
			}

			// Create collision listeners, if applicable.
			if (event.includes("collision_")) {
				const index = event.indexOf("_") + 1;
				const name = event.slice(index, 200);
				GameObject.addListener(this, "collision", name);
			}

		}

		// Add action to event.
		this.prototype.events[event].push({
			flow: flow,
			cache: action
		});

	}

	/**
	 *
	 */
	addListener(type, target="") {
		this.prototype.listeners.push({
			type: type,
			target: target
		});
	}

	/**
	 * @return {Array}
	 */
	getAllInstances() {
		let arr = [];
		instance.instanceArray.forEach(inst => {
			let name = inst.constructor.objectName;
			if (name === this.objectName) {
				arr.push(inst);
			}
		});
		return arr;
	}

	/**
	 * @param {*} obj
	 * @return {Object} The found object, or null if not found.
	 */
	static get(obj) {

		// If obj is already an object/constructor.
		if (typeof obj !== "string")
			return obj;

		// Iterate all objects to find the one we want.
		var a = GameObject.array;
		var n = a.length;
		while (n--) {
			if (a[n].objectName === obj) {
				return a[n];
			}
		}

		// Failed to find an object.
		return null;

	}

}

Generator.classStaticMatch(GameObject);
GameObject.prototype.assetType = "object";
GameObject.names = [];
GameObject.array = [];
