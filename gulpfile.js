'use strict';

var gulp = require('gulp'),
    shell = require('gulp-shell'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'); // JSHint reporter

gulp.task('features-lint', function () {
    return gulp.src([
            './features/' + '**/*.js'
        ])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('cucumber-test', ['features-lint'], shell.task(['node node_modules/cucumber/bin/cucumber.js ']));