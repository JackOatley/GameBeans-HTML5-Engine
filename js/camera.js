import room from "./room.js";
import draw from "./draw.js";

/**
 *
 */
export default class Camera {
	
	/**
	 *
	 */
	constructor(opts = {}) {
		this.x = 0,
		this.y = 0,
		this.angle = 0,
		this.width = room.current.width,
		this.height = room.current.height,
		this.follow = null,
		this.gridLocked = false,
		this.left = 0,
		this.right = 0,
		this.top = 0,
		this.bottom = 0
		Object.assign(this, opts);
		Camera.array.push(this);
	}
	
	/**
	 *
	 */
	update() {
		if (this.follow) {
			
			// if single instance, put into array
			if (!Array.isArray(this.follow))
				this.follow = [this.follow];
			
			//
			let x = 0, y = 0, count = 0, weight = 1;
			this.follow.forEach((inst) => {
				
				if (Array.isArray(inst)) {
					weight = inst[1] || 1;
					inst = inst[0];
				} else {
					weight = 1;
				}
				
				x += inst.x * weight;
				y += inst.y * weight;
				count += weight;
				
			});
			
			this.x = x / count;
			this.y = y / count;
		}
		
		// update bounds
		this.left = this.x - this.width * 0.5;
		this.right = this.x + this.width * 0.5;
		this.top = this.y - this.height * 0.5;
		this.bottom = this.y + this.height * 0.5;
		
		// apply camera
		draw.transform.translate(-this.left, -this.top);
	}
	
	/**
	 *
	 */
	static create(opts = {}) {
		return new Camera(opts);
	}
	
	/**
	 *
	 */
	static updateAll() {
		Camera.array.forEach((cam) => {
			cam.update();
		});
	}
	
}

Camera.array = [];