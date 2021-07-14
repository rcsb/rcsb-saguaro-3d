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
    },
    node: {
        fs: "empty"
    }
};

const appConfig = {
    ...commonConfig,
    entry: {
        'RcsbFv3DCustom':'./build/src/RcsbFv3D/RcsbFv3DCustom.js',
        'rcsb-saguaro-3d':'./build/src/RcsbSaguaro3D.js'
    },
    mode: "development",
    output: {
        filename: '[name].js',
        library: 'RcsbFv3D',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build/dist')
    },
    devtool: 'source-map'
}

module.exports = [appConfig];
