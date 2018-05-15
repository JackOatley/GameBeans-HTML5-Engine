/**
 * @module dataGrid
 */

//
import Pool from "../utils/pool.js";

//
let gridPool = new Pool( Grid );

/**
 *
 */
let Grid = function( width, height, options = {} ) {
	
	//
	let size = width * height,
		value = options.value || 0;
	
	let myGrid = gridPool.get( this );
	let array = ( myGrid === this )
		? this.data = []
		: myGrid.data;
	
	// fill grid with default value
	for ( var n=0; n<size; n++ ) {
		array[n] = value;
	}

	//
	myGrid.size = size;
	myGrid.width = width;
	myGrid.height = height;
	return myGrid;

}

/**
 *
 */
Grid.prototype.get = function( x, y ) {
	return this.data[x + y * this.width];
}

/**
 *
 */
Grid.prototype.set = function( x, y, value ) {
	this.data[x + y * this.width] = value;
}

/**
 *
 */
Grid.prototype.destroy = function() {
	gridPool.release( this );
}

//
export default Grid;