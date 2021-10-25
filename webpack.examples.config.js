const path = require('path');

const commonConfig = {
    mode:"production",
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

const out_path = "build/examples";
const example_1 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/single-chain/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/single-chain/')
    }
}

const example_2 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/structural-alignment/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/structural-alignment/')
    }
}

const example_3 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/assembly/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/assembly/')
    }
}

const example_4 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/multiple-chain/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/multiple-chain/')
    }
}

const example_5 = {
    ...commonConfig,
    entry: {
        "index": './build/src/examples/css-config/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/css-config/')
    }
}

module.exports = [example_1, example_2, example_3, example_4, example_5];
