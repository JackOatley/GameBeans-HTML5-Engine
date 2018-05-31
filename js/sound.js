/**
 * @module sound
 */

//
let soundResources = [];
	
//
let soundModule = {
	
	//
	names: [],
	array: soundResources,
	isEnabled: true,
	
	/**
	 * Whether sound should be enabled at all.
	 */
	enable: function( x ) {
		soundModule.isEnabled = x;
	},
	
	/**
	 * @param {string} name
	 * @param {source} source
	 */
	create: function( name, source ) {

		//
		let sound = {
			name: name,
			assetType: "sound",
			instances: [new Audio( source )],
			ready: false
		}
		
		//
		let test = sound.instances[0];
		let callback = function() {
			sound.ready = true;
			test.oncanplaythrough = null;
		}
		test.oncanplaythrough = callback;
		
		//
		soundModule.names.push(sound.name);
		soundResources.push(sound);
		return sound;

	},
	
	/**
	 * @param {object} sound The sound resource (object) to be played.
	 * @param {object} options object.
	 */
	play: function( soundName, options = {} ) {
		
		//
		let sound;
		if ( typeof sound !== "object" )
			sound = soundModule.get( soundName );
		
		if ( !sound ) {
			console.warn( "sound with name " + soundName + " doesn't exist!" );
			return;
		}
		
		// sound is enabled
		if ( soundModule.isEnabled ) {
			
			// find an existing sound instance to play
			let playSound;
			for ( var i=0, n=sound.instances.length; i<n; i++ ) {
				let instance = sound.instances[i];
				if ( instance.paused )
					playSound = instance;
			}
			
			// create new instance of sound
			if ( !playSound ) {
				playSound = sound.instances[0].cloneNode();
				sound.instances.push( playSound );
			}
			
			//
			playSound.onError = function( err ) {
				console.error( soundName, err );
			}
			
			// play the sound
			let promise = playSound.play();
			if ( promise !== undefined ) {
				promise.then( function() {
					
					// on end event
					playSound.onended = function() {
						
						// internal event stuff
						( ( Number( options.loop || false ) )
							? _loop : _end ).call( this );
						
						// and custom event, if defined
						( options.onEnd ) && options.onEnd();
							
					}
						
				} ).catch( function( error ) {
					console.warn( error );
				} );
			}
			
			//
			return playSound;
		
		}
		
		// sound is disabled, just return base audio node
		return sound.instances[0];

	},
	
	/**
	 *
	 */
	stop: function( sound ) {
	
		//
		if ( typeof sound !== "object" )
			sound = soundModule.get( sound );
		
		// stop all instance of the given sound
		for ( var i=0, n=sound.instances.length; i<n; i++ ) {
			let instance = sound.instances[i];
			if ( !instance.paused )
				_end.call( instance );
		}
	
	},
	
	/**
	 *
	 */
	readyAll: function() {
		
		for ( var i=0, n=soundResources.length; i<n; i++ ) {
			if ( !soundResources[i].ready )
				return false
		}
		
		return true;
		
	},
	
	/**
	 *
	 */
	get: function( value ) {
		
		//
		for ( var i=0, n=soundResources.length; i<n; i++ ) {
			if ( soundResources[i].name === value )
				return soundResources[i];
		}
		
	}
	
}

//
function _loop() {
	this.currentTime = 0;
	this.play();
}

//
function _end() {
	this.pause();
	this.currentTime = 0;
}

//
export default soundModule;
