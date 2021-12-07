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
        fallback: {
            fs: false,
            buffer: require.resolve('buffer'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify')
        }
    }
};

const out_path = "build/examples";
const examples = [];

examples.push({
    ...commonConfig,
    entry: {
        "index": './build/src/examples/assembly/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/assembly/')
    }
});

examples.push({
    ...commonConfig,
    entry: {
        "index": './build/src/examples/single-chain/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/single-chain/')
    }
});

examples.push({
    ...commonConfig,
    entry: {
        "index": './build/src/examples/structural-alignment/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/structural-alignment/')
    }
});

examples.push({
    ...commonConfig,
    entry: {
        "index": './build/src/examples/multiple-chain/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/multiple-chain/')
    }
});

examples.push({
    ...commonConfig,
    entry: {
        "index": './build/src/examples/css-config/index.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, out_path+'/css-config/')
    }
});

module.exports = examples;
