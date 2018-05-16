/**
 * @module objects
 */

import event from "./event.js";
import instance from "./instance.js";
import objectVars from "./objectVars.js";
import Pool from "./utils/pool.js";

let objectArray = [];

//
let objectModule = {
	
	/**
	 * @param {string} name
	 * @param {number} sprite
	 */
	create: function( name, sprite ) {
		
		// build new object
		let obj = function(){};
		objectVars.set( obj.prototype );
		
		//
		obj.assetType = "object";
		obj.objectName = name || "object_" + obj.id;
		obj.prototype.sprite = sprite || null;
		
		//
		obj.pool = new Pool( obj );
		
		//
		objectArray.push( obj );
		return obj;
		
	},

	/**
	 *
	 */
	set: function( obj, property, value ) {
		obj = objectModule.get( obj );
		obj.prototype[property] = value;
	},

	/**
	 * Add an action with variable parameters to an event of an object.
	 * @param object Can be an object constructor or integer ID.
	 * @param event
	 * @param action
	 * @param {...*} args
	 */
	eventAddAction: function( obj, event, action, ...args ) {
		
		obj = objectModule.get( obj );
		
		if ( typeof event === "object" ) {
			Object.keys( event ).forEach( key => {
				event[key].forEach( params => {
					objectModule.eventAddAction( obj, key, ...params );
				} );
			} );
			return;
		}
		
		if ( action !== undefined ) {
			
			// if flow action, get flow tag
			let flow = "";
			if ( typeof action === "string" )
				flow = action;
			
			// create a new event if not yet defined
			if ( obj.prototype.events[event] === undefined ) {
				
				obj.prototype.events[event] = [];
				
				if ( event.includes( "collision_" ) ) {
				
					let index = event.indexOf( "_" ) + 1,
						name = event.slice( index, 200 );
					
					objectModule.addCollisionListener( obj, name );
						
				}
			}
			
			// add action data to event
			obj.prototype.events[event].push({
				flow: flow,
				action: action,
				args: args
			});
			
		} else {
			console.warn( "tried to add an undefined action to an event!" );
		}
		
	},

	/**
	 *
	 */
	addCollisionListener: function( obj, target ) {

		obj.prototype.listeners.push({
			type: "collision",
			target: target
		});

	},

	/**
	 *
	 */
	getAllInstances: function( obj ) {

		let arr = [];
		instance.instanceArray.forEach( instance => {
			let name = instance.constructor.objectName;
			if ( name === obj )
				arr.push( instance );
		} );
		return arr;

	},

	/**
	 * @param {number}
	 */
	get: function( value ) {
		
		if ( typeof value === "object" || typeof value === "function" )
			return value;
		
		for ( var n = 0; n < objectArray.length; n++ )
			if ( objectArray[n].objectName === value )
				return objectArray[n];
			
		console.warn("FAIL: ", typeof value, value);
		return null;
		
	}
	
}

//
export default objectModule;
