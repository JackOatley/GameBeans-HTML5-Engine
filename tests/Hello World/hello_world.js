
console.log(GameBeans);
var GB = GameBeans;

GB.object.create( "objHello" );
GB.object.eventAddAction( "objHello", {
	[GB.event.draw]: [
		[GB.draw.setFont, "Arial", 40, "center", "middle" ],
		[GB.draw.text, "Hello, World!", 320, 240 ]
	]
} );

GB.Room.create( "rmHello", 640, 480 );
GB.Room.addInstance( "rmHello", "objHello", 0, 0 );

GB.main.start();