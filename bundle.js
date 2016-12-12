var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./webpack.config');
var winston = require('winston');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = function() {
  // Override production config for development
  webpackConfig.devtool = 'source-map';
  webpackConfig.plugins = [
    new ExtractTextPlugin('[name].css')
  ];

  var compiler = webpack(webpackConfig);
  var bundleStart = null;

  compiler.plugin('compile', function() {
    winston.loggers.get('app').info('Compiling assets...');
    bundleStart = Date.now();
  });

  compiler.plugin('done', function() {
    winston.loggers.get('app').info('Bundled in', Date.now() - bundleStart, ' ms!');
  });

  const bundler = new WebpackDevServer(compiler, {
    publicPath: '/dist/',
    hot: true,
    quiet: true,
    noInfo: true,
    stats: {
      colors: true
    }
  });

  bundler.listen(3001, 'localhost', function()  {
    winston.loggers.get('app').info('Bundling project, please wait...');
  });
};
