const gulp = require('gulp');
const path = require('path');

const sass = require('gulp-sass')(require('sass'));

const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const tap = require('gulp-tap');

/**
 * sass globs
 */
const sassGlobs = ['./modules/**/*.scss'];

/**
 * sassSpecifyFile
 *
 * sass 编译指定的文件
 */
function sassSpecifyFile(filePath) {
  let dirPath = path.dirname(filePath);

  return gulp.src(filePath)
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(rename({extname: '.wxss'}))
    .pipe(gulp.dest(dirPath));
}

/**
 * sass (所有文件)编译任务
 */
function sassTask(cb) {
  gulp.src(sassGlobs).pipe(tap(function(file, t) { return sassSpecifyFile(file.path); }));

  cb();
}

/**
 * sass 新增和更改监听任务
 */
function sassWatchTask(cb) {
  let sassWatcher = gulp.watch(sassGlobs);

  sassWatcher.on('add', function(path) { sassSpecifyFile(path); });
  sassWatcher.on('change', function(path) { sassSpecifyFile(path); });

  cb();
}


exports.default = sassTask;
exports.sass = sassTask;
exports['sass:watch'] = sassWatchTask;
