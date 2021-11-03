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
  gulp.src('./modules/**/*.scss')
    .pipe(sass().on('error', sass.logError))
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
    .pipe(rename({
      extname: '.wxss'
    }))
    .pipe(gulp.dest('./modules'));

  cb();
}


exports.default = sassWatchTask;
exports.sass = sassTask;
exports.sassWatch = sassWatchTask;
