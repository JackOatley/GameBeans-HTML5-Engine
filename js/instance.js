import math from "./math";
import input from "./input";
import object from "./object";
import sprite from "./sprite";
import Draw from "./draw";
import global from "./global";

const INSTANCE_HARD_LIMIT = 10000;

//
window.global = global;

//
let uniqueId = 1;
let instanceArray = [];
let doDepthSort = false;
let otherStack = [];
let currentEvent = "";

//
class instance {

	static get instanceArray() { return instanceArray; }
	static set doDepthSort(x) { doDepthSort = x; }

	/**
	 * Create a new instance of an object.
	 * @param {Object} obj
	 * @param {number} x
	 * @param {number} y
	 * @return {Object}
	 */
	static create(obj, x, y) {

		let o = object.get(obj);
		if (o === null) {
			window.addConsoleText("#F00", "Instance creation failed! No such object as " + obj + ".");
			//window._GB_stop();
			return null;
		}

		if (instanceArray.length >= INSTANCE_HARD_LIMIT) {
			window.addConsoleText("#F00", "instance number hard limit reached:", INSTANCE_HARD_LIMIT);
			return null;
		}

		return new o(x, y);

	}

	/**
	 * @param {object} obj
	 * @param {number} x
	 * @param {number} y
	 * @param {number} speed
	 * @param {number} direction
	 */
	static createMoving(obj, x, y, speed, direction) {
		let newInst = instance.create(obj, x, y);
		newInst.speed = speed;
		newInst.direction = direction;
		return newInst;
	}

	/**
	 *
	 */
	static setup(inst, o, x, y) {

		inst.id = uniqueId++;
		inst.exists = true;
		inst.speed = 0;
		inst.object = o;
		inst.objectName = o.objectName;
		inst.assetType = "instance";
		inst.x = Number(x);
		inst.y = Number(y);
		inst.startX = inst.x;
		inst.startY = inst.y;
		inst.previousX = inst.x;
		inst.previousY = inst.y;
		inst.boxCollision = {};

		//
		let spr = sprite.get(inst.sprite);
		if (spr) {
			inst.boxCollision.x = spr.originX;
			inst.boxCollision.y = spr.originY;
			inst.boxCollision.width = spr.width;
			inst.boxCollision.height = spr.height;
		}

		//
		addToArray(inst);
		updateBoundingBox(inst);
		updateCollisionBox(inst);
		executeEvent(inst, "create");
	}

	/** */
	static find(obj, n) {
		if (typeof obj === "function") obj = obj.objectName;
		let i, c=0, inst;
		for (i=0; i<instanceArray.length; i++) {
			inst = instanceArray[i];
			if (inst.objectName === obj) {
				if (c++ === n)
					return inst;
			}
		}
		return null;
	}

	/** */
	static findRandom(obj) {
		if (typeof obj === "function") obj = obj.objectName;
		let n = math.randomInt(0, count(obj) - 1);
		return find(obj, n);
	}

	/** Find nearest instance of obj to point. */
	static nearest(x, y, obj) {
		let all = object.get(obj).getAllInstances();
		if (all.length === 0) { return null; }
		if (all.length === 1) { return all[0]; }
		let nrst, dist = 1e9, newDist;
		all.forEach(inst => {
			newDist = math.pointDistance(x, y, inst.x, inst.y);
			if (newDist < dist) {
				nrst = inst;
				dist = newDist;
			}
		});
		return nrst;
	}

	/** Find furthest instance of obj to point. */
	static furthest(x, y, obj) {
		let all = object.get(obj).getAllInstances();
		if (all.length === 0) { return null; }
		if (all.length === 1) { return all[0]; }
		let frst, dist = 0, newDist;
		all.forEach(inst => {
			newDist = math.pointDistance(x, y, inst.x, inst.y);
			if (newDist > dist) {
				frst = inst;
				dist = newDist;
			}
		});
		return frst;
	}

	/** */
	static count(objectName) {
		let c=0;
		instanceArray.forEach((inst) => {
			c += (inst.objectName === objectName);
		});
		return c;
	}

	/**
	 * @param {number} rotation
	 * @param {boolean} relative
	 */
	static setRotation(rotation, relative) {
		this.rotation = (relative) ? this.rotation + rotation : rotation;
	}

	/**
	 * @param {number} rotation
	 * @param {boolean} relative
	 */
	static setDirection(direction, relative) {
		this.direction = (relative) ? this.direction + direction : direction;
	}

	/** Start moving in the direction of a given point. */
	static moveTowardsPoint(inst, x, y, spd) {
		inst.direction = math.pointDirection(inst.x, inst.y, x, y);
		inst.speed = spd;
	}

	/** Step towards the given point */
	static stepTowardsPoint(inst, x, y, spd) {
		let dir = math.pointDirection(inst.x, inst.y, x, y);
		let vec = math.lengthDir(spd, dir);
		inst.x += vec[0];
		inst.y += vec[1];
	}

	/** */
	static distanceToPoint(inst, x, y) {
		return math.pointDistance(inst.x, inst.y, x, y);
	}

	/** */
	static position(x, y, obj) {
		let all = object.get(obj).getAllInstances();
		for (var n=0; n<all.length; n++) {
			let inst = all[n];
			if (instance.pointOn(x, y, inst)) {
				return inst;
			}
		}
		return null;
	}

	/** Returns whether the given point is over the given instance. */
	static pointOn(x, y, inst) {
		return !(inst.boxTop > y - Draw.offsetY
		|| inst.boxBottom < y - Draw.offsetY
		|| inst.boxLeft > x - Draw.offsetX
		|| inst.boxRight < x - Draw.offsetX);
	}

	/** */
	static mouseOn(inst) {
		return instance.pointOn(input.mouse.x, input.mouse.y, inst);
	}

	/** Execute step event. */
	static step(inst) {

		// Step events.
		executeEvent(inst, "step");
		updateAnimation(inst);
		updatePosition(inst);
		updateBoundingBox(inst);
		updateCollisionBox(inst);

		// Collision events.
		instanceExecuteListeners(inst);

		// Input events.
		input.triggerEvents.forEach((event) => {
			executeEvent(inst, event);
		});

	}

	/** */
	static destroy(inst) {
		executeEvent(inst, "destroy");
		inst.exists = false;
	}

	/** */
	static uninstantiate(inst) {
		inst.exists = false;
		let arr = inst.object.instances;
		let index = arr.indexOf(inst);
		if (index >= 0) {
			arr[index] = arr[arr.length-1];
			arr.length -= 1;
		}
	}

	/** */
	static draw(inst) {
		if (!inst.visible) return;
		(inst.events["draw"])
			? executeEvent(inst, "draw")
			: instance.drawSelf(inst);
	}

	/**
	 * @param {Object} inst Instance to draw.
	 * @param {Object} [opts] Options object.
	 */
	static drawSelf(inst, opts) {
		if (inst.sprite === null) return;
		Draw.sprite(
			inst.sprite,
			inst.index,
			inst.x, inst.y,
			inst.scaleX, inst.scaleY,
			inst.rotation,
			opts
		);
	}

	/** */
	static drawDebug(inst) {
		let box = inst.boxCollision;
		Draw.shape.rectangle(
			box.left,
			box.top,
			box.right - box.left,
			box.bottom - box.top, {
				color: "rgba(255,0,0,0.5)"
			}
		);
	}

	/** */
	static changeSprite(sprite) {
		this.sprite = sprite;
	}

	/**
	 * Execute a particular event for all current instances.
	 * @param {string} event The event to execute.
	 * @param {Object} otherInst
	 * @return {void}
	 */
	static executeEventAll(event, otherInst) {
		var n = instanceArray.length;
		while (n--) {
			executeEvent(instanceArray[n], event, otherInst);
		}
	}

	/** */
	static stepAll() {
		newStep();
		let arr = instanceArray.slice();
		arr.forEach(function(inst) { executeEvent(inst, "stepBegin"); });
		arr.forEach(instance.step);
		arr.forEach(function(inst) { executeEvent(inst, "stepEnd"); });
		clearDestroyed();
	}

	/** */
	static drawAll() {
		if (doDepthSort) {
			instanceArray.sort(instance.sortFunction);
		}
		instanceArray.forEach(instance.draw);
	}

	/** */
	static drawGuiAll() {
		var n = instanceArray.length;
		while (n--) {
			executeEvent(instanceArray[n], "drawGUI");
		}
	}

}

/** Resets some instance variables/states. */
function newStep() {
	let arr = instanceArray.slice();
	let i, n = arr.length;
	while (n--) {
		i = arr[n];
		i.previousX = i.x;
		i.previousY = i.y;
	}
}

/** */
function updatePosition(inst) {

	// if the instance is already falling at terminal velocity then we no longer apply gravity
	let gravVector = {
		x: math.lengthDirX(inst.terminal, inst.gravityDirection),
		y: math.lengthDirY(inst.terminal, inst.gravityDirection)
	};

	if (gravVector.x > 0 && inst.speedX <= gravVector.x
	|| gravVector.x < 0 && inst.speedX >= gravVector.x) {
		inst.speedX += math.lengthDirX(inst.gravity, inst.gravityDirection);
	}

	if (gravVector.y > 0 && inst.speedY <= gravVector.y
	|| gravVector.y < 0 && inst.speedY >= gravVector.y) {
		inst.speedY += math.lengthDirY(inst.gravity, inst.gravityDirection);
	}

	// move instance
	inst.x += inst.speedX;
	inst.y += inst.speedY;

}

/** Update the instance's bounding box. */
function updateBoundingBox(i) {
	let spr = sprite.get(i.sprite);
	if (spr === null) return;
	i.boxTop = i.y - spr.originY * i.scaleY;
	i.boxLeft = i.x - spr.originX * i.scaleX;
	i.boxBottom = i.boxTop + spr.height * i.scaleY;
	i.boxRight = i.boxLeft + spr.width * i.scaleX;
}

/** Update the instance's collision box. */
function updateCollisionBox(i) {
	let box = i.boxCollision;
	box.top = i.y - box.y * i.scaleY;
	box.left = i.x - box.x * i.scaleX;
	box.bottom = box.top + box.height * i.scaleY;
	box.right = box.left + box.width * i.scaleX;
}

/** Update the instance's animation. */
function updateAnimation(inst) {

	inst.index += inst.imageSpeed;
	let spr = sprite.get(inst.sprite);
	if (spr) {
		let length = spr.images.length;
		if (inst.index >= length) {

			let behavior = inst.animationBehavior;
			let type = typeof behavior;

			//
			if (type === "string") {

				//
				if (behavior === "loop") {
					inst.index -= length;
				}
				else if (behavior === "stop") {
					inst.index = length - 1;
					inst.imageSpeed = 0;
				}

			}

			//
			else if (type === "function") {
				behavior.call(inst);
			}

		}
	}

}

/** */
function addToArray(inst) {
	let i = instanceArray.length;
	while (i--) {
		if (inst.depth <= instanceArray[i].depth) {
			instanceArray.splice(i, 0, inst);
			return;
		}
	}
	instanceArray.push(inst);
}

/** Returns all instances set as "solid". */
function getAllSolid() {
	var arr = [];
	var i, n = instanceArray.length;
	while (i = instanceArray[--n]) {
		if (i.solid) {
			arr.push(i);
		}
	}
	return arr;
}

/** Remove isntances that have been requested to be destroyed. */
function clearDestroyed() {
	var l = instanceArray.length;
	var i, n = l;
	while (i = instanceArray[--n]) {
		if (!i.exists) {
			instance.uninstantiate(i)
			i.object.pool.release(i);
			instanceArray[n] = instanceArray[--l];
		}
	}
	instanceArray.length = l;
}

/**
 * The function used for instance depth ordering.
 * @param {Object} a Instance.
 * @param {Object} b Instance.
 * @return {number} 0, -1 or 1.
 */
function sortFunction(a, b) {
	return (a.depth === b.depth) ? a.id - b.id : a.depth - b.depth;
}

/** */
function instanceExecuteListeners(inst) {
	inst.listeners.forEach((listener) => {
		switch (listener.type) {
			case ("collision"):
				instanceCollisionInstance(inst, listener.target);
				break;
		}
	});
}

/**
 * Execute an event for the given instance only.
 * @param {Object} inst
 * @param {event} event
 * @param {Object} otherInst The other instance, in collisions for example.
 * @return {void}
 */
function executeEvent(inst, event, otherInst) {

	// Set the current "other" instance.
	otherStack.push(window.other);
	window.other = otherInst;
	currentEvent = event;

	//
	try {
		if (inst.exists) {
			let actions = inst.events[event];
			if (actions) {
				executeActions(inst, actions, otherInst);
			}
		}
	}
	catch (err) {
		console.error(err);
		window.addConsoleText("#F00", "Failed to execute event [" + event + "]" + " of object [" + inst.objectName + "]" + " with error: " + err);
		window._GB_stop();
		return;
	}

	// Restore previous "other" instance.
	window.other = otherStack.pop();

}

/** */
function instanceCollisionInstance(inst, target) {

	if (!inst.exists) return;

	//
	let arr =(target === "solid")
		? getAllSolid(target)
	 	: object.getAllInstances(target);

	let box1 = inst.boxCollision;
	arr.forEach(function(targ) {

		// If target doesn't exist, or is same instance
		if (!targ.exists || inst === targ)
			return;

		// No collision, boxes do not overlap.
		let box2 = targ.boxCollision;
		if (box1.left > box2.right
		|| box1.right < box2.left
		|| box1.top > box2.bottom
		|| box1.bottom < box2.top)
			return;

		// Execute collision event.
		executeEvent(inst, "collision_" + target, targ);

	});

}

/**
 * @param {Object} inst
 * @param {Array} actions
 * @param {Object} otherInst
 * @return {void}
 */
function executeActions(inst, actions, otherInst) {
	const steps = [];
	let condition = true;
	let executeIfElse = false;
	let scope = 0;
	let len = actions.length;
	for (let a=0; a<len; a++) {

		let action = actions[a];
		switch (action.flow) {

			// regular action
			case (""):

				if (condition) {
					executeIfElse = false;
					condition = action.cache.call(inst);
					if (condition === undefined) {
						condition = true;
					} else {
						steps[scope] = 0;
						if (condition === false) {
							executeIfElse = true;
						}
					}
				}

				break;

			// control actions
			case ("ifElse"):
				(executeIfElse)
					? steps[scope] = 0
					: condition = false;
			break;
			case ("blockBegin"): scope++; break;
			case ("blockEnd"): scope--; break;
			case ("exitEvent"): if (condition) return false;

		}

		// exit from a single statement after an expression not contained in a block
		if (steps[scope]++ === 1) {
			condition = true;
		}

	}

}

export default instance;
