import * as math from "./math.js";
import * as instance from "./instance.js";

const box = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	top: 0,
	bottom: 0,
	left: 0,
	right: 0
}

//
const basic = {
	init: function() {
		this.sprite = null;
		this.index = 0;
		this.imageSpeed = 0;
		this.animationBehavior = undefined;
		this.visible = true;
		this.solid = false;
		this.persistent = false;
		this.exists = true;
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotation = 0;
		this.terminal = 100;
		this.gravity = 0;
		this.gravityDirection = 0;
		this.speedX = 0;
		this.speedY = 0;
		this.boxTop = 0;
		this.boxBottom = 0;
		this.boxLeft = 0;
		this.boxRight = 0;
		this._depth = 0;
		this.behaviors = [];
		this.listeners = [];
		this.events = {};
		this.boxCollicion = Object.create(box);
	}
}

const funcs = {
	nearest: function(obj) {
		return instance.nearest(this.x, this.y, obj);
	},

	furthest: function(obj) {
		return instance.furthest(this.x, this.y, obj);
	},

	moveTowardsPoint: function(x, y, spd) {
		instance.moveTowardsPoint(this, x, y, spd);
	},

	stepTowardsPoint: function(x, y, spd) {
		instance.stepTowardsPoint(this, x, y, spd);
	},

	distanceToPoint: function(x, y) {
		return instance.distanceToPoint(this, x, y);
	},

	distanceToInstance: function(inst) {
		return instance.distanceToInstance(this, inst);
	},

	destroy: function() {
		instance.destroy(this);
	},

	mouseOn: function() {
		return instance.mouseOn(this);
	}
}

//
let ObjectVars = {

	/**
	 *
	 */
	set: function(proto) {
		const n = Object.create(basic);
		n.init();
		Object.assign(proto, n, funcs);

		Object.defineProperty(proto, "depth", {
			set: function(x) {
				if (this._depth !== x) {
					this._depth = x;
					instance.setDepthSort(true);
				}
			},
			get: function() { return this._depth; }
		});

		Object.defineProperty(proto, "speed", {
			set: function(x) {
				let y = this.direction * math.DEGTORAD;
				this.speedX = Math.cos(y) * x;
				this.speedY = Math.sin(y) * x;
			},
			get: function( x ) {
				return math.pointDistance( 0, 0, this.speedX, this.speedY );
			}
		} );

		Object.defineProperty(proto, "direction", {
			set: function(x) {
				let y = this.speed;
				this.speedX = Math.cos(x * math.DEGTORAD) * y;
				this.speedY = Math.sin(x * math.DEGTORAD) * y;
			},
			get: function( x ) {
				return math.pointDirection( 0, 0, this.speedX, this.speedY );
			}
		} );

	}

}

//
export default ObjectVars;
