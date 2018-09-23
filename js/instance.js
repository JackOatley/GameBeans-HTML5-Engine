import math from "./math";
import input from "./input";
import object from "./object";
import sprite from "./sprite";
import Draw from "./draw";
import Compiler from "./compile";
import global from "./global";

//
window.global = global;

//
let instance = (function() {

	//
	let uniqueId = 1;
	let instanceArray = [];
	let instanceHardLimit = 1000;
	let doDepthSort = false;
	let otherStack = [];
	let currentEvent = "";

	/**
	 * Create a new instance of an object.
	 * @param {Object} obj
	 * @param {number} x
	 * @param {number} y
	 * @return {Object}
	 */
	function create(obj, x, y) {

		//
		let o = object.get(obj);
		if (o === null) {
			window.addConsoleText("#F00", "No such object as " + obj);
			window._GB_stop();
			return null;
		}

		//
		return new o(x, y);

	}

	/**
	 *
	 */
	function setup(inst, o, x, y) {

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

	/**
	 * @param {Object} inst
	 * @return {void}
	 */
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

	/**
	 * @param {object} obj
	 * @param {number} x
	 * @param {number} y
	 * @param {number} speed
	 * @param {number} direction
	 */
	function createMoving(obj, x, y, speed, direction) {

		if (instanceArray.length >= instanceHardLimit) {
			console.warn("instance number hard limit reached:", instanceHardLimit);
			return;
		}

		let newInst = create(obj, x, y);
		newInst.speed = speed;
		newInst.direction = direction;
		return newInst;

	}

	/**
	 *
	 */
	function find(obj, n) {
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

	/**
	 *
	 */
	function findRandom(obj) {
		if (typeof obj === "function") obj = obj.objectName;
		let n = math.randomInt(0, count(obj) - 1);
		return find(obj, n);
	}

	/**
	 *
	 */
	function count(objectName) {
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
	function setRotation(rotation, relative) {
		this.rotation = (relative) ? this.rotation + rotation : rotation;
	}

	/**
	 * @param {number} rotation
	 * @param {boolean} relative
	 */
	function setDirection(direction, relative) {
		this.direction = (relative) ? this.direction + direction : direction;
	}

	/**
	 * @param {Object} inst Check the mouse is over this instance.
	 * @return {boolean}
	 */
	function mouseOn(inst) {
		return !(inst.boxTop > input.mouse.y - Draw.offsetY
		|| inst.boxBottom < input.mouse.y - Draw.offsetY
		|| inst.boxLeft > input.mouse.x - Draw.offsetX
		|| inst.boxRight < input.mouse.x - Draw.offsetX);
	}

	/**
	 * @param {instance} inst Instance to execute step event of.
	 */
	function step(inst) {

		// step events
		executeEvent(inst, "step");
		updateAnimation(inst);
		updatePosition(inst);
		updateBoundingBox(inst);
		updateCollisionBox(inst);

		// collision events
		instanceExecuteListeners(inst);

		// input events
		input.triggerEvents.forEach((event) => {
			executeEvent(inst, event);
		});

	}

	/**
	 *
	 */
	function updateAnimation(inst) {

		inst.index += inst.imageSpeed;
		let spr = sprite.get(inst.sprite);
		if (spr) {
			let length = spr.images.length;
			if (inst.index >= length) {

				let behavior = inst.animationBehavior;
				let type = typeof behavior;

				//
				if ( type === "string" ) {

					//
					if ( behavior === "loop" ) {
						inst.index -= length;
					}

					//
					else if ( behavior === "stop" ) {
						inst.index = length - 1;
						inst.imageSpeed = 0;
					}

				}

				//
				else if ( type === "function" ) {
					behavior.call( inst );
				}

			}
		}

	}

	/**
	 *
	 */
	function updatePosition(inst) {

		// if the instance is already falling at terminal velocity then we no longer apply gravity
		let gravVector = {
			x: math.lengthDirX( inst.terminal, inst.gravityDirection ),
			y: math.lengthDirY( inst.terminal, inst.gravityDirection )
		};

		if ( gravVector.x > 0 && inst.speedX <= gravVector.x
		||   gravVector.x < 0 && inst.speedX >= gravVector.x ) {
			inst.speedX += math.lengthDirX( inst.gravity, inst.gravityDirection );
		}

		if ( gravVector.y > 0 && inst.speedY <= gravVector.y
		||   gravVector.y < 0 && inst.speedY >= gravVector.y ) {
			inst.speedY += math.lengthDirY( inst.gravity, inst.gravityDirection );
		}

		// move instance
		inst.x += inst.speedX;
		inst.y += inst.speedY;

	}

	/**
	 * @param {object} i Instance whos bounding box to update.
	 */
	function updateBoundingBox(i) {
		let spr = sprite.get(i.sprite);
		if (spr === null) return;
		i.boxTop = i.y - spr.originY * i.scaleY;
		i.boxLeft = i.x - spr.originX * i.scaleX;
		i.boxBottom = i.boxTop + spr.height * i.scaleY;
		i.boxRight = i.boxLeft + spr.width * i.scaleX;
	}

	/**
	 * @param {object} i Instance.
	 */
	function updateCollisionBox(i) {
		let box = i.boxCollision;
		box.top = i.y - box.y * i.scaleY;
		box.left = i.x - box.x * i.scaleX;
		box.bottom = box.top + box.height * i.scaleY;
		box.right = box.left + box.width * i.scaleX;
	}

	/**
	 *
	 */
	function destroy(inst) {
		executeEvent(inst, "destroy");
		inst.exists = false;
		let arr = inst.object.instances;
		let index = arr.indexOf(inst);
		if (index >= 0) {
			arr[index] = arr[arr.length-1];
			arr.length -= 1;
		}
	}

	/**
	 *
	 */
	function draw(inst) {
		if (!inst.visible) return;
		if (inst.events["draw"]) {
			executeEvent(inst, "draw")
		} else {
			drawSelf(inst);
		}
	}

	/**
	 * @param {Object} inst Instance to draw.
	 * @param {Object} [opts] Options object.
	 */
	function drawSelf(inst, opts) {
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

	/**
	 *
	 */
	function drawDebug(inst) {
		let box = inst.boxCollision;
		Draw.shape.rectangle(
			box.left,
			box.top,
			box.right - box.left,
			box.bottom - box.top, {
				color: "#FF000055"
			}
		);
	}

	/**
	 * @param {object} sprite
	 */
	function changeSprite(sprite) {
		this.sprite = sprite;
	}

	/**
	 * @param {object} inst
	 */
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
	 *
	 */
	function instanceCollisionInstance(inst, target) {

		//
		let arr;
		if (target === "solid") {
			arr = getAllSolid(target);
		} else {
			arr = object.getAllInstances(target);
		}

		let box1 = inst.boxCollision;
		arr.forEach(function(targ) {

			// same instance
			if (inst === targ) {
				return;
			}

			// no collision
			let box2 = targ.boxCollision;
			if (box1.left > box2.right
			|| box1.right < box2.left
			|| box1.top > box2.bottom
			|| box1.bottom < box2.top) {
				return;
			}

			// execute collision event
			executeEvent(inst, "collision_" + target, targ);

		});

	}

	/**
	 * Execute a particular event for all current instances.
	 * @param {string} event The event to execute.
	 * @param {Object} otherInst
	 * @return {void}
	 */
	function executeEventAll(event, otherInst) {
		var n = instanceArray.length;
		while (n--) {
			executeEvent(instanceArray[n], event, otherInst);
		}
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
			return false;
		}

		// Restore previous "other" instance.
		window.other = otherStack.pop();

	}

	/***************************************************************************
	 * @param {Object} inst
	 * @param {Array} actions
	 * @param {Object} otherInst
	 */
	function executeActions(inst, actions, otherInst) {
		const steps = [];
		let condition = true;
		let scope = 0;

		for (let a=0; a<actions.length; a++) {

			let action = actions[a];
			switch (action.flow) {

				// regular action
				case (""):

					if (!condition)
						break;

					if (!action.cache) {

						const args = action.args;
						let n, newArgs = [];
						for (n = 0; n < args.length; n++) {
							if (typeof args[n] === "function") {
								newArgs[n] = args[n];
							} else {
								switch (args[n]) {
									case ("self"): newArgs[n] = inst; break;
									case ("other"): newArgs[n] = otherInst; break;
									default: newArgs[n] = Compiler.actionExpression.call(inst, args[n]); break
								}
							}
						}

						// Catch any undefined arguments.
						if (newArgs.includes(undefined)) {
							window.addConsoleText("#F00",
								"[" + inst.objectName + "]"
								+ " > [" + currentEvent + "]"
								+ " > [" + action.action.name + "]"
								+ " Action contains undefined values!");
							window._GB_stop();
							return false;
						}

						//*
						action.cache = (function() {
							if (typeof newArgs[0] === "function") {
								return newArgs[0];
							}
							let t = inst;
							let f = action.action;
							return eval(`
								(function() {
									return f.call(this, ` + newArgs.join(",") + `);
								})
							`);
						})();

					}

					condition = action.cache.call(inst);
					(condition === undefined)
						? condition = true
						: steps[scope] = 0;

					break;

				// control actions
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

	/**
	 *
	 */
	function newStep() {
		let arr = instanceArray.slice();
		arr.forEach((i) => {
			i.previousX = i.x;
			i.previousY = i.y;
		});
	}

	/***************************************************************************
	 * @return {void}
	 */
	function stepAll() {
		newStep();
		let arr = instanceArray.slice();
		arr.forEach(function(inst) { executeEvent(inst, "stepBegin"); });
		arr.forEach(step);
		arr.forEach(function(inst) { executeEvent(inst, "stepEnd"); });
		clearDestroyed();
	}

	/**
	 *
	 */
	function drawAll() {
		if (doDepthSort) {
			instanceArray.sort(sortFunction);
		}
		instanceArray.forEach(draw);
	}

	/**
	 *
	 */
	function drawGuiAll() {
		instanceArray.forEach(function(inst) {
			executeEvent(inst, "drawGUI");
		});
	}

	/***************************************************************************
	 * The function used for instance depth ordering.
	 * @param {Object} a Instance.
	 * @param {Object} b Instance.
	 * @return {number} 0, -1 or 1.
	 */
	function sortFunction(a, b) {
 		return (a.depth === b.depth)
 			? a.id - b.id
 			: a.depth - b.depth;
 	}

	/***************************************************************************
	 * Remove isntances that have been requested to be destroyed.
	 * @return {void}
	 */
	function clearDestroyed() {
		let l = instanceArray.length;
		let n = l;
		let i;
		while (i = instanceArray[--n]) {
			if (!i.exists) {
				i.object.pool.release(i);
				instanceArray[n] = instanceArray[--l];
			}
		}
		instanceArray.length = l;
	}

	/***************************************************************************
	 * Returns all instances set as "solid".
	 * @return {Array}
	 */
	function getAllSolid() {
		let arr = [];
		let n = instanceArray.length;
		let i;
		while (i = instanceArray[--n]) {
			if (i.solid) {
				arr.push(i);
			}
		}
		return arr;
	}

	return {
		get instanceArray() { return instanceArray; },
		set doDepthSort(x) { doDepthSort = x; },
		create: create,
		setup: setup,
		stepAll: stepAll,
		drawAll: drawAll,
		drawGuiAll: drawGuiAll,
		executeEventAll: executeEventAll,
		changeSprite: changeSprite,
		createMoving: createMoving,
		destroy: destroy,
		drawSelf: drawSelf,
		setDirection: setDirection,
		setRotation: setRotation,
		count: count,
		mouseOn: mouseOn,
		find: find
	}

})();

export default instance;
