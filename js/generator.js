/**
 * @author Jack Oatley
 */
export default class Generator {
	
	/**
	 * @param {function} c Constructor function.
	 */
	static classStaticMatch(c) {
		c.create = Generator.functionFromConstructor(c);
		for (let m in c.prototype) {
			c[m] = Generator.functionFromMethod(c.prototype[m], c.get);
		}
	}
	
	/**
	 * @param {function} c Constructor function.
	 */
	static functionFromConstructor(c) {
		return (...a) => new c(...a);
	}

	/**
	 * @param {function} m Prototype method.
	 * @param {function} [get] Optional get function (static on the constructor.)
	 */
	static functionFromMethod(m, get) {
		if (get)
			return (s, ...a) => m.call(get(s), ...a);
		else
			return (...a) => m.call(...a);
	}
	
	/**
	 * @param {array} a An array of instances of constructor with the following method.
	 * @param {function} m The method to execute for each instance in the array.
	 */
	static arrayExecute(a, m) {
		return (...p) => a.forEach(i => m.call(i, ...p));
	}
	
}