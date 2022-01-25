# gulp

## project tree

```shell
app
├── src
│   ├── fonts
│   ├── images
│   ├── music
│   ├── css
│   ├── html
│   ├── js
│   └── sass
├── dist
├── gulpfile.js
├── node_modules
├── package.json
├── package-lock.json
└── server.js
```

## startup command

```bash
node -v
npm  -v
gulp -v

## install from exist package.json
npm install

# init
npm init

# install gulp
## i[install] g[global]
npm install gulp --save-dev

# inside project
## -dev are used for development but not in production
## like gulp, jest
npm i --save-dev gulp

# install used package
npm i --save-dev gulp gulp-autoprefixer gulp-babel @babel/core @babel/preset-env gulp-uglify gulp-sourcemaps sass gulp-sass del static-server gulp-pug gulp-rename gulp-csso gulp-image-resize
```

## Packages

- [gulp-responsive](https://github.com/mahnunchik/gulp-responsive)
- ~~[gulp-image](https://www.npmjs.com/package/gulp-image)~~
- ~~[gulp-webp](https://www.npmjs.com/package/gulp-webp)~~
- [gulp-sourcemaps](https://www.npmjs.org/package/gulp-sourcemaps)
- [gulp-concat](https://www.npmjs.com/package/gulp-concat)
- [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)
- [gulp-babel](https://www.npmjs.com/package/gulp-babel)
- [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)
- [gulp-csso](https://github.com/ben-eb/gulp-csso)
- [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin)
- [gulp-sass](https://www.npmjs.com/package/gulp-sass)
- [del](https://www.npmjs.com/package/del)
- [gulp-zip](https://www.npmjs.com/package/gulp-zip)
- [static-server](https://www.npmjs.com/package/static-server)
- [gulp-pug](https://www.npmjs.com/package/gulp-pug)
- [gulp-rename](https://www.npmjs.com/package/gulp-rename)

## full example of `gulpfile.js`

```js
const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  babel = require('gulp-babel'),

  // responsive = require('gulp-responsive'),
  imageResize = require('gulp-image-resize'),
  del = require('del'),
  pug = require('gulp-pug'),
  rename = require('gulp-rename'),
  sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass')(require('sass')),
  uglify = require('gulp-uglify'),
  PATHS = {
    html: {
      watch: 'src/html/**/*.pug',
      src: 'src/html/pages/*.pug',
      dest: 'dist/html',
    },
    scss: {
      watch: 'src/css/**/*.scss',
      src: 'src/css/*.scss',
      dest: 'dist/css/',
    },
    javascript: {
      src: 'src/javascript/*.js',
      dest: 'dist/javascript/',
    },
    statics: {
      fonts: {
        src: 'src/fonts/**/*',
        dest: 'dist/fonts/',
      },
      music: {
        src: 'src/music/**/*',
        dest: 'dist/music/',
      },
      css: {
        src: 'src/css/libs/*',
        dest: 'dist/css/libs/',
      },
      javascript: {
        src: 'src/javascript/libs/*.js',
        dest: 'dist/javascript/libs/',
      },
    },
    images: {
      src: ['src/images/**/*.{png,jpg,jpeg,svg}'],
      dest: 'dist/images/',
    },
    favicon: {
      src: 'src/images/icons/favicon.{png,jpg,jpeg,svg}',
      dest: 'dist/images/icons/',
    },
  };

function clean() {
  'use strict';
  return del([ 'dist/**', '!dist' ]);
}

function scss_task() {
  'use strict';
  return gulp
    .src(PATHS.scss.src)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(
      rename(function (path) {path.extname = '.min.css';}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(PATHS.scss.dest));
}

function html_task() {
  'use strict';
  require('./server.js');
  return gulp
    .src(PATHS.html.src)
    .pipe(pug({ pretty: true }))
    .pipe(gulp.dest(PATHS.html.dest));
}

function js_task() {
  'use strict';
  return (
    gulp
      .src(PATHS.javascript.src)
      .pipe(sourcemaps.init())
      .pipe(babel({ presets: ['@babel/env'] }))
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify())
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(PATHS.javascript.dest))
  );
}

function statics_css_task() {
  'use strict';
  return gulp
    .src(PATHS.statics.css.src)
    .pipe(gulp.dest(PATHS.statics.css.dest));
}

function statics_js_task() {
  'use strict';
  return gulp
    .src(PATHS.statics.javascript.src)
    .pipe(gulp.dest(PATHS.statics.javascript.dest));
}

function images_task() {
  'use strict';
  return gulp.src(PATHS.images.src).pipe(gulp.dest(PATHS.images.dest));
}

/**
 * return config objects
 * @param {Number} width width of the new image
 * @param {Number} height height of the new image
 * @returns {Object}
 */
function imageSizeConfig(width, height) {
  'use strict';
  return imageResize({
    width: width,
    height: height,
    format: 'png',
  });
}

function favicon_task() {
  'use strict';
  return (gulp.src(PATHS.favicon.src)
    .pipe(imageSizeConfig(180, 180))
    .pipe(rename(path => {path.basename = 'apple-touch-icon';}))
    .pipe(gulp.dest(PATHS.favicon.dest))
    .pipe(imageSizeConfig(16, 16))
    .pipe(rename(path => {path.basename = 'favicon@3x';}))
    .pipe(gulp.dest(PATHS.favicon.dest))
    .pipe(imageSizeConfig(32, 32))
    .pipe(rename(path => {path.basename = 'favicon@2x';}))
    .pipe(gulp.dest(PATHS.favicon.dest))
    .pipe(imageSizeConfig(192, 192))
    .pipe(rename(path => {path.basename = 'favicon@192';}))
    .pipe(gulp.dest(PATHS.favicon.dest))
    .pipe(imageSizeConfig(512, 512))
    .pipe(rename(path => {path.basename = 'favicon@512';}))
    .pipe(gulp.dest(PATHS.favicon.dest))
  );
}

function music_task() {
  'use strict';
  return gulp
    .src(PATHS.statics.music.src)
    .pipe(gulp.dest(PATHS.statics.music.dest));
}

function fonts_task() {
  'use strict';
  return gulp
    .src(PATHS.statics.fonts.src)
    .pipe(gulp.dest(PATHS.statics.fonts.dest));
}

function watch_fun() {
  'use strict';
  gulp.watch(PATHS.html.watch, html_task);
  gulp.watch(PATHS.scss.watch, scss_task);
  gulp.watch(PATHS.javascript.src, js_task);
  gulp.watch(PATHS.statics.javascript.src, statics_js_task);
  gulp.watch(PATHS.statics.css.src, statics_css_task);
  gulp.watch(PATHS.statics.fonts.src, fonts_task);
  gulp.watch(PATHS.images.src, images_task);
  gulp.watch(PATHS.statics.music.src, music_task);
  gulp.watch(PATHS.favicon.src, favicon_task);
}

exports.default = gulp.series(
  clean,
  html_task,
  js_task,
  statics_js_task,
  statics_css_task,
  scss_task,
  fonts_task,
  images_task,
  music_task,
  favicon_task,
  watch_fun,
);
```

## `package.js`

```js
  // ...
  "devDependencies": {
  // ...
  },
  "browserslist": [
    "> 0.5%",
    "last 2 versions",
    "IE 10"
  ]
  // ...
```

## `server`

```js
let StaticServer = require('static-server'),
  server = new StaticServer({
    rootPath: './dist/html',
    port: 8000
  });


server.start(function () {
  console.log('Server listening to', server.port);
});
```
