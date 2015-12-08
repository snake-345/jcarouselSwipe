'use strict';

var gulp = require('gulp'),
	$    = require('gulp-load-plugins')();

// because gulp-load-$ loads plugins only with prefix gulp-. Shit.
$.browserSync = require('browser-sync');

var config = {
	/* uncomment below if you not need php */
	server:    {
		baseDir: './'
	},
	startPath: 'examples/basic',
	//tunnel:    true,
	host:      'localhost',
	//port:      9000,
	logPrefix: 'Frontend'
};

var notifyConfig = {
	title: '<%= error.plugin %>',
	message: '<%= error.message %> in file <%= error.fileName %>:<%= error.lineNumber %>'
};

gulp.task('jcarouselSwipe:build', function () {
	gulp.src('src/*.js')
		.pipe($.plumber({
			errorHandler: $.notify.onError(notifyConfig)
		}))
		.pipe(gulp.dest('dist/'))
		.pipe($.uglify())
		.pipe($.rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest('dist/'))
		.pipe($.browserSync.reload({stream: true}));
});

gulp.task('build', [
	'jcarouselSwipe:build'
]);

gulp.task('watch', function () {
	$.watch(['src/*.js'], function (event, cb) {
		gulp.start('jcarouselSwipe:build');
	});

	$.watch(['examples/**/*.*'], function() {
		$.browserSync.reload();
	});
});

gulp.task('webserver', function () {
	$.browserSync(config);
});

gulp.task('clean', function (cb) {
	rimraf('dist/', cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
