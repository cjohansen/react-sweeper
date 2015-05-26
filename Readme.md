# Minesweeper in React and immutable-js

This is a functional, although not entirely complete version of Minesweeper in
React with the game rules implemented with both immutable-js and straight
JavaScript, using mutable objects and arrays.

## Run the immutable version

```sh
cd immutable-es6
npm start
```

[http://localhost:9966](http://localhost:9966)

## Run the mutable version

```sh
cd mutable-es6
npm start
```

[http://localhost:9965](http://localhost:9965)

## Run the immutable ES5 version

```sh
cd immutable
npm start
```

[http://localhost:9967](http://localhost:9967)

## Benchmarking

Part of the exercise of writing this app many times was to benchmark and
compare. Add `?bench` to the end of the URLs, and the game will play itself by
revealing every tile that does not have a mine, and print the full time in the
console. This is not the world's most scientific benchmark, but if you hit
refresh a few times, you get a picture of the average, and the difference is big
enough to notice with a fairly small dataset.
You will likely see the mutable version being the slowest and the immutable ES6
version being the fastest.

## ES6

The code is written with various ES6 features, supported by the Babel
transpiler. There is also a pure ES5 version.
