var gulp     = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha    = require('gulp-mocha');
var jshint   = require('gulp-jshint');


gulp.task('jshint', function() {
  return gulp.src(['*.js'])
    .pipe(jshint());
});

gulp.task('pre-test', function () {
  return gulp.src(['*.js', 'routes/*.js', 'routes/*/*.js', 'models/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['jshint', 'pre-test'], function () {
  return gulp.src(['test/*.js', 'test/*/*/*.js', 'test/*/*.js', '!test/dummy-data.js'])
    .pipe(mocha({
      reporter: process.env.REPORTER || 'progress',
      timeout: 60000,
    }))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    .once('end', function() {
      process.exit();
    })
});