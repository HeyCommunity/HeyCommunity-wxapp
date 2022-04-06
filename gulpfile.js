const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const watchSass = require("gulp-watch-sass");

/**
 * sassTask
 *
 * @param cb
 */
function sassTask(cb) {
  gulp.src('./modules/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./modules'));

  cb();
}

/**
 * sassWatchTask
 *
 * @param cb
 */
function sassWatchTask(cb) {
  watchSass(['./modules/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./modules'));

  cb();
}


exports.default = sassTask;
exports.sass = sassTask;
exports['sass:watch'] = sassWatchTask;
