# Hooks

a way to write reusable code instead of more classic techniques like inheritance

- `useState` function that let us use state in function component
- `useEffect` function that let us use something lke lifeCycle method in function component
- `useRef` function that let us create `ref` in function component

## Primitive Hooks

- useState
- useEffect
- useContext
- useCallback
- useReducer
- useMemo
- useRef
- useRefuseImperative
- useLayoutEffect
- useDebugValue

## Custom Hooks

use Primitive hook to create custom hook like useTranslate (comping of useState & useEffect)

## `useState`

- Insure that async function will use current value instead of old value.
- Always provide initial value with default value.

```js
const [number, setNumber] = useState(0);

const increaseAsync = () => {
  setTimeOut(() => {
    setNumber((currentValue) => currentValue + 1);
  }, 2000);
};
```

### Update specific object property

```js
const [userInfo, setUserInfo] = useState({
  username: 'mohamed',
  avatar: 'url',
});

const changeUserAvatar = (newAvatarUrl) => {
  setUserInfo((prev) => ({
    ...prev,
    avatar: newAvatarUrl,
  }));
};
```

### Change all inputs with a single `onChange`

```js
const [userInfo, setUserInfo] = useState({
  username: 'mohamed',
  avatar: 'url',
});

const onInputChange = (evt) => {
  setUserInfo((prev) => ({
    ...prev,
    [evt.target.name]: evt.target.value,
  }));
};
```

### Be careful about React derived states

instead of store `selectedPost` store only id as `selectedId`, then user id to filter and find the selected post

the reason why 💡 : is that `selectedPost` are store then if we do any operation on `posts` like increase likes of comments will not effect on `selectedPost`

## `useEffect`

**note** because of `strick` mode of react `useEffect` render twice, it's not a bug due to the documentation is to ensure it work fine to production

use `useMemo` to save **un primitive** datatype like object, array.

```js
const [userInfo, setUserInfo] = useState({
  username: 'mohamed',
  avatar: 'url',
  following: [],
});

// method 1: using `useMemo`
const user = useMemo(
  () => ({
    username: userInfo.username,
  }),
  [userInfo.username]
);

useEffect(() => {
  console.log('Component Render');
}, [user]);

// method 2: using the property name
useEffect(() => {
  console.log('Component Render');
}, [userInfo.username]);
```

### Use `cleanup` function

look at the following `useEffect` code.

each time the component render it add new `Interval` to the dom

```js
const [number, setNumber] = useState(0);

useEffect(() => {
  setInterval(() => {
    setNumber((prev) => prev + 1);
  }, 1000);
}, []);
```

the solution is `cleanup` function to remove old `Interval`

```js
const [number, setNumber] = useState(0);

useEffect(() => {
  const intervalId = setInterval(() => {
    setNumber((prev) => prev + 1);
  }, 1000);

  return () => {
    clearInterval(intervalId);
  };
}, []);
```

### Best Ways to Make API Requests with useEffect

ensure that api call is close after `componentDidMount`

```js
// Junior 😢
useEffect(() => {
  let isCanceled = false;

  if (!isCanceled) {
    apiFunctionCall();
  }

  return () => {
    isCanceled = true;
  };
}, []);

// Senior 😎
useEffect(() => {
  const controller = AbortController();
  const signal = controller.signal;

  if (!controller) {
    fetch('url', { signal })
      .then()
      .catch((error) => {
        if (error.name === 'AbortError') {
          // request is canceled
        } else {
          // any other error
        }
      });
  }

  return () => {
    controller.abort();
  };
}, []);
```

### Decide to use `axios`

```js
// Senior 😎
useEffect(() => {
  const cancelToken = axios.CancelToken.source();
  const signal = controller.signal;

  if (!controller) {
    axios
      .get('url', { cancelToken: cancelToken.token })
      .then()
      .catch((error) => {
        if (axios.isCancel(error)) {
          // request is canceled
        } else {
          // any other error
        }
      });
  }

  return () => {
    cancelToken.cancel();
  };
}, []);
```

## `useRef`

Refs let a component hold some information that isn't used for rendering, like a DOM node or a timeout ID. Unlike with state, updating a ref does not re-render your component.

## Prefer Hooks to HOCs and Render Props

```jsx
// 👎 Avoid using render props
function Component() {
  return (
    <>
      <Header />
      <Form>
        {({ values, setValue }) => (
          <input
            value={values.name}
            onChange={e => setValue('name', e.target.value)}
          />
          <input
            value={values.password}
            onChange={e => setValue('password', e.target.value)}
          />
        )}
      </Form>
      <Footer />
    </>
  )
}

// 👍 Favor hooks for their simplicity and readability
function Component() {
  const [values, setValue] = useForm()

  return (
    <>
      <Header />
      <input
        value={values.name}
        onChange={e => setValue('name', e.target.value)}
      />
      <input
        value={values.password}
        onChange={e => setValue('password', e.target.value)}
      />
      <Footer />
    </>
  )
}
```
