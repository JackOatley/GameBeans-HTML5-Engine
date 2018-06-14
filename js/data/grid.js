import Pool from "../utils/pool.js";
import Generator from "../generator.js";

/**
 * @author Jack Oatley
 */
export default class Grid {

	/**
	 * @param {number} Initial width of the grid.
	 * @param {number} Initial height of the grid
	 * @param {object} [opts={}] Options object.
	 * @param {*} [opts.value=0] Initial value for each cell of the grid.
	 */
	constructor(width, height, opts = {}) {
		let myGrid = Grid.pool.get(this);
		myGrid.size = width * height;
		myGrid.data = (myGrid === this) ? [] : myGrid.data;
		myGrid.data.length = myGrid.size;
		myGrid.width = width;
		myGrid.height = height;
		myGrid.clear(opts.value || 0);
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
	add(x, y, value) {
		this.data[x + y * this.width] += value;
	}
	
	/**
	 *
	 */
	multiply(x, y, value) {
		this.data[x + y * this.width] *= value;
	}
	
	/**
	 * Clears all cells in the grid to the given value.
	 * @param {*} value Value to clear the grid to.
	 */
	clear(value) {
		this.data.fill(value);
	}
	
	/**
	 *
	 */
	destroy() {
		Grid.pool.release(this);
	}

}

//
Grid.pool = new Pool(Grid);
Generator.classStaticMatch(Grid);