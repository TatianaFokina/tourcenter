// ========================================================================
// Подключение модулей
// ========================================================================
var gulp = require('gulp');
CompileStylus = require('gulp-stylus');
pug           = require('gulp-pug');
fs            = require("fs");
pugBeautify   = require('gulp-pug-beautify');
browserSync   = require('browser-sync');
// Для конкатенации файлов
concat        = require('gulp-concat');
// Для сжатия JS
uglify        = require('gulp-uglify');
// Для минификации CSS
cssnano       = require('gulp-cssnano');
// Для переименования файлов
rename        = require('gulp-rename');
// Для удаления файлов и папок
del           = require('del');
// Библиотека кеширования
cache         = require('gulp-cache');
// Для автоматического добавления префиксов
autoprefixer  = require('gulp-autoprefixer');
// Для работы с изображениями
imagemin      = require('gulp-imagemin');
// Для сжатия png
pngquant      = require('imagemin-pngquant');
// Для сжатия jpg
imageminJpegtran = require('imagemin-jpegtran');
// Для сжатия gif
imageminGifsicle = require('imagemin-gifsicle');
// Для сжатия svg
imageminSvgo = require('imagemin-svgo');
gulp_postcss = require('gulp-postcss');
datauri = require('postcss-data-uri');
// Объединяет селекторы с одинаковыми свойствами
mergeRules = require('postcss-merge-rules');
htmlbeautify = require('gulp-html-beautify');
plumber = require('gulp-plumber');
notify = require("gulp-notify");
// Меняет пути к файлам в css
modifyCssUrls = require('gulp-modify-css-urls');
postcss_inline_svg = require('postcss-inline-svg');
replace = require('gulp-replace');




// В квадратных скобках указываются таски, котоыре должны выполниться до текущего таска

// ========================================================================
// Компиляция
// ========================================================================
// Stylus (all.styl → test/)
gulp.task('__compileStylus', function () {
	var $postcss_plugins = [
		postcss_inline_svg,
		mergeRules
	]

	return gulp.src('src/styl/styles.styl')
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(CompileStylus({'include css': true}))
		.pipe(autoprefixer({
			// Версии поддерживаемых браузеров
			browsers: [
				"last 2 versions",
				"> 1%",
				"Firefox >= 20",
				"ie >= 10"],
			cascade: false
		}))
		.pipe(gulp_postcss($postcss_plugins))
		.pipe(gulp.dest('test/css'))
		.pipe(browserSync.reload({stream: true}));
});

// Stylus (all.styl → dist/)
gulp.task('__compileStylus_dist', function () {
	var $postcss_plugins = [
		postcss_inline_svg,
		mergeRules
		/*combineCssMedia({
			sort: true
		})*/
	]

	return gulp.src('src/styl/all.styl')
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(CompileStylus({'include css': true}))
		.pipe(autoprefixer({
			// Версии поддерживаемых браузеров
			browsers: [
				"last 2 versions",
				"> 2%",
				"Firefox >= 30"],
			cascade: false
		}))
		.pipe(gulp_postcss($postcss_plugins))
		.pipe(gulp.dest('dist/css'))
		.pipe(browserSync.reload({stream: true}));
});

// Pug
gulp.task('__compilePug', function () {
	return gulp.src([
		'src/pug/**/*.pug',
		'!src/pug/-helpers/**/*',
		'!src/pug/-templates/**/*',
		'!src/pug/**/*.inc.pug',
		'!src/pug/**/*.tpl.pug',
		'!src/pug/**/*--inc.pug',
		'!src/pug/**/*--tpl.pug',
		'!src/pug/**/_*.pug'
	])
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(pug())
		// Разметка НЕ в одну строку
		//.pipe(pug({pretty: true}))
		.pipe(htmlbeautify({
			"indent_with_tabs": true
		}))
		.pipe(gulp.dest("test"))
		.pipe(browserSync.reload({stream: true}));
});






// ========================================================================
// Объединение файлов
// ========================================================================
// JS
gulp.task('__mergeJS', function() {
	// Список подключаемых файлов. Если подключаем один файл, то убрать скобки и запятые
	return gulp.src(require('./src/js/js-list.json'))
		.pipe(plumber())
		// Собираем их в кучу в новом файле
		.pipe(concat('all.js'))
		// Сохраняем в папку
		.pipe(gulp.dest('test/js'))
		.pipe(browserSync.reload({stream: true}));
});






// ========================================================================
// Watch (следит за измениями файлов и компилирует в папку test)
// ========================================================================
// Следит за папкой "test"
gulp.task('Watch', ['Build--Test'], function () {
	gulp.watch('src/styl/**/*.styl', ['__compileStylus']);
	gulp.watch(['src/**/*.pug','!src/helpers/**/*'], ['__compilePug']);
});

// Следит за папкой "test" и открывает в браузере
gulp.task('LiveReload', ['Build--Test'], function () {
	// Выполняем browserSync
	browserSync({
		// Определяем параметры сервера
		server: {
			// Директория для сервера
			baseDir: 'test'

		},
		port: 3087,
		// Отключаем уведомления
		notify: false
	});
	gulp.watch('src/styl/**/*.styl', ['__compileStylus']);
	gulp.watch('src/**/*.pug', ['__compilePug']);
	gulp.watch('src/js/**/*.js', ['__mergeJS']);
});






// ========================================================================
// Удаление папок
// ========================================================================
// dist
gulp.task('__delDist', function() {
	return del.sync('dist');
});
// test
gulp.task('__delTest', function() {
	return del.sync('test');
});






// ========================================================================
// Билд
// ========================================================================

// →  "test"
gulp.task('Build--Test', ['__compileStylus', '__mergeJS', '__compilePug'], function() {
	// Шрифты
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('test/fonts'));

	// Favicons
	gulp.src('src/favicons/**/*')
		.pipe(gulp.dest('test/favicons'));

	// Images
	gulp.src('src/imgs/**/*')
		.pipe(gulp.dest('test/imgs'));
});

// → "dist"
gulp.task('Build', ['__delDist', '__compileStylus', '__mergeJS'], function() {
	// Шрифты
	gulp.src('src/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'));

	// Favicons
	gulp.src('src/favicons/**/*')
		.pipe(cache(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 7}),
			imagemin.svgo({plugins: [{removeViewBox: true}]})
		])))
		.pipe(gulp.dest('dist/favicons'));

	// Images (с оптимизацией)

	// Выбираем папку с исходными изображениями
	gulp.src('src/imgs/**/*')
		.pipe(cache(imagemin([
			imagemin.gifsicle({interlaced: true}),
			imagemin.jpegtran({progressive: true}),
			imagemin.optipng({optimizationLevel: 7}),
			imagemin.svgo({plugins: [{removeViewBox: true}]})
		])))
		.pipe(gulp.dest('dist/imgs'));

	// Copy html
	gulp.src('test/**/*.html')
		.pipe(gulp.dest("dist"));

	// CSS
	gulp.src('test/css/**/*.css')
	// Добавляем суффикс .min
	//.pipe(rename({suffix: '.min'}))
	/*.pipe(modifyCssUrls({ // Меняет пути к файлам в css
		modify: function (url, filePath) {
			return '/assets/dist' + url;
		}/!*,
		prepend: 'https://fancycdn.com/',
		append: '?cache-buster'*!/
	}))*/
	// Меняет пути к файлам в css
	//.pipe(replace('\"/fonts', '\"/assets/dist/fonts'))
	//.pipe(replace('\'/fonts', '\'/assets/dist/fonts'))
	// Сжимаем
		.pipe(cssnano())
		// Сохраняем в папку
		.pipe(gulp.dest('dist/css'));

	// Сжатие JS
	gulp.src('test/js/**/*.js')
		.pipe(plumber())
		// Сжимаем JS-файл
		.pipe(uglify())
		// Сохраняем в папку
		.pipe(gulp.dest('dist/js'));

	// Copy .txt
	gulp.src('src/*.txt')
		.pipe(gulp.dest("dist"));
});






// ========================================================================
// Разное
// ========================================================================
// Задача по-умолчанию
gulp.task('default', ['LiveReload']);
