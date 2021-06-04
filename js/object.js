import event from "./event.js";
import * as instance from "./instance.js";
import objectVars from "./objectVars.js";
import Pool from "./utils/pool.js";
import {behaviourImplementations} from "./behaviors/implementations.js";

/**
 *
 */
export class GameObject
{
	//
	constructor(name, sprite) {
		// Create new constructor.
		var obj = function(x = 0, y = 0, opts) {
			var inst = obj.pool.get(this);
			instance.setup(inst, obj, x, y, opts);
			obj.instances.push(inst);
			return inst;
		};

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

	find(i) {
		return find(this, i);
	}

	count() {
		return count(this);
	}

	eventAddAction(event, action, obj2) {
		eventAddAction(this, event, action, obj2);
	}

	addListener(type, target) {
		addListener(this, type, target);
	}

	getAllInstances() {
		getAllInstances(this);
	}

	static count = count;
	static getAllInstances = getAllInstances;
	static create = create;
	static getByName = getByName;
	static addBehavior = addBehavior;
	static eventAddAction = eventAddAction;
	static addListener = addListener;
}

function create(name, sprite)
{
	return new GameObject(name, sprite);
}

function count(o)
{
	return instance.count(o);
}

function find(o, i = 0)
{
	return instance.find(o, i);
}

function getByName(obj)
{
	return GameObject.array.find(n => n.objectName === obj);
}

function addBehavior(obj, behavior, ...args)
{
	behaviourImplementations[behavior].apply(obj, args);
}

function addEvent(obj, event, obj2)
{
	obj.prototype.events[event] = [];

	if (event === "outsideroom")
		addListener(obj, "outsideroom");

	if (event.includes("collision"))
		addListener(obj, "collision", obj2);
}

function eventAddAction(obj, event, action, obj2)
{
	if (action === undefined)
		console.warn("tried to add an undefined action to an event!");

	if (!obj.prototype.events[event])
		addEvent(obj, event, obj2);

	obj.prototype.events[event].push({
		flow: getFlow(action),
		cache: action
	});
}

function getFlow(action)
{
	return (typeof action === "string") ? action : "";
}

function addListener(o, type, target = "")
{
	o.prototype.listeners.push({type, target});
}

function getAllInstances(o)
{
	let arr = [];
	instance.instanceArray.forEach(inst => {
		let name = inst.constructor.objectName;
		if (name === o.objectName) {
			arr.push(inst);
		}
	});
	return arr;
}

GameObject.prototype.assetType = "object";
GameObject.names = [];
GameObject.array = [];
