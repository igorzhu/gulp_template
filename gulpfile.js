var gulp = require('gulp'),
    fileinclude = require('gulp-file-include'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    spritesmith = require('gulp.spritesmith'),
    imagemin = require('gulp-imagemin'),
    csso = require('gulp-csso'),
    cssnano = require('gulp-cssnano'),
    rename  = require('gulp-rename'),
    merge = require('merge-stream'),
    buffer = require('vinyl-buffer'),
    sourcemaps = require('gulp-sourcemaps'),
    runSequence = require('run-sequence'),
    uglify = require('gulp-uglifyjs'),
    autoprefixer = require('gulp-autoprefixer'),
    del = require('del'),
    browserSync = require('browser-sync'),
    clean = require('gulp-clean');



gulp.task('clean', function () {
    return gulp.src([
        'resources/css/',
        'public/css',
        'public/fonts',
        'public/html',
        'public/images'
    ], {read: false})
        .pipe(clean());
});


gulp.task('html', function () {
    gulp.src([
        'resources/html/pages/*.html'
    ])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest('public'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('sass', function() {
    return gulp
        .src([
            'resources/scss/**/index.scss'
        ])
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('resources/css/'));
});

gulp.task('style', ['sass'], function() {
    return gulp
        .src([
            'resources/css/*'
        ])
        .pipe(sourcemaps.init())
        .pipe(cssnano({zindex: false}))
        .pipe(concat('app.min.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public/css'))
        .pipe(browserSync.reload({stream: true}));
});

/**
 * build all icons
 */
gulp.task('sprite', function () {
    var spriteData = gulp.src('resources/images/**/**/icons/*').pipe(spritesmith({
        imgName: 'sprite.png',
        imgPath: '../images/sprite.png',
        cssName: 'sprite.css'

    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
    // DEV: We must buffer our stream into a Buffer for `imagemin`
        .pipe(buffer())
        .pipe(imagemin())
        .pipe(gulp.dest('resources/images'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
        .pipe(csso())
        .pipe(gulp.dest('resources/css'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);
});

gulp.task('image', function() {
    return gulp
        .src([
            'resources/images/**/*'
        ])
        .pipe(gulp.dest('public/images'));
});

gulp.task('fonts', function() {
    return gulp
        .src([
            'resources/fonts/*'
        ])
        .pipe(gulp.dest('public/fonts'));
});

gulp.task('scritps', function() {
    return gulp
        .src([
            'resources/js/*'
        ])
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: 'public'
        },
        notify: false
    });
});

gulp.task('watch', ['build', 'browser-sync'], function() {
    gulp.watch('resources/scss/**/*.scss', ['style']);
    gulp.watch('resources/html/**/*.html', ['html']);
    gulp.watch('resources/js/**/*.js', ['scripts']);
});

gulp.task('build', function(callback) {
    runSequence('clean', 'fonts', 'sprite', 'sass', 'style', 'scritps', 'image', 'html',
        callback);
});

gulp.task('default', ['watch']);
