
# Markdown

## Headers

```markdown
# This is an <h1> tag
## This is an <h2> tag
###### This is an <h6> tag
```

### Heading IDs

```markdown
### My Great Heading {#custom-id}
```

The HTML looks like this

```html
<h3 id="custom-id">My Great Heading</h3>
```

### Linking to Heading IDs

## Emphasis

```markdown
[Heading IDs](#heading-ids)
```

on HTML

```html
<a href="#heading-ids">Heading IDs</a>
```

```markdown
*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

~~this is wrong~~
```

*This text will be italic*
_This will also be italic_

**This text will be bold**
__This will also be bold__

_You **can** combine them_

~~this is wrong~~

### Bold and Italic Best Practices

```markdown
This is really***very***important text.
```

This is really***very***important text.

## Lists

### Unordered

also can use `+ - *`

```markdown
* Item 1
* Item 2
  * Item 2a
  * Item 2b
```

* Item 1
* Item 2
  * Item 2a
  * Item 2b
  
### Ordered

```markdown
1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b
```

1. Item 1
1. Item 2
1. Item 3
   1. Item 3a
   1. Item 3b

## Images

![placeholder](https://via.placeholder.com/150)
![placeholder](https://via.placeholder.com/150/09f/fff.png)
![placeholder](https://via.placeholder.com/150/333/fff.jpg?text=NEW)
![placeholder](https://via.placeholder.com/300x300/333/fff?text=it's+me+here)

```markdown
Format: ![Alt Text](url "Optional title")


![Alt text][id]

[id]: url/to/image  "Optional title attribute"
```

### Linking Images

```markdown
[![An old rock in the desert](shiprock.jpg "title")](link to go to)

```

## Horizontal Rules

```markdown
***
---
___
```

## Links

```markdown
[GitHub](http://github.com)
```

[GitHub](http://github.com) link

Any URL (like `http://www.github.com/`) will be automatically converted into a clickable link.

### Adding Titles

My favorite search engine is [Duck Duck Go](https://duckduckgo.com "The best search engine for privacy").

### URLs and Email Addresses

```markdown
<https://www.markdownguide.org>
<fake@example.com>
```

### Formatting Links{#code-id}

```markdown
I love supporting the **[EFF](https://eff.org)**.
This is the *[Markdown Guide](https://www.markdownguide.org)*.
See the section on [`code`](#code).
```

I love supporting the **[EFF](https://eff.org)**.
This is the *[Markdown Guide](https://www.markdownguide.org)*.
See the section on [`code`](#code-id).

### Formatting the First Part of the Link

```markdown
[hobbit-hole][1]
[hobbit-hole] [1]
```

### Formatting the Second Part of the Link

[linkedin]: https://linkedin.com/in/mohammed-taysser

```markdown
[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle
[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle "Hobbit lifestyles"
[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle 'Hobbit lifestyles'
[1]: https://en.wikipedia.org/wiki/Hobbit#Lifestyle (Hobbit lifestyles)
[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> "Hobbit lifestyles"
[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> 'Hobbit lifestyles'
[1]: <https://en.wikipedia.org/wiki/Hobbit#Lifestyle> (Hobbit lifestyles)
```

```markdown
[portfolio]: https://mohammed-taysser.github.io/portfolio/

[portfolio][portfolio]
```

[my linkedin][linkedin]

## Blockquotes

```markdown
> We're living the future so
> the present is our past.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.
```

> We're living the future so
> the present is our past.
>
> The Witch bade her clean the pots and kettles and sweep the floor and keep the fire fed with wood.

```markdown
> #### The quarterly results look great!
>
> - Revenue was off the chart.
> - Profits were higher than ever.
>
>  *Everything* is going according to **plan**.
```

> ## The quarterly results look great
>
> * Revenue was off the chart.
> * Profits were higher than ever.
>
> *Everything* is going according to **plan**.

## Inline code

```markdown
I think you should use an `<addr>` element here instead
```

I think you should use an `<addr>` element here instead

## Task Lists

```markdown
- [x] first complete one
- [x] list syntax
- [x] this is a complete item
- [ ] @mentions is here
```

* [x] first complete one
* [x] list syntax
* [x] this is a complete item
* [ ] @mentions is here

## Tables

```markdown
First | Second
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column
```

First | Second
------------ | -------------
Content from cell 1 | Content from cell 2
Content in the first column | Content in the second column

### Alignment

```markdown
| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |
```

| Syntax      | Description | Test Text     |
| :---        |    :----:   |          ---: |
| Header      | Title       | Here's this   |
| Paragraph   | Text        | And more      |

## Escaping Characters

```markdown
\* Without the backslash, this would be a bullet in an unordered list.
```

\* Without the backslash, this would be a bullet in an unordered list.

Character | Name
------------ | -------------
`\` | backslash
`/` | slash
`*` | asterisk
`_` | underscore
`{}` | curly braces
`[]` | brackets
`<>` | angle brackets
`()` | parentheses
`#` | pound sign
`+` | plus sign
`-` | minus sign (hyphen)
`!` | exclamation mark
`.` | dot
&#124; | pipe
` | backtick

### Escaping Pipe Characters in Tables

You can display a pipe (|) character in a table by using its HTML character code (`&#124;`).
