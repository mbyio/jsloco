/*global __dirname*/

const gulp = require('gulp');
const http = require('http');
const st = require('st');
const livereload = require('gulp-livereload');
const ts = require('gulp-typescript');
const tslint = require('gulp-tslint');

var paths = {
    ts: 'ts/**/*.ts',
    jsOut: 'dist/js/',
    html: 'html/**/*.html',
    htmlOut: 'dist/',
    assets: 'assets/**/*',
    assetsOut: 'dist/assets/',
    out: 'dist'
};

gulp.task('tslint', function() {
    return gulp.src(paths.ts)
    .pipe(tslint())
    .pipe(tslint.report('verbose', {
        emitError: false
    }));
});

gulp.task('js', ['tslint'], function() {
    return gulp.src(paths.ts)
    .pipe(ts({
        noImplicitAny: true,
        out: 'main.js',
        target: 'ES5'
    }))
    .pipe(gulp.dest(paths.jsOut));
});

gulp.task('copyHtml', function() {
    return gulp.src(paths.html)
    .pipe(gulp.dest(paths.htmlOut))
    .pipe(livereload());
});

gulp.task('copyAssets', function() {
    return gulp.src(paths.assets)
    .pipe(gulp.dest(paths.assetsOut))
    .pipe(livereload());
});

gulp.task('watch', ['server'], function() {
    livereload.listen({basePath: paths.out});
    gulp.watch(paths.ts, ['js']);
    gulp.watch(paths.html, ['copyHtml']);
    gulp.watch(paths.assets, ['copyAssets']);
});

gulp.task('server', function(done) {
    http.createServer(
        st({
            path: __dirname + '/' + paths.htmlOut,
            index: 'index.html',
            cache: false
        })
    ).listen(8080, done);
    console.log('Started HTTP server on 8080 for development purposes.');
    console.log('Install the livereload chrome extension to automatically ' +
                'refresh the page when changes occur.');
});

gulp.task('default', ['server', 'watch', 'js', 'copyHtml', 'copyAssets']);
