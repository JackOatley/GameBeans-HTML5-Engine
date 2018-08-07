import math from "./math.js";
import input from "./input.js";
import object from "./object.js";
import sprite from "./sprite.js";
import draw from "./draw.js";
import Compiler from "./compile.js";
import global from "./global";

//
window.global = global;
let aInstances = [];
let otherStack = [];
let currentEvent = "";

//
let instance = {
	
	//
	instanceArray: aInstances,
	instanceHardLimit: 1000,
	
	/**
	 * @param {object} obj
	 * @param {number} x
	 * @param {number} y
	 */
	create: function(obj, x, y) {
		
		//
		let o = object.get(obj);
		if (o === null) {
			window.addConsoleText("#F00", "No such object as " + obj);
			window._GB_stop();
			return null;
		}
		
		let inst = new o(x, y);
		return inst;
	},
	
	setup: function(inst, o, x, y) {
		inst.object = o;
		inst.objectName = o.objectName;
		inst.assetType = "instance";
		inst.x = Number(x);
		inst.y = Number(y);
		inst.startX = inst.x;
		inst.startY = inst.y;
		inst.boxCollision = Object.assign({}, inst.boxCollision);
		
		//
		let spr = sprite.get(inst.sprite);
		if (spr) {
			inst.boxCollision.x = spr.originX;
			inst.boxCollision.y = spr.originY;
			inst.boxCollision.width = spr.width;
			inst.boxCollision.height = spr.height;
		}
		
		//
		instance.addToArray(inst);
		instance.updateBoundingBox(inst);
		instance.updateCollisionBox(inst);
		instance.executeEvent(inst, "create");
	},

	/**
	 *
	 */
	addToArray: function(inst) {
		let i;
		for (i=0; i<aInstances.length; i++) {
			if (inst.depth <= aInstances[i].depth) {
				aInstances.splice(i, 0, inst);
				return;
			}
		}
		aInstances.push(inst);
	},

	/**
	 * @param {object} obj
	 * @param {number} x
	 * @param {number} y
	 * @param {number} speed
	 * @param {number} direction
	 */
	createMoving: function(obj, x, y, speed, direction) {

		if ( aInstances.length >= instance.instanceHardLimit ) {
			console.warn( "instance number hard limit reached:", instance.instanceHardLimit );
			return;
		}

		let newInst = instance.create(obj, x, y);
		newInst.speed = speed;
		newInst.direction = direction;
		return newInst;
		
	},

	/**
	 *
	 */
	find: function(obj, n) {
		if (typeof obj === "function") obj = obj.objectName;
		let i, c=0, inst;
		for (i=0; i<aInstances.length; i++) {
			inst = instance.instanceArray[i];
			if (inst.objectName === obj) {
				if (c++ === n)
					return inst;
			}
		}
		return null;
	},

	/**
	 *
	 */
	findRandom: function(obj) {
		if (typeof obj === "function") obj = obj.objectName;
		let n = math.randomInt(0, instance.count(obj) - 1);
		return instance.find(obj, n);
	},

	/**
	 *
	 */
	count: function(objectName) {
		let c=0;
		instance.instanceArray.forEach((inst) => {
			c += (inst.objectName === objectName);
		});
		return c;
	},

	/**
	 * @param {number} rotation
	 * @param {boolean} relative
	 */
	setRotation: function(rotation, relative) {
		this.rotation = (relative) ? this.rotation + rotation : rotation;
	},

	/**
	 * @param {number} rotation
	 * @param {boolean} relative
	 */
	setDirection: function(direction, relative) {
		this.direction = (relative) ? this.direction + direction : direction;
	},

	/**
	 * @param {object} inst Check the mouse is over this instance.
	 */
	mouseOn: function(inst) {
		return !(inst.boxTop > input.mouse.y/2 - draw.offsetY
		|| inst.boxBottom < input.mouse.y/2 - draw.offsetY
		|| inst.boxLeft > input.mouse.x/2 - draw.offsetX
		|| inst.boxRight < input.mouse.x/2 - draw.offsetX);
	},

	/**
	 * @param {instance} inst Instance to excute step event of.
	 * @param {time} dt Delta time.
	 */
	step: function(inst, dt) {
		
		// step events
		instance.executeEvent(inst, "step");
		instance.updateAnimation(inst, dt);
		instance.updatePosition(inst, dt);
		instance.updateBoundingBox(inst);
		instance.updateCollisionBox(inst);
		
		// collision events
		instance.instanceExecuteListeners(inst);
		
		// input events
		input.triggerEvents.forEach((event) => {
			instance.executeEvent(inst, event);
		});
		
	},

	/**
	 *
	 */
	updateAnimation: function(inst, dt) {
		
		inst.index += inst.imageSpeed;
		let spr = sprite.get( inst.sprite );
		if ( spr ) {
			let length = spr.images.length;
			if ( inst.index >= length ) {
				
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
		
	},

	/**
	 *
	 */
	updatePosition: function(inst, dt) {
		
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
		inst.x += inst.speedX * dt;
		inst.y += inst.speedY * dt;
		
	},

	/**
	 * @param {object} i Instance whos bounding box to update.
	 */
	updateBoundingBox: function(i) {
		let spr = sprite.get(i.sprite);
		if (spr === null) return;
		i.boxTop = i.y - spr.originY * i.scaleY;
		i.boxLeft = i.x - spr.originX * i.scaleX;
		i.boxBottom = i.boxTop + spr.height * i.scaleY;
		i.boxRight = i.boxLeft + spr.width * i.scaleX;
	},

	/**
	 * @param {object} i Instance.
	 */
	updateCollisionBox: function(i) {
		let box = i.boxCollision;
		box.top = i.y - box.y * i.scaleY;
		box.left = i.x - box.x * i.scaleX;
		box.bottom = box.top + box.height * i.scaleY;
		box.right = box.left + box.width * i.scaleX;
	},

	/**
	 *
	 */
	destroy: function(inst) {
		inst.exists = false;
		let index = inst.object.instances.indexOf(inst);
		inst.object.instances.splice(index, 1);
	},

	/**
	 *
	 */
	draw: function(inst) {
		if (!inst.visible) return;
		if (inst.events["draw"]) {
			instance.executeEvent(inst, "draw")
		} else {
			instance.drawSelf(inst);
		}
	},

	/**
	 * @param {Object} inst Instance to draw.
	 * @param {Object} [opts] Options object.
	 */
	drawSelf: function(inst, opts) {
		if (inst.sprite === null) return;
		draw.sprite(
			inst.sprite,
			inst.index,
			inst.x, inst.y,
			inst.scaleX, inst.scaleY,
			inst.rotation,
			opts
		);
	},

	/**
	 *
	 */
	drawDebug: function(inst) {
		let box = inst.boxCollision;
		draw.shape.rectangle(
			box.left,
			box.top,
			box.right - box.left,
			box.bottom - box.top, {
				color: "#FF000055"
			}
		);
	},

	/**
	 * @param {object} sprite
	 */
	changeSprite: function(sprite) {
		this.sprite = sprite;
	},

	/**
	 * @param {object} inst
	 */
	instanceExecuteListeners: function( inst ) {

		inst.listeners.forEach( listener => {
			switch ( listener.type ) {
				
				case ( "collision" ):
					instance.instanceCollisionInstance( inst, listener.target );
					break;
					
			}
		} );

	},

	/**
	 *
	 */
	instanceCollisionInstance: function(inst, target) {
		
		//
		let arr;
		if (target === "solid") {
			arr = instance.getAllSolid(target);
		} else {
			arr = object.getAllInstances(target);
		}
		
		let box1 = inst.boxCollision;
		arr.forEach(function(targ) {
			
			// same instance
			if (inst === targ)
				return;
			
			// no collision
			let box2 = targ.boxCollision;
			if (box1.left > box2.right
			|| box1.right < box2.left
			|| box1.top > box2.bottom
			|| box1.bottom < box2.top) {
				return;
			}
				
			// execute collision event
			instance.executeEvent(inst, "collision_" + target, targ);
			
		});
		
	},

	/**
	 * @param {instance} inst
	 * @param {event} event
	 * @param {instance} otherInst The other instance, in collisions for example.
	 */
	executeEvent: function(inst, event, otherInst) {
		
		// set the current "other" instance
		otherStack.push(window.other);
		window.other = otherInst;
		currentEvent = event;
		
		//
		try {
			if (inst.exists) {
				let actions = inst.events[event];
				if (actions) {
					instance.executeActions(inst, actions, otherInst);
				}
			}
		}
		catch (err) {
			console.error(err);
			window.addConsoleText("#F00",
				"Failed to execute event [" + event + "]"
				+ " of object [" + inst.objectName + "]"
				+ " with error: " + err);
			window._GB_stop();
			return false;
		}
		
		// restore previous "other" instance
		window.other = otherStack.pop();
	},
	
	/**
	 * @param {string} event The event to secute for all instances.
	 * @param {instace} other
	 */
	executeEventAll: function(event, otherInst) {
		for (var n = 0; n < aInstances.length; n++)
			instance.executeEvent(aInstances[n], event, otherInst);
	},

	/**
	 *
	 */
	executeActions: function(inst, actions, otherInst) {
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
					
					const args = action.args;
					let n, newArgs = [];
					for (n = 0; n < args.length; n++) {
						switch (args[n]) {
							case ("self"): newArgs[n] = inst; break;
							case ("other"): newArgs[n] = otherInst; break;
							default: newArgs[n] = Compiler.actionExpression.call(inst, args[n]); break
						}
					}
					
					// Catch and undefined arguments
					if (newArgs.includes(undefined)) {
						window.addConsoleText("#F00",
							"[" + inst.objectName + "]"
							+ " > [" + currentEvent + "]"
							+ " > [" + action.action.name + "]"
							+ " Action contains undefined values!");
						window._GB_stop();
						return false;
					}
					
					condition = action.action.apply(inst, newArgs);
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
			if (steps[scope]++ === 1)
				condition = true;
			
		}
		
	},

	/**
	 * @param {number} dt Delta time.
	 */
	stepAll: function(dt) {
		let arr = aInstances.slice();
		arr.forEach((i) => instance.step(i, dt));
	},

	/** */
	drawAll: function() {
		if (instance.doDepthSort) {
			instance.instanceArray.sort((a, b) => a.depth - b.depth);
		}
		aInstances.forEach((i) => instance.draw(i));
	},
	
	/**
	 *
	 */
	clearDestroyed: function() {
		for (var n=aInstances.length-1; n>=0; n--) {
			let i = aInstances[n];
			if (!i.exists) {
				i.exists = true;
				i.speed = 0;
				i.object.pool.release(i);
				aInstances.splice(n, 1);
			}
		}
	},

	getAllSolid: function() {
		let arr = [];
		instance.instanceArray.forEach((i) => {
			if (i.solid) {
				arr.push(i);
			}
		});
		return arr;
	}
	
}


export default instance;