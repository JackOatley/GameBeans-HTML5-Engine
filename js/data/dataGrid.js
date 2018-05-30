/**
 * @module dataGrid
 */

//
import Pool from "../utils/pool.js";

/**
 *
 */
export default class Grid {

	/**
	 *
	 */
	constructor(width, height, opts = {}) {
		let size = width * height;
		let value = opts.value || 0;
		let myGrid = Grid.pool.get(this);
		let array = (myGrid === this) ? this.data = [] : myGrid.data;
		
		// fill grid with default value
		for (var n=0; n<size; n++)
			array[n] = value;

		//
		myGrid.size = size;
		myGrid.width = width;
		myGrid.height = height;
		return myGrid;
	}
	
	/**
	 *
	 */
	get(x, y) {
		return this.data[x + y * this.width];
	}
	
	/**
	 *
	 */
	set(x, y, value) {
		this.data[x + y * this.width] = value;
	}
	
	/**
	 *
	 */
	create(...args) {
		return newGrid(...args);
	}
	
	/**
	 *
	 */
	destroy() {
		Grid.pool.release(this);
	}
	
	/** */
	static get(...args) {
		return Grid.prototype.get.call(...args);
	}
	
	/** */
	static set(...args) {
		return Grid.prototype.set.call(...args);
	}

}

//
Grid.pool = new Pool(Grid);