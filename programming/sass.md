
# scss

## Sass Basics

### Variables

Sass variables, like all Sass identifiers, treat hyphens and underscores as identical. This means that `$font-size` and `$font_size` both refer to the same variable.

```scss
$base-color: #c6538c;
$border-dark: rgba($base-color, 0.88);

.alert {
  border: 1px solid $border-dark;
}
```

### Default Values

Normally when you assign a value to a variable, if that variable already had a value, its old value is overwritten. But if you’re writing a Sass library, you might want to allow your users to configure your library’s variables before you use them to generate CSS.

To make this possible, Sass provides the !default flag. This assigns a value to a variable only if that variable isn’t defined or its value is null. Otherwise, the existing value will be used

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;

code {
  border-radius: $border-radius;
  box-shadow: $box-shadow;
}


// style.scss
@use 'library' with (
  $black: #222,
  $border-radius: 0.1rem
);
```

### Built-in Variables

```scss
@use "sass:math" as math;

// This assignment will fail.
math.$pi: 0;
```

### scope

If you need to set a global variable’s value from within a local scope (such as in a mixin), you can use the !global flag. A variable declaration flagged as !global will always assign to the global scope.

```scss
$variable: first global value;

.content {
  $variable: second global value !global;
  value: $variable;
}

.sidebar {
  value: $variable;
}
```

The !global flag may only be used to set a variable that has already been declared at the top level of a file. It may not be used to declare a new variable.

### Advanced Variable Functions

```scss
@use "sass:map";

$theme-colors: (
  "success": #28a745,
  "info": #17a2b8,
  "warning": #ffc107,
);

.alert {
  // Instead of $theme-color-#{warning}
  background-color: map.get($theme-colors, "warning");
}
```

### Nesting

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li { display: inline-block; }

  a {
    display: block;
    padding: 6px 12px;
    text-decoration: none;
  }
}
```

```scss
.info-page {
  margin: auto {
    bottom: 10px;
    top: 2px;
  }
}

// css
.info-page {
  margin: auto;
  margin-bottom: 10px;
  margin-top: 2px;
}
```

### Hidden Declarations

```scss
$rounded-corners: false;

.button {
  border: 1px solid black;
  border-radius: if($rounded-corners, 5px, null);
}

// css
.button {
  border: 1px solid black;
}
```

### Custom Properties

```scss
$primary: #81899b;
$accent: #302e24;
$warn: #dfa612;

:root {
  --primary: #{$primary};
  --accent: #{$accent};
  --warn: #{$warn};

  // Even though this looks like a Sass variable, it's valid CSS so it's not
  // evaluated.
  --consumed-by-js: $primary;
}
```

### Selector Lists

```scss
.alert, .warning {ul, p {}}
// will generate in css
.alert ul, .alert p, .warning ul, .warning p {}
```

### Placeholder Selectors

```scss
%toolbelt {
  box-sizing: border-box;
  border-top: 1px rgba(#000, .12) solid;
  padding: 16px 0;
  width: 100%;

  &:hover { border: 2px rgba(#000, .5) solid; }
}

.action-buttons {
  @extend %toolbelt;
  color: #4285f4;
}

.reset-buttons {
  @extend %toolbelt;
  color: #cddc39;
}
```

### Interpolation

```scss
@mixin prefix($property, $value, $prefixes) {
  @each $prefix in $prefixes {
    -#{$prefix}-#{$property}: $value;
  }
  #{$property}: $value;
}

.gray {
  @include prefix(filter, grayscale(50%), moz webkit);
}
```

Unfortunately, `interpolation` removes quotes from strings, which makes it difficult to use quoted strings as values for custom properties when they come from Sass variables. As a workaround, you can use the `meta.inspect()` function to preserve the quotes.

```scss
@use "sass:meta";

$font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
$font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas;

:root {
  --font-family-sans-serif: #{meta.inspect($font-family-sans-serif)};
  --font-family-monospace: #{meta.inspect($font-family-monospace)};
}
```

### Parent Selector

```scss
.alert {
  // The parent selector can be used to add pseudo-classes to the outer
  // selector.
  &:hover {
    font-weight: bold;
  }

  // It can also be used to style the outer selector in a certain context, such
  // as a body set to use a right-to-left language.
  [dir=rtl] & {
    margin-left: 0;
    margin-right: 10px;
  }

  // You can even use it as an argument to pseudo-class selectors.
  :not(&) {
    opacity: 0.8;
  }
}

// css
.alert:hover {
  font-weight: bold;
}
[dir=rtl] .alert {
  margin-left: 0;
  margin-right: 10px;
}
:not(.alert) {
  opacity: 0.8;
}
```

## Modules

```scss
// _base.scss
$font-stack: Helvetica, sans-serif;
$primary-color: #333;

body {
  font: 100% $font-stack;
  color: $primary-color;
}


// styles.scss
@use 'base';

.inverse {
  background-color: base.$primary-color;
  color: white;
}

```

### Mixins

```scss
@mixin theme($theme: DarkGray) {
  background: $theme;
  box-shadow: 0 0 1px rgba($theme, .25);
  color: #fff;
}

.info {
  @include theme;
}
.alert {
  @include theme($theme: DarkRed);
}
.success {
  @include theme($theme: DarkGreen);
}
```

### Extend/Inheritance

Using `@extend` lets you share a set of CSS properties from one selector to another.

```scss
/* This CSS will print because %message-shared is extended. */
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

// This CSS won't print because %equal-heights is never extended.
%equal-heights {
  display: flex;
  flex-wrap: wrap;
}

.message {
  @extend %message-shared;
}

.success {
  @extend %message-shared;
  border-color: green;
}

```

### Operators

Sass has a handful of standard math operators like `+, -, *, math.div()`, and `%`

```scss
@use "sass:math";

.container {
  display: flex;
}

article[role="main"] {
  width: math.div(600px, 960px) * 100%;
}

aside[role="complementary"] {
  width: math.div(300px, 960px) * 100%;
  margin-left: auto;
}
```

### comments

```scss
// This comment won't be included in the CSS.

/* But this comment will, except in compressed mode. */

/* It can also contain interpolation:
 * 1 + 1 = #{1 + 1} */

/*! This comment will be included even in compressed mode. */

p /* Multi-line comments can be written anywhere
   * whitespace is allowed. */ .sans {
  font: Helvetica, // So can single-line commments.
        sans-serif;
}
```

#### Documentation Comments

```scss
/// Computes an exponent.
///
/// @param {number} $base
///   The number to multiply by itself.
/// @param {integer (unitless)} $exponent
///   The number of `$base`s to multiply together.
/// @return {number} `$base` to the power of `$exponent`.
@function pow($base, $exponent) {
  $result: 1;
  @for $_ from 1 through $exponent {
    $result: $result * $base;
  }
  @return $result;
}
```

### Special Functions

#### `url()`

```scss
$roboto-font-path: "../fonts/roboto";

@font-face {
    // This is parsed as a normal function call that takes a quoted string.
    src: url("#{$roboto-font-path}/Roboto-Thin.woff2") format("woff2");

    font-family: "Roboto";
    font-weight: 100;
}

@font-face {
    // This is parsed as a normal function call that takes an arithmetic
    // expression.
    src: url($roboto-font-path + "/Roboto-Light.woff2") format("woff2");

    font-family: "Roboto";
    font-weight: 300;
}

@font-face {
    // This is parsed as an interpolated special function.
    src: url(#{$roboto-font-path}/Roboto-Regular.woff2) format("woff2");

    font-family: "Roboto";
    font-weight: 400;
}
```

## At-Rules

## el zero

### Variables

`scss`

```scss
$main-color: #bf4080;
$font-path: "../fonts/Poppins-ExtraLight.ttf";

body {
  font: 100% $font-path;
  color: $primary-color;
}
```

### Nesting

`scss`

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  &:hover{  // for nav [the parent]
    // ---
  }
}
```

### Modules

`scss`

```scss
// _base.scss
body {
  font: 100% $font-stack;
  color: $primary-color;
}
```

`scss`

```scss
// styles.scss
@use 'base';

.inverse {
  background-color: base.$primary-color;
  color: white;
}
```

### placeholder selector

get the parent selector properties to current selector

will render as class to be use

```scss
.alert{
  // properties
}
.alert-primary{
  @extend .alert;
  // other additional properties
}
```

not render as class can't be use

```scss
%alert{
  // properties
}
.alert-primary{
  @extend %alert;
  // other additional properties
}
```

### Mixins (functions)

`scss`

```scss
@mixin theme($theme: DarkGray) { // parameter
  background: $theme;
  box-shadow: 0 0 1px rgba($theme, .25);
  color: #fff;
}

.info {
  @include theme; // no argument
}
.alert {
  @include theme($theme: DarkRed);
}
.more {
  @include theme(DarkRed);
}
```

### Extend/Inheritance

called **`placeholder selector**

`scss`

```scss
/* This CSS will print because %message-shared is extended. */
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

// This CSS won't print because %equal-heights is never extended.
%equal-heights {
  display: flex;
  flex-wrap: wrap;
}

.message {
  @extend %message-shared;
}

.success {
  @extend %message-shared;
  border-color: green;
}
```

### Operators

`scss`

```scss
.container {
  width: 100%;
}

article[role="main"] {
  float: left;
  width: 600px / 960px * 100%;
}

aside[role="complementary"] {
  float: right;
  width: 300px / 960px * 100%;
}
```

### condition

```scss
$lan_direction: ltr;
$float: left;

@if $direction == ltr{
  $float: left;
} @else {
  $float: right; 
}
```

### loops

```scss
$lan_direction: ltr;
$float: left;
$grid: 12;
$list: xs sm md lg;

// from .. through ...
@for $i from 1 through $grid { // 1, 2 ... 12
  .col-#{$i} {
    width: math.div(100%, math.div($grid, $i));
  }
}

// from .. to ...
@for $i from 1 through $grid {  // 1, 2 ... 11
  .col-#{$i} {
    width: math.div(100%, math.div($grid, $i));
  }
}

// each 
@each $i in $list {
  .col-#{$i} {
    width: math.div(100%, math.div($grid, $i));
  }
}

$list: (facebook, #333),  (facebook, #444) , (lin, #888) ;
@each $name, $color in $list{
    .icon-#{$name}{
        color: $color;
    }
}

// associated array
$associated : (facebook: #333,  op: #444 , lin: #888);

@each $name, $color in $associated {
    .icon-#{$name}{
        color: $color;
    }
}
```

### concatenation

```scss
$title: left;
.success {
  #{$title}-color: green;
}
```

### function

```scss
@function name($var:20){
    @return $var +5;
}
```

# resources

- [the sass way](https://thesassway.herokuapp.com/)
- [sass-guide lines](https://sass-guidelin.es/)
