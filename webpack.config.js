let glob = require('glob')

let webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

let frameworks = glob.sync('./view/style/frameworks/*.css')
let generics = glob.sync('./view/pages/generic/*', {nodir : true})

let generic_entry = []
let masterExports = []

for (let i = 0; i < frameworks.length; i++) {
	generic_entry.push(frameworks[i])
}

for (let i = 0; i < generics.length; i++) {
	generic_entry.push(generics[i])
}

let generic_pages = glob.sync('./view/pages/generic/*/')
for (let i = 0; i < generic_pages.length; i++) {
	let dirname = generic_pages[i].split('/')
	dirname = dirname[dirname.length - 2]

	let entries = glob.sync('./view/pages/generic/' + dirname + '/*.+(css|js|pug)')
	if (entries.length > 0) {
		let view = null
		for (let j = 0; j < entries.length; j++) {
			let pagename = entries[j].split('/')
			pagename = pagename[pagename.length - 1]
			pagename = pagename.split('.')
			let fext = pagename[pagename.length - 1]

			if (fext.toLowerCase() == 'pug') {
				view = entries[j]
				// entries.splice(j, 1)
				break
			}

		}
		if (view != null) {
			let orderEntry = []

			for (let j = 0; j < generic_entry.length; j++) {
				orderEntry.push(generic_entry[j])
			}
			for (let j = 0; j < entries.length; j++) {
				orderEntry.push(entries[j])
			}
			let masterEntryOBJ = {
				mode: 'development',
				entry: orderEntry,
				output: {
					path: __dirname + '/public',
					filename: dirname + '.js',
					publicPath: './'
				},
				module: {
					rules: [{
							test: /\.(png|jpg)$/,
							loader: 'file-loader'
						},
						{
							test: /\.(woff|woff2|eot|ttf|svg)$/,
							loader: 'url-loader?limit=100000'
						},
						{
							test: /\.css/,
							use: 
							[
								{
									loader: 'style-loader',
								},
								{
									loader: 'css-loader',
									options: { importLoaders: 1 }
								},
								{
									loader: 'postcss-loader'
								}
							]

						},
						{
							test: /\.js/,
							loader: 'babel-loader',
							query: {
								presets: ['es2015']
							}
						},
						{
							test: /\.pug/,
							use: [{
									loader: 'html-loader',
								},
								{
									loader: 'pug-html-loader'
								}
							]
						}
					]
				},
				plugins: [
					new webpack.optimize.OccurrenceOrderPlugin(),
					new webpack.HotModuleReplacementPlugin(),
					// Use NoErrorsPlugin for webpack 1.x
					new webpack.NoEmitOnErrorsPlugin(),

					new HtmlWebpackPlugin({
						template: view,
						filename: dirname + ".html",
						inject : 'head'
					}),
				]
			}
			masterExports.push(masterEntryOBJ)
		}
	}
}

let specialized_modules = glob.sync('./view/pages/specialized/*/')

for(let i = 0; i < specialized_modules.length; i++)
{
	let specialized_module_name = specialized_modules[i].split('/')
	specialized_module_name = specialized_module_name[specialized_module_name.length - 2]

	let specialized_entries = glob.sync('./view/pages/specialized/'+specialized_module_name+'/*', {nodir : true})

	let specialized_pages = glob.sync('./view/pages/specialized/' + specialized_module_name + '/*/');


	for (let i = 0; i < specialized_pages.length; i++) {
		let dirname = specialized_pages[i].split('/')
		dirname = dirname[dirname.length - 2]
	
		let entries = glob.sync('./view/pages/specialized/' + specialized_module_name + '/' + dirname + '/*.+(css|js|pug)')
		if (entries.length > 0) {
			let view = null
			for (let j = 0; j < entries.length; j++) {
				let pagename = entries[j].split('/')
				pagename = pagename[pagename.length - 1]
				pagename = pagename.split('.')
				let fext = pagename[pagename.length - 1]
	
				if (fext.toLowerCase() == 'pug') {
					view = entries[j]
					// entries.splice(j, 1)
					break
				}
	
			}
			if (view != null) {
				let orderEntry = []
	
				for (let j = 0; j < generic_entry.length; j++) {
					orderEntry.push(generic_entry[j])
				}
				for (let j = 0; j < specialized_entries.length; j++) {
					orderEntry.push(specialized_entries[j])
				}
				for (let j = 0; j < entries.length; j++) {
					orderEntry.push(entries[j])
				}
				let masterEntryOBJ = {
					mode: 'development',
					entry: orderEntry,
					output: {
						path: __dirname + '/public',
						filename: dirname + '.js',
						publicPath: './'
					},
					module: {
						rules: [{
								test: /\.(png|jpg)$/,
								loader: 'file-loader'
							},
							{
								test: /\.(woff|woff2|eot|ttf|svg)$/,
								loader: 'url-loader?limit=100000'
							},
							{
								test: /\.css/,
								use: 
								[
									{
										loader: 'style-loader',
									},
									{
										loader: 'css-loader',
										options: { importLoaders: 1 }
									},
									{
										loader: 'postcss-loader'
									}
								]
	
							},
							{
								test: /\.js/,
								loader: 'babel-loader',
								query: {
									presets: ['es2015']
								}
							},
							{
								test: /\.pug/,
								use: [{
										loader: 'html-loader',
									},
									{
										loader: 'pug-html-loader'
									}
								]
							}
						]
					},
					plugins: [
						new webpack.optimize.OccurrenceOrderPlugin(),
						new webpack.HotModuleReplacementPlugin(),
						// Use NoErrorsPlugin for webpack 1.x
						new webpack.NoEmitOnErrorsPlugin(),
	
						new HtmlWebpackPlugin({
							template: view,
							filename: dirname + ".html",
							inject : 'head'
						}),
					]
				}
				masterExports.push(masterEntryOBJ)
			}
		}
	}
}

module.exports = masterExports

