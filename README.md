# RxJS-TestScheduler-Bootstrapper

RxJS v5 provides implementation to its [test scheduler](https://github.com/ReactiveX/rxjs/blob/master/src/testing/TestScheduler.ts) but there are some questions related how to set it up to actually create test using those, similar to test coverages in RxJS's repo. There are currently ongoing effort to revise those interfaces more friendly manner which'll remove churns eventually, meanwhile this package provides small utility function to setup test scheduler instances without knowning internals of how did fixture setup in source of library.

# Install

This has a peer dependencies of `rxjs@5.*.*`, which will have to be installed as well

```sh
npm install rxjs-testscheduler-bootstrapper
```

# Usage

You can import `createTestScheduler` function serves as factroy function to create testscheduler and helper functions.

```js
import { createTestScheduler } from 'rxjs-testscheduler-bootstrapper';

const { scheduler, hot, cold, expectObservable } = createTestScheduler();

const v1 = hot ('--a--b--|');
const v2 = cold('--1--2--|');

const value = v1.concatMap(() => v2);

expectObservable(value).toBe('----1--2----1--2--|');

scheduler.flush();
```

`TestScheduler` internally uses `chai`'s assertion to compare marble based observable diagrams and it can be overridden if needed

```js
const customMatcher = (actual: Array<any>, expected: Array<any>) => {
  //do own assertion as needed
};

//now `expectObservable` will use customMatcher instead
const s = createTestScheduler(customMatcher);
```

# FAQ
- I saw RxJS's test codes are not doing `scheduler.flush()` for each tests. Why do I need to do that?

: RxJS repo uses own [test ui for mocha](https://github.com/ReactiveX/rxjs/blob/master/spec/helpers/testScheduler-ui.ts) patches test execution suite does creation / flushing test scheduler instance. There isn't single & simple approach to make those patch works on various test runner so if you'd like to have it, you may need to setup test fixture for your own test runner.

- I want v4's scheduler interface like `scheduler::advanceTo()` but scheduler doesn't have those interface

: Check https://github.com/kwonoj/rxjs-testscheduler-compat for those purpose.



# Building / Testing

Few npm scripts are supported for build / test code.

- `build`: Transpiles code to ES5 commonjs to `dist`.
- `build:clean`: Clean up existing build
- `test`: Run unit test. Does not require `build` before execute test.
- `test:cover`: Run code coverage against test cases
- `lint`: Run lint over all codebases
- `lint:staged`: Run lint only for staged changes. This'll be executed automatically with precommit hook.
- `commit`: Commit wizard to write commit message