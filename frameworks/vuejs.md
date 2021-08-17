
# vue js

## Installation

- `<script src="https://unpkg.com/vue@next"></script>`
- `npm install vue@next`

## CLI

- `npm install -g @vue/cli`
- `vue upgrade --next`

## Declarative Rendering

```html
<div id="counter">
    current using time: {{ counter }}
</div>

<div id="bind-attribute">
    <span v-bind:title="message">
    Hover your mouse over me for a few seconds to see my dynamically bound
    title!
    </span>
</div>
```

```javascript
Vue.createApp({
  data () {
    return {
      counter: 0
    }
  },
  mounted () {
    setInterval(() => {
      this.counter++
    }, 1000)
  }
}).mount('#counter')

Vue.createApp({
  data () {
    return {
      message: 'hello world'
    }
  }
}).mount('#bind-attribute')
```

The `v-bind` attribute you're seeing is called a directive. Directives are prefixed with `v-` to indicate that they are special attributes provided by Vue

## Handling User Input

`click` event

```js
Vue.createApp({
  data () {
    return {
      message: 'mohammed'
    }
  },
  methods: {
    reverse_message () {
      this.message = this.message.split('').reverse().join('')
    }
  }
}).mount('#event-handel')
```

```html
<div id="event-handel">
    <p>{{message}}</p>
    <button v-on:click='reverse_message' class="btn btn-primary">reverse message</button>
</div>
```

`model` event

```js
Vue.createApp({
  data () {
    return {
      message: 'mohammed'
    }
  }
}).mount('#two-way-binding')
```

```html
<div id="two-way-binding" class="my-3">
    <p>current input <span class="text-danger" v-text='message'></span></p>
    <input v-model="message" />
</div>
```

## Conditionals and Loops

```html
<div id="conditional-rendering">
  <span v-if="seen">Now you see me</span>
</div>
```

```js
Vue.createApp({
  data () {
    return {
      seen: true
    }
  }
}).mount('#conditional-rendering')
```

## vue

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
