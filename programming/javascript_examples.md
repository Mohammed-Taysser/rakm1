
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
```
