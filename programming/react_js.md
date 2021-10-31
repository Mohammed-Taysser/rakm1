
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

React DOM uses **camelCase** property naming convention instead of HTML attribute names.
For *example*, `class` becomes `className` in JSX, and `tabindex` becomes `tabIndex`.

Don’t put quotes around curly braces when embedding a JavaScript expression in an attribute. You should either use quotes (for string values) or curly braces (for expressions), but not both in the same attribute.

```js
const element = <div tabIndex="0" className='d-flex'></div>;
```

If a tag is empty, you may close it immediately with />, like **XML**:

```js
const element = <img src={user.avatarUrl} />;
```

### JSX Represents Objects

```js
const element = (
  <h1 className="greeting">Hello, world!</h1>
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

### Class Components

```js
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Function Components

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

### Rendering a Component

```js
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="Sara" />;
ReactDOM.render(element, document.getElementById('root'));
```

### Composing Components

- use the same component abstraction for any level of detail
- Don’t be afraid to split components into smaller components.
- Whether you declare a component as a function or a class, it must never modify its own props.

```js
function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="mohammed" />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

### State and Lifecycle

```js
class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {date: new Date()};
  }

  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({
      date: new Date()
    });
  }

  render() {
    return (
      <div>
        <h1>Hello, world!</h1>
        <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
      </div>
    );
  }
}
```

### Adding Lifecycle Methods to a Class

```js
// method runs after the component output has been rendered to the DOM
componentDidMount() {}

// component is ever removed from the DOM,
componentWillUnmount() {}
```

## Using State Correctly

```js
// Wrong
this.state.comment = 'Hello';

// Correct
this.setState({comment: 'Hello'});
```

### State Updates May Be Asynchronous

```js
// Wrong
this.setState({
  counter: this.state.counter + this.props.increment,
});

// Correct
this.setState((state, props) => ({
  counter: state.counter + props.increment
}));

// Correct also
this.setState(function(state, props) {
  return {
    counter: state.counter + props.increment
  };
});
```

## Handling Events

- React events are named using camelCase, rather than lowercase.
- can pass  function as the event handler, rather than a string.

```js
<button onClick={this.activateLasers}>Activate Lasers</button>
```

cannot return `false` to prevent default behavior in React. You must call `preventDefault`.

```js
// in html
<a href="#" onclick="console.log('The link was clicked.'); return false">
  Click me
</a>

// in JSX
function ActionLink() {
  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}>
      Click me
    </a>
  );
}
```

When you define a component using an `ES6` class, a common pattern is for an event handler to be a method on the class

```js
class Toggle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(state => ({
      isToggleOn: !state.isToggleOn
    }));
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.isToggleOn ? 'ON' : 'OFF'}
      </button>
    );
  }
}
```

public class fields syntax

```js
class LoggingButton extends React.Component {
  // This syntax ensures `this` is bound within handleClick.
  // Warning: this is *experimental* syntax.
  handleClick = () => {
    console.log('this is:', this);
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        Click me
      </button>
    );
  }
}
```

you can use an arrow function in the callback

The **problem** with this syntax is that a different callback is created each time the `LoggingButton` renders. In most cases, this is fine. However, if this callback is passed as a prop to lower components, those components might do an extra re-rendering. We generally **recommend** binding in the constructor or using the class fields syntax, to avoid this sort of performance problem.

```js
class LoggingButton extends React.Component {
  handleClick() {
    console.log('this is:', this);
  }

  render() {
    // This syntax ensures `this` is bound within handleClick
    return (
      <button onClick={() => this.handleClick()}>
        Click me
      </button>
    );
  }
}
```

## Conditional Rendering

```js
function UserGreeting (props) {return <h1>Welcome back!</h1>;}
function GuestGreeting(props) {return <h1>Please sign up.</h1>;}

if (this.state.isLoggedIn) {
  return <UserGreeting />;
}
return <GuestGreeting />;
```

### Inline If with Logical `&&` Operator

It can be handy for conditionally including an element, `true && expression`

```js
<div>{unreadMessages.length > 0 &&
    <h2>
      You have {unreadMessages.length} unread messages.
    </h2>
}</div>
```

### Inline If-Else with Conditional Operator

`condition ? true : false`

```js
<div>{unreadMessages.length > 0 
    ? <span>You have {unreadMessages.length} unread messages.</span> 
    : 'nothing to view'
}</div>
```

## Lists and Keys

### Rendering Multiple Components

**Keys** Must Only Be Unique Among Siblings

```js
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map( (number, index) => <li key={number.toString()}>{number}</li>);

<ul>{listItems}</ul>
```

## Forms

```js
import React, { Component } from 'react';


class Home extends Component {

    constructor(props) {
        super(props);

        this.state = {
            input_value: '',
            textarea_value: '',
            select_value: '',
            multi_select_value: [],
            terms_value: false,
        }

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    // componentDidMount() {}
    // componentWillUnmount() {}


    handleChange(ev) {
        let new_value = ev.target.value;

        if (ev.target.multiple && ev.target.type === 'select-multiple') {
            new_value = this.state.multi_select_value;
            let item_index = new_value.findIndex(item => item === ev.target.value);

            item_index === -1
                ? new_value.push(ev.target.value)
                : new_value.splice(item_index, 1);

        } else if (ev.target.type === 'checkbox') {
            new_value =  ev.target.checked;
        }

        this.setState({
            [ev.target.name]: new_value,
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log(this.state);
    }
    render() {


        return (
            <div >
                <h1 className='text-center'>Hello, world!</h1>

                <form onSubmit={this.handleSubmit} className='container'>

                    <input type="text" value={this.state.input_value} name='input_value' onChange={this.handleChange} className='form-control my-3' />

                    <textarea value={this.state.textarea_value} name='textarea_value' onChange={this.handleChange} className='form-control my-3' />

                    <select value={this.state.select_value} name='select_value' className="custom-select my-3" onChange={this.handleChange}>
                        <option value="grapefruit">Grapefruit</option>
                        <option value="lime">Lime</option>
                        <option value="coconut">Coconut</option>
                        <option value="mango">Mango</option>
                    </select>

                    <select value={this.state.multi_select_value} name='multi_select_value' multiple={true} className="custom-select my-3" onChange={this.handleChange}>
                        <option value="grapefruit">Grapefruit</option>
                        <option value="lime">Lime</option>
                        <option value="coconut">Coconut</option>
                        <option value="mango">Mango</option>
                    </select>

                    <div className="">
                        <div className="custom-control custom-switch">
                            <input type="checkbox" value={this.state.terms_value} onChange={this.handleChange} className="custom-control-input" id="customSwitch1" />
                            <label className="custom-control-label" htmlFor="customSwitch1">Toggle this switch element</label>
                        </div>
                    </div>

                    <input type="submit" value="Submit" className='btn btn-primary' />
                </form>

            </div>
        )
    }
}
export default Home;
```

## Composition vs Inheritance

## Stateless Component

### Containment

Some components don’t know their children ahead of time. This is especially common for components like Sidebar or Dialog that represent generic “boxes”.

We recommend that such components use the special children prop to pass children elements directly into their output

```js
function FancyBorder(props) {
  return <div className={'FancyBorder FancyBorder-' + props.color}>{props.children}</div>
}

// usage
<FancyBorder color="blue">
  <h1 className="Dialog-title">Welcome</h1>
  <p  className="Dialog-message">Thank you for visiting our spacecraft!</p>
</FancyBorder>
```

### Specialization

Sometimes we think about components as being “special cases” of other components. For example, we might say that a WelcomeDialog is a special case of Dialog.
In React, this is also achieved by composition, where a more “specific” component renders a more “generic” one and configures it with props:

```js
function Dialog(props) {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">{props.title}</h1>
      <p  className="Dialog-message">{props.message}</p>
      {props.children}
    </FancyBorder>
  );
}

function WelcomeDialog() {
  return 
    <Dialog title="Welcome" message="Thank you for visiting our spacecraft!" >
      <input value={this.state.login} onChange={this.handleChange} />
      <button onClick={this.handleSignUp}>  Sign Me Up!  </button>
    </Dialog>
}
```

- onClick
- onDoubleClick
- onMouseMove

- create component within function not class
- has no state
- print date doesn't no store it

componentDidMount  : every this is loaded in html like ready in js
componentDidUpdate : when change in page

# notes

- `Fragment`
  can be call as `<React.Fragment>` or `import {Fragment} from 'react'` then `<Fragment></Fragment>`

# resources

- <https://react-bootstrap.github.io/>
- <https://formik.org/docs/overview>
- <https://github.com/jquense/yup>
- <https://reactjs.org/docs/hooks-intro.html>
- <https://github.com/JedWatson/classnames>
- <https://axios-http.com/>
