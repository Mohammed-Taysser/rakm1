# Pitfall

Write components with code and markup

## Nesting Components

Components can render other components, but you must never nest their definitions

```jsx
export default function Gallery() {
  // 🔴 Never define a component inside another component!
  function Profile() {
    // ...
  }
  // ...
}
```

The snippet above is very slow and causes bugs. Instead, define every component at the top level:

```jsx
export default function Gallery() {
  // ...
}

// ✅ Declare components at the top level
function Profile() {
  // ...
}
```

When a child component needs some data from a parent, pass it by props instead of nesting definitions.

## Keeping Components Pure

- **It minds its own business**. It does not change any objects or variables that existed before it was called.
- **Same inputs, same output**. Given the same inputs, a pure function should always return the same result.

Consider this math formula: y = 2x.

If x = 2 then y = 4. Always.
If x = 3 then y = 6. Always.
If x = 3, y won't sometimes be 9 or -1 or 2.5 depending on the time of day or the state of the stock market.

```js
function double(number) {
  return 2 * number;
}
```

## Can event handlers have side effects?

Absolutely! Event handlers are the best place for side effects.

Unlike rendering functions, event handlers don't need to be [`pure`](https://react.dev/learn/keeping-components-pure), so it's a great place to change something—for example, change an input's value in response to typing, or change a list in response to a button press. However, in order to change some information, you first need some way to store it. In React, this is done by using state, a component's memory.

## different between `react` & `react-dom`

react know how to deal with component which call `reconciler`, reactDom know how to take instructions on what we want to show & turn it to html which call `renderer`

## Update State

### Updating Objects in State

```jsx
import { useState } from 'react';

function MovingDot() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const onPointerMove = (evt) => {
    setPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      onPointerMove={onPointerMove}
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
      }}
    >
      <div
        style={{
          position: 'absolute',
          backgroundColor: 'tomato',
          borderRadius: '50%',
          transform: `translate(${position.x}px, ${position.y}px)`,
          left: -10,
          top: -10,
          width: 20,
          height: 20,
        }}
      />
    </div>
  );
}
```

### Updating Arrays in State

|           | avoid (mutates the array)           | prefer (returns a new array)       |
| --------- | ----------------------------------- | ---------------------------------- |
| adding    | `push`, `unshift`                   | `concat`, `[...arr]` spread syntax |
| removing  | `pop`, `shift`, `splice`            | `filter`, `slice`                  |
| replacing | `splice`, `arr[i] = ...` assignment | `map`                              |
| sorting   | `reverse`, `sort`                   | copy the array first               |

## Composing your logic out of pure functions

that rely only on input makes it easier to track bugs and extend

```jsx
// 👎 Helper functions shouldn't read from the component's state
export default function Component() {
  const [value, setValue] = useState('')

  function isValid() {
    // ...
  }

  return <></>
}

// 👍 Extract them and pass only the values they need
export default function Component() {
  const [value, setValue] = useState('')

  return <></>
}

function isValid(value) {
  // ...
}
```

## Pass Objects Instead of Primitives

```jsx
// 👎 Don't pass values on by one if they're related
<UserProfile
  bio={user.bio}
  name={user.name}
  email={user.email}
  subscription={user.subscription}
/>

// 👍 Use an object that holds all of them instead
<UserProfile user={user} />
```

## Move Lists in a Separate Component

```jsx
// 👎 Don't write loops together with the rest of the markup
function Component({ topic, page, articles, onNextPage }) {
  return (
    <div>
      <h1>{topic}</h1>
      {articles.map((article) => (
        <div>
          <h3>{article.title}</h3>
          <p>{article.teaser}</p>
          <img src={article.image} />
        </div>
      ))}
      <div>You are on page {page}</div>
      <button onClick={onNextPage}>Next</button>
    </div>
  );
}

// 👍 Extract the list in its own component
function Component({ topic, page, articles, onNextPage }) {
  return (
    <div>
      <h1>{topic}</h1>
      <ArticlesList articles={articles} />
      <div>You are on page {page}</div>
      <button onClick={onNextPage}>Next</button>
    </div>
  );
}
```

## Using Dot Notation for JSX Type

```js
const MyComponents = {
  DatePicker: function DatePicker(props) {
    return <div>Imagine a {props.color} datepicker here.</div>;
  },
};

function BlueDatePicker() {
  return <MyComponents.DatePicker color='blue' />;
}
```

## Choosing the Type at Runtime

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

## Component Properties

```js
// npm install --save prop-types  => runtime type checking for React props and similar objects

// Verifies the object is a React element. Returns true or false.
React.isValidElement(object);

// Returns the total number of components in children,
// equal to the number of times that a callback passed to map or forEach would be invoked.
React.Children.count(children);

// Verifies that children has only one child (a React element) and returns it.
// Otherwise this method throws an error.
React.Children.only(children);

// Returns the children opaque data structure as a flat array with keys assigned to each child.
// Useful if you want to manipulate collections of children in your render methods,
// especially if you want to reorder or slice this.props.children before passing it down.
React.Children.toArray(children);

// Can be defined as a property on the component class itself, to set the default props for the class.
// This is used for undefined props, but not for null props.
componentName.defaultProps = {
  color: 'blue',
};
```

## Assign Default Props When Destructuring

```jsx
// 👎 Don't define the default props outside of the function
function Component({ title, tags, subscribed }) {
  return <div>...</div>;
}

Component.defaultProps = {
  title: '',
  tags: [],
  subscribed: false,
};

// 👍 Place them in the arguments list
function Component({ title = '', tags = [], subscribed = false }) {
  return <div>...</div>;
}
```

## Referencing Values with Refs

When you want a component to **remember** some information, but you don't want that information to trigger new renders, you can use a ref.

```jsx
const ref = useRef(0);
```

`useRef` returns an object like this:

```js
{ 
  current: 0 // The value you passed to useRef
}
```

### Accessing another component's DOM nodes

This is how it works:

- `<MyInput ref={inputRef} />` tells React to put the corresponding DOM node into `inputRef.current`. However, it's up to the `MyInput` component to opt into that—by default, it doesn't.
- The `MyInput` component is declared using `forwardRef`. This opts it into receiving the `inputRef` from above as the second ref argument which is declared after props.
- `MyInput` itself passes the ref it received to the `<input>` inside of it.

```jsx
import { forwardRef, useRef } from 'react';

const MyInput = forwardRef((props, ref) => {
  return <input {...props} ref={ref} />;
});

export default function Form() {
  const inputRef = useRef(null);

  function handleClick() {
    inputRef.current.focus();
  }

  return (
    <>
      <MyInput ref={inputRef} />
      <button onClick={handleClick}>
        Focus the input
      </button>
    </>
  );
}
```

## Differences between refs and state

| Refs                                                                                | State                                                                                                                   |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| useRef(initialValue) returns { current: initialValue }                              | useState(initialValue) returns the current value of a state variable and a state setter function ( `[value, setValue]`) |
| Doesn't trigger re-render when you change it.                                       | Triggers re-render when you change it.                                                                                  |
| Mutable—you can modify and update current's value outside of the rendering process. | "Immutable"—you must use the state setting function to modify state variables to queue a re-render.                     |
| You shouldn't read (or write) the current value during rendering.                   | You can read state at any time. However, each render has its own snapshot of state which does not change.               |

### Counter Button Implemented With State

Because the `count` value is displayed, it makes sense to use a state value for it. When the counter's value is set with `setCount()`, React re-renders the component and the screen updates to reflect the new count.

```jsx live
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button onClick={handleClick}>
      You clicked {count} times
    </button>
  );
}
```

### Counter Button Implemented With Ref

If you tried to implement this with a ref, React would never re-render the component, so you'd never see the count change! See how clicking this button **does not update its text**:

```jsx live
function Counter() {
  let countRef = useRef(0);

  function handleClick() {
    // This doesn't re-render the component!
    countRef.current = countRef.current + 1;
  }

  return (
    <button onClick={handleClick}>
      You clicked {countRef.current} times
    </button>
  );
}
```

This is why reading ref.current during render leads to unreliable code. If you need that, use state instead.

### When to use refs

- Storing timeout IDs
- Storing and manipulating DOM elements.
- Storing other objects that aren't necessary to calculate the JSX.

## Group by `Route/Module`

```txt
// 👎 Don't group by technical details
├── containers
|   ├── Dashboard.jsx
|   ├── Details.jsx
├── components
|   ├── Table.jsx
|   ├── Form.jsx
|   ├── Button.jsx
|   ├── Input.jsx
|   ├── Sidebar.jsx
|   ├── ItemCard.jsx

// 👍 Group by module/domain
├── modules
|   ├── common
|   |   ├── components
|   |   |   ├── Button.jsx
|   |   |   ├── Input.jsx
|   ├── dashboard
|   |   ├── components
|   |   |   ├── Table.jsx
|   |   |   ├── Sidebar.jsx
|   ├── details
|   |   ├── components
|   |   |   ├── Form.jsx
|   |   |   ├── ItemCard.jsx
```

## Wrap External Components

Try not to import too many 3rd party components directly. By creating an adapter around them we can modify the API if we have to. Also, we can change the library in a single place.

```jsx
// 👎 Don't import directly
import { Button } from 'semantic-ui-react';
import DatePicker from 'react-datepicker';

// 👍 Export the component and use it referencing your internal module
import { Button, DatePicker } from '@modules/common/components';
```
