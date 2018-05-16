/**
 * @module data
 */
 
//
import generator from "./generator.js";
import Grid from "./data/dataGrid.js";

//
let data = {
	
	//
	Grid: Grid,
	grid: {
		create: generator.functionFromConstructor( Grid ),
		get: generator.functionFromMethod( Grid.prototype.get ),
		set: generator.functionFromMethod( Grid.prototype.set ),
		destroy: generator.functionFromMethod( Grid.prototype.destroy )
	}

}

//
export default data;