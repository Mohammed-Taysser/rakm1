
# scss tricks

## resources

- <https://csslayout.io/>
- <https://shortcode.dev/css-cheatsheet>

## custom scrollbar

```css
::-webkit-scrollbar{
    width:10px;
}
::-webkit-scrollbar-track{
    background-color:#eee;
}
::-webkit-scrollbar-thumb{
    border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover{
   background-color:#ccc;
}
```

## arrow bottom

```scss
.arrow-bottom{
    display: block;

    &:after {
        border-style: solid;
        content: '';
        position: absolute;
        border-color: #eb6300 transparent transparent transparent;
        border-width: 10px 10px 0 10px;
    }
}
```

## load custom font

```scss
// <!-- Use preload tag in the header to prioritise font request -->
// <link rel="preload" href="path/to/the/Font-File.woff2" as="font">

@font-face {
    font-family: "Font";
    font-style: normal;
    font-weight: 400;
    src:    url(fonts/Font-File.eot);
    src:    local('Font'), /* Get the local font file if available */
            url(fonts/Font-File.woff2) format("woff2"), /* Preloaded in the header */
            url(fonts/Font-File.woff) format("woff"),
            url(fonts/Font-File.eot#iefix) format("eot");
    font-display: optional;     /* Prevent reflows */
    unicode-range: U+000-5FF;   /* Load Latin glyphs only */
}
```

## radial background gradient

```scss
.radial-background{
    background-color: #009cde;
    background-image: radial-gradient(circle, #009cde, #926fd6, #003087 115%);
    padding: 48px 24px;
    color: #FFF;
    text-align: center;
}

// <div class="radial-background">Element with a radial background.</div>
```

## tooltip

```html
<button class="btn tooltip" data-tooltip="Lorem ipsum dolor sit amet">top tooltip</button>
  
<button class="btn tooltip" data-tooltip="First Line Tooltip Text \n Second Line Tooltip Text">multiline tooltip</button>
```

```scss
.tooltip {
  position: relative;

  &::after {
    background: #fff;
    border-radius: 0.1rem;
    bottom: 100%;
    color: #333;
    content: attr(data-tooltip);
    display: block;
    font-size: 0.7rem;
    left: 50%;
    max-width: 320px;
    opacity: 0;
    overflow: hidden;
    padding: 0.2rem 0.4rem;
    pointer-events: none;
    position: absolute;
    text-overflow: ellipsis;
    transform: translate(-50%, 0.4rem);
    transition: opacity 0.2s, transform 0.2s;
    white-space: pre;
    z-index: 300;
  }

  &:focus::after,
  &:hover::after {
    opacity: 1;
    transform: translate(-50%, -0.2rem);
  }

  &[disabled],
  &.disabled {
    pointer-events: auto;
  }

  &.tooltip-right {
    &::after {
      bottom: 50%;
      left: 100%;
      transform: translate(-0.2rem, 50%);
    }
    &:focus::after,
    &:hover::after {
      transform: translate(0.2rem, 50%);
    }
  }

  &.tooltip-bottom {
    &::after {
      bottom: auto;
      top: 100%;
      transform: translate(-50%, -0.4rem);
    }
    &:focus::after,
    &:hover::after {
      transform: translate(-50%, 0.2rem);
    }
  }

  &.tooltip-left {
    &::after {
      bottom: 50%;
      left: auto;
      right: 100%;
      transform: translate(0.4rem, 50%);
    }
    &:focus::after,
    &:hover::after {
      transform: translate(-0.2rem, 50%);
    }
  }
}
```

## steps

```html
<ul class="step">
  <li class="step-item">
    <a href="#" class="tooltip" data-tooltip="Step 1">Step 1</a>
  </li>
  <li class="step-item active">
    <a href="#" class="tooltip" data-tooltip="Step 2">Step 2</a>
  </li>
  <li class="step-item">
    <a href="#" class="tooltip" data-tooltip="Step 3">Step 3</a>
  </li>
  <li class="step-item">
    <a href="#" class="tooltip" data-tooltip="Step 4">Step 4</a>
  </li>
</ul>
```

```scss
.step {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  list-style: none;
  margin: 0.2rem 0;
  width: 100%;

  .step-item {
    -ms-flex: 1 1 0;
    flex: 1 1 0;
    margin-top: 0;
    min-height: 1rem;
    position: relative;
    text-align: center;
  }

  .step-item:not(:first-child)::before {
    background: #5755d9;
    content: "";
    height: 2px;
    left: -50%;
    position: absolute;
    top: 9px;
    width: 100%;
  }

  .step-item {
    a {
      color: #5755d9;
      display: inline-block;
      padding: 20px 10px 0;
      text-decoration: none;
      &::before {
        background: #5755d9;
        border: 0.1rem solid #fff;
        border-radius: 50%;
        content: "";
        display: block;
        height: 0.6rem;
        left: 50%;
        position: absolute;
        top: 0.2rem;
        transform: translateX(-50%);
        width: 0.6rem;
        z-index: 1;
      }
    }

    &.active a::before {
      background: #fff;
      border: 0.1rem solid #5755d9;
    }

    &.active ~ .step-item::before {
      background: #dadee4;
    }

    &.active ~ .step-item a {
      color: #bcc3ce;
    }

    &.active ~ .step-item a::before {
      background: #dadee4;
    }
  }
}
```

## style selection

```scss
::selection{
    background: #FFF;
    color: #EB6300;
}
```

## position

```scss
@use "sass:meta";

$positions: (fixed, absolute, relative, sticky);
@each $position in $positions{
  .position-#{$position}{
    position: #{$position};
  }
}
```

## Custom Shape Dividers

### top Divider

```html
<div class="custom-shape-divider-top">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
```

```scss
.custom-shape-divider-top {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
}

.custom-shape-divider-top svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 150px;
}

.custom-shape-divider-top .shape-fill {
    fill: #FFFFFF;
}

/** For tablet devices **/
@media (min-width: 768px) and (max-width: 1023px) {
    .custom-shape-divider-top svg {
        width: calc(100% + 1.3px);
        height: 106px;
    }
}

/** For mobile devices **/
@media (max-width: 767px) {
    .custom-shape-divider-top svg {
        width: calc(100% + 1.3px);
        height: 62px;
    }
}
```

### ### bottom Divider

```html
<div class="custom-shape-divider-bottom">
    <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" class="shape-fill"></path>
    </svg>
</div>
```

```scss
.custom-shape-divider-bottom {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    overflow: hidden;
    line-height: 0;
    transform: rotate(180deg);
}

.custom-shape-divider-bottom svg {
    position: relative;
    display: block;
    width: calc(100% + 1.3px);
    height: 150px;
}

.custom-shape-divider-bottom .shape-fill {
    fill: #FFFFFF;
}

/** For tablet devices **/
@media (min-width: 768px) and (max-width: 1023px) {
    .custom-shape-divider-bottom svg {
        width: calc(100% + 1.3px);
        height: 106px;
    }
}

/** For mobile devices **/
@media (max-width: 767px) {
    .custom-shape-divider-bottom svg {
        width: calc(100% + 1.3px);
        height: 62px;
    }
}
```

## gradients

```scss
.gradient {
    background-image: linear-gradient(#ff8a00, #e52e71);

    /* Explicitly declare the direction  right, left, top, bottom*/
    background-image: linear-gradient(to top right, #ff8a00, #e52e71);

    /* Explicitly declare the angle, in degrees */
    background-image: linear-gradient(180deg, #ff8a00, #e52e71);
}
```

## Custom properties

```scss
html {
  --red: #a24e34;
  --green: #01f3e6;
  --yellow: #f0e765;
 --bg1: url(./img/angles-top-left.svg);
 
  --error: var(--red);
  --errorBorder: 1px dashed var(--red);
  --ok: var(--green);
  --warning: var(--yellow);
}
```

# spectra

## avatar

```html
<!-- basic example no image -->
<figure class="avatar" data-initial="YZ"></figure>

<!-- basic example with image -->
<figure class="avatar" data-initial="YZ">
    <img src="85210.png" alt="">
</figure>


<!-- basic example with image and image as icon -->
<figure class="avatar" data-initial="YZ">
    <img src="85210.png" alt="">
    <img src="85210.png" class="avatar-icon" alt="">
</figure>

<!-- basic example with image and presence -->
<figure class="avatar" data-initial="YZ">
    <img src="85210.png" alt="">
    <span class="avatar-presence online"></span>
</figure>
```

```scss
.avatar {
  background: #5755d9;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.85);
  display: inline-block;
  font-size: 2.5rem;
  font-weight: 300;
  height: 5rem;
  width: 5rem;
  line-height: 1.25;
  margin: 0;
  position: relative;
  vertical-align: middle;
  height: 5rem;
  width: 5rem;
  font-size: 1.6rem;

  img {
    border-radius: 50%;
    height: 100%;
    position: relative;
    width: 100%;
    z-index: 1;
  }

  .avatar-icon,
  .avatar-presence {
    background: #fff;
    bottom: 14.64%;
    height: 40%;
    padding: 0.1rem;
    position: absolute;
    right: 14.64%;
    transform: translate(50%, 50%);
    width: 40%;
    z-index: 2;
  }

  .avatar-presence {
    background: #bcc3ce;
    border-radius: 50%;
    box-shadow: 0 0 0 0.2rem #fff;
    height: 0.3em;
    width: 0.3em;
    @each $title, $color in (away: #ffb700, busy: #e85600, online: #32b643) {
      &.#{$title} {
        background-color: #{$color};
      }
    }
  }

  &[data-initial]::before {
    color: currentColor;
    content: attr(data-initial);
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
}
```

## accordion

```html
<div class="custom-accordion">
    <input id="custom-accordion-1" type="radio" name="custom-accordion-radio" checked="" hidden="">
    <label class="custom-accordion-header" for="custom-accordion-1">Elements</label>
    <div class="custom-accordion-body">
        <!-- anything -->
        Lorem
    </div>
</div>
<div class="custom-accordion">
    <input id="custom-accordion-2" type="radio" name="custom-accordion-radio" hidden="">
    <label class="custom-accordion-header" for="custom-accordion-2">Components</label>
    <div class="custom-accordion-body">
        <!-- anything -->
        Lorem ipsum dolor sit
    </div>
</div>
```

```scss
.custom-accordion {
  input:checked ~ .custom-accordion-header > .icon,
  &[open] .custom-accordion-header > .icon {
    transform: rotate(90deg);
  }
  input:checked ~ .custom-accordion-body,
  &[open] .custom-accordion-body {
    max-height: 50rem;
  }

  .custom-accordion-header {
    display: block;
    padding: 0.2rem 0.4rem;
    .icon {
      transition: transform 0.25s;
    }
  }
  .custom-accordion-body {
    margin-bottom: 0.4rem;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.25s;
  }
}
```

## badge

```html
<span class="badge"> Notifications </span>

<span class="badge" data-badge="8"> Notifications </span>

<button class="btn badge" data-badge="8"> Button </button>

<figure class="avatar badge" data-badge="8" data-initial="YZ"> <img src="85210.png" alt=""> </figure>
```

```scss
.badge {
  position: relative;
  white-space: nowrap;

  &[data-badge]::after,
  &:not([data-badge])::after {
    background: #5755d9;
    background-clip: padding-box;
    border-radius: 0.8rem;
    box-shadow: 0 0 0 0.2rem #fff;
    color: #fff;
    content: attr(data-badge);
    display: inline-block;
    transform: translate(-0.05rem, -0.5rem);
  }

  &[data-badge]::after {
    font-size: 0.7rem;
    height: 1rem;
    line-height: 1.5;
    min-width: 1rem;
    //   padding: 0.1rem 0.2rem;
    text-align: center;
    white-space: nowrap;
  }

  &:not([data-badge])::after,
  &[data-badge=""]::after {
    height: 6px;
    min-width: 6px;
    padding: 0;
    width: 6px;
  }

  &.custom-btn::after {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -50%);
  }

  &.avatar::after {
    position: absolute;
    right: 14.64%;
    top: 14.64%;
    transform: translate(50%, -50%);
    z-index: 100;
  }
}
```

## progress bar

```html
<!-- normal bars -->
<div class="bar bar-sm">
    <div class="bar-item" role="progressbar" style="width:25%;" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100"></div>
</div>

<!-- multi-bars -->
<div class="bar">
    <div class="bar-item tooltip" data-tooltip="25%" style="width:25%;">25%</div>
    <div class="bar-item" style="width:15%;background:#db0adb;">15%</div>
</div>

<progress class="progress-bar" value="25" max="100"></progress>

<progress class="progress-bar" max="100"></progress>
```

```scss
.bar {
  background: #eef0f3;
  border-radius: 0.1rem;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: nowrap;
  flex-wrap: nowrap;
  height: 0.8rem;
  width: 100%;

  &.bar-sm {
    height: 0.2rem;
  }

  .bar-item {
    background: #5755d9;
    color: #fff;
    display: block;
    -ms-flex-negative: 0;
    flex-shrink: 0;
    font-size: 0.7rem;
    height: 100%;
    line-height: 0.8rem;
    position: relative;
    text-align: center;
    width: 0;
  }

  .bar-item:first-child {
    border-bottom-left-radius: 0.1rem;
    border-top-left-radius: 0.1rem;
  }

  .bar-item:last-child {
    border-bottom-right-radius: 0.1rem;
    border-top-right-radius: 0.1rem;
    -ms-flex-negative: 1;
    flex-shrink: 1;
  }
}

.progress-bar {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: #eef0f3;
  border: 0;
  border-radius: 0.1rem;
  color: #5755d9;
  height: 0.2rem;
  position: relative;
  width: 100%;

  &::-webkit-progress-bar {
    background: transparent;
    border-radius: 0.1rem;
  }

  &::-webkit-progress-value {
    background: #5755d9;
    border-radius: 0.1rem;
  }

  &::-moz-progress-bar {
    background: #5755d9;
    border-radius: 0.1rem;
  }

  &:indeterminate {
    animation: progress-indeterminate 1.5s linear infinite;
    background: #eef0f3 linear-gradient(to right, #5755d9 30%, #eef0f3 30%) top
      left/150% 150% no-repeat;
  }

  &:indeterminate::-moz-progress-bar {
    background: transparent;
  }

  @keyframes progress-indeterminate {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
}
```

## button

```html
<span class="custom-btn custom-btn-clear"></span> 

<button class="custom-btn badge" data-badge="8"> Button </button>
```

```scss
.custom-btn {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: #fff;
  border: 0.05rem solid #5755d9;
  border-radius: 0.1rem;
  color: #5755d9;
  cursor: pointer;
  display: inline-block;
  font-size: 0.8rem;
  height: 1.8rem;
  line-height: 1.2rem;
  outline: none;
  padding: 0.25rem 0.4rem;
  text-align: center;
  text-decoration: none;
  transition: background 0.2s, border 0.2s, box-shadow 0.2s, color 0.2s;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  vertical-align: middle;
  white-space: nowrap;

  &:focus {
    box-shadow: 0 0 0 0.1rem rgba(87, 85, 217, 0.2);
  }

  &:focus,
  &:hover {
    background: #f1f1fc;
    border-color: #4b48d6;
    text-decoration: none;
  }

  &:active,
  &.active {
    background: #4b48d6;
    border-color: #3634d2;
    color: #fff;
    text-decoration: none;
  }
}

.custom-btn.custom-btn-clear {
  background: transparent;
  border: 0;
  color: currentColor;
  height: 1rem;
  line-height: 0.8rem;
  margin-left: 0.2rem;
  margin-right: -2px;
  opacity: 1;
  padding: 0.1rem;
  text-decoration: none;
  width: 1rem;
}

.custom-btn.custom-btn-clear:focus,
.custom-btn.custom-btn-clear:hover {
  background: rgba(247, 248, 249, 0.5);
  opacity: 0.95;
}

.custom-btn.custom-btn-clear::before {
  content: "\2715";
}
```

## card

```html
<div class="custom-card" style='width: 250px;'>
    <div class="custom-card-image">
        <img src="85210.png" class="" alt=''>
    </div>
    <div class="custom-card-header">
        <div class="custom-card-title h5">title</div>
        <div class="custom-card-subtitle text-muted">price</div>
    </div>
    <div class="custom-card-body">
        Lorem ipsum dolor sit
    </div>
    <div class="custom-card-footer">
        <button class="custom-btn">text</button>
    </div>
</div>
```

```scss
.custom-card {
  background: #fff;
  box-shadow: 0 0.25rem 1rem rgba(48, 55, 66, 0.15);
  border-radius: 0.1rem;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  img {
    width: 100%;
  }
  .custom-card-header,
  .custom-card-body,
  .custom-card-footer {
    padding: 0.8rem;
    padding-bottom: 0;
  }

  .custom-card-header:last-child,
  .custom-card-body:last-child,
  .custom-card-footer:last-child {
    padding-bottom: 0.8rem;
  }

  .custom-card-body {
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
  }

  .custom-card-image {
    padding-top: 0.8rem;

    &:first-child {
      padding-top: 0;
    }

    &:first-child img {
      border-top-left-radius: 0.1rem;
      border-top-right-radius: 0.1rem;
    }

    &:last-child img {
      border-bottom-left-radius: 0.1rem;
      border-bottom-right-radius: 0.1rem;
    }
  }
}
```

## display

```scss
$display-type: (none, block, inline-block, inline, flex, inline-flex);
$visible-type: (
  invisible: hidden,
  visible: visible,
);

@each $type in $display-type {
  .d-#{$type} {
    display: #{$type};
  }
}

@each $title, $type in $visible-type {
  .d-#{$title} {
    display: #{$type};
  }
}
```

## divider

```html
<!-- divider element -->
<div class="divider"></div>
<!-- divider element with text -->
<div class="divider text-center" data-content="OR"></div>
```

```scss
.divider,
.divider-vert {
  display: block;
  position: relative;

  &[data-content]::after,
  &[data-content]::after {
    background: #fff;
    color: #bcc3ce;
    content: attr(data-content);
    display: inline-block;
    font-size: 0.7rem;
    padding: 0 0.4rem;
    transform: translateY(-0.65rem);
  }
}

.divider {
  border-top: 0.05rem solid #f1f3f5;
  height: 0.05rem;
  margin: 0.4rem 0;

  &[data-content] {
    margin: 0.8rem 0;
  }
}
```

# form

## moved checkbox

```html
<label class='moved-checkbox'><input type="checkbox"> <span>Red</span></label>
```

```scss
label.moved-checkbox {
  font-size: 0.8rem;
  color: #9e9e9e;

  input[type="checkbox"] {
    box-sizing: border-box;
    padding: 0;

    + span {
      position: relative;
      padding-left: 35px;
      cursor: pointer;
      display: inline-block;
      height: 25px;
      line-height: 25px;
      font-size: 1rem;
      user-select: none;
    }

    &:not(:checked) {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    &:checked {
      position: absolute;
      opacity: 0;
      pointer-events: none;

      + span::before {
        top: -4px;
        left: -5px;
        width: 12px;
        height: 22px;
        border: 2px solid transparent;
        border-bottom-color: #26a69a;
        border-right-color: #26a69a;
        transform: rotate(40deg);
        backface-visibility: hidden;
        transform-origin: 100% 100%;
      }
    }

    + span::before,
    + span::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 18px;
      border-radius: 3px;
      height: 18px;
      z-index: 0;
      border: 2px solid #5a5a5a;
      margin-top: 3px;
      transition: 0.2s;
    }

    + span::after {
      transform: scale(0);
    }
  }
}
```

## floating-label

needed `required` attr to work else use JS

```html
<div class="float-label">
  <input type="text" class="" id="input-name-1" required>
  <label for="input-name-1">user name</label>
</div>
```

```scss
.float-label {
  position: relative;

  & > label {
    position: absolute;
    left: 14px;
    pointer-events: none;
    top: 2px;
    font-size: 1rem;
    color: #aaa;
    transition: 0.3s;
  }

  input{
    &::placeholder {
      color: transparent;
    }
  }

  & input:focus + label,
  & input.has-content + label {
    top: -30px;
    left: 0;
    font-weight: 400;
    color: #212529;
    transition: 0.3s;
  }
}
```

```js
document.querySelectorAll('.float-label input').forEach(input => {
  input.onfocus = function () {
    if (this.value != '') {
      this.classList.add('has-content');
    } else {
      this.classList.remove('has-content');
    }
  };
})
```

## skew-divider

```html
<div class="skew-divider" style='height: 50px;'></div>
```

```scss
%skew {
  content: "";
  background-color: gold;
  z-index: -1;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: skewY(-6deg);
}

.skew-divider {
  position: relative;
  margin-top: 200px;
  margin-bottom: 200px;

  &::before,
  &::after {
    @extend %skew;
  }
  &::before {
    transform-origin: top left;
  }
  &::after {
    transform-origin: bottom right;
  }
}

.skew-divider-top {
  position: relative;
  margin-top: 200px;

  &::before {
    @extend %skew;
    transform-origin: top left;
  }
}

.skew-divider-bottom {
  position: relative;
  margin-bottom: 200px;

  &::before {
    @extend %skew;
    transform-origin: bottom right;
  }
}

.skew-divider-img {
  position: relative;

  &::after {
    @extend %skew;
    background-image: attr(data-image);
    transform-origin: bottom right;
  }
}
```

## menu

```html
  <ul class="menu">
      <li class="divider" data-content="LINKS"></li>
      <li class="menu-item"><a href="#menus">Slack</a></li>
      <li class="menu-item"><a href="#menus">Hipchat</a></li>
      <li class="menu-item"><a href="#menus">Skype</a></li>
      <li class="divider" data-content="ar"></li>
  </ul>
```

```scss
.menu {
  background: #fff;
  border-radius: 0.1rem;
  box-shadow: 0 0.05rem 0.2rem rgba(48, 55, 66, 0.3);
  list-style: none;
  margin: 0;
  min-width: 180px;
  padding: 0.4rem;
  transform: translateY(0.2rem);
  z-index: 300;

  &.menu-nav {
    background: transparent;
    box-shadow: none;
  }

  .menu-item {
    margin-top: 0;
    padding: 0 0.4rem;
    position: relative;
    text-decoration: none;

    > a {
      border-radius: 0.1rem;
      color: inherit;
      display: block;
      margin: 0 -0.4rem;
      padding: 0.2rem 0.4rem;
      text-decoration: none;
    }

    > a:focus,
    > a:hover {
      background: #f1f1fc;
      color: #5755d9;
    }

    > a:active,
    > a.active {
      background: #f1f1fc;
      color: #5755d9;
    }

    .form-checkbox,
    .form-radio,
    .form-switch {
      margin: 0.1rem 0;
    }

    + & {
      margin-top: 0.2rem;
    }
  }

  .menu-badge {
    align-items: center;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-align: center;
    height: 100%;
    position: absolute;
    right: 0;
    top: 0;

    .label {
      margin-right: 0.4rem;
    }
  }
}
```

# heading

## special heading

```html
<h3 class='special-heading'>title</h3>
```

```scss
.special-heading {
  position: relative;

  &::after,
  &::before {
      content: "";
      position: absolute;
      display: block;
      border-radius: 3px;
  }

  &::after {
      width: 120px;
      height: 1px;
      background: #ddd;
      bottom: -3px;
      left: 0;
  }

  &::before {
      width: 40px;
      height: 3px;
      left: 40px;
      bottom: -4px;
      z-index: 1;
      background-color: gold;
  }
  &.text-center{
      &::after {
          left: calc(50% - 60px);
      }

      &::before {
          left: calc(50% - 20px);
      }
  }

}
```

## hr heading

```html
<h3 class='hr-heading'>title</h3>
```

```scss
.hr-heading {
  position: relative;

  &::before, &::after {
      content: '';
      width: 50px;
      height: 2px;
      background: gold;
      display: inline-block;
  }
  &::before {
      margin: 0 15px 10px 0;
  }
  &::after {
      margin: 0 0 10px 15px;
  }
}
```

# popover

```html
<div class="popover popover-right">
  <button class="btn btn-primary">right popover</button>
  <div class="popover-container">
    ... 
  </div>
</div>
```

```scss
.popover {
  display: inline-block;
  position: relative;

  .popover-container {
    left: 50%;
    opacity: 0;
    padding: 0.4rem;
    position: absolute;
    top: 0;
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.2s;
    width: 320px;
    z-index: 300;
  }

  *:focus +,
  &:hover {
    .popover-container {
      display: block;
      opacity: 1;
      transform: translate(-50%, -100%) scale(1);
    }
  }

  &.popover-right {
    .popover-container {
      left: 100%;
      top: 50%;
    }
    *:focus +,
    &:hover {
      .popover-container {
        transform: translate(0, -50%) scale(1);
      }
    }
  }

  &.popover-bottom {
    .popover-container {
      left: 50%;
      top: 100%;
    }
    *:focus +,
    &:hover {
      .popover-container {
        transform: translate(-50%, 0) scale(1);
      }
    }
  }

  &.popover-left {
    .popover-container {
      left: 0;
      top: 50%;
    }
    *:focus +,
    &:hover {
      .popover-container {
        transform: translate(-100%, -50%) scale(1);
      }
    }
  }

  .card {
    border: 0;
    box-shadow: 0 0.2rem 0.5rem rgba(48, 55, 66, 0.3);
  }
}
```

# pagination

```html
<ul class="pagination">
  <li class="page-item disabled">
    <a href="#" tabindex="-1">Previous</a>
  </li>
  <li class="page-item active">
    <a href="#">1</a>
  </li>
  <li class="page-item">
    <a href="#">2</a>
  </li>
  <li class="page-item">
    <a href="#">3</a>
  </li>
  <li class="page-item">
    <span>...</span>
  </li>
  <li class="page-item">
    <a href="#">12</a>
  </li>
  <li class="page-item">
    <a href="#">Next</a>
  </li>
</ul>
  
<ul class="pagination">
  <li class="page-item page-prev">
    <a href="#">
      <div class="page-item-subtitle">Previous</div>
      <div class="page-item-title h5">Getting started</div>
    </a>
  </li>
  <li class="page-item page-next">
    <a href="#">
      <div class="page-item-subtitle">Next</div>
      <div class="page-item-title h5">Layout</div>
    </a>
  </li>
</ul>
```

```scss
.pagination {
  display: -ms-flexbox;
  display: flex;
  list-style: none;
  margin: 0.2rem 0;
  padding: 0.2rem 0;

  .page-item{
    margin: 0.2rem 0.05rem;

    span {
      display: inline-block;
      padding: 0.2rem 0.2rem;
    }

    a {
      border-radius: 0.1rem;
      display: inline-block;
      padding: 0.2rem 0.4rem;
      text-decoration: none;
      color: rgb(163, 163, 163);
    }

    a:focus,
    a:hover {
      color: #001d38;
    }

    &.disabled a {
      cursor: default;
      opacity: 0.5;
      pointer-events: none;
    }

    &.active a {
      background: #001d38;
      color: #fff;
      border-radius: 3px;
    }

    &.page-prev,
    &.page-next {
      -ms-flex: 1 0 50%;
      flex: 1 0 50%;
    }

    &.page-next {
      text-align: right;
    }

    .page-item-title {
      margin: 0;
    }

    .page-item-subtitle {
      margin: 0;
      opacity: 0.5;
    }
  }
}
```

# code

## basic code style

```html
<pre class="code" data-lang="HTML"><code></code></pre>
```

```scss
code {
  background: #fcf2f2;
  border-radius: 0.1rem;
  color: #d73e48;
  font-size: 85%;
  line-height: 1.25;
  padding: 0.1rem 0.2rem;
}

.code {
  border-radius: 0.1rem;
  color: #3b4351;
  position: relative;

  &::before {
    color: #bcc3ce;
    content: attr(data-lang);
    font-size: 0.7rem;
    position: absolute;
    right: 0.4rem;
    top: 0.1rem;
  }

  code {
    background: #f7f8f9;
    color: inherit;
    display: block;
    line-height: 1.5;
    overflow-x: auto;
    padding: 1rem;
    width: 100%;
  }
}
```

# switch

```html
<input id="switch-1" type="checkbox" class="real-custom-switch">
<label for="switch-1">Switch</label>
  
<input id="switch-2" type="checkbox" class="real-custom-switch" disabled>
<label for="switch-2">Switch</label>
```

```scss
.real-custom-switch {
  -webkit-appearance: none;
  -moz-appearance: none;
  height: 21px;
  outline: none;
  display: inline-block;
  vertical-align: top;
  position: relative;
  margin: 0;
  cursor: pointer;
  border: 1px solid #bbc1e1;
  background: #fff;
  transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;
  width: 38px;
  border-radius: 11px;

  &:after {
    content: "";
    display: block;
    left: 0;
    top: 0;
    position: absolute;
    transition: transform 0.3s ease, opacity 0.2s;
    left: 2px;
    top: 2px;
    border-radius: 50%;
    width: 15px;
    height: 15px;
    background: #bbc1e1;
    transform: translateX(0);
  }

  & + label {
    font-size: 14px;
    line-height: 21px;
    display: inline-block;
    vertical-align: top;
    cursor: pointer;
    user-select: none;
    margin-left: 4px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.9;
    & + label {
      cursor: not-allowed;
    }
    &:checked {
      background: #f6f8ff;
      border: 1px solid #bbc1e1;
      &::after {
        opacity: 0.6;
      }
    }
    &:not(:checked) {
      &:after {
        opacity: 0.6;
      }
    }
  }

  &:focus {
    box-shadow: 0 0 0 2px rgba(39, 94, 254, 0.3);
  }

  &:hover {
    &:not(:checked) {
      &:not(:disabled) {
        border-color: #275efe;
      }
    }
  }

  &:checked {
    --b: #275efe;
    --bc: #275efe;
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
    --ab: var(--active-inner);
    --x: 17px;
    background: #275efe;
    border-color: #275efe;
    &::after {
      transform: translateX(17px);
      background: #fff;
    }
  }
}
```

# loader

## semipolar-spinner

```html
  <div class="semipolar-spinner">
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
    <div class="ring"></div>
  </div>
```

```scss
.semipolar-spinner {
  height: 65px;
  width: 65px;
  position: relative;

  &,
  & * {
    box-sizing: border-box;
  }
  .ring {
    border-radius: 50%;
    position: absolute;
    border: calc(65px * 0.05) solid transparent;
    border-top-color: #ff1d5e;
    border-left-color: #ff1d5e;
    animation: semipolar-spinner-animation 2s infinite;

    &:nth-child(1) {
      height: calc(65px - 65px * 0.2 * 0);
      width: calc(65px - 65px * 0.2 * 0);
      top: calc(65px * 0.1 * 0);
      left: calc(65px * 0.1 * 0);
      animation-delay: calc(2000ms * 0.1 * 4);
      z-index: 5;
    }
    &:nth-child(2) {
      height: calc(65px - 65px * 0.2 * 1);
      width: calc(65px - 65px * 0.2 * 1);
      top: calc(65px * 0.1 * 1);
      left: calc(65px * 0.1 * 1);
      animation-delay: calc(2000ms * 0.1 * 3);
      z-index: 4;
    }
    &:nth-child(3) {
      height: calc(65px - 65px * 0.2 * 2);
      width: calc(65px - 65px * 0.2 * 2);
      top: calc(65px * 0.1 * 2);
      left: calc(65px * 0.1 * 2);
      animation-delay: calc(2000ms * 0.1 * 2);
      z-index: 3;
    }
    &:nth-child(4) {
      height: calc(65px - 65px * 0.2 * 3);
      width: calc(65px - 65px * 0.2 * 3);
      top: calc(65px * 0.1 * 3);
      left: calc(65px * 0.1 * 3);
      animation-delay: calc(2000ms * 0.1 * 1);
      z-index: 2;
    }
    &:nth-child(5) {
      height: calc(65px - 65px * 0.2 * 4);
      width: calc(65px - 65px * 0.2 * 4);
      top: calc(65px * 0.1 * 4);
      left: calc(65px * 0.1 * 4);
      animation-delay: calc(2000ms * 0.1 * 0);
      z-index: 1;
    }
  }
  @keyframes semipolar-spinner-animation {
    50% {
      transform: rotate(360deg) scale(0.7);
    }
  }
}
```

## three spinner

```html
  <div class="three-spinner">
    <div class="circle"></div>
    <div class="circle"></div>
    <div class="circle"></div>
  </div>
```

```scss
.three-spinner .circle {
  animation: rotate-spinner 0.2s linear infinite;
  border: 5px solid transparent;
  border-radius: 50%;
  position: absolute;

  &:first-of-type {
    border-top-color: dodgerblue;
    height: 50px;
    width: 50px;
    top: 50px;
    left: 50px;
    animation-duration: 0.85s;
  }
  &:nth-of-type(2) {
    border-top-color: lawngreen;
    height: 75px;
    width: 75px;
    top: 38px;
    animation-duration: 0.95s;
    left: 38px;
  }
  &:last-of-type {
    border-top-color: darkorange;
    animation-duration: 1.05s;
    height: 100px;
    width: 100px;
    top: 25px;
    left: 25px;
  }
}
@keyframes rotate-spinner {
  from {
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    -o-transform: rotate(360deg);
  }
}
```

# burger

## flippin burger

```html

<svg class="ham-svg  ham-4" viewBox="0 0 100 100" width="80" onclick="this.classList.toggle('active')">
  <path class="line top" d="m 70,33 h -40 c 0,0 -8.5,-0.149796 -8.5,8.5 0,8.649796 8.5,8.5 8.5,8.5 h 20 v -20" />
  <path  class="line middle"  d="m 70,50 h -40" />
  <path class="line bottom" d="m 30,67 h 40 c 0,0 8.5,0.149796 8.5,-8.5 0,-8.649796 -8.5,-8.5 -8.5,-8.5 h -20 v 20" />
</svg>

<svg class="ham-svg  ham-8" viewBox="0 0 100 100" width="80" onclick="this.classList.toggle('active')">
  <path class="line top" d="m 30,33 h 40 c 3.722839,0 7.5,3.126468 7.5,8.578427 0,5.451959 -2.727029,8.421573 -7.5,8.421573 h -20" />
  <path class="line middle" d="m 30,50 h 40" />
  <path class="line bottom" d="m 70,67 h -40 c 0,0 -7.5,-0.802118 -7.5,-8.365747 0,-7.563629 7.5,-8.634253 7.5,-8.634253 h 20" />
</svg>

```

```scss
.ham-svg {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 400ms;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;

  &.active {
    transform: rotate(45deg);
  }

  .line {
    fill: none;
    transition: stroke-dasharray 400ms, stroke-dashoffset 400ms;
    stroke: #000;
    stroke-width: 5.5;
    stroke-linecap: round;
  }

  &.ham-4 {
    .top {
      stroke-dasharray: 40 121;
    }
    .bottom {
      stroke-dasharray: 40 121;
    }
    &.active .top {
      stroke-dashoffset: -68px;
    }
    &.active .bottom {
      stroke-dashoffset: -68px;
    }
  }

  &.ham-8 {
    .top {
      stroke-dasharray: 40 160;
    }
    .middle {
      stroke-dasharray: 40 142;
      transform-origin: 50%;
      transition: transform 400ms;
    }
    .bottom {
      stroke-dasharray: 40 85;
      transform-origin: 50%;
      transition: transform 400ms, stroke-dashoffset 400ms;
    }
    &.active .top {
      stroke-dashoffset: -64px;
    }
    &.active .middle {
      //stroke-dashoffset: -20px;
      transform: rotate(90deg);
    }
    &.active .bottom {
      stroke-dashoffset: -64px;
    }
  }
}
```

## draw burger

```html
<div class="menu-toggle-btn" onclick="this.classList.toggle('open')">
  <div class="hamburger">
    <span></span>
    <span></span>
    <span></span>
  </div>
  <div class="cross">
    <span></span>
    <span></span>
  </div>
</div>
```

```scss
span {
  display:block;
  background:#566973;
  border-radius:2px;
}

.menu-toggle-btn {
  transition:.25s ease-in-out;
  width:70px;
  height:70px;
  margin:50px auto;
  position:relative;
  cursor:pointer;
  background:#d9e4ea;
  border-radius:5px;
  &:hover {
    background:rgba(255,255,255,.8);
  }
  .hamburger {
    transition:.25s ease-in-out;
    position:absolute;
    height:100%;
    width:100%;
    span {
      transition:.25s ease-in-out;
      width:40px;
      height:4px;
      position:relative;
      top:10px;
      left:15px;
      margin:10px 0;
      &:nth-child(1){
        transition-delay:.5s;
      }
      &:nth-child(2){
        transition-delay:.625s;
      }
      &:nth-child(3){
        transition-delay:.75s;
      }
    }
  }
  .cross {
    transition:.25s ease-in-out;
    position:absolute;
    height:100%;
    width:100%;
    transform:rotate(45deg);
    span{
      transition:.25s ease-in-out;
      &:nth-child(1){
        height:0%;
        width:4px;
        position:absolute;
        top:10%;
        left:37px;
        transition-delay:0s;
      }
      &:nth-child(2){
        width:0%;
        height:4px;
        position:absolute;
        left:12%;
        top:35px;
        transition-delay:.25s;
      }
    }
  }
}

.menu-toggle-btn.open {
  .hamburger {
    span {
      width:0%;
      &:nth-child(1){
        transition-delay:0s;
      }
      &:nth-child(2){
        transition-delay:.125s;
      }
      &:nth-child(3){
        transition-delay:.25s;
      }
    }
  }
  .cross {
    span {
      &:nth-child(1){
        height:80%;
        transition-delay:.625s;
      }
    }
    span {
      &:nth-child(2){
        width:80%;
        transition-delay:.375s;
      }
    }    
  }
}
```
