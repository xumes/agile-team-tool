const Webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const AssetsPlugin = require('assets-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {
  entry: {
    app: path.join(__dirname, 'public/js/app.jsx'),
    styles: path.join(__dirname, 'public/css/styles.jsx'),
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.join(__dirname, 'public/dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          { loader: 'sass-loader' },
        ],
      },
      {
        test: /\.jsx$/,
        exclude: [/node_modules/],
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
          },
        ],
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2017', 'react'],
              plugins: [
                'react-html-attrs',
              ],
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-inline-loader',
      },
    ],
  },
  plugins: [
    new ExtractTextPlugin('[name].[chunkhash].css'),
    new Webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
    new MinifyPlugin(),
    new AssetsPlugin(),
  ],
};
