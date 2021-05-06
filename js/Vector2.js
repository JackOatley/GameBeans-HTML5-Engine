import Generator from "./generator.js";

/** */
class Vector2 {

	/** */
	constructor(x, y) {
		this.set(x, y);
	}

	/** */
	set(x, y) {
		this.x = x;
		this.y = y;
	}

	/** */
	copy(v) {
		this.x = v.x;
		this.y = v.y;
	}

	/** */
	add(v) {
		this.x += v.x;
		this.y += v.y;
	}

	/** */
	mul(v) {
		this.x *= v.x;
		this.y *= v.y;
	}

	/** */
	div(v) {
		this.x /= v.x;
		this.y /= v.y;
	}

}

Generator.classStaticMatch(Vector2);

export default Vector2;
