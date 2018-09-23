import event from "./event";
import instance from "./instance";
import objectVars from "./objectVars";
import Pool from "./utils/pool";
import Generator from "./generator"

/**
 *
 */
class GameObject {

	/**
	 * @param {string} name
	 * @param {number} sprite
	 */
	constructor(name, sprite) {

		// Create new constructor.
		let obj = function(x, y) {
			let inst = obj.pool.get(this);
			instance.setup(inst, obj, x, y);
			obj.instances.push(inst);
			return inst;
		};

		Object.assign(obj, GameObject.prototype);
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
	 * Add an action with variable parameters to an event of an object.
	 * @param {*} object Can be an object constructor or integer ID.
	 * @param {*} event
	 * @param {*} action
	 * @param {...*} args
	 * @return {void}
	 */
	eventAddAction(event, action, ...args) {

		if (typeof event === "object") {
			Object.keys(event).forEach((key) => {
				event[key].forEach((params) => {
					GameObject.eventAddAction(this, key, ...params);
				});
			});
			return;
		}

		if (action !== undefined) {

			// if flow action, get flow tag
			let flow = "";
			if (typeof action === "string")
				flow = action;

			// create a new event if not yet defined
			if (!this.prototype.events[event]) {
				this.prototype.events[event] = [];
				if (event.includes("collision_")) {
					let index = event.indexOf("_") + 1;
					let name = event.slice(index, 200);
					GameObject.addCollisionListener(this, name);
				}
			}

			// add action data to event
			this.prototype.events[event].push({
				flow: flow,
				action: action,
				args: args
			});

		} else {
			console.warn("tried to add an undefined action to an event!");
		}

	}

	/**
	 *
	 */
	addCollisionListener(target) {
		this.prototype.listeners.push({
			type: "collision",
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
			if (name === this.objectName)
				arr.push(inst);
		});
		return arr;
	}

	/**
	 * @param {*} obj
	 * @return {Object} THe found object, or null if not found.
	 */
	static get(obj) {

		// If obj is already an object/constructor.
		if (typeof obj === "object" || typeof obj === "function")
			return obj;

		// Iterate all objects to find the one we want.
		var n = GameObject.array.length;
		while (n--) {
			if (GameObject.array[n].objectName === obj) {
				return GameObject.array[n];
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

export default GameObject;
