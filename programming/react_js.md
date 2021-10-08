
# react

## core concept

- component
- JSX       # write XML code in JS code
- virtual DOM

## from  Nour Homsi

in `index.js`

```js
// ReactDOM.render('what to render', 'where to render');
ReactDOM.render(<React.StrictMode></React.StrictMode>,document.getElementById('root'));
```

### write inline style

```js
// as object contain key: value
<p style={{color:'red',marginRight:'10px'}}> text </p>
```

# website

## Introducing JSX

```js
const name = 'Josh Perez';
const element = <h1>Hello, {getGreeting()}</h1>;

function getGreeting(user='') {
  if (user!='') {
    return <h1>Hello, {user}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}

ReactDOM.render(
  element,
  document.getElementById('root')
);
```

### Specifying Attributes with JSX

React DOM uses camelCase property naming convention instead of HTML attribute names.
For example, class becomes className in JSX, and tabindex becomes tabIndex.

Don’t put quotes around curly braces when embedding a JavaScript expression in an attribute. You should either use quotes (for string values) or curly braces (for expressions), but not both in the same attribute.

```js
const element = <div tabIndex="0"></div>;

const element = <img src={user.avatarUrl}></img>;
```

### Specifying Children with JSX

If a tag is empty, you may close it immediately with />, like XML:

```js
const element = <img src={user.avatarUrl} />;
```

### JSX Represents Objects

```js
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);

// same as
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);

// Note: this structure is simplified
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```

## Rendering Elements

### Rendering an Element into the DOM

```js
const element = <h1>Hello, world</h1>;
ReactDOM.render(element, document.getElementById('root'));
```

## Components

```js
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Rendering a Component

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="Sara" />;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

### Composing Components

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

### State and Lifecycle

```js
class Clock extends React.Component {
    render() {
        return (
        <div>
            <h1>Hello, world!</h1>
            <h2>It is {this.props.date.toLocaleTimeString()}.</h2>
        </div>
        );
    }
}

function tick() {
    ReactDOM.render(
        <Clock date={new Date()}/>,
        document.getElementById('app')
    );
}

setInterval(tick, 1000);
```

# event

- onClick
- onDoubleClick
- onMouseMove

## Stateless Component

- create component within function not class
- has no state
- print date doesn't no store it

componentDidMount  : every this is loaded in html like ready in js
componentDidUpdate : when change in page
