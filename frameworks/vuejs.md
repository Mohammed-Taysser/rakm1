
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
