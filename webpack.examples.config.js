const path = require('path');

const commonConfig = {
    module: {
      rules: [
          {
              test: /\.(html|ico)$/,
              use: [{
                  loader: 'file-loader',
                  options: { name: '[name].[ext]' }
              }]
          },{
              test: /\.scss$/,
              use: [
                  'style-loader',
                  {
                      loader: 'css-loader',
                      options: {
                          modules: {
                              localIdentName:'[local]'
                          }
                      }
                  },
                  'sass-loader'
              ]
          }
      ]
    },
    resolve: {
        modules: [
            'node_modules',
            path.resolve(__dirname, 'build/src/')
        ],
    },
    node: {
        fs: "empty"
    }
};

const example_1 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/single-chain/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/single-chain/')
    },
    devtool: 'source-map'
}

const example_2 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/structural-alignment/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/structural-alignment/')
    },
    devtool: 'source-map'
}

const example_3 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/assembly/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/assembly/')
    },
    devtool: 'source-map'
}

const example_4 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/multiple-chain/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/multiple-chain/')
    },
    devtool: 'source-map'
}

const example_5 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/css-config/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/css-config/')
    },
    devtool: 'source-map'
}

module.exports = [example_1, example_2, example_3, example_4, example_5];
