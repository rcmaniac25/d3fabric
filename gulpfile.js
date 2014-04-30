/* Taken from https://github.com/jdan/isomer/blob/master/gulpfile.js */

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

/* Main gulp task to minify and concat assets */
gulp.task('build', function () {
  gulp.src(['./js/d3fabric.js', './js/!(d3fabric)*.js'])
    .pipe(uglify())
    .pipe(concat('d3fabric.min.js'))
    .pipe(gulp.dest('./build'));
});

/* Task for testing purposes - concat without minifying */
gulp.task('concat', function () {
  gulp.src(['./js/d3fabric.js', './js/!(d3fabric)*.js'])
    .pipe(concat('d3fabric.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('default', ['build']);
