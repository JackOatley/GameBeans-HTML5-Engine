
//
let tween = {
	
	/**
	 *
	 */
	blend( n1 , n2 , perc ) {
		let diff = n2 - n1;
		return n1 + ( diff * perc );
	},

	/**
	 *
	 */
	cubicBezier( x2, y2, x3, y3, i ) {
		
		let x1 = 0,
			y1 = 0,
			x4 = 1,
			y4 = 1;
		
		 // The Green Lines
		let xa = tween.blend( x1 , x2 , i ),
			ya = tween.blend( y1 , y2 , i ),
			xb = tween.blend( x2 , x3 , i ),
			yb = tween.blend( y2 , y3 , i ),
			xc = tween.blend( x3 , x4 , i ),
			yc = tween.blend( y3 , y4 , i ),

			// The Blue Line
			xm = tween.blend( xa , xb , i ),
			ym = tween.blend( ya , yb , i ),
			xn = tween.blend( xb , xc , i ),
			yn = tween.blend( yb , yc , i ),

			// The Black Dot
			x = tween.blend( xm , xn , i ),
			y = tween.blend( ym , yn , i );
		
		//
		return y;
		
	}
	
}

//
export default tween;