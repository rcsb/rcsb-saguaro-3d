const HtmlWebpackPlugin = require('html-webpack-plugin');
const fs = require('fs')

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
            }, {
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
            vm: false,
            buffer: require.resolve('buffer'),
            crypto: require.resolve('crypto-browserify'),
            path: require.resolve('path-browserify'),
            stream: require.resolve('stream-browserify')
        }
    }
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
        port: 9000,
    },
    plugins: Object.keys(entries).map(key=>new HtmlWebpackPlugin({
        filename:`${key}.html`,
        template:'./src/examples/html-template/index.html',
        inject: true,
        chunks:[key]
    })),
    mode: "development",
    devtool: 'source-map'
}

module.exports = [server];
