import math from "./math.js";
import instance from "./instance.js";
 
//
let basic = JSON.stringify({
	sprite: null,
	index: 0,
	imageSpeed: 1,
	animationBehavior: "loop",
	visible: true,
	solid: false,
	exists: true,
	scaleX: 1,
	scaleY: 1,
	rotation: 0,
	terminal: 100,
	gravity: 0,
	gravityDirection: 0,
	speedX: 0,
	speedY: 0,
	boxTop: 0,
	boxBottom: 0,
	boxLeft: 0,
	boxRight: 0,
	behaviours: [],
	listeners: [],
	events: {},
	boxCollision: {
		x: 0,
		y: 0,
		width: 0,
		height: 0,
		top: 0,
		bottom: 0,
		left: 0,
		right: 0 
	}
});
 
//
let objectVars = {
	
	/**
	 *
	 */
	set: function(proto) {
		Object.assign(proto, JSON.parse(basic));
		
		let depth = 0;
		Object.defineProperty(proto, "depth", {
			set: function(x) {
				if (depth !== x) {
					depth = x;
					console.log("DEPTH SORT!");
					instance.doDepthSort = true;
				}
			},
			get: () => depth
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
export default objectVars;