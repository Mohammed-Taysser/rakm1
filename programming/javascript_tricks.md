
# js examples

## resources

- <https://1loc.dev/>
- <https://shortcode.dev/javascript-cheatsheet>

## Auto Load || ready Function

```js
(function() {
   // your page initialization code here
   // the DOM will be available here
})();
```

## document notification

```js
let old_title = document.title;
document.title += '(5)'
```

## Check Internet

```js
navigator.onLine    // false || true
```

## check local-storage support

```js
function is_support_local_host() {
    try {
        return 'localStorage' in window && window.localStorage !=== null;
    } catch (error) {
        return false;
    }
}
```

## English Digits to arabic Digits

```js
function toIndiaDigits (num) {
    let id = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, function (w) {
        return id[+w]
    });
}
```

## quantity button

```html
<div class="d-flex align-items-center qty-container">
    <button class="btn-qty btn-qty-down"> <i class="fas fa-minus"></i> </button>
    <input class="form-qty" type="number" name="quantity" value="1">
    <button class="btn-qty btn-qty-up"> <i class="fas fa-plus"></i> </button>
</div>
```

```scss
.qty-container .btn-qty {
  background: none;
  color: #042825;
  border: 1px solid #ced4da;
  height: 40px;
  width: auto;
  padding: 0 10px;
  font-size: 13px;
  cursor: pointer;
}

.qty-container .btn-qty.btn-qty-up {
  border-radius: 0px 3px 3px 0px;
}

.qty-container input.form-qty {
  -moz-appearance: textfield;
  height: 40px;
  border: none;
    border-top-color: currentcolor;
    border-top-style: none;
    border-top-width: medium;
    border-bottom-color: currentcolor;
    border-bottom-style: none;
    border-bottom-width: medium;
  background: #ffffff;
  text-align: center;
  width: 50px;
  border-top: 1px solid #ced4da;
  border-bottom: 1px solid #ced4da;
  color: #042825;
  vertical-align: middle;
}

.qty-container .btn-qty.btn-qty-down {
  border-radius: 3px 0px 0px 3px;
}
```

```js
let qty_container = document.querySelectorAll('.qty-container');
if(qty_container){
    Array.from(qty_container).forEach(item => {
        let qty_plus = item.querySelector('.btn-qty-up'), 
            qty_minus = item.querySelector('.btn-qty-down'),
            qty_input = item.querySelector('.form-qty');

            qty_minus.onclick = function(){
                if(qty_input.value > 1){
                    qty_input.value = parseInt(qty_input.value, 10) - 1;
                }
            }

            qty_plus.onclick = function(){
                if(qty_input.value >= 1){
                    qty_input.value = parseInt(qty_input.value, 10) + 1;
                }
            }
    });
}
```

## print the page

```js
window.print()
```

## prevent right click

```js
document.addEventListener('contextmenu', function(e){
    e.preventDefault();
})
```

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

## Create an one-time event handler

```js
const handler = (e) => {
    // Do something ...
    element.removeEventListener('click', handler);
};

element.addEventListener('click', handler);
```

## date counter

```js
<script>
(function(){
    // Targeted date
    var countDownDate = new Date("Jun 2, 2025 23:59:59").getTime();
    // Update the count down every 1 second
    var x = setInterval(function() {
        // Get current date and time
        var now = new Date().getTime();
        // Time to the date
        var timeToDate = countDownDate - now;
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(timeToDate / (1000 * 60 * 60 * 24));
        var hours = Math.floor((timeToDate % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((timeToDate % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((timeToDate % (1000 * 60)) / 1000);
        // Display the result in the element with id="counter"
        document.getElementById("counter").innerHTML = days + "<small>d</small> " + hours + "<small>h</small> " + minutes + "<small>m</small> " + seconds + "<small>s</small> ";
        // If the countdown is finished, display a message 
        if (timeToDate < 0) {
            clearInterval(x);
            document.getElementById("counter").innerHTML = "Countdown finished";
        }
    }, 1000);

})();
</script>

<div id="counter"></div>
```

## mouse position

```js
window.addEventListener("mousemove", function(e){
    console.log("Mouse position: Y " + e.clientY, ", X " + e.clientY, );
});
```

## offline online network

```js
window.addEventListener('online', ()=> console.log("online"));
window.addEventListener('offline', ()=> console.log("offline"));
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

## prevent user from leaving page

```js
window.onbeforeunload = function(e) {
        window.open(document.URL,"_blank");
        return 'Dialog text here.';
};
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

//  or
document.documentElement.scrollTo({
    top: 0,
    left:0,
    behavior: 'smooth'
});
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

## different between `search` and `indexOf`

with search we can use regular expression but not start position unlike `indexOf` we can use start position but not regular expression

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

## search on array

includes(searchElement, fromIndex)

```js
const array1 = [1, 2, 3];

console.log(array1.includes(2));
// expected output: true
[1, 2, 3].includes(2)         // true
[1, 2, 3].includes(4)         // false
[1, 2, 3].includes(3, 3)      // false
[1, 2, 3].includes(3, -1)     // true
[1, 2, NaN].includes(NaN)     // true
["1", "2", "3"].includes(3)   // false
```

## min & max element on array

```js
Math.max.apply(null,arrayName) // max element on array
Math.maxapply(...arrayName)    // max element on array

Math.min.apply(null,arrayName) // min element on array
Math.minapply(...arrayName)    // min element on array
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
const merge = (a, b) => [].concat(a, b);
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

## Check if a date is between two dates

```js
// `min`, `max` and `date` are `Date` instances
const isBetween = (date, min, max) => date.getTime() >= min.getTime() && date.getTime() <= max.getTime();
```

## Check if a date is today

```js
// `date` is a Date object
const isToday = (date) => date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
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

## Scroll to an element

```js
ele.scrollIntoView({ behavior: 'smooth' });
```

## Change the website favicon

```js
const setFavicon = function (url) {
    // Find the current favicon element
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        // Update the new link
        favicon.href = url;
    } else {
        // Create new `link`
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = url;

        // Append to the `head` element
        document.head.appendChild(link);
    }
};

setFavicon('/path/to/user/profile/icon.ico');
```

## Use an emoji as the favicon

```js
const emojiFavicon = function (emoji) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.height = 64;
    canvas.width = 64;

    // Get the canvas context
    const context = canvas.getContext('2d');
    context.font = '64px serif';
    context.fillText(emoji, 0, 64);

    // Get the custom URL
    const url = canvas.toDataURL();

    // Update the favicon
    setFavicon(url);
};

// Usage
emojiFavicon('🎉');
```

## Detect dark mode

```js
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
```

## Check if an element is in the viewport

```js
const isInViewport = function (ele) {
    const rect = ele.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
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

## check specified type

```js
isNaN( varName )      // return true if is undefine variable
isFinite( varName )   // return true if is finite variable
isInteger( varName )  // return true if is int variable
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

## Check if a given integer is a prime number

```js
const isPrime = (n) =>
    n > 1 &&
    Array(Math.floor(Math.sqrt(n)) - 1)
        .fill(0)
        .map((_, i) => i + 2)
        .every((i) => n % i !== 0);
```

## Check if a number is negative

```js
const isNegative = (n) => Math.sign(n) === -1;

// Or
const isNegative = (n) => n < 0;
```

## Check if a number is positive

```js
const isPositive = (n) => Math.sign(n) === 1;
```

## Check if a number is odd

```js
const isOdd = (n) => n % 2 !== 0;

// Or
const isOdd = (n) => !!(n & 1);

// Or
const isOdd = (n) => !Number.isInteger(n / 2);
```

# Random

## Generate a random boolean

```js
const randomBoolean = () => Math.random() >= 0.5;
```

## Generate a random floating point number in given range

```js
const randomFloat = (min, max) => Math.random() * (max - min) + min;
```

## Generate a random integer in given range

```js
const randomInteger = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
```

## Generate a random hex color

```js
const randomColor = () => `#${Math.random().toString(16).slice(2, 8).padEnd(6, '0')}`;

// Or
const randomColor = () => `#${(~~(Math.random() * (1 << 24))).toString(16)}`;
```

## Generate an array of random integers in a given range

```js
randomArrayInRange(1, 100, 10); // [11, 82, 41, 35, 76, 83, 43, 15, 60, 54]
```

## Get a random item from an array

```js
const randomItem = (arr) => arr[(Math.random() * arr.length) | 0];
```

## Get random items of an array

```js
const randomItems = (arr, count) => arr.concat().reduce((p, _, __, arr) => (p[0] < count ? [p[0] + 1, p[1].concat(arr.splice((Math.random() * arr.length) | 0, 1))] : p), [0, []])[1];


randomItems([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3); // [4, 8, 5]
randomItems(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 4); // ['e', 'c', 'h', 'j']
```

# String

## Convert a letter to associate emoji

```js
const letterToEmoji = (c) => String.fromCodePoint(c.toLowerCase().charCodeAt(0) + 127365);


letterToEmoji('a'); // 🇦
letterToEmoji('b'); // 🇧
```

## Convert a string to URL slug

```js
const slugify = (str) =>
    str
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');


slugify('Chapter One: Once upon a time...'); // 'chapter-one-once-upon-a-time'
```

## Count the number of words in a string

```js
const countWords = (str) => str.trim().split(/\s+/).length;


countWords('Hello World'); // 2
countWords('Hello    World'); // 2
countWords('  Hello  World  '); // 2
```

## Get the number of a character in a string

```js
const characterCount = (str, char) => str.split(char).length - 1;

// Or
const characterCount = (str, char) => str.replace(new RegExp(String.raw`[^${char}]`, 'g'), '').length;


characterCount('192.168.1.1', '.'); // 3
characterCount('star wars', 's'); // 2
```

## Reverse a string

```js
const reverse = (str) => str.split('').reverse().join('');

// Or
const reverse = (str) => [...str].reverse().join('');

// Or
const reverse = (str) => str.split('').reduce((rev, char) => `${char}${rev}`, '');

// Or
const reverse = (str) => (str === '' ? '' : `${reverse(str.substr(1))}${str.charAt(0)}`);
```

## Truncate a string at full words

```js
const truncate = (str, max, suffix) => (str.length < max ? str : `${str.substr(0, str.substr(0, max - suffix.length).lastIndexOf(' '))}${suffix}`);

truncate('This is a long message', 20, '...'); // 'This is a long...'
```

# RegExp (regular expression)

## password pattern

```js
// Password (UpperCase, LowerCase, Number/SpecialChar and min 8 Chars
(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$
```

# Front-end Tips

## Always pass the radix to parseInt

```js
parseInt('50', 10); // 50
```

## Always use `noopener` or `noreferrer` for links opened in new tabs

```js
window.opener.location = 'http://fake.website.here';
```

```html
<!-- Don't -->
<a target="_blank">...</a>

<!-- Do -->
<a target="_blank" rel="noopener">...</a>

<!-- Or -->
<a target="_blank" rel="noreferrer">...</a>
<a target="_blank" rel="noopener noreferrer">...</a>
```

## some rule while coding JS

- var and function are in camelCase
- `global` and `constant` are in **UPPERCASE**
- filename are in **lowercase**
- let `space` between **separator** like `+, - ...`
- short statement can be in one line
- `let i, len = arr.length;` best in performance than `for(i=0; i< len; i++)`
- avoid using `new` word it's bad in performance
- if we using `html` element more it's better put it into variable like `let`, `var` it effect on performance
- `onload`, `onunload` ues to deal with cookie and browser type
- there are two type of event
  - bubbling propagation(default)
  - capturing propagation
- `selector.addEventListener('event', function, false|true)`  by default `false` which mean we are using bubbling propagation
- use try & catch
    ```js
    try{
        throw 'any data type';
        .....
    }
    catch (er){
        er.message;
        ......
    }
    finally{
        'code execute after try/catch' ;
    }
    ```

# Advanced Examples

## [Make a draggable element](https://htmldom.dev/make-a-draggable-element/)

```html
<div id="dragMe" class="draggable">Drag me</div>
```

```scss
.draggable {
    /* Indicate the element draggable */
    cursor: move;

    /* It will be positioned absolutely */
    position: absolute;

    /* Doesn't allow to select the content inside */
    user-select: none;
}
```

```js
/ The current position of mouse
let x = 0;
let y = 0;

// Query the element
const ele = document.getElementById('dragMe');

// Handle the mousedown event
// that's triggered when user drags the element
const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    // Set the position of element
    ele.style.top = `${ele.offsetTop + dy}px`;
    ele.style.left = `${ele.offsetLeft + dx}px`;

    // Reassign the position of mouse
    x = e.clientX;
    y = e.clientY;
};

const mouseUpHandler = function () {
    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

ele.addEventListener('mousedown', mouseDownHandler);
```

## [Drag to scroll](https://htmldom.dev/drag-to-scroll/)

User often uses the mouse to scroll in a scrollable container. In addition to that, some applications also allow user to scroll by dragging the element. You can see that feature implemented in a PDF viewer, Figma and many more.
This post shows you a simple way to archive that feature with vanilla JavaScript.
Assume that we have a scrollable container as below:

```html
<div id="container" class="container">...</div>
```

```scss
.container {
    cursor: grab;
    overflow: auto;
}
```

```js
// Scroll to given position
const ele = document.getElementById('container');
ele.scrollTop = 100;
ele.scrollLeft = 150;
```

The implementation is quite straightforward. By using the similar technique in the Make a draggable element post, we start with handling the mousedown event which occurs when user clicks the element:

```js
let pos = { top: 0, left: 0, x: 0, y: 0 };

const mouseDownHandler = function (e) {
    pos = {
        // The current scroll
        left: ele.scrollLeft,
        top: ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};



const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
};

// Last but not least, we can improve the user experience by setting some CSS properties when user starts moving the mouse:
const mouseDownHandler = function(e) {
    // Change the cursor and prevent user from selecting the text
    ele.style.cursor = 'grabbing';
    ele.style.userSelect = 'none';
    ...
};

// These CSS properties are reset when the mouse is released:
const mouseUpHandler = function () {
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);

    ele.style.cursor = 'grab';
    ele.style.removeProperty('user-select');
};
```

## [Create a custom scrollbar](https://htmldom.dev/create-a-custom-scrollbar/)

Unfortunately, the `-webkit-scrollbar` styles aren't standard and isn't **recommended** to use on **production** sites.

```scss
body::-webkit-scrollbar {
    width: 0.75rem;
}
*::-webkit-scrollbar-track {
    background-color: #edf2f7;
}
*::-webkit-scrollbar-thumb {
    background-color: #718096;
    border-radius: 9999px;
}
```

### Hide the default scrollbar

```html
<div id="wrapper" class="wrapper">
    <div id="content" class="content">...</div>
</div>
```

```scss
.wrapper {
    max-height: 32rem;
    overflow: hidden;
}
.content {
    height: 100%;
    overflow: auto;
}
// It's easy to hide the default scrollbar by using a negative margin:
.content {
    margin-right: -1rem;
    padding-right: 1rem;
}
```

### Position the fake scrollbar

```html
<div id="wrapper">...</div>

<!-- Use an anchor -->
<div id="anchor" style="left: 0; position: absolute; top: 0"></div>

<!-- Fake scrollbar -->
<div id="scrollbar" style="position: absolute; width: .75rem;"></div>
```

The scrollbar is shown at the desired position by setting the top and left styles:

```js
// Query elements
const wrapper = document.getElementById('wrapper');
const content = document.getElementById('content');
const anchor = document.getElementById('anchor');
const scrollbar = document.getElementById('scrollbar');

// Get the bounding rectangles
const wrapperRect = wrapper.getBoundingClientRect();
const anchorRect = anchor.getBoundingClientRect();

// Set the scrollbar position
const top = wrapperRect.top - anchorRect.top;
const left = wrapperRect.width + wrapperRect.left - anchorRect.left;
scrollbar.style.top = `${top}px`;
scrollbar.style.left = `${left}px`;
```

The scrollbar has the same height as the wrapper:

```js
scrollbar.style.height = `${wrapperRect.height}px`;
```

### Organize the scrollbar

```html
<div id="scrollbar">
    <div id="track" class="track"></div>
    <div id="thumb" class="thumb"></div>
</div>
```

```scss


.track {
    left: 0;
    position: absolute;
    top: 0;

    /* Take full size */
    height: 100%;
    width: 100%;
}
.thumb {
    left: 0;
    position: absolute;

    /* Take full width */
    width: 100%;
}
```

```js
// Initially, the thumb's height is calculated based on the ratio between normal and scroll heights of the content element:
const track = document.getElementById('track');
const thumb = document.getElementById('thumb');

const scrollRatio = content.clientHeight / content.scrollHeight;
thumb.style.height = `${scrollRatio * 100}%`;
```

### Drag the thumb to scroll

```js
let pos = { top: 0, y: 0 };

const mouseDownThumbHandler = function (e) {
    pos = {
        // The current scroll
        top: content.scrollTop,
        // Get the current mouse position
        y: e.clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dy = e.clientY - pos.y;

    // Scroll the content
    content.scrollTop = pos.top + dy / scrollRatio;
};

// Attach the `mousedown` event handler
thumb.addEventListener('mousedown', mouseDownThumbHandler);


// When user drags the thumb element as well as scroll the content element, we have to update the position of the thumb element. Here is the scroll event handler of the content element:
const scrollContentHandler = function () {
    window.requestAnimationFrame(function () {
        thumb.style.top = `${(content.scrollTop * 100) / content.scrollHeight}%`;
    });
};

content.addEventListener('scroll', scrollContentHandler);
```

### Jump when clicking the track

```js
const trackClickHandler = function (e) {
    const bound = track.getBoundingClientRect();
    const percentage = (e.clientY - bound.top) / bound.height;
    content.scrollTop = percentage * (content.scrollHeight - content.clientHeight);
};

track.addEventListener('click', trackClickHandler);
```

## [Preview an image before uploading it](https://htmldom.dev/preview-an-image-before-uploading-it/)

```html
<input type="file" id="fileInput" />

<img id="preview" />
```

```js
const fileEle = document.getElementById('fileInput');
const previewEle = document.getElementById('preview');

fileEle.addEventListener('change', function (e) {
    // Get the selected file
    const file = e.target.files[0];

    // Create a new URL that references to the file
    const url = URL.createObjectURL(file);

    // Set the source for preview element
    previewEle.src = url;
});

fileEle.addEventListener('change', function (e) {
    // Get the selected file
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.addEventListener('load', function () {
        // Set the source for preview element
        previewEle.src = reader.result;
    });

    reader.readAsDataURL(file);
});
```

## Create an image comparison slider

```html
<div class="container">
    <!-- Show the modified image -->
    <div class="modified-image"></div>

    <!-- The resizer -->
    <div class="resizer" id="dragMe"></div>

    <!-- The original image -->
    <img src="/path/to/original/image.png" />
</div>
```

```scss
.container {
    position: relative;
}
.modified-image {
    /* Absolute position */
    left: 0;
    position: absolute;
    top: 0;

    /* Take full height and half width of container */
    height: 100%;
    width: 50%;
}
```

We don't use the img tag to display the modified image here because the image could be scaled. Instead, we use the modified image as the background of modified element:

```html
<div class="modified-image" style="background-image: url('/path/to/modified/image.png')"></div>
```

```scss
.modified-image {
    background-position: top left;
    background-repeat: no-repeat;
    background-size: auto 100%;
    ...;
}
```

It's a lot easier to set the position for the resizer. It is displayed at the center of container:

```scss
.resizer {
    /* Absolute position */
    left: 50%;
    position: absolute;
    top: 0;

    /* Size */
    height: 100%;
    width: 2px;

    /* Background */
    background-color: #cbd5e0;

    /* Indicate that it can be resized */
    cursor: ew-resize;
}
```

```js
const resizer = document.getElementById('dragMe');
const leftSide = resizer.previousElementSibling;

// The current position of mouse
let x = 0;
let y = 0;

// The width of modified element
let leftWidth = 0;

// Handle the mousedown event
// that's triggered when user drags the resizer
const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    let newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    newLeftWidth = Math.max(newLeftWidth, 0);
    newLeftWidth = Math.min(newLeftWidth, 100);

    // Set the width for modified and resizer elements
    leftSide.style.width = `${newLeftWidth}%`;
    resizer.style.left = `${newLeftWidth}%`;
};

// Attach the handler
resizer.addEventListener('mousedown', mouseDownHandler);

// When user moves the mouse around, we have to make sure that the mouse isn't moved to out of the container. That's why we have to compare the newLeftWidth with 0 and 100 percentages:

const mouseMoveHandler = function(e) {
    ...

    newLeftWidth = Math.max(newLeftWidth, 0);
    newLeftWidth = Math.min(newLeftWidth, 100);
};
```

## [Create resizable split views](https://htmldom.dev/create-resizable-split-views/)

In order to place the left, resizer and right elements in the same row, we add the `display: flex` style to the parent.

```html
<div style="display: flex">
    <!-- Left element -->
    <div>Left</div>

    <!-- The resizer -->
    <div class="resizer" id="dragMe"></div>

    <!-- Right element -->
    <div style="flex: 1 1 0%;">Right</div>
</div>
```

```js
// Update the width of left side when dragging the resizer element
const resizer = document.getElementById('dragMe');
const leftSide = resizer.previousElementSibling;
const rightSide = resizer.nextElementSibling;

// The current position of mouse
let x = 0;
let y = 0;

// Width of left side
let leftWidth = 0;

// Handle the mousedown event
// that's triggered when user drags the resizer
const mouseDownHandler = function (e) {
    // Get the current mouse position
    x = e.clientX;
    y = e.clientY;
    leftWidth = leftSide.getBoundingClientRect().width;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

// Attach the handler
resizer.addEventListener('mousedown', mouseDownHandler);

const leftSide = resizer.previousElementSibling;
const rightSide = resizer.nextElementSibling;

const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - x;
    const dy = e.clientY - y;

    const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
    leftSide.style.width = `${newLeftWidth}%`;
};


const mouseUpHandler = function () {
    resizer.style.removeProperty('cursor');
    document.body.style.removeProperty('cursor');

    leftSide.style.removeProperty('user-select');
    leftSide.style.removeProperty('pointer-events');

    rightSide.style.removeProperty('user-select');
    rightSide.style.removeProperty('pointer-events');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};
```

### Support vertical direction

```js
const prevSibling = resizer.previousElementSibling;
let prevSiblingHeight = 0;

const mouseDownHandler = function (e) {
    const rect = prevSibling.getBoundingClientRect();
    prevSiblingHeight = rect.height;
};

const mouseMoveHandler = function (e) {
    const h = ((prevSiblingHeight + dy) * 100) / resizer.parentNode.getBoundingClientRect().height;
    prevSibling.style.height = `${h}%`;
};

// We also change the cursor when user moves the resizer element:
const mouseMoveHandler = function(e) {
    ...
    resizer.style.cursor = 'row-resize';
    document.body.style.cursor = 'row-resize';
};
```

### Support both directions

```html
<div style="display: flex">
    <div>Left</div>
    <div class="resizer" data-direction="horizontal"></div>

    <!-- The right side -->
    <div style="display: flex; flex: 1 1 0%; flex-direction: column">
        <div>Top</div>
        <div class="resizer" data-direction="vertical"></div>
        <div style="flex: 1 1 0%">Bottom</div>
    </div>
</div>
```

```js
const direction = resizer.getAttribute('data-direction') || 'horizontal';

const mouseMoveHandler = function(e) {
    switch (direction) {
        case 'vertical':
            const h = (prevSiblingHeight + dy) * 100 / resizer.parentNode.getBoundingClientRect().height;
            prevSibling.style.height = `${h}%`;
            break;
        case 'horizontal':
        default:
            const w = (prevSiblingWidth + dx) * 100 / resizer.parentNode.getBoundingClientRect().width;
            prevSibling.style.width = `${w}%`;
            break;
    }

    const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    resizer.style.cursor = cursor;
    document.body.style.cursor = cursor;

    ...
};
```

## [Drag and drop element in a list](https://htmldom.dev/drag-and-drop-element-in-a-list/)

```html
<div id="list">
    <div class="draggable">A</div>
    <div class="draggable">B</div>
    <div class="draggable">C</div>
    <div class="draggable">D</div>
    <div class="draggable">E</div>
</div>
```

```scss
.draggable {
    cursor: move;
    user-select: none;
}
```

```js
// The current dragging item
let draggingEle;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;

const mouseDownHandler = function (e) {
    draggingEle = e.target;

    // Calculate the mouse position
    const rect = draggingEle.getBoundingClientRect();
    x = e.pageX - rect.left;
    y = e.pageY - rect.top;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function (e) {
    // Set position for dragging element
    draggingEle.style.position = 'absolute';
    draggingEle.style.top = `${e.pageY - y}px`;
    draggingEle.style.left = `${e.pageX - x}px`;
};

const mouseUpHandler = function () {
    // Remove the position styles
    draggingEle.style.removeProperty('top');
    draggingEle.style.removeProperty('left');
    draggingEle.style.removeProperty('position');

    x = null;
    y = null;
    draggingEle = null;

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};

// Now we can attach the mousedown event to each item by looping over the list of items:
// Query the list element
const list = document.getElementById('list');

// Query all items
[].slice.call(list.querySelectorAll('.draggable')).forEach(function (item) {
    item.addEventListener('mousedown', mouseDownHandler);
});
```

### Add a placeholder

Let's take a look at the list of items again: `A B C D E`

When we drag an item, C for example, the next item (D) will move up to the top and takes the area of the dragging element (C). To fix that, we create a dynamic placeholder element and `insert` it right before the dragging element. The height of placeholder must be the same as dragging element.
The placeholder is created once during the mouse moving, so we add a new flag `isDraggingStarted` to track it:

```js


let placeholder;
let isDraggingStarted = false;

const mouseMoveHandler = function(e) {
    const draggingRect = draggingEle.getBoundingClientRect();

    if (!isDraggingStarted) {
        // Update the flag
        isDraggingStarted = true;

        // Let the placeholder take the height of dragging element
        // So the next element won't move up
        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        draggingEle.parentNode.insertBefore(
            placeholder,
            draggingEle.nextSibling
        );

        // Set the placeholder's height
        placeholder.style.height = `${draggingRect.height}px`;
    }

    ...
}

// The placeholder will be removed as soon as the users drop the item:
const mouseUpHandler = function() {
    // Remove the placeholder
    placeholder && placeholder.parentNode.removeChild(placeholder);
    // Reset the flag
    isDraggingStarted = false;

    ...
};
```

### Determine if user moves item up or down

```js
const isAbove = function (nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

// As user moves the item around, we define the previous and next sibling items:
const mouseMoveHandler = function (e) {
    // The current order:
    // prevEle
    // draggingEle
    // placeholder
    // nextEle
    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;
};

// If user moves the item to the top, we will swap the placeholder and the previous item:
const mouseMoveHandler = function(e) {
    ...

    // User moves item to the top
    if (prevEle && isAbove(draggingEle, prevEle)) {
        // The current order    -> The new order
        // prevEle              -> placeholder
        // draggingEle          -> draggingEle
        // placeholder          -> prevEle
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
    }
};

// Similarly, we will swap the next and dragging item if we detect that user moves item down to the bottom:
const mouseMoveHandler = function(e) {
    ...

    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
        // The current order    -> The new order
        // draggingEle          -> nextEle
        // placeholder          -> placeholder
        // nextEle              -> draggingEle
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    }
};

// Here, swap is a small function for swapping two nodes:
const swap = function (nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
};
```

## [Resize columns of a table](https://htmldom.dev/resize-columns-of-a-table/)

```html
<table id="resizeMe" class="table">
    ...
</table>
```

```scss
.table th {
    position: relative;
}
.resizer {
    /* Displayed at the right side of column */
    position: absolute;
    top: 0;
    right: 0;
    width: 5px;
    cursor: col-resize;
    user-select: none;
}
```

```js
// To create resizers and append them to columns, we have to query and loop over all columns:

// Query the table
const table = document.getElementById('resizeMe');

// Query all headers
const cols = table.querySelectorAll('th');

// Loop over them
[].forEach.call(cols, function (col) {
    // Create a resizer element
    const resizer = document.createElement('div');
    resizer.classList.add('resizer');

    // Set the height
    resizer.style.height = `${table.offsetHeight}px`;

    // Add a resizer element to the column
    col.appendChild(resizer);

    // Will be implemented in the next section
    createResizableColumn(col, resizer);
});

/*
Handle the resizer's events
We are going to implement a function, createResizableColumn, which accepts two parameters:

    col that represents the table header
    resizer that represents the resizer element within the column

In order to allow user to resize col, we have to handle three events:

    mousedown on the resizer: Track the current position of mouse
    mousemove on document: Calculate how far the mouse has been moved, and adjust the width of the column
    mouseup on document: Remove the event handlers of document
*/
const createResizableColumn = function (col, resizer) {
    // Track the current position of mouse
    let x = 0;
    let w = 0;

    const mouseDownHandler = function (e) {
        // Get the current mouse position
        x = e.clientX;

        // Calculate the current width of column
        const styles = window.getComputedStyle(col);
        w = parseInt(styles.width, 10);

        // Attach listeners for document's events
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseMoveHandler = function (e) {
        // Determine how far the mouse has been moved
        const dx = e.clientX - x;

        // Update the width of column
        col.style.width = `${w + dx}px`;
    };

    // When user releases the mouse, remove the existing event listeners
    const mouseUpHandler = function () {
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
    };

    resizer.addEventListener('mousedown', mouseDownHandler);
};
```

## Highlight the resizer

```scss
// We can improve the user experience a little bit. When user hovers or clicks on the resizer, it can be hightlighted. To demonstrate the idea in the most simple way, we add a solid border to the :hover selector:

.resizer:hover,
.resizing {
    border-right: 2px solid blue;
}
```

```js
// The resizing class is added to the resizer while user clicks and drags the resizer:

const mouseDownHandler = function(e) {
    ...
    resizer.classList.add('resizing');
};

const mouseUpHandler = function() {
    ...
    resizer.classList.remove('resizing');
};
```

## Text Scramble

random replace char of string by special char

```js
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#________";
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

const phrases = ["find", "read", "BOOM!"];

const el = document.querySelector(".text");
const fx = new TextScramble(el);

let counter = 0;
const next_word = () => {
  fx.setText(phrases[counter]).then(() => {
    setTimeout(next_word, 1500);
  });
  counter = (counter + 1) % phrases.length;
};

next_word();
```

## counter

start count when element is in view and check if already count

```html
<span class="counter-number" data-counter="20000" data-is_count="false"> 1059</span>
```

```js
window.addEventListener('scroll', function () {

    document.querySelectorAll('.counter-number').forEach(counter => {
        if (isInViewport(counter) && counter.getAttribute('data-is_count') == 'false') {
            let frame = 0,
                countTo = parseInt(counter.getAttribute('data-counter'), 10);
            let counter_interval = setInterval(() => {
                frame++;
                let progress = (frame / 250) * (2 - (frame / 250));
                let currentCount = Math.round(countTo * progress);

                if (parseInt(counter.textContent, 10) !== currentCount) {
                    counter.textContent = currentCount;
                }

                if (frame === 250) {
                    clearInterval(counter_interval);
                }
            }, 20);

            counter.setAttribute('data-is_count', true);
        }
    })
});
const isInViewport = function (ele) {
    const rect = ele.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};
```

## password length checker

```html
<div id="js-password-input" class="password-input-container">
<input type="password">
<span id="js-show-hide-password" class="show-hide-password-btn">show</span>
</div>

<div id="js-password-strength" class="password-strength-container">
<span id="poor" class="poor-bar"></span>
<span id="weak" class="weak-bar"></span>
<span id="strong" class="strong-bar"></span>
</div>

<div id="js-password-info" class="password-result-message"></div>
```

```scss
.password-input-container {
  width: 30%;
  display: flex;
  position: relative;

  input[type="password"],
  input[type="text"] {
    width: 100%;
    padding: 10px;
    border: 1px solid lightgrey;
    font-size: 15px;
    padding-right: 50px;
  }

  .show-hide-password-btn {
    font-size: 12px;
    font-weight: 600;
    position: absolute;
    color: tomato;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    user-select: none;
  }
}

.password-strength-container {
  width: 30%;
  height: 5px;
  margin: 5px 0;
  display: none;

  span {
    position: relative;
    height: 100%;
    width: 100%;
    background: lightgrey;
    border-radius: 5px;

    &:nth-child(2) {
      margin: 0 3px;
    }

    &.active:before {
      position: absolute;
      content: "";
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border-radius: 5px;
    }

    &.poor-bar:before {
      background-color: #ff4757;
    }

    &.weak-bar:before {
      background-color: orange;
    }

    &.strong-bar:before {
      background-color: #23ad5c;
    }
  }

  .password-result-message {
    font-size: 15px;

    .poor-bar {
      color: red;
    }

    .weak-bar {
      color: orange;
    }

    .strong-bar {
      color: green;
    }
  }
}
```

```js
let password_input = document.querySelector('#js-password-input input[type="password"]'),
    password_strength = document.getElementById('js-password-strength'),
    poor_bar = document.querySelector('#js-password-strength .poor-bar'),
    weak_bar = document.querySelector('#js-password-strength .weak-bar'),
    strong_bar = document.querySelector('#js-password-strength .strong-bar'),
    password_info_message = document.getElementById('js-password-info');


password_input.oninput = function () {

    let poor_password = password_input.value.match(/[a-z]/),
    weak_password = password_input.value.match(/(?=.*?[0-9])/),
    strong_password = password_input.value.match(/(?=.*?[#?!@$%^&*-])/),
    whitespace = password_input.value.match(/^$|\s+/);

    if (password_input.value != "") {

    password_strength.style.display = "block";
    password_strength.style.display = "flex";
    password_info_message.style.display = "block";
    password_info_message.style.color = "black";

    if (whitespace) {
        password_info_message.textContent = "whites paces are not allowed";
    } else {
        check_poor_password(password_input.value.length, poor_password, weak_password, strong_password);
        check_weak_password(password_input.value.length, poor_password, weak_password, strong_password);
        check_strong_password(password_input.value.length, poor_password, weak_password, strong_password);
    }
    } else {
    password_strength.style.display = "none";
    password_info_message.style.display = "none";
    }
}

function check_poor_password(passwordLength, poorPassword, weakPassword, strongPassword) {

    if (passwordLength <= 5 && (poorPassword || weakPassword || strongPassword)) {
    poor_bar.classList.add("active");
    password_info_message.style.display = "block";
    password_info_message.style.color = "red";
    password_info_message.textContent = "Your password is too Poor";

    }
}

function check_weak_password(passwordLength, poorPassword, weakPassword, strongPassword) {
    if (passwordLength >= 8 && poorPassword && (weakPassword || strongPassword)) {
    weak_bar.classList.add("active");
    password_info_message.textContent = "Your password is Weak";
    password_info_message.style.color = "orange";

    } else {
    weak_bar.classList.remove("active");

    }
}

function check_strong_password(passwordLength, poorPassword, weakPassword, strongPassword) {

    if (passwordLength >= 10 && (poorPassword && weakPassword) && strongPassword) {
    poor_bar.classList.add("active");
    weak_bar.classList.add("active");
    strong_bar.classList.add("active");
    password_info_message.textContent = "Your password is strong";
    password_info_message.style.color = "green";
    } else {
    strong_bar.classList.remove("active");

    }
}


document.querySelector('#js-show-hide-password').onclick = function () {
    if (password_input.type == "password") {
    password_input.type = "text";
    this.textContent = "hide";
    } else {
    password_input.type = "password";
    this.textContent = "show";
    }
}
```

- <https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications
