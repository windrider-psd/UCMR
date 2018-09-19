let glob = require('glob')
let path = require('path')

let pagesDir = glob.sync('./view/pages/*/')
let pagesEntry = {}
let webpack = require('webpack')
for(let i = 0; i < pagesDir.length; i++)
{
    let dirname = pagesDir[i].split('/')
    dirname = dirname[dirname.length - 2]
    

    let dirJS = glob.sync('./view/pages/'+dirname+'/*.+(css|js)')
    if(dirJS.length > 0)
    {
        pagesEntry[dirname] = []
        for(let j = 0; j < dirJS.length; j++)
        {
            let pagename = dirJS[j].split('/')
            pagename = pagename[pagename.length - 1]
            paganame = pagename.split('.')[0]
            pagesEntry[dirname].push(dirJS[j])
        }
    }
    
    
}
let general_entry = glob.sync('./view/generic/*.js')
let frameworks = glob.sync('./view/style/frameworks/*.css')

for(let i = 0; i < frameworks.length; i++)
{
    general_entry.push(frameworks[i])
}


module.exports = 
[
    {
        mode : 'development',
        entry : general_entry,
        output : {
            path : __dirname + '/public/dist',
            filename : 'bundle.general.js',
            publicPath: './public/'
        },
        module:{
            rules:[
                { 
                    test: /\.(png|jpg)$/, loader: 'file-loader' 
                },
                {
                    test: /\.(woff|woff2|eot|ttf|svg)$/, 
                    loader: 'url-loader?limit=100000'
                },
                {
                    test: /\.css/,
                    include : [
                        path.resolve(__dirname, 'view/style/frameworks'),
                    ],
                    use :[
                        {
                            loader : 'style-loader',
                        },
                        {
                            loader : 'css-loader',
                        }
                    ]
                    
                }
            ]
        },
        plugins : [
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            // Use NoErrorsPlugin for webpack 1.x
            new webpack.NoEmitOnErrorsPlugin()
        ]
    },
    {
        mode : 'development',
        entry : pagesEntry,
        output : {
            path : __dirname + '/public/dist',
            filename : '[name].bundle.js',
            publicPath: __dirname + '/public/dist/'
        },
        module:{
            rules:[
                { 
                    test: /\.(png|jpg)$/, loader: 'file-loader' 
                },
                {
                    test: /\.css/,
                    include : [
                        path.resolve(__dirname, 'view/pages')
                    ],
                    use :[
                        {
                            loader : 'style-loader',
                        },
                        {
                            loader : 'css-loader',
                        }
                    ]
                    
                },
                {
                    test : /\.js/,
                    loader : 'babel-loader',
                    query: {
                            presets : ['es2015']
                    }
                }
            ],
        },
        plugins : [
            new webpack.optimize.OccurrenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            // Use NoErrorsPlugin for webpack 1.x
            new webpack.NoEmitOnErrorsPlugin()
        ]
    }
]
    

