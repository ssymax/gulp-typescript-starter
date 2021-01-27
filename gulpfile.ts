const { src, dest, series, watch } = require('gulp');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const ts = require('gulp-typescript');
const fileInclude = require('gulp-file-include');
const eslint = require('gulp-eslint');
const prettier = require('gulp-plugin-prettier');
const jest = require('gulp-jest').default;
const csso = require('gulp-csso');
const imagemin = require('gulp-imagemin');

sass.compiler = require('sass');

const server = function (cb) {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
    notify: false,
    open: true,
  });

  cb();
};

const css = function () {
  return src('src/scss/style.scss')
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(csso())
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
};

const scripts = function () {
  return src('src/ts/*.ts')
    .pipe(
      ts({
        noImplicitAny: true,
        outFile: 'index.js',
      })
    )
    .pipe(dest('dist/js'));
};

const html = function (cb) {
  return src('src/html/index.html')
    .pipe(
      fileInclude({
        prefix: '@@',
        basepath: '@file',
      })
    )
    .pipe(dest('dist'));
};

const reload = function (cb) {
  browserSync.reload();
  cb();
};

const lint = function (cb) {
  return src(['./src/*.ts'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

const format = function (cb) {
  return src(['./src/**/*.ts', './gulpfile.ts'])
    .pipe(prettier.format({ singleQuote: true }))
    .pipe(dest((file) => file.base));
};

const test = function (cb) {
  return src(['_tests_']).pipe(
    jest({
      preprocessorIgnorePatterns: [
        '<rootDir>/dist/',
        '<rootDir>/node_modules/',
      ],
      automock: false,
    })
  );
};

const images = function (cb) {
  return src(['./src/images/*'])
    .pipe(imagemin())
    .pipe(dest(['./dist/images']));
};

const watching = function (cb) {
  watch('src/scss/**/*.scss', { usePolling: true }, series([css]));
  watch('src/html/**/*.html', series(html, reload));
  watch('src/ts/*.ts', series(scripts, reload));
  cb();
};

exports.default = series(
  css,
  format,
  html,
  scripts,
  images,
  server,
  watching,
  lint
);

exports.css = css;
exports.watch = watching;
exports.ts = scripts;
exports.html = html;
exports.lint = lint;
exports.format = format;
exports.images = images;
