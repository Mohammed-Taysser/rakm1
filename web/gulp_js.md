# gulp

## startup

```
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
│   │   ├── my-style.css
│   │   └── text.css
│   ├── html
│   │   └── index.html
│   ├── js
│   │   ├── aro.js
│   │   ├── arrow.js
│   │   └── more.js
│   └── sass
│       ├── files
│       │   ├── _footer.sass
│       │   └── _header.sass
│       └── main.scss
├── dist
│   ├── css
│   │   ├── main.css
│   │   ├── main.css.map
│   │   ├── style.css
│   │   └── style.css.map
│   ├── html
│   │   └── index.html
│   └── js
│       └── script.js
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

# init
npm init

# install gulp
## i[install] g[global]
npm install gulp --save-dev

# inside project
## -dev are used for development but not in production
## like gulp, jest
npm i --save-dev gulp
```

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
npm install del
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

## [gulp-htmlmin](https://www.npmjs.com/package/gulp-htmlmin)

### install gulp-htmlmin

```sell
npm install --save gulp-htmlmin
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

## other plugins

- [gulp-less](https://www.npmjs.com/package/gulp-less)
- [gulp-cached](https://www.npmjs.com/package/gulp-cached)
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
- [ansi-colors](https://www.npmjs.com/package/ansi-colors)
- [gulp-responsive](https://github.com/mahnunchik/gulp-responsive)

## full example of `gulpfile.js`

```js
/* global require, exports */

const gulp = require('gulp'),
    concat = require('gulp-concat'),
    htmlmin = require('gulp-htmlmin'),
    uglify = require('gulp-uglify'),
    autoprefixer = require('gulp-autoprefixer'),
    csso = require('gulp-csso'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass')(require('sass')),
    del = require('del'),
    zip = require('gulp-zip'),
    paths = {
        css: {
            src: ['dev/css/**/*.css'],  // multiple source
            dest: 'dist/css/'
        },
        sass: {
            src: 'dev/sass/files/**/*.sass',
            dest: 'dist/css/'
        },
        js: {
            src: 'dev/js/**/*.js',
            dest: 'dist/js/'
        },
        html: {
            src: 'dev/html/**/*.html',
            dest: 'dist/html/'
        },
        images: {
            src: 'dev/images/**',
            dest: 'dist/images/'
        }
    };
function clean() {
    'use strict';
    return del(['dist/**', '!dist']);
}

function css_fun() {
    'use strict';
    return gulp.src(paths.css.src)
        .pipe(sourcemaps.init())
        .pipe(concat('style.css'))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(csso({
            restructure: true,
            sourceMap: true,
            debug: true
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.css.dest));
}

function sass_fun() {
    'use strict';
    return gulp.src(paths.sass.src)
        .pipe(sourcemaps.init())
        .pipe(concat('main.sass'))
        .pipe(sass({ outputStyle: 'compressed' }))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.sass.dest));
}

function html_fun() {
    'use strict';
    return gulp.src(paths.html.src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.html.dest));
}

function javascript_fun() {
    'use strict';
    return gulp.src(paths.js.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('script.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.js.dest));
}

function compress() {
    'use strict';
    return gulp.src('dist/**/*.*')
        .pipe(zip('archive.zip'))
        .pipe(gulp.dest('.'));
}

function images_fun() {
    'use strict';
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

function watch_fun() {
    'use strict';
    require('./server.js');
    gulp.watch(paths.js.src, javascript_fun);
    gulp.watch(paths.css.src, css_fun);
    gulp.watch(paths.sass.src, sass_fun);
    gulp.watch(paths.html.src, html_fun);
}


exports.default = gulp.series(clean, sass_fun, html_fun, css_fun, javascript_fun, images_fun, compress, gulp.parallel(watch_fun));
```

## `.gitignore`

```.gtignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*
.pnpm-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.test
.env.production

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
# Comment in the public line in if your project uses Gatsby and not Next.js
# https://nextjs.org/blog/next-9-1#public-directory-support
# public

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
```
