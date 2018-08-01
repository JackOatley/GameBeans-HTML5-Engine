import Generator from "./generator.js";

/**
 * @author Jack Oatley
 */
class Vector2 {

	/**
	 * @param {Number} x
	 * @param {Number} y
	 */
	constructor(x, y) {
		this.set(x, y);
	}
	
	/**
	 *
	 */
	set(x, y) {
		this.x = x;
		this.y = y;
	}
	
	/**
	 *
	 */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
	}
	
	/**
	 *
	 */
	add(v) {
		this.x += v.x;
		this.y += v.y;
	}
	
	/**
	 *
	 */
	mul(v) {
		this.x *= v.x;
		this.y *= v.y;
	}
	
	/**
	 *
	 */
	div(v) {
		this.x /= v.x;
		this.y /= v.y;
	}
	
}

Generator.classStaticMatch(Vector2);

export default Vector2;