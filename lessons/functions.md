# What is a pure function?

For function to be pure the following conditions must hold:

1. *Idempotency*. Result of a function only depends on its direct arguments.
2. *Transparency*. Result of a function is represented by its return value.

# Table

> Every pure function can be substituted with a table (probably infinitely long) where keys
> are arguments and values are returns

Bellow is example of such table

```typescript
const powersOf2 = {
  0: 1,
  1: 2,
  2: 4,
  // ...
};
```

1. Idempotency states that there is a direct relationship between arguments and results. Table represents that using
   key-value pair. On the other hand there can be one return for several arguments.

2. Table is a data structure. It's values in our case are *any* storable language primitives (also known as *first class
   elements*). These can be written to a variable, passed to a function or be *returned* from it. The last piece is
   important. Transparency states that result of a function should be returned but if something can be returned, then it
   can be stored in variable, then it can be passed to another procedure as argument, and therefore it is first class
   element.

We can write generic function that constructs such table pure alternatives given any unary pure function:

```typescript
const withTable = (f) => {
  const table = {};

  return (arg) => {
    if (arg in table) {
      return table[arg];
    }

    table[arg] = f(arg);

    return table[arg];
  }
}
```

The above function also referred as memoization procedure, it excludes computations that already happened previously.

To sum up:

1. Every table can be converted to pure function
2. Every pure function can be converted to table

It means that table <=> pure function. It follows that if function can not be converted to table - it is impure.

# Implications

## Deterministic

Table have one major property - for one key there is only one result. It makes pure functions to be deterministic. But
there is one important thing - to say that there is only one such value for one key we must define `equals` operation.
With
that we can write a function that will check that property.

```typescript
const withDeterministicEnsure = (f) => {
  const table = {};

  return (arg) => {
    const result = f(arg);

    if (arg in table) {
      require(equals(table[arg], result));
    }

    table[arg] = f(arg);

    return table[arg];
  }
} 
```

It is relatively easy to define such function for materializable data (e. g. numbers, string, list of primitives etc.).
But what about functions? It is impossible to store a function in language agnostic way given finite space of memory.
Theoretically we could materialize pure functions because they can be substituted with tables and they in turn can be
materialized, but we would need memory of infinite size.

But what about impure procedures? They can not be substituted with tables. They are not deterministic, meaning that its
result does not depend only on its arguments. It means that we can't materialize them. But does that mean we can't
compare them as well? Alright, what if two impure functions are equal? What that suppose to mean? It surely would not
always mean that they will return the same result given the same arguments, it also would not always mean that they have
the same reference. They should behave exactly equal, right? The problems lie's here - it is hard to define comparable
behaviour of impure functions. Imagine common example of non-deterministic procedure - random number generator. How to
tell when two generators are equal? We could use some analysis techniques for that but for sure it is very hard to
automate and even harder to make use of it.

Functions that return actions (e.g. functions) are not deterministic in general. But the thing is - it does not have to!
Functions are rarely used for comparison, they are meant to be called.

Here is a question:

When pure function returns impure function, is it still pure?

We will try to answer on that question later.

## Immutable

Pure function can not mutate variables visible to other functions, because in that case such act will result in
*side effect*.

```typescript
let global = 0

// Not pure because it's result is not expressed via return value
function increment() {
  global += 1;
}

// Not pure because it is not deterministic
function read() {
  return global
}
```

## Scope dependencies

Imagine following function:

```typescript
const k = 2;

function compute(n) {
  return n * k + 2;
}
```

Is it pure? Let's rephrase it a bit. Can it be represented as a table?

Yes, it can.

```typescript
const k = 2;

const computeFnTable = {
  1: 1 * k + 2,
  2: 2 * k + 2
};
```

We can go further and evaluate given expressions

```typescript
const computeFnTable = {
  1: 4,
  2: 6
};
```

But, can we say that this function is pure as well?

```typescript
let k = 2;

function compute(n) {
  return n * k + 2;
}

delayed(2_000).then(() => k = 4);
```

It is not pure because we can not convert this procedure to table anymore. But why is that? Let's give it a try.

```typescript
let k = 2;

const computeFnTable = {
  1: 1 * k + 2,
  2: 2 * k + 2
};

delayed(2_000).then(() => k = 4);
```

Obviously this won't work. Table will be evaluated before all *mutations* of `k` will happen.

It means that pure functions can have scope level dependencies as long as it consists of values that *never* change (
also known as immutable values).

## Exceptions

Does exceptions cause side effects? If so, how to prove it?

Let's take pure function from previous example and add exception case to it:

```typescript
const k = 2;

function compute(n) {
  if (n % 2 === 0) {
    throw new Error();
  }

  return n * k + 2;
}
```

Now let's try to convert it to table (e.g. prove that it is pure):

```typescript
const k = 2;

const computeFnTable = {
  1: 1 * k + 2,
  2: throw new Error() // Expression expected
};
```

It can't be done, because table expects first class element as a value. The only thing that returns value is an
*expression*.

Interestingly enough, we can fix that by removing `throw` keyword:

```typescript
const k = 2;

function compute(n) {
  if (n % 2 === 0) {
    return new Error('n is even');
  }

  return n * k + 2;
}
```

```typescript
const k = 2;

const computeFnTable = {
  1: 1 * k + 2,
  2: new Error() // OK
};
```

Now this function is pure. `new Error()` is an expression that returns reference to instance of `Error` class. We will
return to that later.

# Usefulness

For function to be pure it must hold several conditions. In the end it applies serious restrictions for procedure
forcing programmer to think differently. But is it useful? Should we use such functions?

## Extendability

There are two types of elements that can compute something:

* Hardware
* Software

Notice the difference between them. **Hard**ware describes physical components of a system. These have weight and
solid shape but most importantly it is *hard* to change hardware's behaviour. That is where **soft**ware comes in.

Programs are meant to be changed easily. But when it is hard to change a software?

> It is hard to change a module from which other modules are depended.

It happens so often so certain principles and patterns were developed to address that problem.

In general almost all of them suggest structuring system in such a way so that modules that change often depend on
modules which are much more stable. It involves managing dependencies and reshaping parts of a program.

But what if we have to change a responsible module? For example when new requirement comes in. In that case we need to
somehow change observed behaviour without modifying its source code. In other words, we need to *extend* our program.

Take a look at this pure function

```typescript
const k = 2;

function compute(n) {
  return n * k + 10
}
```

This function is pure and by definition its output depends on its arguments and its result is represented by its return.
Everything this procedure does is *controllable* by its callee (except the algorithm itself). For example, we could
*map* arguments or return values in special way. Or we could *switch* on its result to filter its effect under certain
scenarios. It turns out, this is more than enough for a function to be extendable.

## Ease of reuse

When function is extendable, it means that it can be extended in a way so that we are able to reuse it inside other
places.

```typescript
const k = 2;

function compute(n) {
  return n * k + 10
}

function pow2(n) {
  return n ** 2;
}

// This function is not pure. Can you guess why?
function computeFromString(n: string) {
  const computed = compute(parseInt(n));

  return `${pow2(computed)}`;
}
```

Here, we take two functions and join (*compose*) them together to create a new function. Notice that `computeFromString`
takes a string but `compute` requires a number. We map string to number and vice versa to maintain relevant type.

## Readability

Readability measures the amount of cognitive load needed to understand a module. Program is said to be readable when it
is relatively easy to understand what it does.

Why it can be hard to understand what function does? There can be multiple reasons:

* Domain related: sophisticated scenarios, naturally complex algorithms
* Environment related: amount of code, naming, language, programming paradigm

Pure functions do not solve directly any of above reasons, but they provide ability to *divide* complexity.

> Pure function can be divided in any number of smaller pure functions

Suppose that it is not true, then one of the smaller functions should be impure, but then in turn it would mean that the
original function is impure as well which contradicts with precondition.

Pure function conditions require for procedure to *declare* its arguments and effects directly via types system. It
results in type signatures that contain a lot of information about function behaviour.

For example, can you tell what this pure function does?

```typescript
function pure(n: number): void {
  // ...
}
```

Judging by its signature, it takes any number and returns `undefined`. It can't have any side effects, so it probably
does nothing, and it is probably useless.

Let's check another function:

```typescript
function pure(n: string): number {
  // ...
}
```

The above function could return the number of chars in string, or the number of spaces or something else. It won't throw
any exception, it won't modify or read any mutable values, its result depends only on its arguments. Add proper
function name to this equation and in most cases it will be enough to understand what function does exactly.

Now, let's now try to examine *impure* version of this procedure.

```typescript
function impure(n: string): number {
  // ...
}
```

What it does? The right answer is *we do not know*. We can of course say that it might count the number of chars in
string, but it can be *not the only thing* it does. It can possibly do anything via side effects, for example reading or
modifying global state or throwing exceptions.

See? How all of these restrictions naturally result in chaos reduction naturally giving us more information about a
function via type system.

### Typing exceptions

Let's return to function we previously saw:

```typescript
const k = 2;

function compute(n) {
  if (n % 2 === 0) {
    return new Error('n is even');
  }

  return n * k + 2;
}
```

We converted exceptions to first class elements, but we also have to type it. How to do it properly? The answer lies in
a proper definition of a type.

> Type describes a set of possible values

In our case we have to describe such a set that contains *either* error values or numeric ones. In other words we need
so-called *sum type*.

> Sum type is a union of several types

In this case we have the set of *one* error, which is an exact string.

```typescript
type IsEvenNegative = 'n is even';
```

And the set of all numbers.

```typescript
type NumberPositive = number;
```

Now the total is:

```typescript
function compute(n: number): IsEvenNegative | NumberPositive {
  if (n % 2 === 0) {
    return 'n is even';
  }

  return n * n0 + 2;
}
```

It is already better, now we can gather much more information from the signature, but it is far from perfect.
For example, how can we switch on a result? How can we know that error is received? Sure, in above case we can
use `typeof` keyword. But what if function returns `string` in both cases?

We can introduce additional level of protection by using very smart technique called *disjoint unions*.

Problem arises from the fact that sum of types that have non-empty intersection result in joint unions, meaning that
there is at least one value that satisfies both types simultaneously making it impossible to distinguish later.

We can create *container* type with is disjoint by default.

```typescript
type Left<T> = {
  type: 'left',
  value: T,
};

type Right<T> = {
  type: 'right',
  value: T,
};

type Either<TLeft, TRight> = Left<TLeft> | Right<TRight>;
```

At any given moment of time `Either` can be either `Left` or `Right` but not both. The key here is literal type `type`
which disjoints both types. Now lets rewrite our example.

```typescript
function compute(n: number): Either<'n is even', number> {
  if (n % 2 === 0) {
    return left0('n is even');
  }

  return right0(n * n0 + 2);
}
```

### Other effects

In general all effects function can do can be typed so that it is known from types perceptive. In worst case scenario
those effects can be moved to actions (see `IO` monad). Such functions are considered impure because they are not
deterministic anymore but still it is very useful technique to make code extendable (via modifying result first class
element) and readable (we know that function is impure and also know the exact type of effect).

## Testability

Once program is written it will change from time to time. We want to be sure our module stays working at all times.

Humans can not verify system in fast and reliable way, it is simply not in our nature.

But computers can do that. Programs that verify the behaviour of ther programs are called tests. In general there are
two types of them:

* Static
* Dynamic

### Static tests

Static tests are those that do not need to be run. They are working continuously, checking our program without a stop.
One of the examples is a type checker. This kind of tests is cheap and usually fast, so it is preferable.

Let's check an example

```typescript
function compute(n: number): Either<'n is even', number> {
  // ...
}
```

Imagine we want to reuse `compute` function somewhere else

```typescript
function computeFromString(n: string): number {
  return compute(n); // Compilation error
}
```

Compiler will complain the above case, because compute can throw, but we are trying to tell (see signature) that this
function will always compute successfully. Thus, we get free test, static check that we cover all possible values our
type (or set) is describing.

Here is fixed version

```typescript
function computeFromString(n: string): number {
  return orElse(compute(n), () => -1);
}
```

Now let's compare that with impure version

```typescript
function compute(n: number): number {
  // ...
}

function computeFromString(n: string): number {
  return compute(n);
}
```

`compute` function might throw, but compiler does not know that, so it can not provide enough protection in return.

### Dynamic tests

Dynamic test is a program that is run explicitly, compared to static version. Physically they are just suite of
functions that *reuse* testable procedures and run assertions on them.

Obviously, pure functions are easy to extend, it means it is easy to reuse them for testing purposes, but it does stop
there.

We also what our tests to run as fast as possible, because we want to check correctness of our program
frequently. For that we can run so-called suits concurrently. It requires for a program to not contain any side effects
to avoid racing conditions.

We want our tests to be simple, meaning that we define constant set of arguments and constant set of assertions,
requiring our procedure to be deterministic.

Let's return to our previous question:

When pure function returns impure function, is it still pure?

Here is example:

```typescript
function amIPure() {
  return () => `My name is ${window.localStorage.getItem('name')}`;
}
```

Let's try and test it:

```typescript
function itReturnsCurrentName() {
  window.localStorage.setItem('name', 'John');

  const impure = amIPure();

  assertEquals(impure(), 'My name is John');
}
```

There are certain problems here:

* To verify the behaviour of a function, the client is *forced* to call supplied impure action. It makes client itself
  to be impure.
* The former means that this test no longer can be run concurrently
* This test requires proper setup and teardown phases due to side effects
* Remember - test is the act of reuse. If it is hard to test then it is hard to reuse.

We could solve a problem by properly dividing pure and impure parts apart:

```typescript
function greet(name) {
  return `My name is ${name}`;
}

// Somewhere in main
function main() {
  function impureGreet() {
    return greet(window.localStorage.getItem('name'))
  }
}

// Test suit
function itReturnsCurrentName() {
  assertEquals(greet('John'), 'My name is John');
}
```

Now, the only thing test suit use is pure function which leads us to better maintainability and execution speed.

Returning to that question: is the original function pure?

Some are arguing that these functions are impure, some arguing that these are not. I think what matters most is
extendability and maintainability of a final product which do not depend on "definitions" but on actual effects.

# General rules

In general the amount of predictable, extendable and maintainable code should be maximized. Other impure parts should be
minimized. Pure functions can't use impure functions inside. But it is not true for reversed case. It follows that
impure procedures should be moved to the *boundaries* of a program making it look like a ball with a big core and thin
outer layer. This type of structure is often called hexagonal architecture.

Inner (the biggest) core consist of pure parts which are divided with respect of responsibilities. Parts that change
often depend only on parts that change less frequently. Whole system is built like a building, from small solid bricks.
These are then connected together in compatible way. Compatability is defined using preconditions, invariants, post
conditions and types. It already introduces static and dynamic tests by itself, as well as additional documentation.

Outer (thin) layer mostly describes access for external mutable sources of data. All impure operations are defined
there. This layer should be as small and as simple as possible, because it won't be tested, it should be *humble*.

Tests should cover observable by client behaviour. In other case they will become *fragile* meaning they will fail even
though behavior has not been changed. Who is a client solely depend on domain of a system.

For API server, the client is an application, for web app the client is a human with some means of perceptions (eyes,
ears, touch controls, etc.)

Sometimes it is not possible to test a system from client perspective. That is where pure part comes in:

* It is pure so it is easy to test
* It is largest and most complex piece of a system so tests will provide enough value

Whole system can be divided into smaller hexagons or balls that are connected together via impure thing layers meaning
that complexity can be managed. But it should be done carefully with full respect to responsibilities of each part (they
should not intersect or should intersect at minimum)
