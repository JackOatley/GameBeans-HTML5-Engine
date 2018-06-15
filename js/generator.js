/**
 * @author Jack Oatley
 */
export default class Generator {
	
	/**
	 * If class has a static "get" method it is used in functions created from
	 * prototype methods. If there is a "get" method on the prototype it is not
	 * used in the created functions, however it will overide the static "get"
	 * method. If there is both a static "get" method and a "get" method on the
	 * prototype, the static one is used in created functions and remains so,
	 * but the static method on the class is still overwritten.
	 * @param {function} c Constructor function.
	 */
	static classStaticMatch(c) {
		c.create = Generator.functionFromConstructor(c);
		const get = c.get;
		for (var m in c.prototype) {
			c[m] = Generator.functionFromMethod(c.prototype[m], get);
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