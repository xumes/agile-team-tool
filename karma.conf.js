module.exports = (config) => {
  config.set({
    browsers: ['ChromeHeadless'],
    singleRun: true,
    frameworks: ['jasmine'],
    files: [
      'public/**/__tests__/unit/**/*spec.js',
    ],
    preprocessors: {
      'public/*spec.js': ['webpack', 'sourcemap'],
      'public/**/*spec.js': ['webpack', 'sourcemap'],
    },
    reporters: ['dots'],
    webpack: {
      devtool: 'inline-source-map',
      module: {
        rules: [
          {
            test: /\.jsx$|\.js$/,
            exclude: /node_modules/,
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['es2017', 'react'],
                },
              },
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
            test: /\.svg$/,
            loader: 'svg-inline-loader',
          },
        ],
      },
    },
    webpackServer: {
      noInfo: true, // please don't spam the console when running in karma!
    },
  });
};
