var Webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    home: path.join(__dirname, 'public/js/v2Home.jsx'),
    iterations: path.join(__dirname, 'public/js/v2Iteration.jsx'),
    teams: path.join(__dirname, 'public/js/v2Team.jsx'),
    assessments: path.join(__dirname, 'public/js/v2Assessment.jsx'),
    assessmentSummary: path.join(__dirname, 'public/js/v2AssessmentSummary.jsx'),
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
