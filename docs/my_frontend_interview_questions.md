
# Interview

## HTML

### What is the difference between HTML elements and tags?

HTML elements communicate to the browser to render text. When the elements are enclosed by brackets `<>`, they form HTML tags. Most of the time, tags come in a pair and surround content.

### What's an 'attribute'?

An attribute is simply an additional function that a tag has. This function sets a certain way in which the tag functions in the live version of a webpage.

These attributes are assigned to the tags in the same area in which the name of the tag is displayed.

Example: adding width to an image:

```html
<img src="https://cdn.bitdegree.org/learn/pom-laptop.png?raw=true" width="100">
```

## CSS

### How can you integrate CSS on a web page?

- **Inline** method - It is used to insert style sheets in HTML document
- **Embedded/Internal** method - It is used to add a unique style to a single document
- **Linked/Imported/External** method - It is used when you want to make changes on multiple pages.

### What is the difference between class selectors and id selectors?

An overall block is given to class selector while id selectors take only a single element differing from other elements.

### Explain the difference between visibility: hidden and display: none?

`visibility: hidden` hides the element, but it occupies space and affects the layout of the document.

`display: none` also hides the element but not occupy space. It will not affect the layout of the document.

### What is RWD?

RWD stands for **Responsive Web Design**. This technique is used to display the designed page perfectly on every screen size and device, for example, mobile, tablet, desktop and laptop. You don't need to create a different page for each device.

### What are pseudo-elements?

These elements are used to provide `special effects` to certain selectors. CSS finds usage in applying styles in the HTML markups. If by any chance, additional styling or markup is not feasible for the document, this feature of pseudo-elements helps by allowing extra markup without hampering the original document.

### What are the elements of the CSS Box Model?

The CSS box model defines the layout and design of CSS elements. The elements are content (like text and images, padding (the area around content), border (the area around padding), and margin (the area around the border).

### When should you use translate () instead of absolute positioning?

Translate is a CSS transform value. On changing opacity or transform, browser reflow or repaint is not triggered. Transform requires the browser to create a GPU layer for elements but using the CPU changes absolutes positioning properties. Translate () is more efficient and results in shorter paint times. On using translate (), element occupies original space, unlike in changing absolute positioning.

## JavaScript

### What is BOM?

BOM stands for Browser Object Model. It provides interaction with the browser. The default object of a browser is a window. So, you can call all the functions of the window by specifying the window or directly. The window object provides various properties like document, history, screen, navigator, location, innerHeight, innerWidth

### What is DOM? What is the use of document object?

DOM stands for Document Object Model. A document object represents the HTML document. It can be used to access and change the content of HTML.

### What is the difference between == and ===?

The == operator checks equality only whereas === checks equality, and data type, i.e., a value must be of the same type.

### What's the difference between event.preventDefault() and event.stopPropagation() methods in JavaScript?

In JavaScript, the event.preventDefault() method is used to prevent the default behavior of an element.

**For example**: If you use it in a form element, it prevents it from submitting. If used in an anchor element, it prevents it from navigating. If used in a contextmenu, it prevents it from showing or displaying.

On the other hand, the event.stopPropagation() method is used to stop the propagation of an event or stop the event from occurring in the bubbling or capturing phase.

### What is the difference between undefined value and null value?

Undefined value: Is a value that represents a variable that has been declared but doesn't have a value

Null value: Is a value that indicates the variable points to no object.

### What is `this` keyword in JavaScript?

The this keyword is a reference variable that refers to the current object

### What is meant by scope in JavaScript?

The scope defines the “visibility of your code”.

More formally, the scope describes where variables, functions, and other objects are accessible in the code. Scopes are created in your code during the runtime.

### What are higher-order functions in JavaScript?

A higher-order function operates on another function(s). It either takes a function as an argument or returns another function.

### What is a promise in JavaScript?

A promise is an object that may produce value in the future.

A promise is always in one of the possible states: fulfilled, rejected, or pending.

Promises can be chained together such that a resolved promise returns a new promise.

### Why use promises?

In JavaScript, promises are useful with async operations.

In the past, one had to handle asynchronous operations with callbacks, that is, with functions that execute right after the operation has been completed. This caused a “callback hell”, a pyramid-shaped code with nested callbacks.

### What is the setTimeout() & setInterval() method?

The setInterval() method calls a function periodically with a custom interval.

The setTimeout() method calls a function (once) after a specified number of milliseconds. For example, let's log a message after one second (1000ms):

### What are arrow functions?

Arrow functions provide a shorthand for creating functions in JavaScript.

You can use arrow functions in function expressions only.

Here's a comparison of a regular function and an arrow function:

### What is object destructuring?

Object destructuring is a way to extract properties from an object (or an array).

### What Is an API?

An API stands for Application Programming Interface.

APIs are used to allow communication between different applications and parts of the application.

API is not a server. It is an intermediary piece of code that is used to access a server. In other words, API is an access point to a database.

### What is a spread operator?

The spread operator is a feature from ES6 to help unpack an element. Candidates being asked this interview question on JavaScript should be able to demonstrate an understanding of how the spread operator expands an element – being able to come up with the output of a spread operator.

Spread operator allows iterables such as arrays, objects, and strings to be expanded into single arguments. The spread operator is denoted by three dots (...) followed by the variable to be expanded.
