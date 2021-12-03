
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

## Accessibility

### `WAI-ARIA`

`all aria-*` HTML attributes are fully supported in JSX. Whereas most DOM properties and attributes in React are camelCased, these attributes should be hyphen-cased

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
        <Fragment key={item.id}>          <dt>{item.term}</dt>
          <dd>{item.description}</dd>
        </Fragment>      ))
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

Every HTML form control, such as `<input>` and `<textarea>`, needs to be labeled accessibly. We need to provide descriptive labels that are also exposed to screen readers.

Although these standard HTML practices can be directly used in React, note that the for attribute is written as htmlFor in JSX:

```js
<label htmlFor="namedInput">Name:</label>
<input id="namedInput" type="text" name="name"/>
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
- <https://www.30secondsofcode.org/react/t/hooks/p/1>
- <https://www.30secondsofcode.org/c/react-testing/p/1>
- <https://iq.js.org/questions/react/what-is-react>

# REACT.JS CHEATSHEET

[DOCUMENTATION](https://reactjs.org/docs/), [FILE STRUCTURE](https://reactjs.org/docs/faq-structure.html)

```js
npm install --save react       // declarative and flexible JavaScript library for building UI
npm install --save react-dom   // serves as the entry point of the DOM-related rendering paths
npm install --save prop-types  // runtime type checking for React props and similar objects

// notes: don't forget the command lines


/* *******************************************************************************************
 * REACT
 * https://reactjs.org/docs/react-api.html
 * ******************************************************************************************* */


// Create and return a new React element of the given type.
// Code written with JSX will be converted to use React.createElement().
// You will not typically invoke React.createElement() directly if you are using JSX.
React.createElement(
  type,
  [props],
  [...children]
)

// Clone and return a new React element using element as the starting point.
// The resulting element will have the original element’s props with the new props merged in shallowly.
React.cloneElement(
  element,
  [props],
  [...children]
)

// Verifies the object is a React element. Returns true or false.
React.isValidElement(object)

React.Children  // provides utilities for dealing with the this.props.children opaque data structure.

// Invokes a function on every immediate child contained within children with this set to thisArg.
React.Children.map(children, function[(thisArg)])

// Like React.Children.map() but does not return an array.
React.Children.forEach(children, function[(thisArg)])

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

// The React.Fragment component lets you return multiple elements in a render() method without creating an additional DOM element
// You can also use it with the shorthand <></> syntax.
React.Fragment


/* *******************************************************************************************
 * REACT.COMPONENT
 * React.Component is an abstract base class, so it rarely makes sense to refer to React.Component
 * directly. Instead, you will typically subclass it, and define at least a render() method.
 * https://reactjs.org/docs/react-component.html
 * ******************************************************************************************* */


class Component extends React.Component {
  // Will be called before it is mounted
  constructor(props) {
    // Call this method before any other statement
    // or this.props will be undefined in the constructor
    super(props);

    // The constructor is also often used to bind event handlers to the class instance.
    // Binding makes sure the method has access to component attributes like this.props and this.state
    this.method = this.method.bind(this);

    // The constructor is the right place to initialize state. 
    this.state = {
      active: true,

      // In rare cases, it’s okay to initialize state based on props.
      // This effectively “forks” the props and sets the state with the initial props.
      // If you “fork” props by using them for state, you might also want to implement componentWillReceiveProps(nextProps)
      // to keep the state up-to-date with them. But lifting state up is often easier and less bug-prone.
      color: props.initialColor
    };
  }

  // Enqueues changes to the component state and
  // tells React that this component and its children need to be re-rendered with the updated state.
  // setState() does not always immediately update the component. It may batch or defer the update until later.
  // This makes reading this.state right after calling setState() a potential pitfall.
  // Instead, use componentDidUpdate or a setState callback.
  // You may optionally pass an object as the first argument to setState() instead of a function.
  setState(updater[, callback]) { }

  // Invoked just before mounting occurs (before render())
  // This is the only lifecycle hook called on server rendering.
  componentWillMount() { }

  // Invoked immediately after a component is mounted.
  // Initialization that requires DOM nodes should go here.
  // If you need to load data from a remote endpoint, this is a good place to instantiate the network request.
  // This method is a good place to set up any subscriptions. If you do that, don’t forget to unsubscribe in componentWillUnmount().
  componentDidMount() { }

  // Invoked before a mounted component receives new props.
  // If you need to update the state in response to prop changes (for example, to reset it),
  // you may compare this.props and nextProps and perform state transitions using this.setState() in this method.
  componentWillReceiveProps(nextProps) { }

  // Let React know if a component’s output is not affected by the current change in state or props.
  // The default behavior is to re-render on every state change, and in the vast majority of cases you should rely on the default behavior.
  // shouldComponentUpdate() is invoked before rendering when new props or state are being received. Defaults to true.
  // This method is not called for the initial render or when forceUpdate() is used.
  // Returning false does not prevent child components from re-rendering when their state changes.
  shouldComponentUpdate(nextProps, nextState) { }

  // Invoked just before rendering when new props or state are being received.
  // Use this as an opportunity to perform preparation before an update occurs. This method is not called for the initial render.
  // Note that you cannot call this.setState() here; nor should you do anything else
  // (e.g. dispatch a Redux action) that would trigger an update to a React component before componentWillUpdate() returns.
  // If you need to update state in response to props changes, use componentWillReceiveProps() instead.
  componentWillUpdate(nextProps, nextState) { }

  // Invoked immediately after updating occurs. This method is not called for the initial render.
  // Use this as an opportunity to operate on the DOM when the component has been updated.
  // This is also a good place to do network requests as long as you compare the current props to previous props (e.g. a network request may not be necessary if the props have not changed).
  componentDidUpdate(prevProps, prevState) { }

  // Invoked immediately before a component is unmounted and destroyed.
  // Perform any necessary cleanup in this method, such as invalidating timers, canceling network requests,
  // or cleaning up any subscriptions that were created in componentDidMount().
  componentWillUnmount() { }

  // Error boundaries are React components that catch JavaScript errors anywhere in their child component tree,
  // log those errors, and display a fallback UI instead of the component tree that crashed.
  // Error boundaries catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.
  componentDidCatch() { }

  // This method is required.
  // It should be pure, meaning that it does not modify component state,
  // it returns the same result each time it’s invoked, and
  // it does not directly interact with the browser (use lifecycle methods for this)
  // It must return one of the following types: react elements, string and numbers, portals, null or booleans.
  render() {
    // Contains the props that were defined by the caller of this component.
    console.log(this.props);

    // Contains data specific to this component that may change over time.
    // The state is user-defined, and it should be a plain JavaScript object.
    // If you don’t use it in render(), it shouldn’t be in the state.
    // For example, you can put timer IDs directly on the instance.
    // Never mutate this.state directly, as calling setState() afterwards may replace the mutation you made.
    // Treat this.state as if it were immutable.
    console.log(this.state);

    return (
      <div>
        {/* Comment goes here */}
        Hello, {this.props.name}!
      </div>
    );
  }
}

// Can be defined as a property on the component class itself, to set the default props for the class.
// This is used for undefined props, but not for null props.
Component.defaultProps = {
  color: 'blue'
};

component = new Component();

// By default, when your component’s state or props change, your component will re-render.
// If your render() method depends on some other data, you can tell React that the component needs re-rendering by calling forceUpdate().
// Normally you should try to avoid all uses of forceUpdate() and only read from this.props and this.state in render().
component.forceUpdate(callback)


/* *******************************************************************************************
 * REACT.DOM
 * The react-dom package provides DOM-specific methods that can be used at the top level of
 * your app and as an escape hatch to get outside of the React model if you need to.
 * Most of your components should not need to use this module.
 * https://reactjs.org/docs/react-dom.html
 * ******************************************************************************************* */


// Render a React element into the DOM in the supplied container and return a reference
// to the component (or returns null for stateless components).
ReactDOM.render(element, container[, callback])

// Same as render(), but is used to hydrate a container whose HTML contents were rendered
// by ReactDOMServer. React will attempt to attach event listeners to the existing markup.
ReactDOM.hydrate(element, container[, callback])

// Remove a mounted React component from the DOM and clean up its event handlers and state.
// If no component was mounted in the container, calling this function does nothing.
// Returns true if a component was unmounted and false if there was no component to unmount.
ReactDOM.unmountComponentAtNode(container)

// If this component has been mounted into the DOM, this returns the corresponding native browser
// DOM element. This method is useful for reading values out of the DOM, such as form field values
// and performing DOM measurements. In most cases, you can attach a ref to the DOM node and avoid
// using findDOMNode at all.
ReactDOM.findDOMNode(component)

// Creates a portal. Portals provide a way to render children into a DOM node that exists outside
// the hierarchy of the DOM component.
ReactDOM.createPortal(child, container)


/* *******************************************************************************************
 * REACTDOMSERVER
 * The ReactDOMServer object enables you to render components to static markup.
 * https://reactjs.org/docs/react-dom.html
 * ******************************************************************************************* */


// Render a React element to its initial HTML. React will return an HTML string.
// You can use this method to generate HTML on the server and send the markup down on the initial
// request for faster page loads and to allow search engines to crawl your pages for SEO purposes.
ReactDOMServer.renderToString(element)

// Similar to renderToString, except this doesn’t create extra DOM attributes that React uses
// internally, such as data-reactroot. This is useful if you want to use React as a simple static
// page generator, as stripping away the extra attributes can save some bytes.
ReactDOMServer.renderToStaticMarkup(element)

// Render a React element to its initial HTML. Returns a Readable stream that outputs an HTML string.
// The HTML output by this stream is exactly equal to what ReactDOMServer.renderToString would return.
// You can use this method to generate HTML on the server and send the markup down on the initial
// request for faster page loads and to allow search engines to crawl your pages for SEO purposes.
ReactDOMServer.renderToNodeStream(element)

// Similar to renderToNodeStream, except this doesn’t create extra DOM attributes that React uses
// internally, such as data-reactroot. This is useful if you want to use React as a simple static
// page generator, as stripping away the extra attributes can save some bytes.
ReactDOMServer.renderToStaticNodeStream(element)


/* *******************************************************************************************
 * TYPECHECKING WITH PROPTYPES
 * https://reactjs.org/docs/typechecking-with-proptypes.html
 * ******************************************************************************************* */


import PropTypes from 'prop-types';

MyComponent.propTypes = {
  // You can declare that a prop is a specific JS type. By default, these
  // are all optional.
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

  // Anything that can be rendered: numbers, strings, elements or an array
  // (or fragment) containing these types.
  optionalNode: PropTypes.node,

  // A React element.
  optionalElement: PropTypes.element,

  // You can also declare that a prop is an instance of a class. This uses
  // JS's instanceof operator.
  optionalMessage: PropTypes.instanceOf(Message),

  // You can ensure that your prop is limited to specific values by treating
  // it as an enum.
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // An object that could be one of many types
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // An array of a certain type
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // An object with property values of a certain type
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // An object taking on a particular shape
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),

  // You can chain any of the above with `isRequired` to make sure a warning
  // is shown if the prop isn't provided.
  requiredFunc: PropTypes.func.isRequired,

  // A value of any data type
  requiredAny: PropTypes.any.isRequired,

  // You can also specify a custom validator. It should return an Error
  // object if the validation fails. Don't `console.warn` or throw, as this
  // won't work inside `oneOfType`.
  customProp: function(props, propName, componentName) {
    if (!/matchme/.test(props[propName])) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  },

  // You can also supply a custom validator to `arrayOf` and `objectOf`.
  // It should return an Error object if the validation fails. The validator
  // will be called for each key in the array or object. The first two
  // arguments of the validator are the array or object itself, and the
  // current item's key.
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matchme/.test(propValue[key])) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  })
};
```
