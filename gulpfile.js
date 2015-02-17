/**
 * Created by Jonathan on 1/25/2015.
 */
var gulp = require('gulp');
var gutil = require('gulp-util');

var jshint = require('gulp-jshint');
var browserify = require('browserify');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var jade = require('gulp-jade');
var less = require('gulp-less');
var server = require('gulp-express');

gulp.task('watch', function() {
    gulp.watch(['./source/less/*.less'], ['less'])
    gulp.watch(['./source/jade/*.jade', './source/jade/**/*.jade'], ['jade']);
    gulp.watch(['./source/js/*.js', './source/js/**/*.js'], ['jshint', 'browserify']);
    gulp.watch(['./server/index.js'], ['server']);
});

gulp.task('server', function () {
    // Start the server at the beginning of the task
    server.run(['./server/index.js']);
});

gulp.task('jshint', function() {
    return gulp.src(['./source/js/main.js', './source/js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('jade', function() {
    gulp.src(['./source/jade/*.jade', './source/jade/**/*.jade', '!./source/jade/components/**/*.jade'])
        .pipe(jade())
        .pipe(gulp.dest('./public/'))
});

gulp.task('less', function () {
    gulp.src('./source/less/*.less')
        .pipe(less())
        .pipe(gulp.dest('./public/css'));
});

gulp.task('browserify', function () {
    var bundler = browserify(['./source/js/main.js']);

    return bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('main.js'))
        // optional, remove if you dont want sourcemaps
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./public/js'));

 });

gulp.task('default', ['less', 'jade', 'jshint', 'browserify', 'server', 'watch']);
