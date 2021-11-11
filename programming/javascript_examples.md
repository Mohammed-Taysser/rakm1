
# js examples

## resources

- <https://1loc.dev/>

## save on locale storage

```html
<div class="my-3 localstorage" id="localstorage">
    <p>change color by click and save it in locale storage</p>

    <div class="colors d-flex justify-content-center align-items-center">
        <div class="rounded-circle mx-2 bg-danger" data-color='danger'></div>
        <div class="rounded-circle mx-2 bg-primary" data-color='primary'></div>
        <div class="rounded-circle mx-2 bg-success" data-color='success'></div>
        <div class="rounded-circle mx-2 bg-warning" data-color='warning'></div>
    </div>
    <div class="p-5 my-3" id="effect"></div>
</div>
```

```css
.localstorage .colors div{
    width: 30px;
    height: 30px;
    cursor: pointer;
}
```

```js
let colors_elements = document.querySelectorAll('#localstorage .colors div');
let effect_element = document.querySelector('#effect');
let using_color = [];

// if(localStorage.getItem('using_color') !== null){
// effect_element.classList.add(localStorage.getItem('using_color'));
// }else {
// effect_element.classList.add('bg-info');
// }
effect_element.classList.add(localStorage.getItem('using_color') || 'bg-info');

colors_elements.forEach(color => {
    using_color.push('bg-' + color.dataset['color'])
    color.addEventListener('click', function (){
        if(!effect_element.classList.contains('bg-' + this.dataset['color'])){
            effect_element.classList.remove(...using_color);
            effect_element.classList.add('bg-' + this.dataset['color']);
            localStorage.setItem('using_color', 'bg-' + this.dataset['color']);
        }
    }, false);
})
```

## text writer effect

```html
<div class="my-3" id="text_effect">
    <div class="form-group my-3">
        <label for="exampleFormControlTextarea1">write your text</label>
        <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        <div class="small text-right mt-1">letter <span class="letter_left">0</span></div>
        <button class="btn btn-primary mt-3 done" disabled>Done</button>
    </div>
    <div class="output"></div>
</div>
```

```js
let text_area_input = document.querySelector('#text_effect textarea'), i=0;
let done_btn = document.querySelector('#text_effect .done'), output_write = document.querySelector('#text_effect .output');
text_area_input.oninput = function () {
    document.querySelector('#text_effect .letter_left').textContent = text_area_input.value.length ;
    if(text_area_input.value.length > 0){
        done_btn.disabled = false
    }else {
        done_btn.disabled = true
    }
}
done_btn.onclick = function(){
    text_area_input.disabled = true;
    done_btn.disabled = true
    output_write.textContent = '';
    let text_writer_interval = setInterval(() => {
        if (i > text_area_input.value.length - 1) {
            clearInterval(text_writer_interval);
            text_area_input.disabled = false;
            done_btn.disabled = false
            i = 0;
        }else {
            output_write.textContent += text_area_input.value[i];
            i++;
        }
    }, 100);
}
```

## close button

```html
<div class="section-close-button my-5 py-5">
    <div class="bg-light close-button transition cursor-pointer">
        <div class="bar transition bg-primary mb-2" style="height: 3px;width: 40px;"></div>
        <div class="bar transition bg-warning mb-2" style="height: 3px;width: 40px;"></div>
        <div class="bar transition bg-danger mb-2" style="height: 3px;width: 40px;"></div>
    </div>
</div>
```

```css
.section-close-button {
  width: 50px;
}
.section-close-button .close-button div:first-of-type.transform {
  transform: rotate(-45deg) translate(-10px, 10px);
  -webkit-transform: rotate(-45deg) translate(-10px, 10px);
  -moz-transform: rotate(-45deg) translate(-10px, 10px);
  -ms-transform: rotate(-45deg) translate(-10px, 10px);
  -o-transform: rotate(-45deg) translate(-10px, 10px);
}
.section-close-button .close-button div:nth-of-type(2).transform {
  opacity: 0;
}
.section-close-button .close-button div:last-of-type.transform {
  transform: rotate(45deg) translate(-5px, -5px);
  -webkit-transform: rotate(45deg) translate(-5px, -5px);
  -moz-transform: rotate(45deg) translate(-5px, -5px);
  -ms-transform: rotate(45deg) translate(-5px, -5px);
  -o-transform: rotate(45deg) translate(-5px, -5px);
}
```

```js
$('.section-close-button').on('click', function () {
    $('.section-close-button .close-button div').toggleClass('transform');
});
```

## spinner

```html
<div class="section-spinner">
    <div class="spinner position-relative">
        <div class="rounded-circle position-absolute circle"></div>
        <div class="rounded-circle position-absolute circle"></div>
        <div class="rounded-circle position-absolute circle"></div>
    </div>
</div>
```

```css
.section-spinner{
    height: 100px;
}
.section-spinner .spinner .circle {
  animation: rotate-spinner 0.2s linear infinite;
  -webkit-animation: rotate-spinner 0.2s linear infinite;
  border: 5px solid transparent;
}
.section-spinner .spinner .circle:first-of-type {
  border-top-color: dodgerblue;
  height: 50px;
  width: 50px;
  top: 50px;
  left: 50px;
  animation-duration: 0.85s;
}

.section-spinner .spinner .circle:nth-of-type(2) {
  border-top-color: lawngreen;
  height: 75px;
  width: 75px;
  top: 38px;
  animation-duration: 0.95s;
  left: 38px;
}
.section-spinner .spinner .circle:last-of-type {
  border-top-color: darkorange;
  animation-duration: 1.05s;
  height: 100px;
  width: 100px;
  top: 25px;
  left: 25px;
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

## image border

### effect 1

```html
<div class="section-img-border">
    <div class="position-relative transition img-container img-border-1 mb-3">
        <img src="../assets/images/game.jpg" alt="" class="img-fluid transition">
        <span class="position-absolute transition bg-primary"></span>
        <span class="position-absolute transition bg-info"></span>
        <span class="position-absolute transition bg-warning"></span>
        <span class="position-absolute transition bg-danger"></span>
    </div>
</div>
```

### effect 2

```html
<div class="section-img-border">
    <div class="position-relative transition img-container img-border-2">
        <img src="../assets/images/game.jpg" alt="" class="img-fluid transition">
        <span class="position-absolute transition bg-primary"></span>
        <span class="position-absolute transition bg-info"></span>
        <span class="position-absolute transition bg-warning"></span>
        <span class="position-absolute transition bg-danger"></span>
    </div>
</div>
```

```css
.section-img-border .img-container.img-border-1 span:nth-of-type(1),
.section-img-border .img-container.img-border-2 span:nth-of-type(1) {
  left: 0;
  top: 0;
  height: 0;
  width: 3px;
}
.section-img-border .img-container.img-border-1 span:nth-of-type(2),
.section-img-border .img-container.img-border-2 span:nth-of-type(2) {
  left: 0;
  bottom: 0;
  width: 0;
  height: 3px;
}
.section-img-border .img-container.img-border-1 span:nth-of-type(3),
.section-img-border .img-container.img-border-2 span:nth-of-type(3) {
  right: 0;
  bottom: 0;
  height: 0;
  width: 3px;
}
.section-img-border .img-container.img-border-1 span:nth-of-type(4),
.section-img-border .img-container.img-border-2 span:nth-of-type(4) {
  right: 0;
  top: 0;
  width: 0;
  height: 3px;
}

.section-img-border .img-container.img-border-1:hover span:nth-of-type(1),
.section-img-border .img-container.img-border-1:hover span:nth-of-type(3) {
  height: 100%;
}
.section-img-border .img-container.img-border-1:hover span:nth-of-type(2),
.section-img-border .img-container.img-border-1:hover span:nth-of-type(4) {
  width: 100%;
}
.section-img-border .img-container.img-border-1:hover img {
  opacity: 0.5;
  transition-delay: 0.3s;
}

.section-img-border .img-container.img-border-2:hover span:nth-of-type(1) {
  height: 100%;
}
.section-img-border .img-container.img-border-2:hover span:nth-of-type(2) {
  width: 100%;
  transition-delay: 0.5s;
}

.section-img-border .img-container.img-border-2:hover span:nth-of-type(3) {
  height: 100%;
  transition-delay: 1s;
}
.section-img-border .img-container.img-border-2:hover span:nth-of-type(4) {
  width: 100%;
  transition-delay: 1.5s;
}
.section-img-border .img-container.img-border-2:hover img {
  transition-delay: 1.5s;
  opacity: 0.5;
}
```

## input effect

```html
<div class="section-input-effect">
    <div class="position-relative">
        <input type="text" class="form-control effect" id="input-name-1" required>
        <label for="input-name-1">user name</label>
    </div>
</div>
```

```css
.section-input-effect .effect ~ label {
  position: absolute;
  left: 14px;
  width: 100%;
  pointer-events: none;
  top: 8px;
  font-size: 1rem;
  color: #aaa;
  transition: 0.3s;
}
.section-input-effect .effect:focus ~ label,
.section-input-effect .has-content.effect ~ label {
  top: -30px;
  left: 0;
  /* font-size: 0.9rem; */
  font-weight: 400;
  color: #212529;
  transition: 0.3s;
}
```

```js
$('.section-input-effect input.effect').focusout(function () {
    if ($(this).val() != '') {
        $(this).addClass('has-content');
    } else {
        $(this).removeClass('has-content');
    }
});
```

## RGBToHex

```js
function RGBToHex (r, g, b) {
  return ((r << 16) + (g << 8) + b).toString(16).padStart(6, '0');
}

RGBToHex(255, 165, 1); // 'ffa501'
```

## Convert rgb color to hex

```js
const rgbToHex = (red, green, blue) => `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1)}`;

// Or
const rgbToHex = (red, green, blue) => `#${[red, green, blue].map((v) => v.toString(16).padStart(2, '0')).join('')}`;

rgbToHex(0, 255, 255); // '#00ffff'
```

## hexToRGB

```js
function hexToRGB (hex) {
  let alpha = false, h = hex.slice(hex.startsWith('#') ? 1 : 0);
  if (h.length === 3) h = [...h].map(x => x + x).join('');
  else if (h.length === 8) alpha = true;
  h = parseInt(h, 16);
  return (
    'rgb' +
    (alpha ? 'a' : '') +
    '(' +
    (h >>> (alpha ? 24 : 16)) +
    ', ' +
    ((h & (alpha ? 0x00ff0000 : 0x00ff00)) >>> (alpha ? 16 : 8)) +
    ', ' +
    ((h & (alpha ? 0x0000ff00 : 0x0000ff)) >>> (alpha ? 8 : 0)) +
    (alpha ? `, ${h & 0x000000ff}` : '') +
    ')'
  );
};

hexToRGB('#27ae60ff'); // 'rgba(39, 174, 96, 255)'
hexToRGB('27ae60'); // 'rgb(39, 174, 96)'
hexToRGB('#fff'); // 'rgb(255, 255, 255)'
```

## Convert hex to rgb

```js
const hexToRgb = (hex) =>
    hex
        .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`)
        .substring(1)
        .match(/.{2}/g)
        .map((x) => parseInt(x, 16));

hexToRgb('#00ffff'); // [0, 255, 255]
hexToRgb('#0ff'); // [0, 255, 255]
```

## formatSeconds

```js
const formatSeconds = s => {
  const [hour, minute, second, sign] =
    s > 0
      ? [s / 3600, (s / 60) % 60, s % 60, '']
      : [-s / 3600, (-s / 60) % 60, -s % 60, '-'];

  return (
    sign +
    [hour, minute, second]
      .map(v => `${Math.floor(v)}`.padStart(2, '0'))
      .join(':')
  );
};

formatSeconds(200); // '00:03:20'
formatSeconds(-200); // '-00:03:20'
formatSeconds(99999); // '27:46:39'
```

## copyToClipboard

```js
const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
```

## Create your own query selector shorthand

```js
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const mainContent = $('.main-content');
const externalLinks = $$('a[target="_blank"]');
```

## scrollToTop

```js
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
};

scrollToTop(); // Smooth-scrolls to the top of the page
```

## smoothScroll

```js
const smoothScroll = element =>
  document.querySelector(element).scrollIntoView({
    behavior: 'smooth'
  });

smoothScroll('#fooBar'); // scrolls smoothly to the element with the id fooBar
smoothScroll('.fooBar');
// scrolls smoothly to the first element with a class of fooBar
```

## formatDuration

```js
const formatDuration = ms => {
  if (ms < 0) ms = -ms;
  const time = {
    day: Math.floor(ms / 86400000),
    hour: Math.floor(ms / 3600000) % 24,
    minute: Math.floor(ms / 60000) % 60,
    second: Math.floor(ms / 1000) % 60,
    millisecond: Math.floor(ms) % 1000
  };
  return Object.entries(time)
    .filter(val => val[1] !== 0)
    .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
    .join(', ');
};

formatDuration(1001); // '1 second, 1 millisecond'
formatDuration(34325055574);
// '397 days, 6 hours, 44 minutes, 15 seconds, 574 milliseconds'
```

# Array

## shuffle array

```js
const shuffle = ([...arr]) => {
  let m = arr.length;
  while (m) {
    const i = Math.floor(Math.random() * m--);
    [arr[m], arr[i]] = [arr[i], arr[m]];
  }
  return arr;
};

// or
const shuffle = (arr) =>
    arr
        .map((a) => ({ sort: Math.random(), value: a }))
        .sort((a, b) => a.sort - b.sort)
        .map((a) => a.value);

// Or
const shuffle = (arr) => arr.sort(() => 0.5 - Math.random());


shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]); // [9, 1, 10, 6, 8, 5, 2, 3, 7, 4]
```

## Sort an array of numbers

```js
const sort = (arr) => arr.sort((a, b) => a - b);

sort([1, 5, 2, 4, 3]); // [1, 2, 3, 4, 5]
```

## Check if an array is empty

```js
const isEmpty = (arr) => !Array.isArray(arr) || arr.length === 0;

isEmpty([]); // true
isEmpty([1, 2, 3]); // false
```

## Clone an array

```js
const clone = (arr) => arr.slice(0);

// Or
const clone = (arr) => [...arr];

// Or
const clone = (arr) => Array.from(arr);

// Or
const clone = (arr) => arr.map((x) => x);

// Or
const clone = (arr) => JSON.parse(JSON.stringify(arr));

// Or
const clone = (arr) => arr.concat([]);
```

## Convert an array of strings to numbers

```js
const toNumbers = (arr) => arr.map(Number);

// Or
const toNumbers = (arr) => arr.map((x) => +x);

toNumbers(['2', '3', '4']); // [2, 3, 4]
```

## Count the occurrences of a value in an array

```js
const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);

// Or
const countOccurrences = (arr, val) => arr.filter((item) => item === val).length;

countOccurrences([2, 1, 3, 3, 2, 3], 2); // 2
countOccurrences(['a', 'b', 'a', 'c', 'a', 'b'], 'a'); // 3
```

## Count the occurrences of array elements

```js
const countOccurrences = (arr) => arr.reduce((prev, curr) => ((prev[curr] = ++prev[curr] || 1), prev), {});

countOccurrences([2, 1, 3, 3, 2, 3]); // { '1': 1, '2': 2, '3': 3 }
countOccurrences(['a', 'b', 'a', 'c', 'a', 'b']); // { 'a': 3, 'b': 2, 'c': 1 }
```

## Create an array of numbers in the given range

```js
const range = (min, max) => [...Array(max - min + 1).keys()].map((i) => i + min);

// Or
const range = (min, max) =>
    Array(max - min + 1)
        .fill(0)
        .map((_, i) => min + i);

// Or
const range = (min, max) => Array.from({ length: max - min + 1 }, (_, i) => min + i);

range(5, 10); // [5, 6, 7, 8, 9, 10]
```

## Generate an array of alphabet characters

```js
const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

// Or
const alphabet = [...'abcdefghijklmnopqrstuvwxyz'];

// Or
const alphabet = Array(26)
    .fill(0)
    .map((_, i) => String.fromCharCode(i + 97));

// Or
const alphabet = [...Array(26).keys()].map((i) => String.fromCharCode(i + 97));

// Or
const alphabet = [...Array(26)].map((_, i) => (i + 10).toString(36));

// Or
const alphabet = String.fromCharCode(
    ...' '
        .repeat(26)
        .split('')
        .map((_, i) => i + 97)
).split('');
```

## Get indices of a value in an array

```js
const indices = (arr, value) => arr.reduce((acc, v, i) => (v === value ? [...acc, i] : acc), []);

// Or
const indices = (arr, value) => arr.map((v, i) => (v === value ? i : false)).filter(Boolean);

indices(['h', 'e', 'l', 'l', 'o'], 'l'); // [2, 3]
indices(['h', 'e', 'l', 'l', 'o'], 'w'); // []
```

## Get the average of an array

```js
const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
```

## Flatten an array

```js
const flat = (arr) =>
    [].concat.apply(
        [],
        arr.map((a) => (Array.isArray(a) ? flat(a) : a))
    );

// Or
const flat = (arr) => arr.reduce((a, b) => (Array.isArray(b) ? [...a, ...flat(b)] : [...a, b]), []);

// Or
// See the browser compatibility at https://caniuse.com/#feat=array-flat
const flat = (arr) => arr.flat();
```

## Get the intersection of arrays

```js
const getIntersection = (a, ...arr) => [...new Set(a)].filter((v) => arr.every((b) => b.includes(v)));

getIntersection([1, 2, 3], [2, 3, 4, 5]); // [2, 3]
getIntersection([1, 2, 3], [2, 3, 4, 5], [1, 3, 5]); // [3]
```

## Get union of arrays

```js
const union = (...arr) => [...new Set(arr.flat())];
```

## Get the sum of an array of numbers

```js
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
```

## Get the unique values of an array

```js
const unique = (arr) => [...new Set(arr)];

// Or
const unique = (arr) => arr.filter((el, i, array) => array.indexOf(el) === i);

// Or
const unique = (arr) => arr.reduce((acc, el) => (acc.includes(el) ? acc : [...acc, el]), []);
```

## Merge two arrays

```js
// Merge but don't remove the duplications
const merge = (a, b) => a.concat(b);
// Or
const merge = (a, b) => [...a, ...b];

// Merge and remove the duplications
const merge = (a, b) => [...new Set(a.concat(b))];
// Or
const merge = (a, b) => [...new Set([...a, ...b])];
```

## Remove duplicate values in an array

```js
const removeDuplicate = (arr) => arr.filter((i) => arr.indexOf(i) === arr.lastIndexOf(i));

removeDuplicate(['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']); //  ['h', 'e', 'w', 'r', 'd']
```

# Date

## Calculate the number of difference days between two dates

```js
const diffDays = (date, otherDate) => Math.ceil(Math.abs(date - otherDate) / (1000 * 60 * 60 * 24));

diffDays(new Date('2014-12-19'), new Date('2020-01-01')); // 1839
```

## Calculate the number of months between two dates

```js
const monthDiff = (startDate, endDate) => Math.max(0, (endDate.getFullYear() - startDate.getFullYear()) * 12 - startDate.getMonth() + endDate.getMonth());

monthDiff(new Date('2020-01-01'), new Date('2021-01-01')); // 12
```

## Convert a date to `YYYY-MM-DD` format

```js
// `date` is a `Date` object
const formatYmd = (date) => date.toISOString().slice(0, 10);

formatYmd(new Date()); // 2020-05-06
```

## Convert seconds `to hh:mm:ss` format

```js
// `s` is number of seconds
const formatSeconds = (s) => new Date(s * 1000).toISOString().substr(11, 8);

// Or
const formatSeconds = (s) => new Date(s * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];

// Or
const formatSeconds = (s) => [parseInt(s / 60 / 60), parseInt((s / 60) % 60), parseInt(s % 60)].join(':').replace(/\b(\d)\b/g, '0$1');

formatSeconds(200); // 00:03:20
formatSeconds(500); // 00:08:20
```

## Extract year, month, day, hour, minute, second and millisecond from a date

```js
// `date` is a `Date` object
const extract = (date) =>
    date
        .toISOString()
        .split(/[^0-9]/)
        .slice(0, -1);

// `extract` is an array of [year, month, day, hour, minute, second, millisecond]
```

## Get the current quarter of a date

```js
const getQuarter = (d = new Date()) => Math.ceil((d.getMonth() + 1) / 3);
```

## Get the tomorrow date

```js
const tomorrow = ((d) => new Date(d.setDate(d.getDate() + 1)))(new Date());

// Or
const tomorrow = new Date(new Date().valueOf() + 1000 * 60 * 60 * 24);
```

## Get the yesterday date

```js
const yesterday = ((d) => new Date(d.setDate(d.getDate() - 1)))(new Date());

// Or
const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24);
```

# JS DOM

## Check if an element is a descendant of another

```js
const isDescendant = (child, parent) => parent.contains(child);
```

## Check if the touch events are supported

```js
const touchSupported = () => 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch);
```

## Check if user scrolls to the bottom of the page

```js
const isAtBottom = () => document.documentElement.clientHeight + window.scrollY >= document.documentElement.scrollHeight;
```

## Detect Internet Explorer browser 🥲

```js
const isIE = !!document.documentMode;
```

## Detect macOS browser 🤑

```js
const isMacBrowser = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
```

## Get all siblings of an element

```js
const siblings = (ele) => [].slice.call(ele.parentNode.children).filter((child) => child !== ele);
```

## Get the position of an element relative to the document

```js
const getPosition = (ele) => ((r = ele.getBoundingClientRect()), { left: r.left + window.scrollX, top: r.top + window.scrollY });

getPosition(document.body); // { left: 0, top: 0 }
```

## Get the selected text

```js
const getSelectedText = () => window.getSelection().toString();
```

## Insert given HTML after an element

```js
const insertHtmlAfter = (html, ele) => ele.insertAdjacentHTML('afterend', html);
```

## Insert given HTML before an element

```js
const insertHtmlBefore = (html, ele) => ele.insertAdjacentHTML('beforebegin', html);
```

## Redirect to another page

```js
const goTo = (url) => (location.href = url);
```

## Reload the current page

```js
const reload = () => location.reload();

// Or
const reload = () => (location.href = location.href);
```

## Toggle an element

```js
const toggle = (ele) => (ele.style.display = ele.style.display === 'none' ? 'block' : 'none');

// Or
const toggle = (ele) => (ele.hidden = !ele.hidden);
```

# Function

## Execute a function once

```js
const once = (fn) =>
    (
        (ran = false) =>
        () =>
            ran ? fn : ((ran = !ran), (fn = fn()))
    )();
```

## Logical xor operator

```js
// returns `true` if one of the arguments is truthy and the other is falsy

const xor = (a, b) => (a && !b) || (!a && b);

// Or
const xor = (a, b) => !(!a && !b) && !(a && b);

// Or
const xor = (a, b) => Boolean(!a ^ !b);
```

# misc

## Clear all cookies

```js
const clearCookies = () => document.cookie.split(';').forEach((c) => (document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)));
```

## Convert 3 digits color to 6 digits color

```js
const toFullHexColor = (color) =>
    `#${(color.startsWith('#') ? color.slice(1) : color)
        .split('')
        .map((c) => `${c}${c}`)
        .join('')}`;

toFullHexColor('123'); // '#112233'
toFullHexColor('#123'); // '#112233'
toFullHexColor('#abc'); // '#aabbcc'
```

## Convert Celsius to Fahrenheit

```js
const celsiusToFahrenheit = (celsius) => (celsius * 9) / 5 + 32;
```

## Convert Fahrenheit to Celsius

```js
const fahrenheitToCelsius = (fahrenheit) => ((fahrenheit - 32) * 5) / 9;

fahrenheitToCelsius(59); // 15
fahrenheitToCelsius(32); // 0
```

## Convert cookie to object

```js
const cookies = document.cookie
    .split(';')
    .map((item) => item.split('='))
    .reduce((acc, [k, v]) => (acc[k.trim().replace('"', '')] = v) && acc, {});
```

## Convert URL parameters to object

```js
const getUrlParams = (query) => Array.from(new URLSearchParams(query)).reduce((p, [k, v]) => Object.assign({}, p, { [k]: p[k] ? (Array.isArray(p[k]) ? p[k] : [p[k]]).concat(v) : v }), {});


getUrlParams(location.search); // Get the parameters of the current URL
getUrlParams('foo=Foo&bar=Bar'); // { foo: "Foo", bar: "Bar" }

// Duplicate key
getUrlParams('foo=Foo&foo=Fuzz&bar=Bar'); // { foo: ["Foo", "Fuzz"], bar: "Bar" }
```

## Detect dark mode

```js
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## Get type of a variable in string

```js
const getTypeOf = (obj) => Object.prototype.toString.call(obj).match(/\[object (.*)\]/)[1];


getTypeOf('hello world'); // String
getTypeOf(1000); // Number
getTypeOf(Infinity); // Number
getTypeOf(true); // Boolean
getTypeOf(Symbol()); // Symbol
getTypeOf(null); // Null
getTypeOf(undefined); // Undefined
getTypeOf({}); // Object
getTypeOf([]); // Array
getTypeOf(/[a-z]/g); // RegExp
getTypeOf(new Date(2021)); // Date
getTypeOf(new Error()); // Error
getTypeOf(function () {}); // Function
getTypeOf((a, b) => a + b); // Function
getTypeOf(async () => {}); // AsyncFunction
getTypeOf(document); // HTMLDocument
```

## Swap two variables

```js
[a, b] = [b, a];

// Or
a = [b, (b = a)][0];

// Or
a = ((x) => x)(b, (b = a));

// Or
// (only works with numbers)
a = b + ((b = a), 0);

a = b * ((b = a), 1);
```
