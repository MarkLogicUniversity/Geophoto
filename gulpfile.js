'use strict';

var gulp      = require('gulp'),
var concat    = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var rename    = require('gulp-rename');

var paths = {
    css: ['public/css/*.css']
};

var outputs = {
    css: 'public/css/dist/'
};

gulp.task('css', function() {
    return gulp.src(paths.css)
    .pipe(concat('app.css'))
    .pipe(gulp.dest(outputs.css))
    .pipe(rename('app.min.css'))
    .pipe(minifycss({processImport: false, keepSpecialComments: 0}))
    .pipe(gulp.dest(outputs.css))
});

gulp.task('default', ['css']);
