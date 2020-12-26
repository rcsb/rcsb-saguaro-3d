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
        "example": './build/src/examples/custom-panel/example.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/custom-panel/')
    },
    devtool: 'source-map'
}


const example_3 = {
    ...commonConfig,
    entry: {
        "example": './build/src/examples/assembly/example.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'build/dist/examples/assembly/')
    },
    devtool: 'source-map'
}

module.exports = [example_1, example_3];
