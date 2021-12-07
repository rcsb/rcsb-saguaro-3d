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
          },
        {
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

const appConfig = {
    ...commonConfig,
    entry: {
        'app':'./build/src/RcsbSaguaro3D.js'
    },
    mode: "production",
    output: {
        filename: '[name].js',
        library: 'RcsbFv3D',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    }
    //, devtool: 'source-map'
}

module.exports = [appConfig];
