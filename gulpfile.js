var gulp = require('gulp');
var http = require("http");
var del = require("del");
var connect = require("connect");
//var cpl = require('connect-proxy-layer');
var merge = require('merge-stream');
var xmlParseString = require('xml2js').parseString;
var url = require('url');
var proxy = require('proxy-middleware');
var plugins = require("gulp-load-plugins")();

var config = {
	debug: true,
	uglifyjs: {outSourceMap:true}
};

var tsProject = plugins.typescript.createProject({
	sortOutput:true,
	declarationFiles:true,
	//noExternalResolve:true,
	removeComments:true,
	noImplicitAny:true
});

// https://github.com/dlmanning/gulp-sass/issues/28#issuecomment-43951089
var processWinPath = function(file) {
	var path = require('path');
	if (process.platform === 'win32') {
		file.path = path.relative('.', file.path);
		file.path = file.path.replace(/\\/g, '/');
	}
};

gulp.task('styles', function() {
	return gulp.src('src/scss/*.scss')
		.on('data', processWinPath)
		.pipe(plugins.sass({sourceComments:'map', sourceMap:'sass', errLogToConsole: true}))
		//.pipe(plugins.autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		//.pipe(plugins.rename({suffix: '.min'}))
		//.pipe(plugins.minifyCss())
		.pipe(gulp.dest('target/css'));
});

gulp.task('scripts', function() {
	var js = gulp.src('src/js/**/*.js')
		//.pipe(plugins.jshint('.jshintrc'))
		//.pipe(plugins.jshint.reporter('default'))
		//.pipe(plugins.uglifyjs("js.js", config.uglifyjs))
		;
	var ts = gulp.src('src/ts/**/*.ts')
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.typescript(tsProject)).js
		;
	return merge(js, ts)
		.pipe(plugins.concatSourcemap('all.js', {sourcesContent:true, prefix:3}))
		//.pipe(plugins.uglify())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest('target/js'));
});

gulp.task('images', function() {
	return gulp.src('src/img/**/*')
		.pipe(gulp.dest('target/img'));
});

gulp.task('html', function() {
	return gulp.src('src/html/**/*.html')
		.pipe(gulp.dest('target'));
});

gulp.task('clean', function(next) {
	del('target', next);
});

gulp.task('webserver', function(next) {
	var app = connect();
	/*
	var rewriteHeader = function header(localRequest, next, proxy, pump) {
		delete localRequest.headers['accept-encoding']; // don't ask for compressed, can't be bothered to un-gzip
		pump(localRequest);
	};
	var rewriteOutput = function(remoteResponse, responseBody, localResponse, nxt, send) {
		remoteResponse.headers['content-type'] = 'application/json';
		delete remoteResponse.headers['content-length'];
		xmlParseString(responseBody, function (err, result) {
			send(localResponse, remoteResponse, JSON.stringify(result));
		});
	};
	app.use('/api', cpl('http://endpoint/api/', rewriteHeader, null, rewriteOutput));
	*/
	app.use(connect.static('target'));
	http.createServer(app).listen(3000, next);
});

gulp.task('package', function() {
	gulp.start('default');
});

gulp.task('default', function() {
	gulp.start('styles', 'scripts', 'images', 'html');
});

gulp.task('liveserve', ['default', 'webserver'], function() {
	gulp.watch('src/scss/**/*.scss', ['styles']);
	gulp.watch('src/js/**/*.js', ['scripts']);
	gulp.watch('src/ts/**/*.ts', ['scripts']);
	gulp.watch('src/img/**/*', ['images']);
	gulp.watch('src/html/**/*', ['html']);
	
	plugins.livereload.listen();
	gulp.watch(['target/**']).on('change', plugins.livereload.changed);
});