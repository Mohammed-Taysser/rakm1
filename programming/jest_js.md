
# project structure

```text
dev/
├── css
├── html
├── images
├── sass
├── js
│   ├── aro.js
│   ├── arrow.js
│   ├── gulpfile.js
│   ├── kio.js
│   └── more.js
└── __test__
└── aro.test.js
```

## initialize

    npm init

## install jest

    npm i jest --save-dev

## run tests

> `jest --coverage`

    npm test

## jest function

	test('description', function, timeout)
    # alias as
    it('description', function, timeout)

    describe('description', function)

on `index.js`

```javascript
/* global module */

const powerfulSum = (...numbers) => numbers.reduce((previous, current) => previous + current, 0);

module.exports = powerfulSum;

```

on `index.test.js`

```javascript
/* global test expect require describe */

const just_sum = require('../index.js');

describe('sum numbers', () => {

 test('return 0 if no argument passed', () => {
  expect(just_sum()).toBe(0);
 });

});

```

## focus on test or describe

for `test`

```javascript
test.only('return 0 if no argument passed', () => {
  expect(just_sum()).toBe(0);
});
```

for `describe`

```javascript
describe.only('sum numbers', () => {
  // ...
});

```

## skip tests or describe

for `test`

```javascript
test.skip('return 0 if no argument passed', () => {
  expect(just_sum()).toBe(0);
});
```

for `describe`

```javascript
describe.skip('sum numbers', () => {
  // ...
});

```

## matchers

- `toBe(n)`
- `toHaveLength(n)`
- `toContain(n)`
- `toBeFalsy()`
- `toBeTruthy()`
- `toBeGreaterThan(n)`
- `toBeGreaterThanOrEqual(n)`
- `toBeLessThan(n)`
- `toBeLessThanOrEqual(n)`
- `toBeUndefine()`
- `toMatch(/reg_exp/)`
- `toHaveProperty('name')`

```javascript
expect(arr.length).toBe(5);   // array of length 5
expect(arr).toHaveLength(5);  // array of length 5
expect(arr).toContain(-10);   // array contain 10 as element
expect(isNaN(arr[0)]).toBeFalsy() // first element is number
expect(isNaN(arr[0)]).toBeGreaterThan(10) // first element is greater than 10

// the opposite of matchers
expect(arr.length).not.toBe(5);   // array is not of length 5
expect(arr).not.toHaveLength(5);  // array is not of length 5
expect(arr).not.toContain(-10);   // array not contain 10 as element

expect(str).toMatch(/name/)       // match base on regular expression
expect(str).toHaveProperty('name')       // check if object has property
expect(str).toHaveProperty('name', 10)       // check if object has property and has value 10
```

## custom matchers

```javascript
expect.extend({
 toBeBetween(target, start, end){
    // target is 5 from `expect(5).toBeBetween(1, 10);``
  let result = target <= end && target >= start;
  if (result) {
   return {
    message: `expected ${target} to be between ${start} and ${end}`,
    pass : true,
   };
  }
  else {
   return {
    message :`error expected ${target} to be between ${start} and ${end}`,
    pass : false,
   };
  }
 }
});
```

## expect anything expect null or undefined

```javascript
test('expect anything else null and undefined', () => {
  expect('strange').toEqual(expect.anything())
  expect([1, 2, 3]).toEqual(expect.anything())
})
```

## expect anything

`expect.any(constructor)` constructor like `Number` or `Strong`

```javascript
test('expect anything else null and undefined', () => {
  expect(10).toEqual(expect.any(Number))    // expect only numbers
  expect('mo').toEqual(expect.any(String))  // expect only string
})
```

## expect array

`expect.any(constructor)` constructor like `Number` or `Strong`

```javascript
test('expect anything else null and undefined', () => {
  expect([1, 2]).toEqual(expect.arrayContaining([1]))  // check exist element
})
```

## links

- <https://github.com/sapegin/jest-cheat-sheet/blob/master/Readme.md>
- <https://devhints.io/jest>
- <https://jestjs.io/docs/using-matchers>

# from website

## Getting Started

### install

```sell
npm install --save-dev jest

npm install jest --global
```

Add the following section to your package.json

```js
{
  "scripts": {
    "test": "jest"
  }
}
```

let's get started by writing a test for a hypothetical function that adds two numbers. First, create a `sum.js` file:

```js
function sum(a, b) {
  return a + b;
}
module.exports = sum;
```

Then, create a file named `sum.test.js`. This will contain our actual test:

```js
const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
```

### run test

```js
npm run test
```

### Additional Configuration

Generate a basic configuration file

```shell
jest --init
```

## Common Matchers

```js
test('two plus two is four', () => {
  expect(2 + 2).toBe(4);
});

test('object assignment', () => {
  const data = {one: 1};
  data['two'] = 2;
  expect(data).toEqual({one: 1, two: 2});
});
```

### Truthiness

- `toBeNull` matches only `null`
- `toBeUndefined` matches only `undefined`
- `toBeDefined` is the opposite of `toBeUndefined`
- `toBeTruthy` matches anything that an `if` statement treats as true
- `toBeFalsy` matches anything that an `if` statement treats as false

```js
test('null', () => {
  const n = null;
  expect(n).toBeNull();
  expect(n).toBeDefined();
  expect(n).not.toBeUndefined();
  expect(n).not.toBeTruthy();
  expect(n).toBeFalsy();
});

test('zero', () => {
  const z = 0;
  expect(z).not.toBeNull();
  expect(z).toBeDefined();
  expect(z).not.toBeUndefined();
  expect(z).not.toBeTruthy();
  expect(z).toBeFalsy();
});
```

### Numbers

```js
test('two plus two', () => {
  const value = 2 + 2;
  expect(value).toBeGreaterThan(3);
  expect(value).toBeGreaterThanOrEqual(3.5);
  expect(value).toBeLessThan(5);
  expect(value).toBeLessThanOrEqual(4.5);

  // toBe and toEqual are equivalent for numbers
  expect(value).toBe(4);
  expect(value).toEqual(4);
});
```

For floating point equality, use toBeCloseTo instead of toEqual, because you don't want a test to depend on a tiny rounding error.

```js
test('adding floating point numbers', () => {
  const value = 0.1 + 0.2;
  //expect(value).toBe(0.3);           This won't work because of rounding error
  expect(value).toBeCloseTo(0.3); // This works.
});
```

### Strings

You can check strings against regular expressions with toMatch:

```js
test('there is no I in team', () => {
  expect('team').not.toMatch(/I/);
});

test('but there is a "stop" in Christoph', () => {
  expect('Christoph').toMatch(/stop/);
});
```

### Arrays and iterables

You can check if an array or iterable contains a particular item using toContain

```js
const shoppingList = [
  'diapers',
  'kleenex',
  'trash bags',
  'paper towels',
  'milk',
];

test('the shopping list has milk on it', () => {
  expect(shoppingList).toContain('milk');
  expect(new Set(shoppingList)).toContain('milk');
});
```

## Test4ing Asynchronous Code

### Callbacks

For example, let's say that you have a `fetchData(callback)` function that fetches some data and calls `callback(data)` when it is complete. You want to test that this returned data is the string `'peanut butter'`.

By default, Jest tests complete once they reach the end of their execution.

The problem is that the test will complete as soon as fetchData completes, before ever calling the callback

There is an alternate form of `test` that fixes this. Instead of putting the test in a function with an empty argument, use a single argument called `done`. Jest will wait until the `done` callback is called before finishing the test.

```js
test('the data is peanut butter', done => {
  function callback(data) {
    try {
      expect(data).toBe('peanut butter');
      done();
    } catch (error) {
      done(error);
    }
  }

  fetchData(callback);
});
```

If `done()` is never called, the test will fail (with timeout error), which is what you want to happen.

If the expect statement fails, it throws an error and `done()` is not called. If we want to see in the test log why it failed, we have to wrap expect in a `try` block and pass the error in the `catch` block to `done`. Otherwise, we end up with an opaque timeout error that doesn't show what value was received by `expect(data).`

### Promises

For example, let's say that `fetchData`, instead of using a callback, returns a promise that is supposed to resolve to the string `'peanut butter'`. We could test it with:

```js
test('the data is peanut butter', () => {
  return fetchData().then(data => {
    expect(data).toBe('peanut butter');
  });
});
```

Be sure to return the `promise` - if you omit this return statement, your test will complete before the promise returned from `fetchData` resolves and `then()` has a chance to execute the callback.

If you expect a promise to be rejected, use the `.catch` method. Make sure to add `expect.assertions` to verify that a certain number of assertions are called. Otherwise, a fulfilled promise would not fail the test.

```js
test('the fetch fails with an error', () => {
  expect.assertions(1);
  return fetchData().catch(e => expect(e).toMatch('error'));
});
```

### `.resolves / .rejects`

You can also use the `.resolves` matcher in your expect statement, and Jest will wait for that promise to resolve. If the promise is rejected, the test will automatically fail.

```js
test('the data is peanut butter', () => {
  return expect(fetchData()).resolves.toBe('peanut butter');
});
```

Be sure to return the assertion—if you omit this `return` statement, your test will complete before the promise returned from `fetchData` is resolved and `then()` has a chance to execute the `callback`.

If you expect a promise to be rejected, use the `.rejects` matcher. It works analogically to the `.resolves` matcher. If the promise is fulfilled, the test will automatically fail.

```js
test('the fetch fails with an error', () => {
  return expect(fetchData()).rejects.toMatch('error');
});
```

### Async/Await

Alternatively, you can use `async` and `await` in your tests. To write an async test, use the `async` keyword in front of the function passed to test. For example, the same `fetchData` scenario can be tested with:

```js
test('the data is peanut butter', async () => {
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});

test('the fetch fails with an error', async () => {
  expect.assertions(1);
  try {
    await fetchData();
  } catch (e) {
    expect(e).toMatch('error');
  }
});
```

You can combine async and await with .resolves or .rejects

```js
test('the data is peanut butter', async () => {
  await expect(fetchData()).resolves.toBe('peanut butter');
});

test('the fetch fails with an error', async () => {
  await expect(fetchData()).rejects.toMatch('error');
});
```