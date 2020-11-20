const path = require('path');

module.exports = [{
    //mode: "development",
    mode: "production",
    entry: {
        'RcsbFv3D':'./src/RcsbFv3DBuilder.tsx',
        'rcsb-saguaro-3d':'./src/RcsbSaguaro3D.js'
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'ts-loader',
          exclude: /node_modules/
        },{
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: [/node_modules/]
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
      extensions: [ '.tsx', '.ts', '.js', 'jsx' ]
    },
    node: {
        fs: "empty"
    },
    output: {
        filename: '[name].js',
        library: 'RcsbFv3D',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'source-map',
}];
