import event from "./event";
import instance from "./instance";
import objectVars from "./objectVars";
import Pool from "./utils/pool";
import Generator from "./generator"

/**
 *
 */
export default class GameObject {

	/**
	 * @param {string} name
	 * @param {number} sprite
	 */
	constructor(name, sprite) {
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
	 *
	 */
	set(property, value) {
		this.prototype[property] = value;
	}

	/**
	 *
	 */
	executeScript() {
		const closure = function() {
			eval(this.objectScript);
		}.call(this);
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

		//console.log(event, action);

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
	 *
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
	 * @param {number}
	 */
	static get(value) {

		if (typeof value === "object" || typeof value === "function")
			return value;

		for (var n = 0; n < GameObject.array.length; n++)
			if (GameObject.array[n].objectName === value)
				return GameObject.array[n];

		console.warn("FAIL: ", typeof value, value);
		return null;

	}

}

Generator.classStaticMatch(GameObject);
GameObject.prototype.assetType = "object";
GameObject.names = [];
GameObject.array = [];
