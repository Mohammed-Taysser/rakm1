
# JS Essential

## Output

    selector.innerHTML
    selector.outerHTML
    selector.textContent

## Condition

```js
if (condition){
    ...
} else if (condition) {
    ...
} else {
    ....
}
```

## Function

```js
function function_name (arg) {
    'use strict';
    # code here
}
```

## Switch

```js
switch(expression){
    case 1: {
        // code
        break
    }
    case 2:
    case 3: {
        // code
        break
    }
    default: {
        // code
        break
    }
}
```

## events

    onload
    onclick
    ondblclick
    onchange
    oninput
    onmouseover
    onmouseout
    onkeyup
    onkeydown
    onkeypress

## array method

    arr.length
    arr.sort()
    arr.reverse()
    arr.slice('start +|-', 'end +|-')
    arr.concat('arr_1', 'element_1', ... )

### Check array

    Array.isArray(arrayName)
    arr.constructor === Array

### Join To Array

    arr.toString()
    arr.toLocaleString()
    arr.join('char')

### array add

    arr[arr.length] = "new"
    arr.push('new')     // at end
    arr.unshift('new')  // at first
    arr.splice('index', 0, e1,...)

### array remove

    arr.pop()   // return deleted item from end
    arr.shift() // return deleted item from start
    arr.splice('start', 'end')

### array search

    arr.indexOf('value', 'start')
    arr.lastIndexOf('value','start')


## loops

    for(let i=0; i>5; i++) {....}
    var i=0; while(i>5;) {....}
    var i=0; do {....} while(i>5);

    for(let prop in obj ) {
      if(obj.hasOwnProperty(prop)){
        obj[prop]
      }
    }

## string method

    typeof(name)
    name.length
    name.replace('old', 'new')  // work with reg ex

### string concatenation

    name.concat('word',...)
    name.fromCharCode('code',...) // use ASCII code

### Convert To String

    name.toString()
    name = string('var')
    name.toLowerCase()
    name.toUpperCase()
    name.trim()

### String Search

    name.indexOf('value', 'start')
    name.lastIndexOf('val','start')
    name.search('val')  // with reg exp

### string slice

    name.split('char', 'limit')
    name.split('')   // all char as array
    name.split(' ')  // all words as array

    name.slice('start +|-', 'end +|-')
    name.substr('start', 'length')
    name.substring('start', 'end')  // swap if end > start

### string search

    name.charAt('index')
    name.charCodeAt('index')    // return ASCII

## Math

    Math.ceil(n)
    Math.round(n)
    Math.floor(n)
    Math.min(n1, n2, ....)
    Math.max(n1, n2, ....)
    Math.random()

    Math.floor(Math.random() * 5)       // between 0, 4
    Math.floor(Math.random() * 5) + 1   // between 1, 4

## regular expression

> use with search, test, replace, split, match

```js
let str = 'study django and vue js';
let index = str.search(/django/img);  // 6
let item  = str.replace(/django/img, 'SasS');  // "study SasS and vue js"
```

    i : case insensitive
    g : global search
    m : multi line search

    /[val]/g  :search for val or char
    /[^val]/g :search anything else val
    /[a-c]/g  :search on range a-c
    /[A-C]/g  :search on range A-C
    /[0-9]/g  :search on range 0-9
    /[^0-9]/g :search anything else range 0-9
    /[A-c]/g  :range A-Z & range a-c
    /[A-Z0-9]/g  :range A-Z & range 0-9

    /[letter+]/g :one or more letter consider one word e==ee==eee
    /[letter{2,5}]/g :2 letter or 5 letter consider one word
    /[letter{n,}]/g :at least n letter or more consider one word

## date

    new Date()
    new Date( mill-second )
    new Date( '20 Octoper 2020 12:12:16' )
    new Date( year, month, day, hour, minute, second )

note: month start with 0

    ISO:  new Date( 'YY-MM-DD h-m-s TZD' )

note: for all date function we can add `UTC` to get the result in UTC date like `getUTCMonth()` as `getMonth()` and also set is available as get like `setMonth()`

### date function

    var.getDate() return day of month 1-31
    var.getDay()  return day of week 0-6
    var.getFullYear() return year
    var.getMonth() return month
    var.getHours() return hours 0-59
    var.getMinutes() return minutes 0-59
    var.getSeconds() return seconds 0-59
    var.getMilliSeconds() return milliseconds 0-999
    var.getTime() return milliseconds from 1970 or specific date
    var.getTimezoneOffset() def betweem UTC and local date in min
    var.now() return milliseconds from 1970 to now
    var.toISOString()
    var.toTimeString()
    var.toLocaleString()
    var.toLocaleTimeString()

## number

    typeOf(varNum)
    (100 / 20).toString()
    varNum.toExponential(n)     // n:power like 1e+1
    varNum.toFixed(n)   // n:number after '.' like 5.001
    varNum.parseInt(n)

# Java Script Dom (document object model)

## elements selector

    document.getElementById('id')
    document.getElementsByTagName('tag')
    document.getElementsByClassName('class')
    document.querySelector('css selector')
    document.querySelectorAll('css selector')

## classList

    selector.classList
    selector.classList.length
    selector.classList.contains('text-danger')
    selector.classList.item(n)  // n is number

    selector.classList += 'newClass'    // add newClass
    selector.classList.add('newClass', ... )
    selector.classList.remove('newClass', ... )
    selector.classList.toggle('newClass', ... )

## change attribute

    selector.id
    selector.className
    selector.src
    selector.alt
    selector.title
    selector.getAttribute('attr')
    selector.setAttribute('attr', 'value')
    selector.hasAttribute('attr')
    selector.removeAttribute('attr')

## useful

    selector.value
    selector.type
    selector.contains('element')
    
    test = document.createAttribute('id')
    test.value = "test"
    selector.setAttributeNode(test)

## children

    selector.childElementCount  // elements with tag
    selector.childNodes[n]      // all elements
    selector.children.length
    selector.children[n]

    selector.firstElementChild
    selector.lastElementChild

    selector.firstChild
    selector.lastChild

    document.createElement('div')
    document.createComment('text ....')
    document.createTextNode('text ....')

    selector.appendChild('new element')
    selector.insertBefore('new element', 'element')
    selector.removeChild('element')

## elements

    selector.childNodes[n].tagName only tags
    selector.childNodes[n].nodeName
    selector.childNodes[n].nodeValue
    selector.childNodes[n].nodeType
    // 1 = element, 2 = attr, 3 = text, 8 = comment

    selector.cloneNode(true/false)  // clone with content
    selector.parentElement
    selector.parentNode
    selector.previousSibling
    selector.previousElementSibling
    selector.nextElementSibling
    selector.nextSibling

    selector.focus()     // auto focus
    selector.blur()      // auto blur
    selector.click()     // auto click

## more events

    selector.addEventListener('event', 'function')
    selector.removeEventListener('event', 'function')

    window.load
    window.onscroll
    window.onresize

    form_field.onfocus
    form_field.onblur
    form_field.onsubmit
    selector.oncontextmenuright      // click right menu

    function(e){e.preventDefault()}

## style

    selector.clientHeight   // padding only, visible area
    selector.clientWidth    // padding only, visible area

    selector.scrollHeight   // padding only, complete area
    selector.scrollWidth    // padding only, complete area

    selector.offsetHeight   // all else margin, visible area
    selector.offsetWidth    // all else margin, visible area

    selector.scrollTop
    selector.scrollLeft

    selector.clientTop     // (scroll + border)   top
    selector.clientLeft    // (scroll + border)   left [with direction]

    selector.style.property     // camel case backgroundColor

## document

    document.documentElement    // html page
    document.body
    document.title
    document.images  // images[2].src
    document.forms   // forms[1].field_name.value, forms.length
    document.anchors
    document.links
    document.URL    // url of the page
    document.inputEncoding
    document.lastModified

# Javascript Bom (browser object model)

## window

    window.document.title

    window.alert('...')
    window.prompt('text','default text')
    window.confirm('text)

    var name = setTimeout(function, milliseconds);
    clearTimeout(name)

    var name = setInterval(function, milliseconds);
    clearInterval(name)

    var windowName = window.open('url', 'width=100, height=100, left=10, top=10, menubar=true|false, status=true|false','history')
    // history: true|false -> save in browser history or not

    window.scrollTo(x, y)   // without px
    window.scrollBy(x, y)   // without px

    window.scrollX          // scroll x value
    window.scrollY          // scroll y value

    window.pageYOffset      // scroll y value [not in IE]
    window.pageXOffset      // scroll X value [not in IE]

    window.stop()           // stop load the page
    windowName.close()      // close the page opened with window.open
    windowName.focus()      // focus page opened with window.open

    window.innerHeight()    // the view browser window height
    window.outerHeight()    // browser window height (with scroll)

    window.innerWidth()     // the view browser window Width
    window.outerWidth()     // browser window Width (with scroll)

## location

    window.location.href    // current page link
    location.host
    location.hash
    location.pathName
    location.protocol
    location.search
    // fullLink = location.host + location.pathName + locationsearch

    location.assign('link')     // save in history
    location.replace('link')    // don't save in history
    location.reload(false|true) // true: reload cache from server

## history

    history.length
    history.back()
    history.forward()
    history.go(+n|-n)

## navigator

    navigator.onLine
    navigator.language
    navigator.languages
    navigator.platform
    navigator.cookiEnabeld

## cookies

    document.cookie('name = val; expire = date; path = /')

# Javascript ES6

## arrow function

> remove function word , car replace '()' with '_' if there no argument, remove '{}' if there one statement doesn't have 'this' word,
> so it can use the content this ' like arrow function inside regular function, if i use this inside arrow it will use 'this' of the regular function'

    let name = () => 1; return 1
    let name = arg => arg * 5; return arg *5
    let name = (arg1, arg2) => arg1 * arg2; return arg1 * arg2

## string

using
    ` string like writhing on pre and to use variable ${varName} `

```js
let name = 'mohammed';
let text_p =  `hello iam ${name}
learn js
^_^
`;
document.getElementById('string_p').textContent = text_p;
```

str.startWith('text', startIndex)
str.endWith('text', endIndex)
str.include('text', startIndex)
str.repeat(n)

## spread operator

    ...arrayName

> this example will add all parameter pass to function

```js
function add(...arr){
    let temp = 0;
    for(i of arr)
        temp += i;
    return temp;
}
    let num = add(1, 2 ,3);
```

## rest parameter

> any number of parameter are store in args (can named any name)

```js
function any_name(arg_1, arg_2, ...args){
    return arg_1 + arg_2'
}
```

## destructuring

### object destructuring

```js
user = {
    name   : 'mohammed',
    age    : 20,
    city   : 'cairo',
    skills : {
        html : 90,
        css  : 80,
        js   : 70
    }
};

// new variable
// each one has it's value from user object
let { name, age, city} = user;

// pre define variable 
let name, age, city;
({ name, age, city} = user);

// not sure if define in the user object
let { name, age, city = 'default'} = user;

// rename user properties
let { name:new_name, age, city:live = 'default'} = user;

// get item from object inside user
let { name:new_name, age, langs:{html:html_language, bootstrap = 100}} = user;
console.log(html);  // 90

let {html, css, js} = user.skills;
```

### array destructuring

```js
arr = ['html', 'css', 'js'];
let [lang_1, lang_2, lang_3, lang_4 = 'python'] = arr ; // html, css, js, python

//to skip element from array just put ','
let [lang_1, , lang_3, lang_4 = 'python'] = arr ; // html, js, python

// pre define variable
[lang_1, , lang_3, lang_4 = 'python'] = arr ; // html, js, python

arr = ['html', 'css', 'js', ['php','sql','python']];
[lang_1, lang_2, lang_3, [lan_1,lan_2,lan_3]] = arr ;

arr = ['html', 'css', 'js','php','sql','python'];
// other_langs will store on otherName
[lang_1, lang_2, lang_3, ...other_langs] = arr; 
```

### destructuring mix abject and array

```js
user = {
name  : 'mohammed',
age   : 20,
language : {
    html : 50,
    css  : 80 ,
    js   : ['angular', 'vue', 'react']
}
};
    

{
    name:username, ,
    language : {
        lang1,
        lang2, 
        [fr1 ,fr2 ,fr3] 
    }
} = user
```

### function parameter destructuring

```js
user = {
name  : 'mohammed',
age   : 20,
language : {
    html : 50,
    css  : 80 ,
    js   : ['angular', 'vue', 'react']
}
};

function showDetails(user){
    console.log(` in old way ->name :${user.name} ,age:${user.age} ,language : ${language.html} ,${language.css} , ${user.js.language[0]}`);
}

function showDetails({name:Username, , language : {lang1, lang2,    lang3:Javascript [fr1 ,fr2 ,fr3] }}){
    console.log(` in new way ->name :${name} ,language : ${lang1} ,${lang2} , ${fr1}`);
}
showDetails(user);
```

## set and array

- can't access set `my_set[0]` is undefine
- take only iterable data type str, arr, ...

    let my_set = new Set([1, 2, 3]);

    my_set.size
    my_set.add('value')
    my_set.delete('value')
    my_set.has('value')
    my_set.clear()  // remove all elements

    // use to remove repeated element from array
    numbers = [2,3,4,4,2,3,3,4,4,5,5,6,6,7,5,32,3,4,5];
    newNumber = [...new Set(numbers)]; // [2, 3, 4, 5, 6, 7, 32]

    // if i pass string to set it will store every char unlike 'add' method it add values
    let newSet = new Set('text');   // t, e, x

## map and abject and symbol

in `object` property name must be **string**

    let name = {} // empty object
    name.newProp  = 'value';
    name[newProp] = 'value';

in `map`,  it's like associative array in php , has key and value
  property name can be **anything** like string , object, even function

    let name = new Map();
    name.set('property','value');
    name.set(true,'boolean');

    // to add with declare
    let newMap = new Map([
        ['property','value'],
        [20,'value'],
        [function() {},'value'],
        [{a:'aa', b:'bb'},'value'],
    ]);

    map_name.size
    map_name.get('propName')
    map_name.has('propName')
    map_name.delete('propName')
    map_name.clear()

in `symbol` use to create private variable inside objects (can't print with loop), it else unique which mean if i have two symbol

```js
let my_symbol_1 = Symbol();
let my_symbol_2 = Symbol();
console.log(my_symbol_1 === my_symbol_2) 
// will return false as they are unique


// if i use text inside symbol it's called symbol description, like
let my_symbol_1 = Symbol('text'); // symbol not exists, create it
let my_symbol_2 = Symbol('text'); // symbol exists, return it
console.log(my_symbol_1 === my_symbol_2) 
// also will return false as they are unique


let my_symbol_1 = Symbol.for('text');
let my_symbol_2 = Symbol.for('text');
console.log(my_symbol_1 === my_symbol_2) 
// also will return true as they have the same description



let my_symbol = Symbol.for('text');
console.log(Symbol.keyFor(my_symbol)) // will return description key
console.log(my_symbol.description)    // will return description key



// to use symbol like string we use toString()
console.log(my_symbol); 
alert(my_symbol.toString()); 


// when i print object prop it will not print as it private
let my_symbol = Symbol(); 
// to use inside object ['symbolName']: 'value'
let obj = {
    username : 'mo',
    password : '123',
    [my_symbol] : 'newValue'
}
// print all object property using console.log(objectName);
// printing object method without symbol

for(let i of object.entries(obj))
    console.log(i);

console.log(object.keys(obj));

console.log(object.getOwnPropertyNames(obj));

console.log(JSON.stringify(obj));

// to printing object method with symbol
console.log(object.getOwnPropertySymbols(obj));
```

## foreach

```js
//in old way
let arr = [1, 2, 3, , 4, 5];
for(let i =0; i < arr.length; i++)
  console.log(`${i} - ${arr[i]}`);

console.log('-'.repeat(20));

//in new way
//the special about it that skip empty [undefined] elements
let arr = [1, 2, 3, , 4, 5];
arr.forEach((val,index) =>{
  console.log(`${index} - ${val}`);
});

console.log('-'.repeat(20));

//using function as parameter
arr.forEach(functionName);
function functionName(val, i){
  .log(`${i} - ${val}`);
}

//foreach with set
let set = new Set([1, 2, 3,2,3,5,9,1 , 4, 5]);
set.forEach(val => {
  console.log(val);
})

console.log('-'.repeat(20));

//foreach with map
let set = new Map([['property','value'],[20,'value'],]);
map.forEach((val, key) => {
  console.log(`${key} - ${val}`);
});
```

## set and weakSet

  --> set
    - contains any datatype
    - get elements count with .size
    - forEach is available
    - can get any key
  --> weakSet
    - contains only object
    - can't use .size
    - forEach not available
    - can't get keys
    - cabbage collector remove object that has no reference ' like obj = null; now obj has no reference' un like set
    let weakset = new WeakSet();

    weaksetName.add('value')
    weaksetName.delete('value')
    weaksetName.has('value')
    weaksetName.clear()

## map and weak map

the same different as set and weak set

    weakmapName.get('propName')
    weakmapName.has('propName')
    weakmapName.delete('propName')
    weakmapName.clear()

## symbol iterator

iterable -> object has symbol.iterator

    iterator :
    - object with interface designed for iteration
    - has next() method that return result object
    - result object has two property
      -- value -> next value
      -- done -> boolean if there exists next value or not

```js
let it_arr = [1,2,3];
let it_name = 'name';

console.log(typeof(it_arr[Symbol.iterator]));
// will return 'function' keyword which mean it can perform loop on it, also string and map are implement iterator method

//to store iterator object to use it later
let iterator_name = it_arr[Symbol.iterator]();
console.log(iterator_name.next());
console.log(iterator_name.next().value);
console.log(iterator_name.next().done);

// to use iteration in for loop
for(let i of it_arr){
  console.log(i);
}
```

## custom iterator

```js
let it_obj = {
  name : 'mohammed',
  age : 20,
  langs : 'html',
  [Symbol.iterator](){
    let step = 0;
    let properities = Object.keys(this);
    return{
      next(){
        return{
          value : properities[step],
          done : step ++ === properities.length
        }
      }
    }
  }
}
for(let i of it_obj){
  console.log(`${i} - ${it_obj[i]}`);
}
```

## generator

```js
//use to create iterator, if we use typeOf it will return object
function * functionName (){
  yield 1;
  yield 2;
  yield 3;
}

// with array
function * generatorArr(arr){
    for (let i = 0; i < arr.length; i++) {
        yield arr[i];
    }
}

let genName = generatorName(); // to start use generator
console.log(`${genName.next().value}`);

//can perform 'of' loop on the generator himself
for (i of functionName())
  console.log(i)

//or loop on the iterator
for (i of genName)
  console.log(i)

//Create Infinite Loop
function * generatorInfinite(){
  let i = 0;
  while (true)
    yield i++;
}
```

## new array method

### `Array.of()`

```js
let old_arr = Array(100)        // empty array with length 100
let new_arr = Array.of(100)     // array with length 1

let old_arr = Array(100, 200)        // array with length 2
let new_arr = Array.of(100, 200)     // array with length 2
```

### `Array.from()`

```js
// let arr = Array.from(iterable, mapFunction, this)

let name = 'Mohammed';
let arr = Array.from(name);
console.log(name); // Mohammed
console.log(arr);  // [M, o, h, a, m, m, e, d]

// if we want to use function
let arr = [11, 22, 33, 44, 55]
let output = Array.from(arr, n => n-10); // will return number element - 10
console.log(output)                      // [1, 12, 23, 34, 45]
```

### `Array.fill()`

```js
// arrayName.fill(value, start, end)

let arr = [1,2,3,4,5];
arr.fill(50);
console.log(arr);   // [ 50, 50, 50, 50, 50 ]
// will return arr element all with value 50 if not provide start or end 

let arr = [1,2,3,4,5];
arr.fill(50, 3);    // provide start index
console.log(arr);   // [ 1, 2, 3, 50, 50 ]

let arr = [1,2,3,4,5];
arr.fill(50, 2, 4);    // provide start index
console.log(arr);   // [ 1, 2, 50, 50, 5 ]
```

### `Array.find()`

```js
// arrayName.find(function) RETURN FIRST ITEM Satisfy the function

let arr = [1,2,3,4,5];
founded = arr.find(i => i < 10);    // 1


let foundedIndex = arr.findIndex(i => i < 10);
console.log(foundedIndex);          // 0
```

### `Array.copyWithin()`

```js
arrayName.copyWithin(target, start, end) //target:start index to replace
let arr = [1,2,3,4,5,6];
arr.copyWithin(0,3,6);
console.log(arr); // will return arr but change 1,2,3 with 4,5,6
```

## import & export

```html
<script src='main.js' type='module'></script>
<script src='app.js' type='module'></script>
```

on `main.js`
```js
export let arr = [1, 2, 3];

export function func_name() {
    return 10;
}

// -------------- or
let arr = [1, 2, 3];

function func_name() {
    return 10;
}

export {
    func_name,
    arr as arr_number,
}
```

on `app.js`
```js
import {func_name, arr} from './app.js';
console.log(arr);       // [1, 2, 3]

import * from './app.js';
console.log(arr);       // [1, 2, 3]

import * as all from './app.js';
console.log(all.arr);   // [1, 2, 3]
```

### export default

```js
// ----------- export
// only one export default can use in module
export default function any_name(){
    // ...
}

export default fun_name;

// ----------- import 
import any_name from './app.js';

import any_name_else from  './app.js';

import default_export, {any_other_exports} from './app.js';
```

## class & object

```js
class User{

    constructor(name, age){
        this.name = name;
        this.age = age;
    }

    getInfo(){
        condole.log(`hello ${this.name} your age is ${this.age * 365}`);
    }
}

class Admin extend User {
    constructor(name, age, email){
        super(name, age)
        this.email = email;
    }
}

let i_am = new User('mohammed', 22);
let i_am_admin = new Admin('mohammed', 22, 'mo@mo.mo');
```

## Promise

made for not callback hell

```js
let pro = new Promise((resolve, reject) => {
  let connect = true;
  if(connect){
    resolve('connected');
  }
  else{
    reject(Error('failed')); // will get an error if connect == false
  }
});

console.log(typeof pro);    // will get object

// to get callback to the promise
pro.then(
  (resolve) => console.log(resolve),
  (reject)  => console.log(reject)
);

// no need for resolve
pro.then(null, (reject)  => console.log(reject));

// chain
let pro = new Promise((resolve, reject)=>{
  let connect = Math.random() * 100;
  if(connect < 50)
   resolve('connected');
  else
   reject(Error('failed'));
}).catch(
    (resolve) => console.log(resolve);
 ).then(
    (reject)  => console.log(reject);
);
```

## get data from github API

```js
// ---------- old way
function get_github_repos(url){
    let my_reqest = new XMLHttpRequest();
    my_reqest.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200){
            console.log(JSON.parse(this.requestText))
        }
    }
    // XMLHttpRequest.open(method, url, user, password)
    my_reqest.open('GET', url, true);
    my_reqest.send()
}

get_github_repos('https://api.github.com/users/Mohammed-Taysser/repos');

// ---------- new way
const get_github_repos = url => {
    return new Promise((resolve, reject) => {
        my_reqest.onload = function () {
            if (this.readyState == 4 && this.status == 200){
                resolve(JSON.parse(this.requestText));
            } else {
                reject(Error(this.statusText));
            }
        }
        my_reqest.open('GET', url, true);
        my_reqest.send()
    });
}

get_github_repos('https://api.github.com/users/Mohammed-Taysser/repos').then(
    (success) => {
        console.log(success)
    },
    (error)  => console.log(error) 
)
```

```js
// chain and return
let pro = new Promise((resolve, reject)=>{
    let connect = [1, 2, 3, 4, 5];
    resolve('connected');
})

 pro.then((reject)  => {
     console.log(reject * 10);
     return reject;
 }).then((reject)  => {
     console.log(reject * 100);
     return reject;
 };
```

```js
// deal with groub of promise
let promise_1 = new Promise((resolve, reject) => {
  let connect = true;
  if(connect){
    resolve('connected');
  }
  else{
    reject(Error('failed'));
  }
});

let promise_2 = new Promise((resolve, reject) => {
  let connect = true;
  if(connect){
    resolve('connected');
  }
  else{
    reject(Error('failed'));
  }
});

Promise.all([promise_1, promise_2]).then((result) => {
    console.log(result);
})
```

## fetch

```js
fetch('https://api.github.com/users/Mohammed-Taysser/repos').then((result) => {
        let repos = result.json();
        console.log(repos);
        return result;
    }).then((result) => {
        console.log(result.length);
    })
```

# Javascript oop

## object essential

```js
let user_object = {
    name  : 'mohammed',
    age   : 21,
    language : {
        html : 80,
        css : 90,
        js : 70
    },
    skills: ['web', 'python'],
    get_details : function() {
      return `name: ${this.name}, age: ${this.age}`;
    },
    get_lang_value : () => user.language.html,
};

//access object methods
console.log(user.name);   // dot notation
console.log(user['age']); // bracket notation
console.log(user["language"]["html"]);
console.log(user.language.js);
console.log(user.get_lang());
console.log(user.get_details());
```

## object methods

make a copy of exist object, it will have the same properties and methods

    let other = Object.create(user);

### append & create objects

`target` is the object that collect other objects, `source` is the other object to append

    Object.assign(target, source1, {
        name  : 'mohammed',
        age   : 21,
    }, source2, ...);

    let newUser = Object.assign({}, source1, {
        name  : 'mohammed',
        age   : 21,
    }, source2, ...);

### delete object property

```js
delete user.name;
delete user["age"];
console.log(delete user.name);      // true | false if deleted or not
```

### loop on object

```js
for(let i in user ) {
    if(user.hasOwnProperty(i)){
      console.log(i, user[i]);
    }
}
```

### freeze object

protect object from delete property

```js
let user_object = {
    name  : 'mohammed',
    age   : 21,
};

console.log(user.name);         // mohammed
console.log(delete user.name);  // true
console.log(user.name);         // undefine

// -------------------- example 1

let user_object = Object.freeze({
    name  : 'mohammed',
    age   : 21,
});

console.log(user.name);         // mohammed
console.log(delete user.name);  // false
console.log(user.name);         // mohammed

// -------------------- example 1
let user = {};
user.defineProperty(user, 'value', {value: 1, configurable: false});

console.log(user.name);         // mohammed
console.log(delete user.name);  // false
console.log(user.name);         // mohammed
```

## constructor (old way)

```js
class phone {

  constructor (model, price, color){
    this.model = model;
    this.price = price;
    this.color = color
  };

  get_price(){ return this.price; }
  set_price(price){ this.price = price; }
  get_details(){ return `model: ${this.model}, price: ${this.price}, color: ${this.color}`; }
};
let iphone = new phone(2020, 2000, "gold");
console.log(iphone.get_details());
```

## constructor (ES6)

```js
class phone {
  constructor (model, price, color){
    this.model = model;
    this.price = price;
    this.color = color
  };
  get get_price(){ return this.price; }       // treated as property
  set set_price(price){ this.price = price; } // treated as property
  get get_details(){ return `model: ${this.model}, price: ${this.price}, color: ${this.color}`; }
};
let iphone = new phone(2020, 2000, "gold");
iphone.set_price = 5000;         // without ()
console.log(iphone.get_details); // without ()
```

## deal with prototype

any object inherit from it

```js
// check if object is object of class
user_1.prototype === User.prototype     // true | false

// ------------- instance
if(!(this instanceof User)){
    throw new Error('not called with new keyword')
}

// ------------- ES6
if(!new.target){
    throw new Error('not called with new keyword')
}
```

```js
// function to add 0 at begin of string or number
// prototype is for class name
String.prototype.zfill = function(len){
  let result = this;
  while (result.length < len) {
    result = `0${result}`;
  }
  return result.toString();
}
console.log("45".zfill(5));

console.log(String.prototype); // all string methods
```

## static

```js
class phone {
  static number_of_objects = 0;
  constructor (model, price, color){
    this.model = model;
    this.price = price;
    this.color = color
    phone.number_of_objects ++;
  };
  get get_price(){ return this.price; }       // treated as property
  set set_price(price){ this.price = price; } // treated as property
  get get_details(){ return `model: ${this.model}, price: ${this.price}, color: ${this.color}`; }
  static current_number_of_objects(){return this.number_of_objects;}
};
let iphone = new phone(2020, 2000, "gold");
let iphcone = new phone(2020, 2000, "gold");
console.log(phone.number_of_objects);   // called by class name
```

## extends & inheritance

```js
class phone {
  constructor (model, price, color){
    this.model = model;
    this.price = price;
    this.color = color
  };
  get get_price(){ return this.price; }
  set set_price(price){ this.price = price; }
  get get_details(){ return `model: ${this.model}, price: ${this.price}, color: ${this.color}`; }
};
class generation extends phone{
  constructor (model, price, color, sensor){
    super(model, price, color);
    this.sensor = sensor;
  }
}
```

## meta data

```js
let name = {
  name : "Mo"
}
// define only one property
Object.defineProperty(name, "age",{
  writable : true,      // false : can't change it's value
  enumerable : true,    // false : can't appear in loops
  configurable : true,  // false : can't delete it or change it's meta data
  value : 21
});
console.log(name);
console.log(name.age);

// get meta data about age
console.log(Object.getOwnPropertyDescriptor(name,"age")); 

// object properties length
console.log(Object.getOwnPropertyNames(name).length); 

console.log(Object.keys(name)); // can perform loop on it

// define more properties
Object.defineProperties(name,{
  prop1 : {
    writable : true,
    enumerable : false,
    configurable : true,
    value : 21
  },
  prop2 : {},
  ...
});
```

# JS Tricks

## Auto Load Function

```js
(function() {
   // your page initialization code here
   // the DOM will be available here
})();
```

## Merge Array

    arr_0 = arr.contact(arr1, ...)
    arr_0 = [].contact(arr1, ...)

    arr_0 = [...arr_1, ...]
    arr_0.push(...arr_1, ...)
    arr_0 = [...new Aet([...arr_1, ...])]   // no duplicate

## document title notification

    let old_title = docuement.title;
    document.title += '(5)'

### swap values

using destruction

```js
let book = 'clean code', anime = 'solo levelling'
[book, anime] = [anime, book]
```

## print the page

    window.print()

## short if

    if a > b ? true : false

    note that name = 'text' dosn't equal name = "text"

## different between `search` and `indexOf`

with search we can use regular expression but not start position unlike `indexOf` we can use start position but not regular expression

## check specified type

    isNaN( varName )      // return true if is undefine variable
    isFinite( varName )   // return true if is finite variable
    isInteger( varName )  // return true if is int variable

## exponential

    ** exponential

    2 ** 2      // 4

## sort

with function to determine the order

    arr.sort((a,b) => a - b)

## min & max element on array

    Math.max.apply(null,arrayName) max element on array
    Math.maxapply(...arrayName) max element on array

    Math.min.apply(null,arrayName) min element on array
    Math.minapply(...arrayName) min element on array

## prevent right click

```js
document.addEventListener('contextmenu', function(e){
    e.preventDefault();
})
```


# some rule wile coding

- var and function are in camelCase
- global and constant are in upper case
- file name are in lower case
- let space between `separator` like `+, - ...`
- short statement can be in one line
- `let i, len = arr.length;` best in performance than `for(i=0; i< len; i++)`
- avoid using new word it's bad in performance
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

- `arr.find(function(val,index){})` return first element achieve function condition
- `arr.findIndex(function(val,index){})` return index of first element achieve function condition
- `arr.filter(function(val,index){})` return array under function condition
- arr`.foreach(function(val,index){})` loop on array
- arr`.map(function(val,index){})` return array after achieve function on every element
- `arr.reduce(function(total,val,index){})` turn array into string under function condition
- `arr.every(function(val,index){})` return `true|false` if function achieve on all elements
- `arr.some(function(val,index){})` return `true|false` if function achieve on some elements
- `arr.indexof('key', 'start')`
- `arr.lastIndexof('key', 'start')`

with object

let name = {
  username : 'Mohammed',
  methodName : function(){
    return username;
  }
  get : function(){
    return username;
  }
  set : function(username){
    this.username = username;
  }
};
let temp = name.username;
//any change on temp will effect on name and vice verse, as object are address by refrence
