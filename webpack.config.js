var path = require('path');
var webpack = require('webpack');

module.exports = [{
	entry: {
		"GameBeans": './js/core.js'
	},
	output: {
		path: path.resolve(__dirname, 'bin'),
		filename: '[name].js',
		library: "GameBeans",
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				query: {
					presets: ['es2015-ie']
				}
			}
		]
	},
	stats: {
		colors: true,
		modules: true,
        reasons: true,
        errorDetails: true
	},
	devtool: 'source-map'
}];