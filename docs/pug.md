
# Pug.js

## Install

```shell
npm install pug
npm install pug-cli -g
```

## Usage

```bash
pug -w -P src/html/pages/ -o dist/html
```

## Doctype

```html
<!-- pug -->
doctype html

<!-- html -->
<!DOCTYPE html>
```

## Attributes

```pug
- var classes = ['foo', 'bar', 'baz']
a(class = classes, class='button', href='//google.com') Google

- var authenticated = true
body(class=authenticated ? 'auth' : 'anon')
```

### Multiline Attributes

```pug
input(
  type='checkbox'
  name='agreement'
  checked
  style={color: 'red', background: 'green'}
)
```

### Attribute Interpolation

```pug
- var url = 'pug-test.html';
a(href='/' + url) Link
- url = 'https://example.com/'
a(href=url) Another link

- var btnType = 'info', btnSize = 'lg'
button(type='button' class='btn btn-' + btnType + ' btn-' + btnSize)
button(type='button' class=`btn btn-${btnType} btn-${btnSize}`)
```

### Boolean Attributes

```pug
input(type='checkbox' checked)
input(type='checkbox' checked=true)
input(type='checkbox' checked=false)
input(type='checkbox' checked=true && 'checked')
```

### Style Attributes

```pug
style={color: 'red', background: 'green'}
```

### Class Attributes

```pug
- var classes = ['foo', 'bar', 'baz']
a(class=classes)
//- the class attribute may also be repeated to merge arrays
a.bang(class=classes class=['bing'])


//- conditional classes
- var currentUrl = '/about'
a(class={active: currentUrl === '/'} href='/') Home
a(class={active: currentUrl === '/about'} href='/about') About
//- render as
<a href="/">Home</a>
<a class="active" href="/about">About</a>
```

## Case

```pug
- var friends = 10
case friends
  when 0
    p you have no friends
  when 1
  when 3
    p you have a friend
  default
    p you have #{friends} friends
```

### Block Expansion

```pug
- var friends = 1
case friends
  when 0: p you have no friends
  when 1: p you have a friend
  default: p you have #{friends} friends
```

## Code

### Unbuffered Code

Unbuffered code starts with `-`. It does not directly add anything to the output

```pug
- for (var x = 0; x < 3; x++)
  li item
```

### Buffered Code

Buffered code starts with `=`. It evaluates the JavaScript expression and outputs the result. For security, buffered code is first HTML escaped.

```pug
p= 'This code is <escaped>!'

//- render as
<p>This code is &lt;escaped&gt;!</p>
```

## Comments

```pug
//- will not output within markup

// just some paragraphs
//- render as
<!-- just some paragraphs-->
```

### Block Comments

```pug
//-
    Comments for your template writers.
    Use as much text as you want.
//
    Comments for your HTML readers.
    Use as much text as you want.
```

### Conditional Comments

```pug
<!--[if IE 8]>
<html lang="en" class="lt-ie9">
<![endif]-->
<!--[if gt IE 8]><!-->
<html lang="en">
<!--<![endif]-->
```

## Conditionals

```pug
- var user = {description: 'foo bar baz'}
- var authorised = false
#user
  if user.description
    h2.green Description
    p.description= user.description
  else if authorised
    h2.blue Description
    p.description.
      User has no description,
      why not add one...
  else
    h2.red Description
    p.description User has no description
```

## Includes

```pug
include includes/head
//- any content
include includes/footer
```

## Template Inheritance

Template inheritance works via the `block` and `extends` keywords.

in `layout.pug`

```pug
doctype html
html(lang="en")
    body 
        block content 
```

in `home.pug`

```pug
extends ../layouts/layout
//- - page_title = 'Home' 

block title 
    title home

block content 
    p.io io is here
```

### Block `append` & `prepend`

```pug
block append head
//- or
append head
```

## Interpolation

```pug
- var msg = "not my inside voice";
p This is #{msg.toUpperCase()}
```

If you need to include a verbatim `#{`, you can either escape it, or use interpolation.

```pug
p Escaping works with \#{interpolation}
p Interpolation works with #{'#{interpolation}'} too!
```

### String Interpolation, Unescaped

```pug
- var riskyBusiness = "<em>Some of the clothing.</em>";
.quote
  p Joel: !{riskyBusiness}

//-  render as 
<div class="quote">
  <p>Joel: <em>Some of the clothing.</em></p>
</div>
```

### Tag Interpolation

```pug
p This is a long #[strong strongly phrase] and #[em ignored].
p And here's an example #[q(lang="es") ¡Hola Mundo!]

//-  render as 
<p>This is a long <strong>strongly phrase</strong> and <em>ignored</em>.</p>
<p>And here's an example <q lang="es">¡Hola Mundo!</q></p>
```

### Whitespace Control

```pug
p
  | If I don't write the paragraph with tag interpolation, tags like
  strong strong
  | and
  em em
  | might produce unexpected results.
p.
  If I do, whitespace is #[strong respected] and #[em everybody] is happy.
```

## Iteration (loops)

### each

```pug
ul
  each val, index in ['zero', 'one', 'two']
    li= index + ': ' + val


ul
  each val, key in {1: 'one', 2: 'two', 3: 'three'}
    li= key + ': ' + val


//- with else
- var values = [];
ul
  each val in values
    li= val
  else
    li There are no values
```

### while

```pug
- var n = 0;
ul
  while n < 4
    li= n++
```

### for

```pug
ul
    - for (let i=0; i<= 5; i++)
        li=i
```

## Mixins

```pug
//- Declaration
mixin list
  ul
    li foo
    li bar
    li baz

//- Use
+list
+list

mixin pet(name)
  li.pet= name
ul
  +pet('cat')
  +pet('dog')
```

### Mixin Blocks

Mixins can also take a block of Pug to act as the content:

```pug
mixin article(title)
  .article
    .article-wrapper
      h1= title
      if block  ///- given children
        block
      else
        p No content provided

+article('Hello world')

+article('Hello world')
  p This is my
  p Amazing article

//- html
<div class="article">
  <div class="article-wrapper">
    <h1>Hello world</h1>
    <p>No content provided</p>
  </div>
</div>
<div class="article">
  <div class="article-wrapper">
    <h1>Hello world</h1>
    <p>This is my</p>
    <p>Amazing article</p>
  </div>
</div>
```

### Mixin Attributes

The values in `attributes` by default are already escaped! You should use `!=` to avoid escaping them a second time.

```pug
mixin link(href, name)
  //- attributes == {class: "btn"}
  a(class!=attributes.class href=href)= name

+link('/foo', 'foo')(class="btn")
```

## Default Argument's Values

```pug
//- Declaration
mixin article(title='Default Title')
  .article
    .article-wrapper
      h1= title

//- Use
+article()

+article('Hello world')
```

### Rest Arguments

```pug
mixin list(id, ...items)
  ul(id=id)
    each item in items
      li= item

+list('my-list', 1, 2, 3, 4)
```

## Filters

Filters let you use other languages in Pug templates. They take a block of plain text as an input.

All JSTransformer modules can be used as Pug filters. Popular filters include `:babel`, `:uglify-js`, `:scss`, and `:markdown-it`. Check out the documentation for the JSTransformer for the options supported for the specific filter.

```shell
npm install --save jstransformer-markdown-it
```

```pug
:markdown-it(linkify langPrefix='highlight-')
  # Markdown

  Markdown document with http://links.com and

```

### Inline Syntax

```pug
p
  :markdown-it(inline) **BOLD TEXT**

p.
  In the midst of a large amount of plain
  text, suddenly a wild #[:markdown-it(inline) *Markdown*]
  appeared.
```

### Including Filtered Text

```pug
body
  include:markdown-it article.md
```
