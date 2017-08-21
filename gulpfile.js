'use strict';
 
var gulp = require('gulp');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var zip = require('gulp-zip');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var fs = require("fs");
var size = require('gulp-size');

gulp.task('clean', function () {
  return gulp.src('build', {read: false})
    .pipe(clean())
});

gulp.task('js', function() {
  // for efficiency not using dep management so just manually control concat order
  return gulp.src([
      './src/js/glMatrix.custom.min.js',
      './src/js/shaders.js',
      './src/js/buffers.js',
      './src/js/textures.js',
      './src/js/index.js'
    ])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./tmp'));
});

gulp.task('html', function() {
  var MAIN_JS = fs.readFileSync('./tmp/main.js', 'utf8');
  var GROUND_TEXTURE_ENCODING = fs.readFileSync('./base64Textures/ground.txt', 'utf8');

  return gulp.src(['./src/index.html'])
    .pipe(replace('{{MAIN_JS}}', MAIN_JS))
    .pipe(replace('{{GROUND_TEXTURE_ENCODING}}', GROUND_TEXTURE_ENCODING))
    .pipe(gulp.dest('./build'));
});

gulp.task('watch', function () {
  return gulp.watch('./src/**/*', ['default']);
});

gulp.task('zip', function() {
  return gulp.src('./build/index.html')
    .pipe(zip('index.html.zip'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('size', function() {
  return gulp.src('./dist/index.html.zip')
    .pipe(size())
});

gulp.task('compress', function () {
  return gulp.src('./tmp/main.js')
    .pipe(uglify())
    .pipe(gulp.dest('./tmp'))
});

gulp.task('default', function() {
  runSequence('clean', 'js', 'html');
});

gulp.task('prod', function() {
  runSequence('clean', 'js', 'compress', 'html', 'zip', 'size');
});
