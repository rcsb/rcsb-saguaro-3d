const HtmlWebpackPlugin = require('html-webpack-plugin');

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

const examples = [];

examples.push({
    ...commonConfig,
    entry: {
        'assembly': './src/examples/assembly/index.ts'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "assembly-interface": './src/examples/assembly-interface/index.ts'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "external-mapping": './src/examples/external-mapping/index.tsx'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "single-chain": './src/examples/single-chain/index.tsx'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "structural-alignment": './src/examples/structural-alignment/index.tsx'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "multiple-chain": './src/examples/structural-alignment/index.tsx'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "css-config": './src/examples/css-config/index.tsx'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

examples.push({
    ...commonConfig,
    entry: {
        "uniprot": './src/examples/structural-alignment/index.tsx'
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
});

const server = {
    ...commonConfig,
    entry: {
        //...examples.map(e=>Object.entries(e.entry)[0]).reduce((prev,curr)=>{prev[curr[0]]=curr[1];return prev;},{})
        'assembly': './src/examples/assembly/index.ts'
    },
    devServer: {
        compress: true,
        port: 9000,
    },
    plugins: [new HtmlWebpackPlugin({
        filename:'[name].html',
        template:'./src/examples/html-template/index.html'
    })]
}

module.exports = [server];
