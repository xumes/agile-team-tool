var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');
var eslint = require('gulp-eslint');
var fs = require('fs');
var replace = require('gulp-string-replace');

gulp.task('lint', function() {
  return gulp.src(['**/*.js', '!public/dist/**', '!node_modules/**', '!models/mongodb/data/**', '!mongo_scripts/**', '!public/lib/**/*.js'])
    .pipe(eslint({
      useEslintrc: true,
      envs: ['node', 'mocha']
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('pre-test', function() {
  return gulp.src(['*.js', 'routes/*.js', 'routes/*/*.js', '!models/*.js', 'models/mongodb/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['lint', 'pre-test'], function() {
  process.env.isGulpTest = true;
  return gulp.src(['test/models/*.js'])
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

gulp.task('replace-assets', function() {
  var assets = JSON.parse(fs.readFileSync('webpack-assets.json', 'utf-8'));

  gulp.src('views/**/*.ejs')
    .pipe(replace('/dist/(.*?.js|.*?.css)', function(replacement)  {
      var replaceKeys = replacement.substring(6).split('.');
      return '/dist/' + assets[replaceKeys[0]][replaceKeys[1]];
    }
  )).pipe(gulp.dest('dist'));

});

gulp.task('build', ['replace-assets']);
