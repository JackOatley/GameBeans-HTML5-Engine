/**
 * @module objects
 */

import event from "./event.js";
import instance from "./instance.js";
import objectVars from "./objectVars.js";
import Pool from "./utils/pool.js";

/**
 *
 */
export default class object {

	/**
	 * @param {string} name
	 * @param {number} sprite
	 */
	constructor(name, sprite) {
		let obj = function(){};
		objectVars.set(obj.prototype);
		obj.assetType = "object";
		obj.objectName = name || "object_" + obj.id;
		obj.prototype.sprite = sprite || null;
		obj.pool = new Pool(obj);
		object.array.push(obj);
		return obj;
	}
	
	/**
	 *
	 */
	static create(...args) {
		return new object(...args);
	}
	
	/**
	 *
		*/
	static set(obj, property, value) {
		obj = object.get(obj);
		obj.prototype[property] = value;
	}
	
	/**
	 * Add an action with variable parameters to an event of an object.
	 * @param object Can be an object constructor or integer ID.
	 * @param event
	 * @param action
	 * @param {...*} args
	 */
	static eventAddAction(obj, event, action, ...args) {
		
		obj = object.get(obj);
		
		if ( typeof event === "object" ) {
			object.keys(event).forEach((key) => {
				event[key].forEach((params) => {
					object.eventAddAction(obj, key, ...params);
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
			if ( obj.prototype.events[event] === undefined ) {
				
				obj.prototype.events[event] = [];
				
				if ( event.includes( "collision_" ) ) {
					let index = event.indexOf("_") + 1;
					let name = event.slice(index, 200);
					object.addCollisionListener(obj, name);
				}
			}
			
			// add action data to event
			obj.prototype.events[event].push({
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
	static addCollisionListener(obj, target) {
		obj.prototype.listeners.push({
			type: "collision",
			target: target
		});
	}

	/**
	 *
	 */
	static getAllInstances(obj) {
		let arr = [];
		instance.instanceArray.forEach(instance => {
			let name = instance.constructor.objectName;
			if (name === obj)
				arr.push(instance);
		});
		return arr;
	}

	/**
	 * @param {number}
	 */
	static get(value) {
		
		if (typeof value === "object" || typeof value === "function")
			return value;
		
		for (var n = 0; n < object.array.length; n++)
			if (object.array[n].objectName === value)
				return object.array[n];
			
		console.warn("FAIL: ", typeof value, value);
		return null;
		
	}

}

object.array = [];
