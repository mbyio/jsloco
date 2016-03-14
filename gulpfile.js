const gulp = require('gulp');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const http = require('http');
const st = require('st');
const livereload = require('gulp-livereload');
const flow = require('flow-bin');
const execFile = require('child_process').execFile;

var paths = {
    es6: 'es6/**/*.js',
    jsOut: 'dist/js/',
    html: 'html/**/*.html',
    htmlOut: 'dist/',
    out: 'dist'
}

gulp.task('lintJs', function() {
    return gulp.src(paths.es6)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
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
    return gulp.src(paths.es6)
    .pipe(babel())
    .pipe(browserify())
    .pipe(gulp.dest(paths.jsOut))
    .pipe(livereload());
});

gulp.task('js', ['lintJs', 'typeCheckJs', 'compileJs']);

gulp.task('copyHtml', function() {
    return gulp.src(paths.html)
    .pipe(gulp.dest(paths.htmlOut))
    .pipe(livereload());
});

gulp.task('watch', ['server'], function() {
    livereload.listen({basePath: paths.out});
    gulp.watch(paths.es6, ['js']);
    gulp.watch(paths.html, ['copyHtml']);
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

gulp.task('default', ['server', 'watch', 'js', 'copyHtml']);
