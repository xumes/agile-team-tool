const webpackConfig = require('./webpack.config');

module.exports = (config) => {
  config.set({
    browsers: ['ChromeHeadless'],
    singleRun: true,
    frameworks: ['jasmine'],
    files: [
      'public/**/__tests__/unit/**/*spec.js',
      'public/**/__tests__/unit/**/*spec.jsx',
    ],
    preprocessors: {
      'public/**/__tests__/unit/**/*spec.js': ['webpack', 'sourcemap'],
      'public/**/__tests__/unit/**/*spec.jsx': ['webpack', 'sourcemap'],
    },
    reporters: ['dots'],
    webpack: webpackConfig,
    webpackServer: {
      noInfo: true, // please don't spam the console when running in karma!
    },
  });
};
