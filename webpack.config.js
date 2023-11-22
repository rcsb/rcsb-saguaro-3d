const path = require('path');


const commonConfig = {
    module: {
      rules: [{
              test: /\.svg$/,
              issuer: /\.[jt]sx?$/,
              use: [{
                  loader:'@svgr/webpack',
                  options: {
                      expandProps: "end",
                      svgoConfig: {}
                  }
              }]
          },{
              test: /\.(html|ico)$/,
              use: [{
                  loader: 'file-loader',
                  options: { name: '[name].[ext]' }
              }]
          },{
              test: /\.(graphql|gql)$/,
              loader: 'raw-loader'
          },{
              test: /\.tsx?$/,
              loader: 'ts-loader',
              exclude: /node_modules/
          },{
              test: /\.jsx?$/,
              loader: 'babel-loader',
              exclude: /node_modules/
          }, {
            test: /\.s?css$/,
            use: ['style-loader', {
                loader: 'css-loader',
                options: {
                    modules: {
                        localIdentName:'[local]'
                    }
                }
            },{
                loader: 'sass-loader',
                options: {
                    sourceMap: true
                }
            }]
          }
      ]
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.jsx' ],
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
        'app':'./lib/app.js'
    },
    mode: "production",
    output: {
        filename: '[name].js',
        library: 'RcsbFv3D',
        libraryTarget: 'umd',
        umdNamedDefine: true,
        path: path.resolve(__dirname, 'build')
    },
    devtool: 'source-map'
}

module.exports = [appConfig];
