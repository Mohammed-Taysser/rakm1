# Sass notes

## resources

- [the sass way](https://thesassway.herokuapp.com/)
- [sass-guide lines](https://sass-guidelin.es/)

## Variables

Sass variables, like all Sass identifiers, treat hyphens and underscores as identical. This means that `$font-size` and `$font_size` both refer to the same variable.

```scss
$base-color: #c6538c;
$border-dark: rgba($base-color, 0.88);
$font-path: "../fonts/Poppins-ExtraLight.ttf";

.alert {
  border: 1px solid $border-dark;
  font: 100% $font-path;
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
  &:hover{  // for nav [the parent]
    // ---
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

## Interpolation

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

## Operators

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

## comments

```scss
// This comment won't be included in the CSS.

/* But this comment will, except in compressed mode. */

/* It can also contain interpolation:
 * 1 + 1 = #{1 + 1} */

/*! This comment will be included even in compressed mode. */

p /* Multi-line comments can be written anywhere
   * whitespace is allowed. */ .sans {
  font: Helvetica, 
        sans-serif    ;
}
```

### Documentation Comments

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

## Special Functions `url()`

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

## `@use`

The `@use` rule loads mixins, functions, and variables from other Sass stylesheets, and combines CSS from multiple stylesheets together. Stylesheets loaded by `@use` are called "modules". Sass also provides built-in modules full of useful functions.

```scss
// foundation/_code.scss
code {
  padding: .25em;
  line-height: 0;
}

// style.scss
@use 'foundation/code';
```

### Loading Members

```scss
// src/_corners.scss
$radius: 3px;

@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "src/corners";

.button {
  @include corners.rounded;
  padding: 5px + corners.$radius;
}
```

### Choosing a Namespace

```scss
// src/_corners.scss
$radius: 3px;

@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "src/corners" as c;

.button {
  @include c.rounded;
  padding: 5px + c.$radius;
}
```

You can even load a module without a namespace by writing `@use <url>` as `*`. We recommend you only do this for stylesheets written by you, though; otherwise, they may introduce new members that cause name conflicts!

```scss
// src/_corners.scss
$radius: 3px;

@mixin rounded {
  border-radius: $radius;
}

// style.scss
@use "src/corners" as c;

.button {
  @include rounded;
  padding: 5px + c.$radius;
}
```

### Private Members

to define a private member by starting its name with either - or _.

```scss
// src/_corners.scss
$-radius: 3px;

@mixin rounded {
  border-radius: $-radius;
}

// style.scss
@use "src/corners" as c;

.button {
  @include c.rounded;
  // This is an error! $-radius isn't visible outside of `_corners.scss`.
  padding: 5px + c.$-radius;
}
```

### Configuration

A stylesheet can define variables with the !default flag to make them configurable. To load a module with configuration, write `@use <url>` with (`<variable>: <value>, <variable>: <value>`). The configured values will override the variables’ default values

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

### With Mixins

```scss
// _library.scss
$-black: #000;
$-border-radius: 0.25rem;
$-box-shadow: null;

/// If the user has configured `$-box-shadow`, returns their configured value.
/// Otherwise returns a value derived from `$-black`.
@function -box-shadow() {
  @return $-box-shadow or (0 0.5rem 1rem rgba($-black, 0.15));
}

@mixin configure($black: null, $border-radius: null, $box-shadow: null) {
  @if $black {
    $-black: $black !global;
  }
  @if $border-radius {
    $-border-radius: $border-radius !global;
  }
  @if $box-shadow {
    $-box-shadow: $box-shadow !global;
  }
}

@mixin styles {
  code {
    border-radius: $-border-radius;
    box-shadow: -box-shadow();
  }
}

// style.scss
@use 'library';

@include library.configure(
  $black: #222,
  $border-radius: 0.1rem
);

@include library.styles;
```

### Finding the Module

It wouldn’t be any fun to write out absolute URLs for every stylesheet you load, so Sass’s algorithm for finding a module makes it a little easier. For starters, you don’t have to explicitly write out the extension of the file you want to load; `@use "variables"` will automatically load variables.scss, variables.sass, or variables.css.

### Load Paths

All Sass implementations allow users to provide load paths: paths on the filesystem that Sass will look in when locating modules. For example, if you pass `node_modules/susy/sass` as a load path, you can use `@use "susy"` to load `node_modules/susy/sass/susy.scss`.

### Index Files

If you write an `_index.scss` or `_index.sass` in a folder, the index file will be loaded automatically when you load the URL for the folder itself.

```scss
// foundation/_code.scss
code { }

// foundation/_lists.scss
ul, ol { }

// foundation/_index.scss
@use 'code';
@use 'lists';

// style.scss
// will called _index.scss witch call both code.scss and list.scss
@use 'foundation';
```

### Loading CSS

```scss
// code.css
code {
  padding: .25em;
  line-height: 0;
}

// style.scss
@use 'code';
```

## `@forward`

The rule is written @forward "`<url>`". It loads the module at the given URL just like @use, but it makes the public members of the loaded module available to users of your module as though they were defined directly in your module. Those members aren’t available in your module, though—if you want that, you’ll need to write a @use rule as well. Don’t worry, it’ll only load the module once!

If you do write both a @forward and a @use for the same module in the same file, it’s always a good idea to write the @forward first. That way, if your users want to configure the forwarded module, that configuration will be applied to the @forward before your @use loads it without any configuration.

```scss
// src/_list.scss
@mixin list-reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

// bootstrap.scss
/// now ant thing write in list became available as written in bootstrap.scss
@forward "src/list";

// styles.scss
@use "bootstrap";

li {
  @include bootstrap.list-reset;
}
```

### Adding a Prefix

This is written `@forward "<url>" as <prefix>-*`, and it adds the given prefix to the beginning of every mixin, function, and variable name forwarded by the module. For **example**, if the module defines a member named reset and it’s forwarded as `list-*`, downstream stylesheets will refer to it as `list-reset`.

```scss
// src/_list.scss
@mixin reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

// bootstrap.scss
@forward "src/list" as list-*;

// styles.scss
@use "bootstrap";

li {
  @include bootstrap.list-reset;
}
```

### Controlling Visibility

Sometimes, you don’t want to forward every member from a module. You may want to keep some members private so that only your package can use them, or you may want to require your users to load some members a different way. You can control exactly which members get forwarded by writing `@forward "<url>" hide <members...>` or `@forward "<url>" show <members...>`.

The `hide` form means that the listed members shouldn’t be forwarded, but everything else should. The `show` form means that only the named members should be forwarded. In both forms, you list the names of mixins, functions, or variables (including the $)

```scss
// src/_list.scss
$horizontal-list-gap: 2em;

@mixin list-reset {
  margin: 0;
  padding: 0;
  list-style: none;
}

@mixin list-horizontal {
  @include reset;

  li {
    display: inline-block;
    margin: {
      left: -2px;
      right: $horizontal-list-gap;
    }
  }
}

// bootstrap.scss
@forward "src/list" hide list-reset, $horizontal-list-gap;
```

### Configuring Modules

The `@forward` rule can also load a module with configuration. This mostly works the same as it does for `@use`, with one addition: a `@forward` rule’s configuration can use the `!default` flag in its configuration. This allows a module to change the defaults of an upstream stylesheet while still allowing downstream stylesheets to override them.

```scss
// _library.scss
$black: #000 !default;
$border-radius: 0.25rem !default;
$box-shadow: 0 0.5rem 1rem rgba($black, 0.15) !default;

code {
  border-radius: $border-radius;
  box-shadow: $box-shadow;
}

// _opinionated.scss
@forward 'library' with (
  $black: #222 !default,
  $border-radius: 0.1rem !default
);

// style.scss
@use 'opinionated' with ($black: #333);
```

## `@mixin and @include` (Mixins)

Mixin names, like all Sass identifiers, treat `hyphens` and `underscores` as identical. This means that reset-`list` and `reset_list` both refer to the same mixin

```scss
@mixin reset-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

@mixin horizontal-list {
  @include reset-list;

  li {
    display: inline-block;
    margin: {
      left: -2px;
      right: 2em;
    }
  }
}

nav ul {
  @include horizontal-list;
}
```

### Optional Arguments

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

### Taking Arbitrary Arguments

```scss
@mixin order($height, $selectors...) {
  @for $i from 0 to length($selectors) {
    #{nth($selectors, $i + 1)} {
      position: absolute;
      height: $height;
      margin-top: $i * $height;
    }
  }
}

@include order(150px, "input.name", "input.address", "input.zip");
```

### Taking Arbitrary Keyword Arguments

```scss
@use "sass:meta";

@mixin syntax-colors($args...) {
  @debug meta.keywords($args);
  // (string: #080, comment: #800, variable: #60b)

  @each $name, $color in meta.keywords($args) {
    pre span.stx-#{$name} {
      color: $color;
    }
  }
}

@include syntax-colors(
  $string: #080,
  $comment: #800,
  $variable: #60b,
)
```

Because an argument list keeps track of both positional and keyword arguments, you use it to pass both at once to another mixin. That makes it super easy to define an alias for a mixin!

```scss
@mixin btn($args...) {
  @warn "The btn() mixin is deprecated. Include button() instead.";
  @include button($args...);
}
```

### Content Blocks

```scss
@mixin hover {
  &:not([disabled]):hover {
    @content;
  }
}

.button {
  border: 1px solid black;
  @include hover {
    border-width: 2px;
  }
}
```

### Passing Arguments to Content Blocks

```scss
@mixin media($types...) {
  @each $type in $types {
    @media #{$type} {
      @content($type);
    }
  }
}

@include media(screen, print) using ($type) {
  h1 {
    font-size: 40px;
    @if $type == print {
      font-family: Calluna;
    }
  }
}
```

## `@function`

- Use **mixins** for side-effects, and use **functions** just to compute values.
- scale-color and scale_color both refer to the same function
- The `@return` at-rule indicates the value to use as the result of calling a function. It’s only allowed within a `@function` body, and each @function must end with a `@return`.

```scss
@function name($var:20){
  @return $var +5;
}

@function pow($base, $exponent) {
  $result: 1;
  @for $_ from 1 through $exponent {
    $result: $result * $base;
  }
  @return $result;
}

.sidebar {
  float: left;
  margin-left: pow(4, 3) * 1px;
}
```

### Arguments

```scss
@function invert($color, $amount: 100%) {
  $inverse: change-color($color, $hue: hue($color) + 180);
  @return mix($inverse, $color, $amount);
}

$primary-color: #036;
.header {
  background-color: invert($primary-color, 80%);
}
```

### Taking Arbitrary Arguments in function

```scss
@function sum($numbers...) {
  $sum: 0;
  @each $number in $numbers {
    $sum: $sum + $number;
  }
  @return $sum;
}

.micro {
  width: sum(50px, 30px, 100px);
}
```

### return

```scss
@use "sass:string";

@function str-insert($string, $insert, $index) {
  // Avoid making new strings if we don't need to.
  @if string.length($string) == 0 {
    @return $insert;
  }

  $before: string.slice($string, 0, $index);
  $after: string.slice($string, $index);
  @return $before + $insert + $after;
}
```

## `@extend`

- if an `@extend` doesn’t match any selectors in the stylesheet, Sass will produce an error
- If you want the `@extend` to do nothing if the extended selector doesn’t exist, just add `!optional` to the end. ex `@extend %example !optional;`

[BEM methodology](http://getbem.com/naming/)

Sass’s `@extend` rule solves this. It’s written `@extend <selector>`, and it tells Sass that one selector should inherit the styles of another.

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;

  &--serious {
    @extend .error, .color;
    border-width: 3px;
  }
}

// css
.error, .error--serious {
  border: 1px #f00;
  background-color: #fdd;
}
.error--serious {
  border-width: 3px;
}
```

### Placeholder Selectors

**Extend/Inheritance** Using `@extend` lets you share a set of CSS properties from one selector to another.

```scss
/* This CSS will print because is extended. */
%toolbelt {
  box-sizing: border-box;
  border-top: 1px rgba(#000, .12) solid;
  padding: 16px 0;
  width: 100%;

  &:hover { border: 2px rgba(#000, .5) solid; }
}

// This CSS won't print because is never extended.
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.action-buttons {
  @extend %toolbelt;
}

.reset-buttons {
  @extend %toolbelt;
  color: #cddc39;
}
```

### Private Placeholders

placeholder selector can be marked private by starting its name with either - or _. A private placeholder selector can only be extended within the stylesheet that defines it. To any other stylesheets, it will look as though that selector doesn’t exist.

### Extends or Mixins

`Extends` and `mixins` are both ways of encapsulating and re-using styles in Sass, which naturally raises the question of when to use which one. Mixins are obviously necessary when you need to configure the styles using **arguments**, but what if they’re just a chunk of styles?

### Limitations

Only simple selectors—individual selectors like `.info`

```scss
.alert {
  @extend .message.info;
  //      ^^^^^^^^^^^^^
  // Error: Write @extend .message, .info instead.

  @extend .main .info;
  //      ^^^^^^^^^^^
  // Error: write @extend .info instead.
}
```

### Extend in `@media`

While `@extend` is allowed within @media and other CSS at-rules, it’s not allowed to extend selectors that appear outside its at-rule. This is because the extending selector only applies within the given media context, and there’s no way to make sure that restriction is preserved in the generated selector without duplicating the entire style rule.

```scss
@media screen and (max-width: 600px) {
  // before @extend is the right position
  .error--serious {
    @extend .error;
    //      ^^^^^^
    // Error: ".error" was extended in @media, but used outside it.
  }
}

.error {
  border: 1px #f00;
  background-color: #fdd;
}
```

### `@error`

```scss
@mixin reflexive-position($property, $value) {
  @if $property != left and $property != right {
    @error "Property #{$property} must be either left or right.";
  }

  $left-value: if($property == right, initial, $value);
  $right-value: if($property == right, $value, initial);

  left: $left-value;
  right: $right-value;
  [dir=rtl] & {
    left: $right-value;
    right: $left-value;
  }
}

.sidebar {
  @include reflexive-position(top, 12px);
  //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  // Error: Property top must be either left or right.
}
```

### `@warn`

```scss
$known-prefixes: webkit, moz, ms, o;

@mixin prefix($property, $value, $prefixes) {
  @each $prefix in $prefixes {
    @if not index($known-prefixes, $prefix) {
      @warn "Unknown prefix #{$prefix}.";
    }

    -#{$prefix}-#{$property}: $value;
  }
  #{$property}: $value;
}

.tilt {
  // Oops, we typo'd "webkit" as "wekbit"!
  @include prefix(transform, rotate(15deg), wekbit ms);
}
```

### `@debug`

Sometimes it’s useful to see the value of a variable or expression while you’re developing your stylesheet. That’s what the @debug rule is for: it’s written `@debug <expression>`, and it prints the value of that expression, along with the filename and line number.

```scss
@mixin inset-divider-offset($offset, $padding) {
  $divider-offset: (2 * $padding) + $offset;
  @debug "divider offset: #{$divider-offset}";

  margin-left: $divider-offset;
  width: calc(100% - #{$divider-offset});
}

// test.scss:3 Debug: divider offset: 132px
```

### `@at-root`

```scss
@use "sass:selector";

@mixin unify-parent($child) {
  @at-root #{selector.unify(&, $child)} {
    @content;
  }
}

.wrapper .field {
  @include unify-parent("input") {
    /* ... */
  }
  @include unify-parent("select") {
    /* ... */
  }
}
```

### Beyond Style Rules

```scss
@media print {
  .page {
    width: 8in;

    @at-root (without: media) {
      color: #111;
    }

    @at-root (with: rule) {
      font-size: 1.2em;
    }
  }
}
```

## `@if and @else`

```scss
$lan_direction: ltr;
$float: left;

@if $direction == ltr{
  $float: left;
} @else {
  $float: right; 
}
```

## `@if`

```scss
// example with mixin
@mixin avatar($size, $circle: false) {
  width: $size;
  height: $size;

  @if $circle {
    border-radius: $size / 2;
  }
}

.square-av {
  @include avatar(100px, $circle: false);
}
.circle-av {
  @include avatar(100px, $circle: true);
}
```

## `@else`

```scss
$light-background: #f2ece4;
$light-text: #036;
$dark-background: #6b717f;
$dark-text: #d2e1dd;

@mixin theme-colors($light-theme: true) {
  @if $light-theme {
    background-color: $light-background;
    color: $light-text;
  } @else {
    background-color: $dark-background;
    color: $dark-text;
  }
}

.banner {
  @include theme-colors($light-theme: true);
  body.dark & {
    @include theme-colors($light-theme: false);
  }
}
```

## `@else if`

```scss
@use "sass:math";

@mixin triangle($size, $color, $direction) {
  height: 0;
  width: 0;

  border-color: transparent;
  border-style: solid;
  border-width: math.div($size, 2);

  @if $direction == up {
    border-bottom-color: $color;
  } @else if $direction == right {
    border-left-color: $color;
  } @else if $direction == down {
    border-top-color: $color;
  } @else if $direction == left {
    border-right-color: $color;
  } @else {
    @error "Unknown direction #{$direction}.";
  }
}

.next {
  @include triangle(5px, black, right);
}
```

## `@each`

`@each <variable> in <expression> { ... }`, where the expression returns a list

```scss
$sizes: 40px, 50px, 80px;

@each $size in $sizes {
  .icon-#{$size} {
    font-size: $size;
    height: $size;
    width: $size;
  }
}
```

### With Maps

`@each <variable>, <variable> in <expression> { ... }`

```scss
$icons: ("eye": "\f112", "start": "\f12e", "stop": "\f12f");

@each $name, $glyph in $icons {
  .icon-#{$name}:before {
    display: inline-block;
    font-family: "Icon Font";
    content: $glyph;
  }
}
```

### Destructuring

```scss
$icons:
  "eye" "\f112" 12px,
  "start" "\f12e" 16px,
  "stop" "\f12f" 10px;

@each $name, $glyph, $size in $icons {
  .icon-#{$name}:before {
    display: inline-block;
    font-family: "Icon Font";
    content: $glyph;
    font-size: $size;
  }
}
```

## `@for`

`@for <variable> from <expression> to <expression> { ... }` or `@for <variable> from <expression> through <expression> { ... }`

If `to` is used, the final number is **excluded** ; if `through` is used, it's **included**

```scss
$grid: 12;

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
```

## `@while`

written `@while <expression> { ... }`

```scss
/// Divides `$value` by `$ratio` until it's below `$base`.
@function scale-below($value, $base, $ratio: 1.618) {
  @while $value > $base {
    $value: math.div($value, $ratio);
  }
  @return $value;
}

$normal-font-size: 16px;
sup {
  font-size: scale-below(20px, 16px);
}
```

## `@media`

```scss
$layout-breakpoint-small: 960px;

@media (min-width: $layout-breakpoint-small) {
  .hide-extra-small {
    display: none;
  }
}
```

When possible, Sass will also merge media queries that are nested within one another to make it easier to support browsers that don’t yet natively support nested @media rules.

```scss
@media (hover: hover) {
  .button:hover {
    border: 2px solid black;

    @media (color) {
      border-color: #036;
    }
  }
}
```

## `@supports`

```scss
@mixin sticky-position {
  position: fixed;
  @supports (position: sticky) {
    position: sticky;
  }
}

.banner {
  @include sticky-position;
}
```

## `@keyframes`

```scss
@keyframes slide-in {
  from {
    margin-left: 100%;
    width: 300%;
  }

  70% {
    margin-left: 90%;
    width: 150%;
  }

  to {
    margin-left: 0%;
    width: 100%;
  }
}
```
