# Software developer

## Role of programmer today

If we review a history of humankind we notice that it consists of transitions between social systems: primitive,
slavery, feudalism, capitalism and socialism.

It seems that history is just a sequence of accidents, chaos of errors, senseless battles and mistakes. Just a product
of someone's decisions.

Прежде чем заниматься политикой, наукой, искусством, религией, философией, люди должны есть, пить, одеваться, иметь
жилище. Чтобы иметь эти жизненные блага, люди должны производить их. Способ и эффективность производства материальных
благ: пищи, одежды, обуви, жилища, топлива, орудий производства, образует главную силу в системе условий материальной
жизни общества, определяющую существование общества, его структуру, его развитие.

In 1960 nobody knew what a programmer was. How many programmers were? A few thousand. What about 1950? A few hundred.
And when was there just one? What 1946. Alan Turing. He is a first programmer to program an electronic computer. He had
a program to manipulate numbers, it was integers. And he wrote a program for floating point numbers. Where he needed to
be to call some bits of his program and receive a result. Architecture did not allow for this, so he invented the
concept of the stack. Тяжело было мужику и в частности из за этого появились и другие разработчики.

Think about it, there was a moment in time when there was only one programmer in the world. But how many there are
today?

log_a(2). Увеличивается на 3~5 лет. If that is true, every five years the amount of under experienced developers
doubles.

Core direction of developers activity is increasing labor performance. The reason behind this is constantly increasing
demand. As a side effect - it also increasing the amount of technologies around as. There are many devices.

Computers are now cheap (in majority) and so they are everywhere.

## Tale of two values

Every software system provides two different values to the stakeholders: behavior and
structure. Software developers are responsible for ensuring that both those values
remain high. Unfortunately, they often focus on one to the exclusion of the other. Even
more unfortunately, they often focus on the lesser of the two values, leaving the software
system eventually valueless.

The first value of software is its behavior. Programmers are hired to make machines
behave in a way that makes or saves money for the stakeholders. We do this by helping
the stakeholders develop a functional specification, or requirements document. Then we
write the code that causes the stakeholder’s machines to satisfy those requirements.
When the machine violates those requirements, programmers get their debuggers out and
fix the problem.

Programmers should not (and can not) continually verify behaviour of a system. For that, automatic program verifiers
should be used (they are called tests).

Many programmers believe that is the entirety of their job. They believe their job is to
make the machine implement the requirements and to fix any bugs. They are sadly
mistaken.

## Hard and soft

Software — a compound word composed of “soft” and “ware.” The word “ware” means “product”; the word “soft”… Well, that’s
where the second value lies.

Software was invented to be “soft.” It was intended to be a way to easily change the
behavior of machines. If we’d wanted the behavior of machines to be hard to change, we would have called it hardware.

To fulfill its purpose, software must be soft—that is, it must be easy to change. When the stakeholders change their
minds about a feature, that change should be simple and easy to make. The difficulty in making such a change should be
proportional only to the change itself, and not to the state of a program.

It is the reason that costs grow out of proportion to the size of the requested changes.
It is the reason that the first year of development is much cheaper than the second, and the second year is much cheaper
than the third.

From the stakeholders’ point of view, they are simply providing a stream of changes of roughly similar scope. From the
developers’ point of view, the stakeholders are giving them a stream of jigsaw puzzle pieces that they must fit into a
puzzle of ever-increasing complexity.

Each new request
is harder to fit than the last, because the shape of the system does not match the shape of the request. Software
developers often feel as if they are forced to jam square pegs into round holes.

The problem, of course, is the architecture of the system. The more this
architecture prefers one shape over another, the more likely new features will be harder and harder to fit into that
structure.

## Structure effect

From positive side - it leads to increasing productivity, making development cheaper, product easier to maintain and
scale.

From negative side - it quickly leads project to stagnation. Where each new change leads to high cost tasks and
long-running bugfixes after.

## Sum up

Software programs increase productivity.

On the surface this leads for stakeholders to make more money, thus expanding their business allowing for more projects
to evolve and increasing demand for programmers.

High demand and low experience turns out to be bad mixture.

## What you need to learn

Each, solve completely different tasks because the environment and purposes are different.

Server side
Server, solves other problems. For example by being stable and reliable. By providing different data constraints
maintaining integrity. Usually, there are more clients than servers, so different scaling strategies might be used,
which again, bring complexities in to the game.

Client side. There are a lot of platforms around us and we as developers must create software which is able to run on
most if not on all of them fluently. But it is usually hard to separately develop programs for each and every case.

For that, cross-platform technologies are used. There are two major groups of apps:

* Native applications
* Web applications

Client applications should provide smooth, responsive and adaptive experience. Often time restricted by hardware
capabilities (hard to update, low on recourses, battery restrictions)

How to google techonoliges:

Client side web framework
Client side native framework
Server side framework

## About language

There are a lot of languages. But historically, the most popular one's have similar C-like syntax, so it is not that
important. What is important is the type system.

* Static - types are determined on the phase of writing a program
* Dynamic - types are determined on runtime

* Weak - values of unrelated types can be substituted
* Strong - only values of compatible types can be substituted

There are of course other subgroups like (nominal or structural types, type variance support, soundness, algebraic
support etc.)

For a lot of purposes the most popular ones are languages with static strong type system. It provides the highest
protection against bugs and allows to model behaviour in most precise way.

## About paradigm

### Structured

The first paradigm to be adopted (but not the first to be invented) was structured
programming, which was discovered by Edsger Wybe Dijkstra in 1968. Dijkstra
showed that the use of unrestrained jumps (goto statements) is harmful to program
structure. As we’ll see in the chapters that follow, he replaced those jumps with the
more familiar if then else and do while until constructs.

It adds ability for using control statements

### Object oriented

The second paradigm to be adopted was actually discovered two years earlier, in 1966,
by Ole Johan Dahl and Kristen Nygaard. These two programmers noticed that the
function call stack frame in the ALGOL language could be moved to a heap, thereby
allowing local variables declared by a function to exist long after the function returned.
The function became a constructor for a class, the local variables became instance
variables, and the nested functions became methods. This led inevitably to the discovery
of polymorphism through the disciplined use of function pointers.

It adds ability for using mutable objects (meaning reference is the same but behaviour is different)

### Functional

The third paradigm, which has only recently begun to be adopted, was the first to be
invented. Indeed, its invention predates computer programming itself. Functional
programming is the direct result of the work of Alonzo Church, who in 1936 invented lcalculus while pursuing the same
mathematical problem that was motivating Alan
Turing at the same time. His l-calculus is the foundation of the LISP language, invented
in 1958 by John McCarthy. A foundational notion of l-calculus is immutability—that is,
the notion that the values of symbols do not change. This effectively means that a
functional language has no assignment statement. Most functional languages do, in fact,
have some means to alter the value of a variable, but only under very strict discipline.

It removes ability to mutate and have side effects.

Notice that there are no words like inheritance, polymorphism or encapsulation. They are wrong attributes because they
do not distinct any paradigm at all. Furthermore, there are a lot of intersection in those.

### Source of complexity

Among the main sources (which is hard to prove to a developer without experience) are state and control.

State have different types and properties. It can be provided to the system as an input, or it can be derived from other
data. It also can be mutable or immutable.

For control, it is mostly about ordering and branching. Everyone can imagine a long function with a lot of branching.
But this example is innocent compared to implicitly modeled concurrent systems.

It turns out these kind of properties are essential for traditional stateful computers (von-Neumann), so-called state
based or stateful computation. It imposes imperative style of programming.

### There is another way

Still imperative style of programming and oo paradigm are very popular today, due to some kind of inertia. But industry
will move slowly towards more efficient solutions. It turns out to be able to fight with complexity we must constrain
ourselves, banishing mutations, side effects and using strong static adt capable system.

### Methodology

Tell about Agile, and it's influence on program's architecture

### Managing requirements

Requirements are given to us not by stakeholders but by analytics. They are like a bridge, allowing us (developers) to
understand money giver desires. It is important to note that computer system is extremely formal and concrete. It does
not forgive contradictions and partial applications. So it is important to always communicate not only with analytics
but with stakeholders themselves.

### Managing tasks

Main capabilities are:

* Managing capacity
* Managing vector of development
* Managing quality

### Managing project

Main capabilities are:

* Provide UI intergated abilities to use subprograms
    * Reading (Navigation, Documentation) and Editing (Refactoring, Intellisense)
    * Runners
    * Debuggers
    * VCS
    * Static analyzers
