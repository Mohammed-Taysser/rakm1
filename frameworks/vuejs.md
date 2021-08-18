
# vue js

## Installation

- `<script src="https://unpkg.com/vue@next"></script>`
- `npm install vue@next`

## CLI

- `npm install -g @vue/cli`
- `vue upgrade --next`

> `<p v-text='title'></p>`

- `v-text='title'`
- `v-html='<strong></strong>'`
- `v-for='skill in skills'`
- `v-for='(skill, index) in skills'`
- `v-if='boolean_value'`
- `<p v-if='boolean_value'>1</p> <p v-else>2</p>`   doesn't render it if not pass the condition
- `<p v-if='boolean_value'>1</p> <p v-else-if='boolean_value >= 50 && boolean_value <= 100'>0</p> <p v-else>2</p>`
- `v-once`
- `v-show='title'` set `display:none;` if title not provide
- `v-bind:attribute_name='title'`

### component options
- data
- methods
- props
- computed
- inject
- setup

`Vue` also exposes some built-in properties via the component instance, such as `$attrs` and `$emit`. These properties all have a `$` prefix to avoid conflicting with user-defined property names.

## Template Syntax

- Text `<span>Message: {{ msg }}</span>`
- Raw HTML  `<span v-html="rawHtml"></span>`

## Shorthands

- `v-bind: => :`
- `v-on: =>  @`

stop at component
