# Node JS

- [nodejs][nodejs-official-website] is javascript runtime environment, that enable us to use js outside browser
- add some extra features to javascript like manipulate files

**JS engine**:

- `v8` use in chrome

## topics

- backend with nodejs
- express framework
- connect nodejs with mongoDB
- build API with nodejs
- some extra project

## startup

- `window` object == `global` object
- `document` object == `process` object
- `argv` mean argument vector
- get arguments with `process.argv`

## different between nodejs & apache server

- apache server: make thread for each request
- nodejs server: handel all request in the same thread asynchronously using event loop

event loop use two condition to running 'is there any running process', 'is there any callback waiting'

## nodejs not totally single thread

nodejs use two thing

1. `V8`: single thread and asynchronous functions
2. `Libuv`: use to manipulate file system (write in pure c++), multiple thread

[nodejs-official-website]: https://nodejs.org/en/download/
