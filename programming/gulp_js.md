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
npm i --save-dev gulp gulp-autoprefixer gulp-babel @babel/core @babel/preset-env gulp-uglify gulp-sourcemaps gulp-sass del  static-server gulp-pug  gulp-webp gulp-imagemin gulp-rename
```

## Packages

- [gulp-responsive](https://github.com/mahnunchik/gulp-responsive)
- ~~[gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)~~
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
    // concat = require('gulp-concat'),
    responsive = require('gulp-responsive'),
    del = require('del'),
    pug = require('gulp-pug'),
    rename = require('gulp-rename'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass')(require('sass')),
    uglify = require('gulp-uglify'),
    paths = {
        html: {
            src: 'src/html/pages/*.pug',
            dest: 'dist/html',
        },
        scss: {
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
            javascript: {
                src: 'src/javascript/libs/*.js',
                dest: 'dist/javascript/libs/',
            },
            html: {
                src: 'src/html/**/*.pug',
            },
            scss: {
                src: 'src/css/**/*.scss',
            },
            images: {
                src: 'src/images/favicon/*.{png,jpg,jpeg,svg}',
                dest: 'dist/images/favicon/',
            },
            search_engin: {
                src: ['src/robots.txt', 'src/manifest.json'],
                dest: 'dist/',
            },
        },
        images: {
            src: ['src/images/**/*.{png,jpg,jpeg,svg}', '!src/images/favicon/'],
            dest: 'dist/images/',
        },

    };

function clean() {
    'use strict';
    return del(['dist/**', '!dist']);
}


function dist_scss_task() {
    'use strict';
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename(function (path) { path.extname = '.min.css'; }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest));
}

function dev_scss_task() {
    'use strict';
    return gulp.src(paths.scss.src)
        // .pipe(sourcemaps.init())
        // .pipe(autoprefixer())
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function (path) { path.extname = '.css'; }))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest));
}

function dist_html_task() {
    'use strict';
    return gulp.src(paths.html.src)
        .pipe(pug({ pretty: false }))
        .pipe(gulp.dest(paths.html.dest));
}

function dev_html_task() {
    'use strict';
    require('./server.js');
    return gulp.src(paths.html.src)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.html.dest));
}

function dev_js_task() {
    'use strict';
    return gulp.src(paths.javascript.src)
        // .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))
        // .pipe(concat('script.js'))
        // .pipe(rename(function (path) {
        //     if (path.basename.slice(-3) === 'min') {
        //         path.basename = path.basename.slice(0, -4);
        //     }
        // }))
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.javascript.dest));
}
function dist_js_task() {
    'use strict';
    return gulp.src(paths.javascript.src)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))
        // .pipe(concat('scripts.min.js'))
        .pipe(rename(function (path) {
            if (path.basename.slice(-3) !== 'min') {
                path.extname = '.min.js';
            }
        }))
        // .pipe(rename({ suffix: '.min' }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.javascript.dest));
}

function images_task() {
    'use strict';
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

function favicon_task() {
    'use strict';
    return gulp.src(paths.statics.images.src)
        .pipe(
            responsive({
                'favicon.png': [
                    {
                        width: 180,
                        height: 180,
                        rename: 'apple-touch-icon.png',
                        format: 'png',
                        progressive: true,
                        withMetadata: false,
                    },
                    {
                        width: 32,
                        height: 32,
                        rename: 'favicon-32x32.png',
                        format: 'png',
                        progressive: true,
                        withMetadata: false,
                    },
                    {
                        width: 16,
                        height: 16,
                        rename: 'favicon-16x16.png',
                        format: 'png',
                        progressive: true,
                        withMetadata: false,
                    },
                ]
            })
        )
        .pipe(gulp.dest(paths.statics.images.dest));
}

function music_task() {
    'use strict';
    return gulp.src(paths.statics.music.src)
        .pipe(gulp.dest(paths.statics.music.dest));
}

function fonts_task() {
    'use strict';
    return gulp.src(paths.statics.fonts.src)
        .pipe(gulp.dest(paths.statics.fonts.dest));
}

function statics_js_task() {
    'use strict';
    return gulp.src(paths.statics.javascript.src)
        .pipe(gulp.dest(paths.statics.javascript.dest));
}

function search_engin_task() {
    'use strict';
    return gulp.src(paths.statics.search_engin.src)
        .pipe(gulp.dest(paths.statics.search_engin.dest));
}

function watch_fun() {
    'use strict';
    gulp.watch(paths.statics.html.src, dev_html_task);
    gulp.watch(paths.statics.scss.src, dev_scss_task);
    gulp.watch(paths.javascript.src, dev_js_task);
    gulp.watch(paths.statics.javascript.src, statics_js_task);
    gulp.watch(paths.statics.fonts.src, fonts_task);
    gulp.watch(paths.images.src, images_task);
    gulp.watch(paths.statics.music.src, music_task);
    gulp.watch(paths.statics.images.src, favicon_task);
}

const dev = gulp.series(
    clean,
    dev_html_task,
    dev_scss_task,
    dev_js_task,
    statics_js_task,
    fonts_task,
    images_task,
    music_task,
    watch_fun,
),
    dist = gulp.series(
        clean,
        dist_html_task,
        dist_js_task,
        statics_js_task,
        dist_scss_task,
        fonts_task,
        images_task,
        music_task,
        favicon_task,
        search_engin_task,
    );

module.exports = {
    dev,
    dist,
}
```

## `package.js`

```js
  // ...
  "devDependencies": {
  // ...
  },
  "browserslist": [
    "> 2%",
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
