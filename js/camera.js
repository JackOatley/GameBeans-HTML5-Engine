import room from "./room.js";
import * as draw from "./draw.js";
import * as Instance from "./instance.js";

/**
 *
 */
export const allCameras = [];

/**
 * @author Jack Oatley
 */
export class Camera {

	/**
	 * Create a new Camera instance.
	 * @param {object} [opts={}]
	 * @param {number} [x]
	 * @param {number} [y]
	 * @param {number} [angle]
	 * @param {number} [width]
	 * @param {number} [height]
	 * @param {number} [follow]
	 * @param {number} [gridLocked]
	 */
	constructor(opts = {}) {
		this.x = 0;
		this.y = 0;
		this.angle = 0;
		this.width = room.current.width;
		this.height = room.current.height;
		this.follow = null;
		this.gridLocked = false;
		this.left = 0;
		this.right = 0;
		this.top = 0;
		this.bottom = 0;
		Object.assign(this, opts);
		Camera.array.push(this);
	}

	/**
	 * Update the Camera.
	 * @return {void}
	 */
	update() {

		//
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

		this.updateBounds();

		// apply camera
		draw.scale(room.current.width/this.width, room.current.height/this.height);
		draw.translate(-this.left, -this.top);

		// Draw for this camera.
		Camera.currentlyDrawing = this;
		room.draw(room.current);
		Instance.drawAll();

	}

	/**
	 *
	 */
	updateBounds() {
		this.left = this.x - this.width / 2;
		this.right = this.x + this.width / 2;
		this.top = this.y - this.height / 2;
		this.bottom = this.y + this.height / 2;
	}

	/**
	 * @return {void}
	 */
	destroy() {
		var index = Camera.array.indexOf(this);
		if (index < 0) return;
		Camera.array.splice(index, 1);
	}

	/**
	 *
	 */
	static create = opts => new Camera(opts);
	static array = allCameras;
	static currentlyDrawing = null;
	static updateAll = updateAllCameras;
	static destroyAll = destroyAllCameras;

}

/**
 * @type {function():void}
 */
export function updateAllCameras() {
	allCameras.forEach(x => x.update());
}

/**
 * @type {function():void}
 */
export function destroyAllCameras() {
	allCameras.forEach(x => x.destroy());
}
