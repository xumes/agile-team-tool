var Webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'public/js/app.jsx'),
    styles: path.join(__dirname, 'public/css/styles.jsx')    
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.join(__dirname, 'public/dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' }
        ]
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          { 
            loader: 'babel-loader',
            options: {              
              presets: ['react'],
              plugins: ['react-html-attrs']
            }
          }
        ]        
      },
      {
        test: /\.svg$/, 
        loader: 'svg-inline-loader'
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].[chunkhash].css'),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new Webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      compress: {
        warnings:false
      },
      output: {
        comments: false
      }
    }),
    new AssetsPlugin()
  ]
};
