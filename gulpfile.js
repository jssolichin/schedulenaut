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
var gls = require('gulp-live-server');

gulp.task('watch', function() {
    gulp.watch(['./source/less/*.less', './source/less/**/*.less'], ['less']);
    gulp.watch(['./source/jade/*.jade', './source/jade/**/*.jade'], ['jade']);
    gulp.watch(['./source/js/*.js', './source/js/**/*.js'], ['jshint', 'browserify']);
});

gulp.task('serve', function() {
    var server = gls.new('./server/index.js');
    server.start();
    //restart my server
    gulp.watch(['./server/*.js', './server/**/*.js'], server.start);
});


gulp.task('jshint', function() {
    return gulp.src(['./source/js/main.js', './source/js/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('jade', function() {
    gulp.src(['./source/jade/*.jade', './source/jade/**/*.jade', '!./source/jade/components/**/*.jade'])
        .pipe(jade()
            .on('error', onError)
        )
        .pipe(gulp.dest('./public/'))
});

gulp.task('less', function () {
    gulp.src('./source/less/*.less')
        .pipe(less().on('error', onError))
        .pipe(gulp.dest('./public/css'));
});

var onError = function ( err ) {
    gutil.log( gutil.colors.green( err.message ));
    gutil.log.bind(gutil, 'Error');
    this.emit( 'end' );
};


gulp.task('browserify', function () {

	var bundler = browserify({debug: true}).add('./source/js/main.js');

    return bundler.bundle()
        // log errors if they happen
        .on('error', onError)
        .pipe(source('main.js'))
        // optional, remove if you dont want sourcemaps
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        .pipe(sourcemaps.write('./')) // writes .map file
        .pipe(gulp.dest('./public/js'));

 });

gulp.task('default', ['less', 'jade', 'jshint', 'browserify', 'serve', 'watch']);
gulp.task('build', ['less', 'jade', 'jshint', 'browserify']);
