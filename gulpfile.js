var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var eslint   = require('gulp-eslint');

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!node_modules/**', '!models/mongodb/data/**', '!mongo_scripts/**'])
    .pipe(eslint({
      useEslintrc: true,
      envs: ['node', 'mocha']
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function() {
  return gulp.src(['*.js', 'routes/*.js', 'routes/*/*.js', 'models/*.js', '!models/teamscore.js', 'models/mongodb/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'pre-test'], function() {
  process.env.isGulpTest = true;
  return gulp.src(['test/models/mongodb/*.js'])
  //return gulp.src(['test/*.js', 'test/*/*/*.js', 'test/*/*.js'])
    .pipe(mocha({
      reporter: process.env.REPORTER || 'spec',
      timeout: 60000,
    }))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    .pipe(istanbul.enforceThresholds({
      thresholds: {
        global: {
          lines: 90
        }
      }
    }))
    .once('end', function() {
      process.exit();
    });
});
