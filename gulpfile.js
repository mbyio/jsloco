/*global __dirname*/

const gulp = require('gulp');
const eslint = require('gulp-eslint');
const browserify = require('browserify');
const http = require('http');
const st = require('st');
const livereload = require('gulp-livereload');
const flow = require('flow-bin');
const execFile = require('child_process').execFile;
const source = require('vinyl-source-stream');

var paths = {
    es6: 'es6/**/*.js',
    es6Entry: 'es6/main.js',
    jsOut: 'dist/js/',
    html: 'html/**/*.html',
    htmlOut: 'dist/',
    assets: 'assets/**/*',
    assetsOut: 'dist/assets/',
    out: 'dist'
};

gulp.task('lintJs', function() {
    return gulp.src(paths.es6)
    .pipe(eslint())
    .pipe(eslint.format());
});

gulp.task('typeCheckJs', function(cb) {
    execFile(flow, ['--color=always'], function(err, stdout) {
        if (stdout) {
            console.log(stdout);
        }
        if (err) {
            cb(err);
        } else {
            cb();
        }
    });
});

gulp.task('compileJs', function() {
    return browserify(paths.es6Entry)
    .transform('babelify')
    .bundle()
    // bundle returns a regular fs stream, source converts it into a vinyl
    // stream, which is what gulp commands expect
    .pipe(source('main.js'))
    .pipe(gulp.dest(paths.jsOut))
    .pipe(livereload());
});

gulp.task('js', ['lintJs', 'typeCheckJs', 'compileJs']);

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
    gulp.watch(paths.es6, ['js']);
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
