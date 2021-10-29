# gulp

## startup

```shell
- use to automate tasks
- build on node js
- task example [minify css, compile sass, compress images, upload files]

# project tree
app
├── archive.zip
├── src
│   ├── fonts
│   ├── images
│   ├── css
│   ├── html
│   ├── js
│   └── sass
│       └── main.scss
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
npm i --save-dev gulp-concat gulp-autoprefixer gulp-babel @babel/core @babel/preset-env gulp-uglify gulp-csso gulp-sourcemaps gulp-sass del gulp-newer static-server gulp-pug
```

## Packages

- [gulp-responsive](https://github.com/mahnunchik/gulp-responsive)
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
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
- [gulp-newer](https://www.npmjs.com/package/gulp-newer)
- [static-server](https://www.npmjs.com/package/static-server)
- [gulp-pug](https://www.npmjs.com/package/gulp-pug)

## other

- <https://www.npmjs.com/package/gulp-clean-css>

## [gulp-concat](https://www.npmjs.com/package/gulp-concat)

### gulp concat Installation

```text
npm install --save-dev gulp-concat
```

### gulp concat Usage

```js
var concat = require('gulp-concat');
 
gulp.task('scripts', function() {
  return gulp.src('./lib/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
});
```

### gulp concat with [gulp-sourcemaps](https://www.npmjs.org/package/gulp-sourcemaps)

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
 
gulp.task('javascript', function() {
  return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(concat('all.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
});
```

## [gulp-autoprefixer](https://www.npmjs.com/package/gulp-autoprefixer)

### gulp-autoprefixer Installation

```text
npm install --save-dev gulp-autoprefixer
```

### gulp-autoprefixer Usage

```js
const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');

exports.default = () => (
    gulp.src('src/app.css')
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(gulp.dest('dist'))
```

### gulp-autoprefixer [gulp-sourcemaps](https://github.com/gulp-sourcemaps/gulp-sourcemaps)

```js
const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');

exports.default = () => (
    gulp.src('src/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(concat('all.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'))
);
```

```js
var concat = require('gulp-concat');
 
gulp.task('scripts', function() {
  return gulp.src('./lib/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./dist/'));
});
```

## [gulp-babel](https://www.npmjs.com/package/gulp-babel)

### install gulp-babel

```text
# last version
npm i gulp-babel

# Babel 7
npm install --save-dev gulp-babel @babel/core @babel/preset-env

```

### use gulp-babel

```js
const gulp = require('gulp');
const babel = require('gulp-babel');
 
gulp.task('default', () =>
    gulp.src('src/app.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('dist'))
);
```

### use gulp-babel with [gulp-sourcemaps](https://github.com/floridoo/gulp-sourcemaps)

```js
const gulp = require('gulp');
const babel = require('gulp-babel');
 
gulp.task('default', () =>
    gulp.src('src/app.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('dist'))
);
```

## [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)

Minify `JavaScript` with UglifyJS3.

### gulp-uglify install

```sell
npm install --save-dev gulp-uglify
```

### use gulp-uglify

```js
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
 
gulp.task('compress', function () {
  return pipeline(
        gulp.src('lib/*.js'),
        uglify(),
        gulp.dest('dist')
  );
});
```

## [gulp-csso](https://github.com/ben-eb/gulp-csso)

### install gulp-csso

```text
npm install gulp-csso --save-dev
```

### use gulp-csso

```js
var gulp = require('gulp');
var csso = require('gulp-csso');

gulp.task('default', function () {
    return gulp.src('./main.css')
        .pipe(csso())
        .pipe(gulp.dest('./out'));
});

gulp.task('development', function () {
    return gulp.src('./main.css')
        .pipe(csso({
            restructure: true,
            sourceMap: true,
            debug: true
        }))
        .pipe(gulp.dest('./out'));
});
```

### gulp-csso with [gulp-sourcemaps](https://www.npmjs.org/package/gulp-sourcemaps)

```js
var gulp = require('gulp');
var csso = require('gulp-csso');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('default', function () {
    return gulp.src('main.css')
        .pipe(sourcemaps.init())
        .pipe(csso())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./out'));
});
```

## [gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps)

### gulp-sourcemaps install

```text
npm i gulp-sourcemaps --save-dev
```

### gulp-sourcemaps

```js
var gulp = require('gulp');
var plugin1 = require('gulp-plugin1');
var plugin2 = require('gulp-plugin2');
var sourcemaps = require('gulp-sourcemaps');
 
function javascript() {
  gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
      .pipe(plugin1())
      .pipe(plugin2())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('dist'));
};
 
 
exports.javascript = javascript;
```

All plugins between sourcemaps.init() and sourcemaps.write() need to have support for gulp-sourcemaps. You can find a list of such plugins in the [wiki](https://github.com/gulp-sourcemaps/gulp-sourcemaps/wiki/Plugins-with-gulp-sourcemaps-support).

### Write external source map files

```js
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
 
function javascript() {
  gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
    // ....
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest('dist'));
};
```

### Handle large files

```js
// ...
.pipe(sourcemaps.init({largeFile: true}))
// ...
```

## [gulp-sass](https://www.npmjs.com/package/gulp-sass)

### install gulp-sass

```sell
npm install sass gulp-sass --save-dev
```

### use gulp-sass

```js
var sass = require('gulp-sass')(require('sass'));

function buildStyles() {
  return gulp.src('./sass/**/*.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    // .pipe(sass({outputStyle: 'compressed'}))
    .pipe(gulp.dest('./css'));
};

exports.buildStyles = buildStyles;
```

### Include a source map with gulp-sass

```js
var sourcemaps = require('gulp-sourcemaps');

function buildStyles() {
  return gulp.src('./sass/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./css'));
}
```

## [del](https://www.npmjs.com/package/del)

### install del

```sell
npm install --save-del del
```

### use del

The glob pattern ** matches all children and the parent.

You have to explicitly ignore the parent directories too:

```js
del(['public/assets/**', '!public/assets', '!public/assets/goat.png']);
```

## [gulp-zip](https://www.npmjs.com/package/gulp-zip)

### install gulp-zip

```sell
npm install --save-dev gulp-zip
```

### use gulp-zip

```js
const gulp = require('gulp');
const zip = require('gulp-zip');

exports.default = () => (
    gulp.src('src/*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('dist'))
);
```

## [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)

### install gulp-imagemin

```sell
npm install --save-dev gulp-imagemin
```

### Basic use gulp-imagemin

```js
import gulp from 'gulp';
import imagemin from 'gulp-imagemin';

export default () => (
    gulp.src('src/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
);
```

### Custom plugin options gulp-imagemin

```js
.pipe(imagemin([
    imagemin.gifsicle({interlaced: true}),
    imagemin.mozjpeg({quality: 75, progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({
        plugins: [
            {removeViewBox: true},
            {cleanupIDs: false}
        ]
    })
]))
```

## [gulp-newer](https://www.npmjs.com/package/gulp-newer)

### install gulp-newer

```sell
npm install --save-dev gulp-newer
```

### Usage gulp-newer

```js
var gulp = require('gulp');
var newer = require('gulp-newer');
var imagemin = require('gulp-imagemin');
 
var imgSrc = 'src/img/**';
var imgDest = 'build/img';
 
// Minify any new images
gulp.task('images', function() {
 
  // Add the newer pipe to pass through newer images only
  return gulp.src(imgSrc)
      .pipe(newer(imgDest))
      .pipe(imagemin())
      .pipe(gulp.dest(imgDest));
 
});
 
gulp.task('default', function() {
  gulp.watch(imgSrc, ['images']);
});
```

### Using newer with many

```js
var gulp = require('gulp');
var newer = require('gulp-newer');
var concat = require('gulp-concat');
 
// Concatenate all if any are newer
gulp.task('concat', function() {
 
  // Add the newer pipe to pass through all sources if any are newer
  return gulp.src('lib/*.js')
      .pipe(newer('dist/all.js'))
      .pipe(concat('all.js'))
      .pipe(gulp.dest('dist'));
 
});
```

## [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin)

### install gulp-htmlmin

```sell
npm install --save-dev gulp-htmlmin
```

### Usage gulp-htmlmin

```js
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
 
gulp.task('minify', () => {
  return gulp.src('src/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest('dist'));
});
```

## [static-server](https://www.npmjs.com/package/static-server)

### install static-server

```sell
npm install --save-dev static-server
```

### Usage static-server

```js
var StaticServer = require('static-server');
var server = new StaticServer({
  rootPath: '.',            // required, the root of the server file tree
  port: 1337,               // required, the port to listen
  name: 'my-http-server',   // optional, will set "X-Powered-by" HTTP header
  host: '10.0.0.100',       // optional, defaults to any interface
  cors: '*',                // optional, defaults to undefined
  followSymlink: true,      // optional, defaults to a 404 error
  templates: {
    index: 'foo.html',      // optional, defaults to 'index.html'
    notFound: '404.html'    // optional, defaults to undefined
  }
});
 
server.start(function () {
  console.log('Server listening to', server.port);
});
 
server.on('request', function (req, res) {
  // req.path is the URL resource (file name) from server.rootPath
  // req.elapsedTime returns a string of the request's elapsed time
});
 
server.on('symbolicLink', function (link, file) {
  // link is the source of the reference
  // file is the link reference
  console.log('File', link, 'is a link to', file);
});
 
server.on('response', function (req, res, err, file, stat) {
  // res.status is the response status sent to the client
  // res.headers are the headers sent
  // err is any error message thrown
  // file the file being served (may be null)
  // stat the stat of the file being served (is null if file is null)
 
  // NOTE: the response has already been sent at this point
});
```

### example of `server.js`

```js
let StaticServer = require('static-server'),
  server = new StaticServer({
    rootPath: './dist',
    port: 8000
  });


server.start(function () {
  console.log('Server listening to', server.port);
});
```

## [gulp-pug](https://www.npmjs.com/package/gulp-pug)

```js
const { src, dest } = require('gulp');
const pug = require('gulp-pug');

exports.views = () => {
  return src('./src/*.pug')
    .pipe(
      pug({
        // Your options in here.
      })
    )
    .pipe(dest('./dist'));
};
```

## other plugins

- [gulp.spritesmith](https://www.npmjs.com/package/gulp.spritesmith)
- [gulp-image](https://www.npmjs.com/package/gulp-image)
- [gulp-mobile-icons](https://www.npmjs.com/package/gulp-mobile-icons)

## full example of `gulpfile.js`

```js
const gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass')(require('sass')),
    del = require('del'),
    pug = require('gulp-pug'),
    paths = {
        html: {
            src: 'src/html/pages/*.pug',
            dest: 'dist/html'
        },
        css: {
            src: ['src/css/**/*.css', 'src/css/*.scss'],
            dest: 'dist/css/'
        },
        js: {
            src: 'src/js/**/*.js',
            dest: 'dist/js/'
        },
        fonts: {
            src: 'src/fonts/**',
            dest: 'dist/fonts/'
        },
        images: {
            src: 'src/images/**',
            dest: 'dist/images/'
        }
    };
function clean() {
    'use strict';
    return del(['dist/**', '!dist']);
}

function un_minified_css_task() {
    'use strict';
    return gulp.src(paths.css.src)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass().on('error', sass.logError))
        // .pipe(csso())
        .pipe(concat('style.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.css.dest));
}

function minified_css_task() {
    'use strict';
    return gulp.src(paths.css.src)
        .pipe(sourcemaps.init())
        .pipe(autoprefixer())
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.css.dest));
}

function html_task() {
    'use strict';
    require('./server.js');
    return gulp.src(paths.html.src)
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.html.dest));
}

function fonts_task() {
    'use strict';
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest));
}

function un_minified_javascript_task() {
    'use strict';
    return gulp.src(paths.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(concat('script.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
}

function minified_javascript_task() {
    'use strict';
    return gulp.src(paths.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(concat('script.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
}

function images_task() {
    'use strict';
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

function watch_fun() {
    'use strict';
    gulp.watch(paths.html.src, html_task);
    gulp.watch(paths.css.src, un_minified_css_task);
    gulp.watch(paths.css.src, minified_css_task);
    gulp.watch(paths.js.src, un_minified_javascript_task);
    gulp.watch(paths.js.src, minified_javascript_task);
    gulp.watch(paths.fonts.src, fonts_task);
    gulp.watch(paths.images.src, images_task);
}


exports.default = gulp.series(
    clean,
    html_task,
    un_minified_css_task,
    minified_css_task,
    un_minified_javascript_task,
    minified_javascript_task,
    fonts_task,
    images_task,
    gulp.parallel(watch_fun)
);
```

## `package.js`

```js
{
  "name": "ultimate-frontend",
  "version": "1.0.0",
  "description": "project structure for start design multiped pages",
  "main": "gulpfile.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": ""
  },
  "keywords": [
    ""
  ],
  "author": "Mohammed Taysser",
  "license": "ISC",
  "bugs": {
    "url": ""
  },
  "homepage": "",
  "devDependencies": {
    "@babel/core": "^7.15.8",
    "@babel/preset-env": "^7.15.8",
    "del": "^6.0.0",
    "gulp": "^4.0.2",
    "gulp-autoprefixer": "^8.0.0",
    "gulp-babel": "^8.0.0",
    "gulp-concat": "^2.6.1",
    "gulp-csso": "^4.0.1",
    "gulp-newer": "^1.4.0",
    "gulp-pug": "^5.0.0",
    "gulp-sass": "^5.0.0",
    "gulp-sourcemaps": "^3.0.0",
    "gulp-uglify": "^3.0.2",
    "sass": "^1.43.2",
    "static-server": "^2.2.1"
  },
  "browserslist": [
    "> 2%",
    "last 2 versions",
    "IE 10"
  ]
}
```
