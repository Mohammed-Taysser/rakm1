
## initialize

    npm init

## install jest

    npm i jest --save-dev

## run tests

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
