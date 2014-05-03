/* Taken from https://github.com/jdan/isomer/blob/master/gulpfile.js */

var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

var sources = [
        './js/d3fabric.js', 
        './js/prototype.js', 
        './js/gsap.js',
        './js/fabric.js',
        './js/d3.js',
        './js/**/setup.js',
        './js/**/!(setup)*.js'
    ]

/* Main gulp task to minify and concat assets */
gulp.task('build', function () {
  gulp.src(sources)
    .pipe(uglify())
    .pipe(concat('d3fabric.min.js'))
    .pipe(gulp.dest('./build'));
});

/* Task for testing purposes - concat without minifying */
gulp.task('concat', function () {
  gulp.src(sources)
    .pipe(concat('d3fabric.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('default', ['build']);
