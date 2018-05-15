/**
 * @module Pool
 */

/**
 * The Pool object contains an array (the pool) called stack to which we can give objects. The Pool also maintains it's own length property, as the true length of the stack array does not change, so as to avoid garbage collection.
 * @param {Object} newConstructor The constructor function for this pool. During get, if no items are in the pool and no default value is provided, a new object is created from this constructor and returned.
 */
export default function Pool( newConstructor ) {
	this.stack = [];
	this.length = 0;
	this.newConstructor = newConstructor;
}

/**
 * @param {Object} [def] The default object (or even value) to return if no items are found in the pool. If this is not defined, and no items are found in the pool, then a new object is created as per the Pool's newConstructor property.
 */
Pool.prototype.get = function( def ) {
	
	// return object from pool
	if ( this.length ) {
		def = this.stack[--this.length];
		this.stack[this.length] = undefined;
	}
	
	// return found/default object or create a new one
	return def || new this.newConstructor();
	
}

/**
 * @param {Object} i Objec to release, adding it to the pool.
 */
Pool.prototype.release = function( i ) {
	this.stack[this.length++] = i;
}
