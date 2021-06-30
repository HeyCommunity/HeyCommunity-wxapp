const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const watchSass = require("gulp-watch-sass");

/**
 * sassTask
 *
 * @param cb
 */
function sassTask(cb) {
  gulp.src('./components/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./components'));

  gulp.src('./pages/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./pages'));

  cb();
}

/**
 * sassWatchTask
 *
 * @param cb
 */
function sassWatchTask(cb) {
  watchSass(['./components/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./components'));

  watchSass(['./pages/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./pages'));

  cb();
}


exports.default = sassWatchTask;
exports.sass = sassTask;
exports.sassWatch = sassWatchTask;
