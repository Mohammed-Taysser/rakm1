
# Getting Start

- <https://github.com/typescript-cheatsheets/react>
- <https://github.com/basarat/typescript-book>


# Typescript

## Installation

```shell
npm -g i typescript
```

to check installation type `tsc -v` into terminal, the output will similar to `Version 4.8.4`

## Transpilation `typescript` into `javascript`

```shell
tsc fileName.ts
```

## `tsconfig.json`

to create `tsconfig.json` use `tsc --init`, it ues to configure how `typescript` will compile

After create `tsconfig.json` use the command `tsc` to compile `typescript` files, add `-w` flag will watch any `typescript` files in the root directory

## Utils

- use `tsc -w fileName.ts` to watch typescript file

## Type Annotations

```js
// Declare variables  with no values
let startup: any

// Declare variables  with values
const num: number = 45;
const str: string = 'mohammed';
const bool: boolean = true;

let all: any = 'dynamic datatype';

let anyOfThem : string | number = 12;
const arrayOfNumbers:number[] = [1,2];

const multiDatatype: (number | string)[] = [1, 2]
const multidimensionalArray: (number | number[])[] = [1, 2, [11, 22]]

// no problem 😉
all = 22;
```

type aliases

```typescript
type str = string
type strNun = string | number

let title: str = 'Mohammed'
```

## Function

optional parameters van be at end of function parameters

```typescript
function getInfo(name: string, age: number, salary?: number): string {
  return `${name} ${age} ${salary}`;
}
```

need to not provide an argument

```typescript
function getInfo(name: string, age: number, salary?: number): string {
  return `${name} ${age} ${salary}`;
}

getInfo(undefine, 22)
```

reset operator

```typescript
function add(...numbers: number[]): number {
  return numbers.reduce((prev: number, current: number) => prev + current, 0)
}

console.log(add(10, 20, 30))
```

## Data types

advanced types

```typescript
type Margin = {
  up   : string,
  down : string,
  right: string,
  left : string,
}

type MarginV2 = Margin & {
  v: number
}

function getMargin(margin: Margin): string {
  return margin.down
}
```

Literal Types

```typescript
function compare(num1: number, num2: number): 0 | 1 | -1 {
  if (num1 === num2) return 0
  else if (num1 > num2) return 1
  else return -1
}

// OR

type comparableType = 0 | 1 | -1

function compare(num1: number, num2: number): comparableType {
  if (num1 === num2) return 0
  else if (num1 > num2) return 1
  else return -1
}
```

### Data Types - Tuple

```typescript
// learned language tubule
// use readonly to prevent add element to it as JS tread it ad array
let languageTubule: readonly [number, string, boolean] = [101, 'React.js', true]

const [code, title, isLeaned] = languageTubule
```

### Data Types - Void And Never

```typescript
// return undefine
function voidFunction(message: string): void {
  console.log(message);
  // use return only without value still void
  return
}

// no return anytime anywhere
function voidFunction(message: string):never {
  throw new Error(message);
}
```

### Data Types - Enums

```typescript
enum levels {
  kids = 15,
  easy = 10,
  medium = 6,
  star = 5
}
console.log(levels.easy);
```

### Data Types - Type Assertions

```typescript
const preview = document.getElementById('previewId') as HTMLImageElement;
const price = <HTMLInputElement>document.getElementById('priceId')

console.log(preview.src);
console.log(price.value);

// Typescript dose'nt perform any check after assert
console.log(('100' as string).repeat(3))  // completely valid
console.log(( 100  as string).repeat(3))  // error on execution
```

## Interface Method And Parameters

```typescript
interface User {
  name: string;
  age?: number;
  readonly username: string;
  isAdmin(): boolean;
  getMessage(username: string): string;
}

const user: User = {
  name: 'Mohammed',
  username: 'mo',
  isAdmin() {
    return Math.random() > 4
  },
  getMessage(username) {
    return `Hello ${username}`
  },
}
```

## Interface Reopen And Use Cases

```typescript
// homepage
interface Setting {
  theme: string;
  font: string;
}

// articles
interface Setting {
  sidebar?: boolean;
}

const userSetting: Setting = {
  theme: 'dark',
  font: 'bold',
}
```

## Interface Extend

this the main different between `type` and `interface`

```typescript
interface User {
  id: number;
  username: string;
}

interface Moderator extends User {
  role: string;
}

interface Admin extends User, Moderator {
  sudo: true;
}

const moderator: Moderator = {
  id: 1,
  username: 'Aurora',
  role: 'Moderator'
}
```

## Polymorphism And Method Override

```typescript
class Player {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
  attack(): void {
    console.log('Attack');
  }
}

class Amazon extends Player {
  constructor(name: string) {
    super(name);
  }

  override attack(): void {
    console.log('Amazon Attack');
  }
}
```

# Typescript.org

## Defining Types

There is already a small set of primitive types available in JavaScript: `boolean`, `bigint`, `null`, `number`, `string`, `symbol`, and `undefined`, which you can use in an `interface`. TypeScript extends this list with a few more, such as `any` (allow anything), `unknown` (ensure someone using this type declares what the type is), `never` (it's not possible that this type could happen), and `void` (a function which returns undefined or has no return value).

```typescript
const user = {
  name: "Hayes",
  id: 0,
};

// You can explicitly describe this object's shape using an interface declaration:
interface User {
  name: string;
  age: number;
}

// You can then declare that a JavaScript object conforms to the shape of your new interface by using syntax like : TypeName after a variable declaration:
const user: User = {
  name: "Hayes",
  age: 20,
};
```

Since JavaScript supports classes and object-oriented programming, so does TypeScript. You can use an `interface` declaration with classes:

```typescript
interface User {
  name: string;
  age: number;
}
 
class UserAccount {
  name: string;
  age: number;
 
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}
 
const user: User = new UserAccount("Mohammed", 22);
```

You can use interfaces to annotate parameters and return values to functions:

```typescript
function getAdminUser(): User {
  //...
}
 
function deleteUser(user: User) {
  // ...
}
```

## Composing Types

### Unions

With a union, you can declare that a type could be one of many types.

A popular use-case for union types is to describe the set of `string` or `number` literals that a value is allowed to be:

```typescript
type WindowStates = "open" | "closed" | "minimized";
type LockStates = "locked" | "unlocked";
type PositiveOddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;
```

Unions provide a way to handle different types too. For example, you may have a function that takes an `array` or a `string`:

```typescript
function getLength(obj: string | string[]) {
  return obj.length;
}
```

To learn the type of a variable, use `typeof`:

Type | Predicate
---  | ---
`string` | `typeof s === "string"`
`number` | `typeof n === "number"`
`boolean` | `typeof b === "boolean"`
`undefined` | `typeof undefined === "undefined"`
`function` | `typeof f === "function"`
`array` | `Array.isArray(a)`

For example, you can make a `function` return different values depending on whether it is passed a `string` or an `array`:

```typescript
function wrapInArray(obj: string | string[]) {
  if (typeof obj === "string") {
    return [obj];
  }
  return obj;
}
```

## Structural Type System

One of TypeScript's core principles is that type checking focuses on the shape that values have. This is sometimes called 'duck typing' or 'structural typing'.

In a structural type system, if two objects have the same shape, they are considered to be of the same type.

```typescript
interface Point {
  x: number;
  y: number;
}
 
function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
 
// logs "12, 26"
logPoint({ x: 12, y: 26 });
```
