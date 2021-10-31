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
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
- [gulp-image](https://www.npmjs.com/package/gulp-image)
- [gulp-webp](https://www.npmjs.com/package/gulp-webp)
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
    webp = require('gulp-webp'),
    image = require('gulp-image'),
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
            libs: 'src/js/libs/*.js',
            build: {
                src: 'src/js/*.js',
                dest: 'dist/javascript/build/',
            },
            demo: {
                src: 'src/js/*.js',
                dest: 'dist/javascript/',
            },
        },
        fonts: {
            src: 'src/fonts/**',
            dest: 'dist/fonts/',
        },
        images: {
            src: 'src/images/**',
            dest: 'dist/images/',
        },
        music: {
            src: 'src/music/**',
            dest: 'dist/music/',
        },
    };
function clean() {
    'use strict';
    return del([
        'dist/**', '!dist',
    ]);
}


function scss() {
    'use strict';
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(rename(function (path) { path.extname = '.min.css'; }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest));
}

function demo_scss() {
    'use strict';
    return gulp.src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function (path) { path.extname = '.css'; }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.scss.dest));
}

function html() {
    'use strict';
    require('./server.js');
    return gulp.src(paths.html.src)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.html.dest));
}

function fonts() {
    'use strict';
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest));
}

function demo_js_task() {
    'use strict';
    return gulp.src(paths.javascript.demo.src)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))

        // .pipe(concat('script.js'))
        .pipe(rename(function (path) {
            if (path.basename.slice(-3) === 'min') {
                path.basename = path.basename.slice(0, -4);
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.javascript.demo.dest));
}

function build_js() {
    'use strict';
    return gulp.src(paths.javascript.build.src)
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
        .pipe(gulp.dest(paths.javascript.build.dest));
}

function build_libs_js() {
    'use strict';
    return gulp.src(paths.javascript.libs)
        .pipe(sourcemaps.init())
        .pipe(rename(function (path) {
            if (path.basename.slice(-3) !== 'min') {
                path.extname = '.min.js';
            }
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.javascript.build.dest));
}

function images_task() {
    'use strict';
    return gulp.src(paths.images.src)
        .pipe(image({quiet: true}))
        .pipe(webp())
        .pipe(gulp.dest(paths.images.dest));
}

function music_task() {
    'use strict';
    return gulp.src(paths.music.src)
        .pipe(gulp.dest(paths.music.dest));
}

function watch() {
    'use strict';
    gulp.watch('src/html/**/*.pug', html);

    // gulp.watch(paths.javascript.demo.src, demo_js_task);
    // gulp.watch(paths.scss.src, demo_scss);
    gulp.watch('src/js/**/*.js', build_js);
    gulp.watch('src/js/**/*.js', build_libs_js);
    gulp.watch(paths.fonts.src, fonts);
    gulp.watch('src/css/**/*.scss', scss);
    gulp.watch(paths.images.src, images_task);
    gulp.watch(paths.music.src, music_task);
}


exports.default = gulp.series(
    clean,
    html,
    build_js,
    build_libs_js,

    // demo_js_task,
    // demo_scss,
    fonts,
    images_task,
    scss,
    music_task,
    gulp.parallel(watch),
);
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
