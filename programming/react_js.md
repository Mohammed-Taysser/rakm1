
# react

## core concept

- component
- JSX       # write XML code in JS code
- virtual DOM

### write inline style

```js
// as object contain key: value
<p style={{color:'red',marginRight:'10px'}}> text </p>
```

# Main Concept

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

**Don’t** put quotes around curly braces when embedding a JavaScript expression in an attribute. You should either use quotes (for string values) or curly braces (for expressions), *but not both in the same attribute*.

```js
const element = <div tabIndex="0" className='d-flex'></div>;
```

If a tag is empty, you may close it immediately with />, like `XML`:

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
// ReactDOM.render('what to render', 'where to render');
ReactDOM.render(element, document.getElementById('root'));
```

## Components

### Class Components

```js
class Welcome extends React.Component {
  const {title, date} = this.props;
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

### Function Components

```js
function Welcome(props) {
  const {title, date} = props;
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
- Don’t be afraid to **split** components into smaller components.
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

componentDidUpdate(prevProps, prevState){
  // in case specify change to state or props
}
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

this.setState((state) => {
  {
    is_editable: !state.is_editable
  }
});
```

## Handling Events

- React events are named using **camelCase**, rather than *lowercase*.
- can pass **function** as the event handler, rather than a *string*.

```js
<button onClick={this.activateLasers}>Activate Lasers</button>
```

cannot return `false` to prevent default behavior in React. You must call `preventDefault`.

```js
// in html
<a href="#" onclick="console.log('The link was clicked.'); return false">Click me</a>

// in JSX
function ActionLink() {

  function handleClick(e) {
    e.preventDefault();
    console.log('The link was clicked.');
  }

  return (
    <a href="#" onClick={handleClick}> Click me </a>
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
      <button onClick={() => this.handleClick()}> Click me </button>
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
  <h2>You have {unreadMessages.length} unread messages.</h2>
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

**Keys** Must Only Be **Unique** Among Siblings

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
  <p className="Dialog-message">Thank you for visiting our spacecraft!</p>
</FancyBorder>
```

### Specialization

Sometimes we think about components as being “special cases” of other components. For example, we might say that a `WelcomeDialog` is a special case of `Dialog`.

In React, this is also achieved by composition, where a more “specific” component renders a more “generic” one and configures it with props:

```js
function Dialog(props) {
  return (
    <FancyBorder color="blue">
      <h1 className="Dialog-title">{props.title}</h1>
      <p className="Dialog-message">{props.message}</p>
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

# Advanced Guide

## Accessibility

### `WAI-ARIA`

`all aria-*` HTML attributes are fully supported in JSX. Whereas most DOM properties and attributes in React are camelCased, these attributes should be `hyphen-cased`

```js
<input
  type="text" value={inputValue} name="name"
  aria-label={labelText}  aria-required="true"  onChange={onchangeHandler}
/>
```

### Semantic HTML

use React `Fragments` to group together multiple elements.

```js
function Glossary(props) {
  return (
    <dl> {
        props.items.map(item => (
          // Fragments should also have a `key` prop when mapping collections
          <Fragment key={item.id}>          
            <dt>{item.term}</dt>
            <dd>{item.description}</dd>
          </Fragment>      
        ))
      }
    </dl>
  );
}
```

When you don’t need any props on the `Fragment` tag you can use the short syntax

```js
<>      
  <dt>{item.term}</dt>
  <dd>{item.description}</dd>
</>
```

### Labeling

Every HTML form control, such as `<input>` and `<textarea>`, needs to be labeled accessibly.
We need to provide descriptive labels that are also exposed to screen readers.

Although these standard HTML practices can be directly used in React, note that the for attribute is written as htmlFor in JSX:

```js
<label htmlFor="namedInput">Name:</label>
<input id="namedInput" type="text" name="name"/>
```

### Programmatically managing focus

it something like focus event

Note:

While this is a very important accessibility feature, it is also a technique that should be used judiciously. Use it to repair the keyboard focus flow when it is disturbed, not to try and anticipate how users want to use applications.

```js
constructor(props) {
  super(props);
  // Create a ref to store the textInput DOM element
  this.textInput = React.createRef();
}

getting_focus = () => {
  // Explicitly focus the text input using the raw DOM API
  // Note: we're accessing "current" to get the DOM node
  this.textInput.current.focus();
}

render() {

  // Use the `ref` callback to store a reference to the text input DOM
  // element in an instance field (for example, this.textInput).
  return (
    <>
      <input ref={this.textInput} />
      <button onClick={() => this.getting_focus()}>focus</button>
    </>

  );
}
```

### Mouse and pointer events

Ensure that all functionality exposed through a mouse or pointer event can also be accessed using the keyboard alone. Depending only on the pointer device will lead to many cases where keyboard users cannot use your application.

let’s look at a example of broken accessibility caused by click events.
This is the outside click pattern, where a user can disable an opened popover by clicking outside the element.

```js
constructor(props) {
  super(props);

  this.state = { is_open: false };
  this.toggle_container = React.createRef();

  this.on_click_inside = this.on_click_inside.bind(this);
  this.on_click_outside = this.on_click_outside.bind(this);
}

componentDidMount() {
  // attaching a click event to the window object that closes the popover:
  window.addEventListener('click', this.on_click_outside);
}

componentWillUnmount() {
  window.removeEventListener('click', this.on_click_outside);
}

on_click_inside() {
  this.setState(currentState => ({
    is_open: !currentState.is_open
  }));
}

on_click_outside(event) {
  if (this.state.is_open && !this.toggle_container.current.contains(event.target)) {
    this.setState({ is_open: false });
  }
}

render() {
  return (
    <div ref={this.toggle_container}>
      <button onClick={this.on_click_inside}>Select an option</button>
      {this.state.is_open && (
        <ul>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      )}
    </div>
  );
}
```

This may work fine for users with pointer devices, such as a mouse,
but operating this with the keyboard alone leads to broken functionality when tabbing to the next element as the `window` object never receives a `click` event. This can lead to obscured functionality which blocks users from using your application.

This code exposes the functionality to both **pointer** device and **keyboard** users.
Also note the added `aria-*` props to support screen-reader users. For simplicity’s sake the keyboard events to enable arrow key interaction of the popover options have not been implemented.

```js
constructor(props) {
  super(props);

  this.state = { is_open: false };
  this.toggle_container = React.createRef();

  this.on_blur_handler = this.on_blur_handler.bind(this);
  this.on_focus_handler = this.on_focus_handler.bind(this);
  this.on_click_inside = this.on_click_inside.bind(this);
  this.on_click_outside = this.on_click_outside.bind(this);
}

componentDidMount() {
  // attaching a click event to the window object that closes the popover:
  window.addEventListener('click', this.on_click_outside);
}

componentWillUnmount() {
  window.removeEventListener('click', this.on_click_outside);
}

on_click_inside() {
  this.setState(currentState => ({
    is_open: !currentState.is_open
  }));
}

on_click_outside(event) {
  if (this.state.is_open && !this.toggle_container.current.contains(event.target)) {
    this.setState({ is_open: false });
  }
}

// We close the popover on the next tick by using setTimeout.
// This is necessary because we need to first check if
// another child of the element has received focus as
// the blur event fires prior to the new focus event.
on_blur_handler() {
  this.timeOutId = setTimeout(() => {
    this.setState({
      isOpen: false
    });
  });
}

// If a child receives focus, do not close the popover.
on_focus_handler() {
  clearTimeout(this.timeOutId);
}
render() {
  return (
    <div onFocus={this.on_focus_handler()} onBlur={this.on_blur_handler()} ref={this.toggle_container}>
      <button onClick={this.on_click_inside} aria-haspopup="true" aria-expanded={this.state.isOpen}>Select an option</button>
      {this.state.is_open && (
        <ul>
          <li>Option 1</li>
          <li>Option 2</li>
          <li>Option 3</li>
        </ul>
      )}
    </div>
  );
}
```

## Fragments

```js
return (
  <dl>
    {props.items.map(item => (
      // Without the `key`, React will fire a key warning
      <React.Fragment key={item.id}>
        <dt>{item.term}</dt>
        <dd>{item.description}</dd>
      </React.Fragment>
    ))}
  </dl>
);
```

### Short Syntax

```js
return (
  <>        
    <td>Hello</td>
    <td>World</td>
  </>    
);
```

## JSX In Depth

### Using Dot Notation for JSX Type

```js
const MyComponents = {
  DatePicker: function DatePicker(props) {
    return <div>Imagine a {props.color} datepicker here.</div>;
  }
}

function BlueDatePicker() {
  return <MyComponents.DatePicker color="blue" />;
}
```

### User-Defined Components Must Be Capitalized

When an element type starts with a **lowercase** letter, it refers to a **built-in** component like `<div>` or `<span>` and results in a string '`div`' or '`span`' passed to React.`createElement`.
Types that start with a **capital** letter like `<Foo />` compile to `React.createElement(Foo)` and correspond to a component defined or imported in your JavaScript file.

We **recommend** naming components with a **capital** letter. If you do have a component that starts with a **lowercase** letter, assign it to a **capitalized** variable before using it in `JSX`.

```js
// Correct! This is a component and should be capitalized:
function Hello(props) {  
  // Correct! This use of <div> is legitimate because div is a valid HTML tag:
  return <div>Hello {props.toWhat}</div>;
}

function HelloWorld() {
  // Correct! React knows <Hello /> is a component because it's capitalized.  
  return <Hello toWhat="World" />;
}
```

### Choosing the Type at Runtime

You cannot use a general expression as the React element type. If you do want to use a general expression to indicate the type of the element, just assign it to a **capitalized** variable first. This often comes up when you want to render a different component based on a prop

```js
import { PhotoStory, VideoStory } from './stories';

const components = {
  photo: PhotoStory,
  video: VideoStory
};

function Story(props) {
  // Wrong! JSX type can't be an expression.  
  return <components[props.storyType] story={props.story} />;
}

function Story(props) {
  // Correct! JSX type can be a capitalized variable.  
  const SpecificStory = components[props.storyType];  
  return <SpecificStory story={props.story} />;
}
```

### Props in JSX

```js
// You can pass any JavaScript expression as a prop, by surrounding it with {}.
<MyComponent foo={1 + 2 + 3 + 4} /> // value of props.foo will be 10


// You can pass a string literal as a prop. 
// These two JSX expressions are equivalent
<MyComponent message="hello world" />
<MyComponent message={'hello world'} />


// When you pass a string literal, its value is HTML-unescaped. 
// So these two JSX expressions are equivalent
<MyComponent message="&lt;3" />
<MyComponent message={'<3'} />


// If you pass no value for a prop, it defaults to true. 
// In general, we don’t recommend not passing a value for a prop
// These two JSX expressions are equivalent
<MyTextBox autocomplete />
<MyTextBox autocomplete={true} />


// if you already have props as an object, and you want to pass it in JSX,
// you can use ... as a “spread” operator to pass the whole props object.
// These two components are equivalent
function App1() {
  return <Greeting firstName="Ben" lastName="Hector" />;
}
function App2() {
  const props = {firstName: 'Ben', lastName: 'Hector'};
  return <Greeting {...props} />;
}

// You can also pick specific props that your component will consume while passing all other props using the spread operator.
const Button = props => {
  const { kind, ...other } = props;  
  const className = kind === "primary" ? "PrimaryButton" : "SecondaryButton";
  return <button className={className} {...other} />;
};
const App = () => {
  return (
    <Button kind="primary" onClick={() => console.log("clicked!")}>Hello World!</Button>
  );
};
```

### Children in JSX

In JSX expressions that contain both an *opening* tag and a *closing* tag, the content between those tags is passed as a special prop: `props.children`. There are several different ways to pass children

JSX removes **whitespace** at the beginning and ending of a line. It also removes **blank lines**. **New lines** adjacent to tags are removed; new lines that occur in the middle of string literals are condensed into a single space.

```js
// You can put a string between the opening and closing tags
<MyComponent>Hello world!</MyComponent>


// You can provide JSX elements as the children.
<MyContainer>
  <MyFirstComponent />
  <MySecondComponent />
</MyContainer>


// You can pass any JavaScript expression as children, by enclosing it within {}. 
// these expressions are equivalent
<MyComponent>foo</MyComponent>
<MyComponent>{'foo'}</MyComponent>


// array items are render
function TodoList() {
  const todos = ['finish doc', 'submit pr', 'nag dan to review'];
  return (
    <ul>
      {todos.map((message) => <Item key={message} message={message} />)}    
    </ul>
  );
}


// false, null, undefined, and true are valid children. They simply don’t render
// useful to conditionally render React elements. renders <Header /> only if showHeader is true
<div>
  {showHeader && <Header />}  
  <Content />
</div>


// make sure that the expression before && is always boolean
<div>
  { props.messages.length > 0 &&    
    <MessageList messages={props.messages} />
  }
</div>


// if you want a value like false, true, null, or undefined to appear in the output
// you have to convert it to a string first
<div>
  My JavaScript variable is {String(myVariable)}.
</div>
```

## Optimizing Performance

- Use the Production Build `npm run build`

## Typechecking With PropTypes

# API Reference

## React.Component

the base class for React components

```js
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

## React.PureComponent

is similar to `React.Component`. The difference between them is that `React.Component` doesn’t implement `shouldComponentUpdate()`, but `React.PureComponent` implements it with a **shallow** prop and state comparison.

If your React component’s `render()` function renders the same result given the same props and state, you can use `React.PureComponent` for a performance boost in some cases.

# resources

- <https://react-bootstrap.github.io/>
- <https://formik.org/docs/overview>
- <https://github.com/jquense/yup>
- <https://reactjs.org/docs/hooks-intro.html>
- <https://github.com/JedWatson/classnames>
- <https://axios-http.com/>
- <https://www.30secondsofcode.org/react/t/hooks/p/1>
- <https://www.30secondsofcode.org/c/react-testing/p/1>
- <https://iq.js.org/questions/react/what-is-react>
- <https://www.npmjs.com/package/prop-types>
- <https://duckduckgo.com/?t=ffab&q=react+css+modules&atb=v281-1&ia=web>
- <https://duckduckgo.com/?t=ffab&q=styled+components&atb=v281-1&ia=web>
- <https://reactjs.org/docs/refs-and-the-dom.html>

```js
npm install --save react       // declarative and flexible JavaScript library for building UI
npm install --save react-dom   // serves as the entry point of the DOM-related rendering paths
npm install --save prop-types  // runtime type checking for React props and similar objects

// Verifies the object is a React element. Returns true or false.
React.isValidElement(object)

// Returns the total number of components in children,
// equal to the number of times that a callback passed to map or forEach would be invoked.
React.Children.count(children)

// Verifies that children has only one child (a React element) and returns it.
// Otherwise this method throws an error.
React.Children.only(children)

// Returns the children opaque data structure as a flat array with keys assigned to each child.
// Useful if you want to manipulate collections of children in your render methods,
// especially if you want to reorder or slice this.props.children before passing it down.
React.Children.toArray(children)

// Can be defined as a property on the component class itself, to set the default props for the class.
// This is used for undefined props, but not for null props.
componentName.defaultProps = {
  color: 'blue'
};

```

# [Udemy Course with Stephen Grider](https://www.udemy.com/course/react-redux/)

code id => 105
stop : 25

## diff between react & react-dom

react know how to deal with component which call `reconciler`, reactDom know how to take instructions on what we want to show & turn it to html which call `renderer`

## main way of start

```js
// import rect & reactDOM
import React from 'react';
import ReactDOM from 'react-dom';

// create component
const App = () =>{
  return 'Hello world';
}

// display the component o screen
ReactDOM.render(<App />, document.querySelector('#root));
```

## named of handler

`on + tagName + eventName`

for example `onInputChange`
when add event `change` to input tag

## Hooks

a way to write reusable code instead of more classic techniques like inheritance

- `useState` function that let us use state in function component
- `useEffect` function that let us use something lke lifeCycle method in function component
- `useRef` function that let us create `ref` in function component

### Primitive Hooks

- useState
- useEffect
- useContext
- useCallback
- useReducer
- useMemo
- useRefuseImperative
- useLayoutEffect
- useDebugValue

### Custom Hooks

use Primitive hook to create custom hook like useTranslate (comping of useState & useEffect)

## `useState`

```js
// current_question     : piece of state
// setCurrentQuestion   : function to change this piece of state
// null                 : initial value for this piece of state
const [current_question, setCurrentQuestion] = useState(null);

// use stored value
<h1> {current_question} </h1>

// set new value (update with new value)
setCurrentQuestion(10);
```

## `useEffect`

```js
// with nothing as second argument
// render as initial render
// run after every renderer
useEffect(()=>{});

// with empty array as second argument
// render as initial render
useEffect(()=>{}, []);

// with array within values as second argument
// render as initial render
// run after every renderer if data has changed science last render
useEffect(()=>{}, [val1, val2, ....]);
```

### use `async` inside `useEffect`

```js
useEffect( () => {
  // 1: just a async function & it's call
  const search = async () =>{
    await axios.get(
      // ...
    );
  }
  search();

  // 2: auto call function
  (async () =>{
    await axios.get(
      // ...
    );
  })();

  // 3: use promises
  axios.get(
    // ...
  ).then(()=>{
    // ...
  });

}, []);
```

### clean up with `useEffect`

```js
useEffect(() => {
  // some code
  return () =>{
    // will invoke before next render
    // for example: use to clear setTimeout or clearInterval
    console.log('cleaned up');
  }
});
```

## Redux

```js
// ---------------      ----------     ------------      -----------       ---------
// Action Creator |  => | Action |  => | Dispatch |  =>  | Reducer |   =>  | State |
// ---------------      ----------     ------------      -----------       ---------
```

# react Project idea

## youtube

- <https://www.youtube.com/watch?v=rR4n-0KYeKQ>

## login Form with localStorage

```js
// send api request to get data and token
// token use to check valid data or not
// also use to check expire cookies
const data ={
  token:'hash-value', 
  email:'', 
  password:''
}
```

- useState (store data from localStorage)
- useEffect (get stored data from localStorage)
- useContext
