const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')

const commonConfig = {
    mode: "development",
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        },{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            exclude: [/node_modules/]
        },{
                test: /\.s?css$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName:'[local]'
                        }
                    }
                }, 'sass-loader'],
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', 'jsx' ],
        fallback: {
            fs: false,
            buffer: require.resolve('buffer'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify')
        }
    },
    devtool: 'source-map'
};

const examples = ['assembly','uniprot','structural-alignment','sequence-identity','single-chain','multiple-chain','alignment-provider'];
const entries = examples.reduce((prev,current)=>{
        prev[current]= fs.existsSync(`./src/examples/${current}/index.ts`) ? `./src/examples/${current}/index.ts` : `./src/examples/${current}/index.tsx`;
        return prev;
    },{});

const server = {
    ...commonConfig,
    entry: entries,
    devServer: {
        compress: true,
        port: 9090,
    },
    plugins: Object.keys(entries).map(key=>new HtmlWebpackPlugin({
        filename:`${key}.html`,
        template:'./src/examples/html-template/index.html',
        inject: true,
        chunks:[key]
    }))
}

module.exports = [server];
