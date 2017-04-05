var Webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'public/js/app.jsx'),
    styles: path.join(__dirname, 'public/css/styles.jsx')
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'public/dist')
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract('style', 'css')
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['react'],
          plugins: ['react-html-attrs']
        }
      },
      {test: /\.svg$/, loader: 'svg-inline'}
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css'),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new Webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ]
};
