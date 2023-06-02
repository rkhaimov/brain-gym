```typescript
type AreEqual<A, B> = A extends B ? (B extends A ? true : false) : false;

declare const expect: <T extends true>() => void;

declare const identity: <T>(input: T) => T;

interface Compose {
    <A, B, C>(g: (x: B) => C, f: (x: A) => B): (x: A) => C;

    <A, B, C, D>(h: (x: C) => D, g: (x: B) => C, f: (x: A) => B): (x: A) => D;
}

declare const compose: Compose;
```

# Category theory

It is the most abstract branch of mathematics

Firstly there were assembly languages - very lowed level, imperative way to write a program. Main problem of which are -
they are hard to understand by human, and it is very hard to scale such programs

Then, procedural paradigm came - its main purpose is to provide ability to divide big problem into smaller pieces called
procedures. It can compute a value based on other values, or it can do a side effect.

Next, people came up with an idea of object-oriented paradigm, and it's even more abstract. Now we have stuff that is
hidden inside objects. These can then be composed together to implement more complex behaviours. Encapsulation improves
readability and maintainability by hiding implementation details behind small and concise interface.

## Important idea

All these paradigm provide certain ways to divide complex problems into smaller ones, solve them separately and combine
the solutions together. There is a name for that - Compatibility.

There is another idea though - abstraction (subtraction). It means getting read of details. Details are among main
sources of complexity and fragility.

Compatibility and abstraction in union provide reusable blocks of code.

## Something is wrong

OOP exhibits problems when working with concurrent code.

This paradigm hides two things that are very important:

* Mutations - object can change its state over time, and it is hidden from the client
* Share - object often contain pointer to other objects. These are often hidden.

Both create surface for side effects and non-deterministic behaviour. Main causes for rigid and immobile code to exist.

## Solutions

Category theory is a high level language. It provides abstract ideas that can be translated into practical tools.
It unifies a lot of things making for example all programming languages to look the same. It even unifies certain areas
of mathematics which describes rules of logic and universe (presented with human minds).

## Types

People used to work with data as a collection of bytes with pointers between. And again it is low level. Type theory
came to help us, it describes all categories of data structures. Again, it classifies them all at higher level of
abstraction making it to be language independent.

## Logic

There is logic that were created long time ago. At some point people realized that all these distinct areas of
mathematics are exactly the same. Whatever you do logic can be directly translated into type theory (and vice versa).

They are said to be isomorphic. We will define that later

## Divisibility

There might be a reason for category theory to be ubiquitous. People solve complex problems by dividing them into
smaller ones and combine a solution later. So if a problem is complex, and it can be chopped - then it is not solved and
theory is not born. That may be the reason why all the branches of mathematics can be abstracted via certain categories
with composition abstractions. It does not mean that all universe is structured in exactly that way.

Maybe it's just our brains that love structure so much. Maybe we are able to understand something only if it has
particular rules describing how inner parts are communicating together former final architecture of a thing.

Category theory is not about mathematics or physics, it is about human minds.

## What is a category

These are the main tools for solving problems by decomposing into simpler questions:

* Abstraction
* Composition
* Identity

The last one is especially important. Abstraction removes unnecessary details from objects thus casting them to simpler,
higher level entities. It often results in different in details objects to become *identical*.

Composition and Identity in union define category theory. It encompasses those two.

## Category insides

Category consists of objects and morphisms (arrows, operations or functions transforming one object to another within
same category). Object has no properties or structures. It is like a point, just some primitive. Morphism is also a
primitive. The only property it has is that an arrow has start and end points.

Objects in that case serve the only purpose to define both ends of arrows (morphisms)

Interestingly enough, so-called spatial relationship and movement were among the first ways primitive man were
communicating with each other.

* There can be zero or more number of arrows between objects.
* Arrows can be reference to itself. A -> A

```typescript
declare const id: (x: number) => number;
```

* Arrows can be bidirectional (cycles). A -> B -> A

```typescript
declare const t1: (x: number) => string;
declare const t2: (x: string) => number;
```

## Composition

It is a property that if A f -> B g -> C than there always must exist an arrow such that A g * f -> C.
declare const t3: (x: number) => string;
declare const t4: (x: string) => boolean;
const t5 = compose(t4, t3);

## Identity

Category is identified by all possible compositions of all morphisms between objects (multiplication table). Different
tables will give different categories.

For every object A there is a morphism s.t. A id -> A. id is called *identity* morphism.

* id * f = f = f * id
  declare const id: <T>(x: T) => T;

id * f = f * id
declare const t11: (x: number) => string;

const t12 = compose(id, t11);
const t13 = compose(t11, id<number>);

expect<AreEqual<typeof t12, typeof t13>>();

Every category must have an identity element. When dealing with functions, the identity arrow is implemented as the
identity function that just returns back its argument. The implementation is the same for every type, which means this
function is universally polymorphic

## Associativity

Suppose we have A f -> B g -> C h -> D then there are two options:
declare const t6: (x: number) => string;
declare const t7: (x: string) => boolean;
declare const t8: (x: boolean) => number[];

* A g * f -> C h -> D = h * (g * f)
  const t9 = compose(t8, compose(t7, t6));
* A f -> B h * g -> D = (h * g) * f
  const t10 = compose(compose(t8, t7), t6);
* h * (g * f) = (h * g) * f
  expect<AreEqual<typeof t9, typeof t10>>();

It means that parentheses can be moved freely thus they are not important. It means that morphisms can be *composed* in
any order.

To summarize: A category consists of objects and arrows (morphisms). Arrows can be composed, and the composition is
associative.
Every object has an identity arrow that serves as a unit under composition.

## QUESTIONS

Is the world-wide web a category in any sense? Are links morphisms?
Objects in this category are web-sites
Morphisms are links between them

* Composition -> link from Yandex to Google and from Google to YouTube can be composed into a new link from Yandex to
  YouTube
* Identity -> link can refer to _blank and do nothing by result

Is Facebook a category, with people as objects and friendships as morphisms?
Objects in this category are people
Morphisms are friendship between them

* Composition -> if Jorge is friend of Mike and Mike is friend of Zoe, it does not mean Jorge is going well with Zoe
* Identity -> Jorge might not go well with himself

When is a directed graph a category?

* Composition -> every head and tail of three connected nodes should be connected with an arrow
* Identity -> every node should have an arrow to itself

# Types and Functions

In a dynamically typed language, type mismatches would be discovered at runtime, in strongly typed
statically checked languages type mismatches are discovered at compile time, eliminating lots of incorrect programs
before they have a chance to run.

## Types Are About Composability

Category theory is about composing arrows. But not any two arrows can be composed. The target object of one arrow must
be the same as the source object of the next arrow. In programming we pass the results of one function to another. The
program will not work if the target function is not able to correctly interpret the data produced by the source
function. The two ends must fit for the composition to work. The stronger the type system of the language, the better
this match can be described and mechanically verified.

In Haskell, except on rare occasions, type annotations are purely optional. Programmers tend to use them anyway, because
they can tell a lot about the semantics of code, and they make compilation errors easier to understand. It’s a common
practice in Haskell to start a project by designing the types. Later, type annotations drive the implementation
and become compiler-enforced comments.

Unit testing may catch some mismatches, but testing is almost always a probabilistic rather than a deterministic
process. Testing is a poor substitute for proof.

## What Are Types?

The simplest intuition for types is that they are sets of values. Sets can be finite or infinite. The type of String,
which is a synonym for a list of Char, is an example of an infinite set.

There are some subtleties that make this identification of types and sets tricky. There are problems with polymorphic
functions that involve circular definitions, and with the fact that you can’t have a set of all sets.

```typescript
// Why We can not have sets of all sets?
```

𝐒𝐞𝐭 is a very special category, because we can actually peek inside its objects and get a lot of intuitions from doing
that.

* We know that an empty set has no elements.
* We know that there are special one-element sets.
* We know that functions map elements of one set to elements of another set. They can map two elements to one, but not
  one element to two.
* We know that an identity function maps each element of a set to itself.

The plan is to gradually forget all this information and instead express all those notions in purely categorical terms,
that is in terms of objects and arrows.

A mathematical function does not execute any code — it just knows the answer. A function has to calculate the
answer. It’s not a problem if the answer can be obtained in a finite number of steps — however big that number might be.
But there are some calculations that involve recursion, and those might never terminate. We can’t just ban
non-terminating functions from Haskell because distinguishing between terminating and non-terminating functions is
undecidable — the famous halting problem.

That’s why computer scientists came up with a brilliant idea, or a major hack, depending on your point of view, to
extend every type by one more special value called the bottom and denoted by _|_, or Unicode ⊥. This “value” corresponds
to a non-terminating computation.

Functions that may return bottom are called partial, as opposed to total functions, which return valid results for every
possible argument.

```typescript
declare const hang: () => never;

const n: number = hang();
```

## Why Do We Need a Mathematical Model?

There are formal tools for describing the semantics of a language but, because of their complexity, they are mostly used
with simplified academic languages, not real-life programming behemoths. One such tool called operational semantics
describes the mechanics of program execution.

The problem is that it’s very hard to prove things about programs using operational semantics. To show a property of a
program you essentially have to “run it” through the idealized interpreter.

```typescript
// What is operational semantics?
```

We think that the code we write will perform certain actions that will produce desired results. We are usually quite
surprised when it doesn’t. That means we do reason about programs we write, and we usually do it by running an
interpreter in our heads. It’s just really hard to keep track of all the variables. Computers are good at running
programs — humans are not! If we were, we wouldn’t need computers.

But there is an alternative. It’s called denotational semantics, and it’s based on math. In denotational semantics every
programming construct is given its mathematical interpretation. With that, if you want to prove a property of a program,
you just prove a mathematical theorem.

```typescript
// Denotational friendly syntax
const fact = (n: number) => product(range(1, n));
```

```typescript
function fact(n: number): number {
    const result = 1;

    for (const i = 2; i <= n; ++i) {
        result *= i;
    }

    return result;
}
```

Okay, I’ll be the first to admit that this was a cheap shot! A factorial function has an obvious mathematical
denotation. An astute reader might ask: What’s the mathematical model for reading a character from the keyboard or
sending a packet across the network? For the longest time that would have been an awkward question leading to a rather
convoluted explanation. It seemed like denotational semantics wasn’t the best fit for a considerable number of important
tasks that were essential for writing useful programs, and which could be easily tackled by operational semantics. The
breakthrough came from category theory. Eugenio Moggi discovered that computational effect can be mapped to monads. This
turned out to be an important observation that not only gave denotational semantics a new lease on life and made pure
functional programs more usable, but also shed new light on traditional programming.

This might not seem so important when you’re writing consumer software, but there are areas of programming where the
price of failure may be exorbitant, or where human life is at stake. But even when writing web applications for the
health system, you may appreciate the thought that functions and algorithms from the Haskell standard library come with
proofs of correctness.

## Pure and Dirty Functions

The things we call functions in C++ or any other imperative language, are not the same things mathematicians call
functions. A mathematical function is just a mapping of values to values.

We can implement a mathematical function in a programming language: Such a function, given an input value will calculate
the output value. A function to produce a square of a number will probably multiply the input value by itself. It will
do it every time it’s called, and it’s guaranteed to produce the same output every time it’s called with the same input.
The square of a number doesn’t change with the phases of the Moon.

Also, calculating the square of a number should not have a side effect of dispensing a tasty treat for your dog. A
“function” that does that cannot be easily modelled as a mathematical function.

In programming languages, functions that always produce the same result given the same input and have no side effects
are called pure functions. In a pure functional language like Haskell all functions are pure. Because of that, it’s
easier to give these languages denotational semantics and model them using category theory. As for other languages, it’s
always possible to restrict yourself to a pure subset, or reason about side effects separately.

## Examples of Types

It’s a type that’s not inhabited by any values. You can define a function that takes Void, but you can never call it. To
call it, you would have to provide a value of the type Void, and there just aren’t any. As for what this function can
return, there are no restrictions whatsoever.

```typescript
const absurd = <T>(input: never): T => input;
```

The name is not coincidental. There is deeper interpretation of types and functions in terms of logic called the
Curry-Howard isomorphism. The type Void represents falsity, and the type of the function absurd corresponds to the
statement that from falsity follows anything.

Next is the type that corresponds to a singleton set. It’s a type that has only one possible value. This value just
“is.”

Think of functions from and to this type. A function from void can always be called. If it’s a pure function, it will
always return the same result.

```typescript
const a42 = (input: void) => 42;
const b42 = () => 42;

// a42 === b42
```

Conceptually, it takes a dummy value of which there is only one instance ever, so we don’t have to mention it
explicitly. In Haskell, however, there is a symbol for this value: an empty pair of parentheses, ().

Notice that every function of unit is equivalent to picking a single element from the target type. In fact, you could
think of pick as a different representation for the value of a set. This is an example of how we can replace explicit
mention of elements of a set by talking about functions (arrows) instead. Functions from unit to any type 𝐴 are in
one-to-one correspondence with the elements of that set 𝐴.

Mathematically, a function from a set 𝐴 to a singleton set maps every element of 𝐴 to the single element of that
singleton set.

```typescript
const unit = <T>(input: T): void => {
};
```

Functions that can be implemented with the same formula for any type are called parametrically polymorphic. This is in
fact a constructor of unit.

Pure functions from Bool just pick two values from the target type, one corresponding to True and another to False.
Functions to Bool are called predicates.

```typescript
type Bool = true | false;

// number^2
const oneOrTwo = (input: boolean) => input ? 1 : 2;

// 2^number
const isEven = (input: number) => input % 2 === 0
```

## QUESTIONS

* Define a higher-order function (or a function object) memoize in your favorite language.
* Try to memoize a function from your standard library that you normally use to produce random numbers.
* Implement a function that takes a seed, calls the random number generator with that seed, and returns the result.
  Memoize that function.
* How many functions are there from Bool to Bool?
* Draw a picture of a category whose only objects are the types Void, () (unit), and Bool; with arrows corresponding to
  all possible functions between these types. Label the arrows with the names of the functions.

# Categories Great and Small

Categories come in all shapes and sizes and often pop up in unexpected places.

## No Objects

The most trivial category is one with zero objects and, consequently, zero morphisms.

## Simple Graphs

A category can be generated from directed graph. Such a category is called a free category generated by a given graph.
It’s an example of a free construction, a process of completing a given structure by extending it with a minimum number
of items to satisfy its laws (here, the laws of a category).

## Orders

A category where a morphism is a relation between objects: the relation of being less than or equal. Do we have identity
morphisms? Every object is less than or equal to itself: check! Do we have composition? If 𝑎 ⩽ 𝑏 and 𝑏 ⩽ 𝑐 then 𝑎 ⩽ 𝑐:
check! Is composition associative? Check! A set with a relation like this is called a preorder, so a preorder is indeed
a category.

You can also have a stronger relation, that satisfies an additional condition that, if 𝑎 ⩽ 𝑏 and 𝑏 ⩽ 𝑎 then 𝑎 must be
the same as 𝑏. That’s called a partial order.

Finally, you can impose the condition that any two objects are in a relation with each other, one way or another; and
that gives you a linear order or total order.

A preorder is a category where there is at most one morphism going from any object 𝑎 to any object 𝑏. Another name for
such a category is “thin.” A preorder is a thin category.

A set of morphisms from object 𝑎 to object 𝑏 in a category 𝐂 is called a hom-set and is written as 𝐂(𝑎, 𝑏) (or,
sometimes, Hom𝐂(𝑎, 𝑏)). So every hom-set in a preorder is either empty or a singleton. That includes the hom-set 𝐂(𝑎,
𝑎), the set of morphisms from 𝑎 to 𝑎, which must be a singleton, containing only the identity, in any preorder.

![Preorder](img.png)

Cycles are forbidden in a partial order.

## Monoid as Set

It’s the concept behind basic arithmetics: Both addition and multiplication form a monoid. Monoids are ubiquitous in
programming. They show up as strings, lists, foldable data structures, futures in concurrent programming, events in
functional reactive programming, and so on.

Traditionally, a monoid is defined as a set with a binary operation (as a closure). All that’s required from this
operation is that it’s associative, and that there is one special element that behaves like a unit with respect to it.

For instance, natural numbers with zero form a monoid under addition. Associativity means that:

* (𝑎 + 𝑏) + 𝑐 = 𝑎 + (𝑏 + 𝑐)

The neutral element is zero, because:

* 0 + 𝑎 = 𝑎
* 𝑎 + 0 = 𝑎

The second equation is redundant, because addition is commutative (𝑎+ 𝑏 = 𝑏 + 𝑎), but commutativity is not part of the
definition of a monoid.

```typescript
type Monoid<M> = {
    empty: M;
    combine(left: M, right: M): M;
}
```

There is no way to express the monoidal properties of mempty and mappend (i.e., the fact that mempty is neutral and that
mappend is associative). It’s the responsibility of the programmer to make sure they are satisfied.

```typescript
const concatM: Monoid<string> = {
    empty: '',
    combine: (left, right) => left + right,
};
```

## Monoid as Category

In category theory we try to get away from sets and their elements, and instead talk about objects and morphisms.

So let’s change our perspective a bit and think of the application of the binary operator as “moving” or “shifting”
things around the set. For instance, there is the operation of adding 5 to every natural number. It maps 0 to 5, 1 to 6,
2 to 7, and so on. That’s a function defined on the set of natural numbers. That’s good: we have a function and a set.
In general, for any number n there is a function of adding 𝑛 — the “adder” of 𝑛.

* The composition of the function that adds 5 with the function that adds 7 is a function that adds 12.
* There is also the adder for the neutral element, zero. Adding zero doesn’t move things around, so it’s the identity
  function in the set of natural numbers.

Now I want you to forget that you are dealing with the set of natural numbers and just think of it as a single object, a
blob with a bunch of morphisms — the adders. A monoid is a single object category. In fact the name monoid comes from
Greek mono, which means single. Every monoid can be described as a single object category with a set of morphisms that
follow appropriate rules of composition.

![img_1.png](img_1.png)

You might ask whether every categorical monoid — a one-object category — defines a unique
set-with-binary-operator monoid. It turns out that we can always extract a set from a single-object category. This set
is the set of morphisms — the adders in our example. In other words, we have the hom-set 𝐌(𝑚, 𝑚) of the single object 𝑚
in the category 𝐌.

![img_2.png](img_2.png)

```typescript
// It tells about isomorphism between monoid set (set of all elements and binary operation) and category monoid (an object and morphisms)
```

## QUESTIONS

* Generate a free category from
    * A graph with one node and no edges
    * A graph with one node and one (directed) edge (hint: this edge can be composed with itself)
    * A graph with two nodes and a single arrow between them
    * A graph with a single node and 26 arrows marked with the letters of the alphabet: a, b, c … z.
* What kind of order is this
    * A set of sets with the inclusion relation: 𝐴 is included in 𝐵 if every element of 𝐴 is also an element of 𝐵.
    * C++ types with the following subtyping relation: T1 is a subtype of T2 if a pointer to T1 can be passed to a
      function that expects a pointer to T2 without triggering a compilation error.
* Considering that Bool is a set of two values True and False, show that it forms two (set-theoretical) monoids with
  respect to, respectively, operator && (AND) and || (OR).
* Represent the Bool monoid with the AND operator as a category: List the morphisms and their rules of composition
* Represent addition modulo 3 as a monoid category.

# Kleisli Categories

There is a way to model side effects, or nonpure functions, in category theory. Let’s have a look at one such example:
functions that log or trace their execution. Something that, in an
imperative language, would likely be implemented by mutating some
global state

```typescript
declare let logger: string;

const not = (flag: boolean) => {
    logger += `not ${flag}`;

    return !flag;
};
```

This function has side effects.

In general, we try to stay away from global mutable state as much as possible — if only because of the complications of
concurrency.

Let's make it pure

```typescript
const not = (flag: boolean, logger: string) => [!flag, `${logger} not ${flag}`] as const;
```

This function is pure, it has no side effects, it returns the same pair every time it’s called with the same arguments.
The callers are free to ignore the string in the return type, so that’s not a huge burden; but they are forced to pass a
string as input, which might be inconvenient.

Granted, the message that is logged is specific to the function, but the task of aggregating the messages into one
continuous log is a separate concern.

```typescript
const not = (flag: boolean) => [!flag, `not ${flag}`] as const;

const id = (flag: boolean) => [flag, `id ${flag}`] as const;

compose(not, id) // Error
```

We want to compose these two functions into another embellished function that uppercases a string and splits it into
words, all the while producing a log of those actions.

```typescript
const composeWriter =
    <A, B, C>(g: (input: B) => [C, string], f: (input: A) => [B, string]) =>
        (input: A) => {
            const [b, fLog] = f(input);
            const [c, gLog] = g(b);

            return [c, gLog + fLog] as const;
        };
```

We have accomplished our goal: The aggregation of the log is no longer the concern of the individual functions. They
produce their own messages, which are then, externally, concatenated into a larger log. Now imagine a whole program
written in this style. It’s a nightmare of repetitive, error-prone code. But we are programmers. We know how to deal
with repetitive code: we abstract it! This is, however, not your run of the mill abstraction — we have to abstract
function composition itself. But composition is the essence of category theory, so before we write more code, let’s
analyze the problem from the categorical point of view.

## The Writer Category

The idea of embellishing the return types of a bunch of functions in
order to piggyback some additional functionality turns out to be very
fruitful.

For instance, suppose that we want to embellish the function isEven
that goes from int to bool. We turn it into a morphism that is represented by an embellished function. The important
point is that this morphism is still considered an arrow between the objects int and bool,
even though the embellished function returns a pair:

```typescript
const isEven = (n: number) => [n % 2 === 0, `isEven ${n}`];
```

By the laws of a category, we should be able to compose this morphism with another morphism that goes from the object
bool to whatever. In particular, we should be able to compose it with our earlier not

```typescript
const not = (flag: boolean) => [!flag, `not ${flag}`] as const;
```

If we want to abstract this composition as a higher order function:

```typescript
const notIsEven = composeWriter(not, isEven)
```

But we are not finished yet. We have defined composition in our new category, but what are the identity morphisms?

They have to behave like units with respect to composition. If you look at our definition of composition, you’ll see
that an identity morphism should pass its argument without change, and only contribute an empty string to the log:

```typescript
const id = <T>(input: T) => [input, ''];
```

You can easily convince yourself that the category we have just defined is indeed a legitimate category. In particular,
our composition is trivially associative. If you follow what’s happening with the first component of each pair, it’s
just a regular function composition, which is associative. The second components are being concatenated, and
concatenation is also associative.

An astute reader may notice that it would be easy to generalize this construction to any monoid, not just the string
monoid.

## Kleisli Categories

You might have guessed that I haven’t invented this category on the spot. It’s an example of the so called Kleisli
category — a category based on a monad.

For our limited purposes, a Kleisli category has, as objects, the types of the underlying programming language.
Morphisms from type 𝐴 to type 𝐵 are functions that go from 𝐴 to a type derived from 𝐵 using the particular
embellishment. Each Kleisli category defines its own way of composing such morphisms, as well as the identity morphisms
with respect to that composition.

You’ve seen previously that we could model programming-language types and functions in the category of sets (
disregarding bottoms, as usual). Here we have extended this model to a slightly different category, a category where
morphisms are represented by embellished functions, and their composition does more than just pass the output of one
function to the input of another. We have one more degree of freedom to play with: the composition itself. It turns out
that this is exactly the degree of freedom which makes it possible to give simple denotational semantics to programs
that in imperative languages are traditionally implemented using side effects.

## QUESTIONS

A function that is not defined for all possible values of its argument is called a partial function. It’s not really a
function in the mathematical sense, so it doesn’t fit the standard categorical mold. It can, however, be represented by
a function that returns an embellished type optional

* Construct the Kleisli category for partial functions (define composition and identity).
* Implement the embellished function safe_reciprocal that returns a valid reciprocal of its argument, if it’s different
  from zero.
* Compose the functions safe_root and safe_reciprocal to implement safe_root_reciprocal that calculates sqrt(1/x)
  whenever possible.

# Products and Coproducts

We are defined by our relationships.

```typescript
// How is that?
```

Nowhere is this more true than in category theory. If we want to single out a particular object in a category, we can
only do this by describing its pattern of relationships with other objects (and itself). These relationships are defined
by morphisms.

There is a common construction in category theory called the universal construction for defining objects in terms of
their relationships. One way of doing this is to pick a pattern defining particular shape (consisting of objects and
morphisms) and then find its occurrences in a category. Often, there will be many such hits, so we need to filter them
such that there will be only one left. It can be accomplished by ranking them in a certain way.

## Initial Object

The simplest shape is a single object. We could generalize that notion of object precedence by saying that object 𝑎 is
“more initial” than object 𝑏, if there is an arrow (a morphism) going from 𝑎 to 𝑏. We would then define the initial
object as one that has arrows going to all other objects. Obviously there is no guarantee that such an object exists,
and that’s okay. A bigger problem is that there may be too many such objects: The recall is good, but precision is
lacking. The solution is to take a hint from ordered categories — they allow at most one arrow between any two objects:
there is only one way of being less-than or equal-to another object. Which leads us to this definition of the initial
object:

The initial object is the object that has one and only one morphism going to any object in the category

However, even that doesn’t guarantee the uniqueness of the initial object (if one exists). But it guarantees the next
best thing: uniqueness up to isomorphism.

Here are some examples: The initial object in a partially ordered set (often called a poset) is its least element. Some
posets don’t have an initial object — like the set of all integers, positive and negative, with less-than-or-equal
relation for morphisms.

It’s this family of morphisms that makes Void the initial object in the category of types.

```typescript
const absurd = <T>(input: never): T => input;
```

## Terminal Object

Let’s continue with the single-object pattern, but let’s change the way we rank the objects. We’ll say that object 𝑎 is
“more terminal” than object 𝑏 if there is a morphism going from 𝑏 to 𝑎 (notice the reversal of direction). We’ll be
looking for an object that’s more terminal than any other object in the category. Again, we will insist on uniqueness up
to isomorphism:

The terminal object is the object with one and only one morphism coming to it from any object in the category.

```typescript
// Any singleton set will suffice
const unit = <T>(input: T): void => {
};
```

Notice that in this example the uniqueness condition is crucial, because there are other sets (actually, all of them,
except for the empty set) that have incoming morphisms from every set. For instance, there is a Boolean-valued
function (a predicate) defined for every type:

```typescript
const yes = <T>(input: T) => true;
```

But Bool is not a terminal object. There is at least one more Bool-valued function from every type:

```typescript
const no = <T>(input: T) => false;
```

Insisting on uniqueness gives us just the right precision to narrow down the definition of the terminal object to just
one type.

## Duality

You can’t help but to notice the symmetry between the way we defined the initial object and the terminal object. The
only difference between the two was the direction of morphisms. It turns out that for any category 𝐂 we can define the
opposite category 𝐂 𝑜𝑝 just by reversing all the arrows.

For every construction you come up with, there is its opposite; and for every theorem you prove, you get one for free.
The constructions in the opposite category are often prefixed with “co”.

It follows then that a terminal object is the initial object in the opposite category.

Union

![img_3.png](img_3.png)

Intersection

![img_4.png](img_4.png)

## Isomorphisms

As programmers, we are well aware that defining equality is a nontrivial task. You’d think that mathematicians would
have figured out the meaning of equality, but they haven’t.

Mathematically it means that there is a mapping from object 𝑎 to object 𝑏, and there is a mapping from object 𝑏 back to
object 𝑎, and they are the inverse of each other. In category theory we replace mappings with morphisms. An isomorphism
is an invertible morphism; or a pair of morphisms, one being the inverse of the other.

Morphism 𝑔 is the inverse of morphism 𝑓 if their composition is the identity morphism:

```typescript
declare const numberToString: (n: number) => string;
declare const stringToNumber: (s: string) => number;

const nToN = compose(stringToNumber, numberToString);
const sToS = compose(numberToString, stringToNumber);

expect<AreEqual<typeof nToN, typeof identity<number>>>();
expect<AreEqual<typeof sToS, typeof identity<string>>>();
```

## Products
