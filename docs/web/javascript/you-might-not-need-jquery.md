
# You Might Not Need JQuery

- <https://youmightnotneedjquery.com>

## AJAX

### JSON

```js
// in jQuery
$.getJSON('/my/url', function(data) {
    // code
});

// vanilla JS
var request = new XMLHttpRequest();
request.open('GET', '/my/url', true);

request.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var data = JSON.parse(this.response);
  } else {
    // We reached our target server, but it returned an error
  }
};

request.onerror = function() {
  // There was a connection error of some sort
};
request.send();
```

### Post

```js
// in jQuery
$.ajax({
  type: 'POST',
  url: '/my/url',
  data: data
});

// vanilla JS
var request = new XMLHttpRequest();
request.open('POST', '/my/url', true);
request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
request.send(data);
```

### Request

```js
// in jQuery
$.ajax({
  type: 'GET',
  url: '/my/url',
  success: function(resp) {

  },
  error: function() {

  }
});
// vanilla JS
var request = new XMLHttpRequest();
request.open('GET', '/my/url', true);

request.onload = function() {
  if (this.status >= 200 && this.status < 400) {
    // Success!
    var resp = this.response;
  } else {
    // We reached our target server, but it returned an error

  }
};

request.onerror = function() {
  // There was a connection error of some sort
};
request.send();
```

## Effects

### Fade In

```js
// in jQuery
$(el).fadeIn();

// vanilla JS
el.classList.add('show');
el.classList.remove('hide');
```

```css
.show {
  transition: opacity 400ms;
}
.hide {
  opacity: 0;
}
```

### Fade Out

```js
// in jQuery
$(el).fadeOut();

// vanilla JS
el.classList.add('hide');
el.classList.remove('show');
```

```css
.hide {
  opacity: 0;
  transition: opacity 400ms;
}
.show {
  opacity: 1;
}
```

### Hide

```js
// in jQuery
$(el).hide();

// vanilla JS
el.style.display = 'none';
```

### Show

```js
// in jQuery
$(el).show();

// vanilla JS
el.style.display = '';
```

## Elements

### Add | remove Class

```js
// in jQuery
$(el).addClass(className);
$(el).removeClass(className);

// vanilla JS
el.classList.add(className);
el.classList.remove(className);
```

### After

```js
// in jQuery
$(target).after(element);

// vanilla JS
target.insertAdjacentElement('afterend', element);
```

### Append

```js
// in jQuery
$(parent).append(el);

// vanilla JS
parent.appendChild(el);
```

### Before

```js
// in jQuery
$(target).before(element);

// vanilla JS
target.insertAdjacentElement('beforebegin', element);
```

### Children

```js
// in jQuery
$(el).children();

// vanilla JS
el.children
```

### Clone

```js
// in jQuery
$(el).clone();

// vanilla JS
el.cloneNode(true);
```

### Contains

```js
// in jQuery
$.contains(el, child);

// vanilla JS
el !== child && el.contains(child);
```

### Contains Selector

```js
// in jQuery
$(el).find(selector).length;

// vanilla JS
!!el.querySelector(selector);
```

### Each

```js
// in jQuery
$(selector).each(function(i, el){

});

// vanilla JS
var elements = document.querySelectorAll(selector);
Array.prototype.forEach.call(elements, function(el, i){

});
```

### Empty

```js
// in jQuery
$(el).empty();

// vanilla JS
while(el.firstChild)
  el.removeChild(el.firstChild);
```

### Filter

```js
// in jQuery
$(selector).filter(filterFn);

// vanilla JS
Array.prototype.filter.call(document.querySelectorAll(selector), filterFn);
```

### Find Children

```js
// in jQuery
$(el).find(selector);

// vanilla JS
el.querySelectorAll(selector);
```

### Find Elements

```js
// in jQuery
$('.my #awesome selector');

// vanilla JS
document.querySelectorAll('.my #awesome selector');
```

### Get Attributes

```js
// in jQuery
$(el).attr('tabindex');

// vanilla JS
el.getAttribute('tabindex');
```

### Get Height

```js
// in jQuery
$(el).height();

// vanilla JS
parseFloat(getComputedStyle(el, null).height.replace("px", ""))
```

### Get Width

```js
// in jQuery
$(el).width();

// vanilla JS
parseFloat(getComputedStyle(el, null).width.replace("px", ""))
```

### Get HTML

```js
// in jQuery
$(el).html();

// vanilla JS
el.innerHTML
```

### Get Outer HTML

```js
// in jQuery
$(el).prop('outerHTML');

// vanilla JS
el.outerHTML
```

### Get Style

```js
// in jQuery
$(el).css(ruleName);

// vanilla JS
getComputedStyle(el)[ruleName];
```

### Get Text

```js
// in jQuery
$(el).text();

// vanilla JS
el.textContent
```

### Has Class

```js
// in jQuery
$(el).hasClass(className);

// vanilla JS
el.classList.contains(className);
```

### Index

```js
// in jQuery
$(el).index();

// vanilla JS
function index(el) {
  if (!el) return -1;
  var i = 0;
  while (el = el.previousElementSibling) {
    i++;
  }
  return i;
}
```

### Matches

```js
// in jQuery
$(el).is($(otherEl));

// vanilla JS
el === otherEl
```

### Matches Selector

```js
// in jQuery
$(el).is('.my-class');

// vanilla JS
var matches = function(el, selector) {
  return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
};

matches(el, '.my-class');
```

### Next

```js
// in jQuery
$(el).next();

// vanilla JS
el.nextElementSibling
```

### Offset

```js
// in jQuery
$(el).index();

// vanilla JS
var rect = el.getBoundingClientRect();

{
  top: rect.top + document.body.scrollTop,
  left: rect.left + document.body.scrollLeft
}
```

### Offset Parent

```js
// in jQuery
$(el).offsetParent();

// vanilla JS
el.offsetParent || el
```

### Outer Height

```js
// in jQuery
$(el).outerHeight();

// vanilla JS
el.offsetHeight
```

### Outer Height With Margin

```js
// in jQuery
$(el).outerHeight(true);

// vanilla JS
function outerHeight(el) {
  var height = el.offsetHeight;
  var style = getComputedStyle(el);

  height += parseInt(style.marginTop) + parseInt(style.marginBottom);
  return height;
}

outerHeight(el);
```

### Outer Width

```js
// in jQuery
$(el).outerWidth();

// vanilla JS
el.offsetWidth
```

### Outer Width With Margin

```js
// in jQuery
$(el).outerWidth(true);

// vanilla JS
function outerWidth(el) {
  var width = el.offsetWidth;
  var style = getComputedStyle(el);

  width += parseInt(style.marginLeft) + parseInt(style.marginRight);
  return width;
}

outerWidth(el);
```

### Parent

```js
// in jQuery
$(el).parent();

// vanilla JS
el.parentNode
```

### Position

```js
// in jQuery
$(el).position();

// vanilla JS
{left: el.offsetLeft, top: el.offsetTop}
```

### Position Relative To Viewport

```js
// in jQuery
var offset = el.offset();

{
  top: offset.top - document.body.scrollTop,
  left: offset.left - document.body.scrollLeft
}

// vanilla JS
el.getBoundingClientRect()
```

### Prepend

```js
// in jQuery
$(parent).prepend(el);

// vanilla JS
parent.insertBefore(el, parent.firstChild);
```

### Prev

```js
// in jQuery
$(el).prev();

// vanilla JS
el.previousElementSibling
```

### Remove

```js
// in jQuery
$(el).remove();

// vanilla JS
if (el.parentNode !== null) {
  el.parentNode.removeChild(el);
}
```

### Remove Attributes

```js
// in jQuery
$(el).removeAttr('tabindex');

// vanilla JS
el.removeAttribute('tabindex');
```

### Remove Class

```js
// in jQuery
$(el).removeClass(className);

// vanilla JS
el.classList.remove(className);
```

### Replace From HTML

```js
// in jQuery
$(el).replaceWith(string);

// vanilla JS
el.outerHTML = string;
```

### Set Attributes

```js
// in jQuery
$(el).attr('tabindex', 3);

// vanilla JS
el.setAttribute('tabindex', 3);
```

### Set Height

```js
// in jQuery
$(el).height(val);

// vanilla JS
function setHeight(el, val) {
    if (typeof val === "function") val = val();
    if (typeof val === "string") el.style.height = val;
    else el.style.height = val + "px";
}

setHeight(el, val);
```

### Set HTML

```js
// in jQuery
$(el).html(string);

// vanilla JS
el.innerHTML = string;
```

### Set Style

```js
// in jQuery
$(el).css('border-width', '20px');

// vanilla JS
// Use a class if possible
el.style.borderWidth = '20px';
```

### Set Text

```js
// in jQuery
$(el).text(string);

// vanilla JS
el.textContent = string;
```

### Set Width

```js
// in jQuery
$(el).width(val);

// vanilla JS
function setWidth(el, val) {
    if (typeof val === "function") val = val();
    if (typeof val === "string") el.style.width = val;
    else el.style.width = val + "px";
}

setWidth(el, val);
```

### Siblings

```js
// in jQuery
$(el).siblings();

// vanilla JS
var siblings = function (el) {
  if (el.parentNode === null) return [];

  return Array.prototype.filter.call(el.parentNode.children, function (child) {
    return child !== el;
  });
};

siblings(el);
```

### Toggle Class

```js
// in jQuery
$(el).toggleClass(className);

// vanilla JS
el.classList.toggle(className);
```

## Events

### Click

```js
// in jQuery
$(el).click(function () {});

// vanilla JS
el.addEventListener('click', function () {}, false);
```

### Delegate

```js
// in jQuery
$(document).on(eventName, elementSelector, handler);

// vanilla JS
document.addEventListener(eventName, function(e) {
    // loop parent nodes from the target to the delegation node
    for (var target = e.target; target && target != this; target = target.parentNode) {
        if (target.matches(elementSelector)) {
            handler.call(target, e);
            break;
        }
    }
}, false);
```

### Off

```js
// in jQuery
$(el).off(eventName, eventHandler);

// vanilla JS
el.removeEventListener(eventName, eventHandler);
```

### on

```js
// in jQuery
$(el).on(eventName, eventHandler);

// vanilla JS
el.addEventListener(eventName, eventHandler);
```

### Ready

```js
// in jQuery
$(document).ready(function(){

});

// vanilla JS
function ready(fn) {
  if (document.readyState != 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
```

### Trigger Custom

```js
// in jQuery
$(el).trigger('my-event', {some: 'data'});

// vanilla JS
if (window.CustomEvent && typeof window.CustomEvent === 'function') {
  var event = new CustomEvent('my-event', {detail: {some: 'data'}});
} else {
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent('my-event', true, true, {some: 'data'});
}

el.dispatchEvent(event);
```

### Trigger Native

```js
// in jQuery
$(el).trigger('change');

// vanilla JS
// For a full list of event types: https://developer.mozilla.org/en-US/docs/Web/API/document.createEvent
var event = document.createEvent('HTMLEvents');
event.initEvent('change', true, false);
el.dispatchEvent(event);
```

## Utils

### Array Each

```js
// in jQuery
$.each(array, function(i, item){

});

// vanilla JS
array.forEach(function(item, i){

});
```

### bind

```js
// in jQuery
$.proxy(fn, context);

// vanilla JS
fn.bind(context);
```

### Deep Extend

```js
// in jQuery
$.extend(true, {}, objA, objB);

// vanilla JS
var deepExtend = function (out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    var obj = arguments[i];

    if (!obj) continue;

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          if (obj[key] instanceof Array) out[key] = obj[key].slice(0);
          else out[key] = deepExtend(out[key], obj[key]);
        } else out[key] = obj[key];
      }
    }
  }

  return out;
};

deepExtend({}, objA, objB);
```

### Extend

```js
// in jQuery
$.extend({}, objA, objB);

// vanilla JS
var extend = function(out) {
  out = out || {};

  for (var i = 1; i < arguments.length; i++) {
    if (!arguments[i])
      continue;

    for (var key in arguments[i]) {
      if (arguments[i].hasOwnProperty(key))
        out[key] = arguments[i][key];
    }
  }

  return out;
};

extend({}, objA, objB);
```

### Index Of

```js
// in jQuery
array.indexOf(item);
```

### Is Array

```js
// in jQuery
$.isArray(arr);

// vanilla JS
Array.isArray(arr);
```

### map

```js
// in jQuery
$.map(array, function(value, index){

});

// vanilla JS
array.map(function(value, index){

});
```

### Now

```js
// in jQuery
$.now();

// vanilla JS
Date.now();
```

### Parse HTML

```js
// in jQuery
$.parseHTML(htmlString);

// vanilla JS
var parseHTML = function (str) {
  var tmp = document.implementation.createHTMLDocument("");
  tmp.body.innerHTML = str;
  return tmp.body.children;
};

parseHTML(htmlString);
```

### Parse JSON

```js
// in jQuery
$.parseJSON(string);

// vanilla JS
JSON.parse(string);
```

### Slice

```js
// in jQuery
$(els).slice(begin, end);

// vanilla JS
els.slice(begin, end);
```

### Trim

```js
// in jQuery
$.trim(string);

// vanilla JS
string.trim();
```

### Type

```js
// in jQuery
$.type(obj);

// vanilla JS
Object.prototype.toString.call(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase();
```
