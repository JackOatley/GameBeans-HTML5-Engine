/**
 * @author Jack Oatley
 */
export default class Generator {
	
	/**
	 * @param {function} constructor Constructor function.
	 */
	static classStaticMatch(c) {
		c.create = Generator.functionFromConstructor(c);
		for (let m in c.prototype) {
			c[m] = Generator.functionFromMethod(c.prototype[m]);
		}
	}
	
	/**
	 * @param {function} constructor Constructor function.
	 */
	static functionFromConstructor(c) {
		return (...a) => new c(...a);
	}

	/**
	 * @param {function} method Prototype method.
	 */
	static functionFromMethod(m) {
		return (...a) => m.call(...a);
	}
	
}