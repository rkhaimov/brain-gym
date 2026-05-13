DOM event system is built with respect to UI tree structure meaning clicking on concrete element -> clicking on all of
its parents.

During hit testing phase browser determines target element and starts event propogation process. First, event goes from
top to bottom (capture phase).

Then goes from bottom to top (bubble phase).

Events are executed as macrotasks, so if main thread is busy -> events are not being handled (degrading INP)

Event loop — schedules macrotasks/microtasks for the JS main thread; microtasks run before render/next task.
Propagation — capture → target → bubble.
Input latency — input waits if main thread or microtask queue is busy.
Passive listeners — promise not to call preventDefault(), enabling faster scrolling/touch handling.
Forced reflow — synchronous layout recalculation caused by reading layout after DOM/style changes.
Main thread — JS, style, layout, often paint.
Compositor thread — layer compositing, smooth scrolling/transforms, coordinates GPU work.
requestAnimationFrame — callback before next paint.
Event delegation — parent listener handles child events through bubbling.

# Raw

At a high level, browser events are a coordination system between:

the OS (mouse, keyboard, touch, timers, network)
the browser engine
the JavaScript runtime
the rendering pipeline

The browser continuously:

receives signals,
converts them into events,
schedules JavaScript handlers,
updates DOM/layout/paint if needed.

1. Native event happens

Example:

MouseDown at x=120 y=300

Browser converts this into a DOM event:

new MouseEvent("mousedown")

2. Hit testing (target detection)

Browser must determine:

"Which DOM element is under the cursor?"

This is called hit testing.

Result:

<button id="save">Save</button>

Target becomes:

event.target === saveButton

3. Event object creation

Browser creates an event object.

```javascript
const e = {
  type: "click",
  target: button,
  clientX: 120,
  clientY: 300,
  bubbles: true,
  cancelable: true
}
```

```text
Event
 ├── UIEvent
 │    ├── MouseEvent
 │    ├── KeyboardEvent
 │    └── FocusEvent
 └── CustomEvent
```

4. Event propagation begins

This is the most important part.

DOM events travel through the tree in 3 phases:

```text
Window
↓
Document
↓
<html>
  ↓
<body>
  ↓
<div>
  ↓
<button> TARGET
```

Phases:

Capturing phase
Target phase
Bubbling phase

5. Capturing phase

Event travels top → down.

Only listeners with:

addEventListener(type, handler, { capture: true })

run here.

Example:

document.addEventListener("click", fn, true);

Flow:

window
document
html
body
div
button

6. Target phase

Event reaches actual target element.

Both:

capture listeners
bubble listeners

on target may run.

7. Bubbling phase

Event travels bottom → up.

Default listeners run here.

button -> div -> body -> html -> document

This enables event delegation.

Example:

document.body.addEventListener("click", e => {
console.log(e.target);
});

Single listener handles many children.

8. Event loop integration

Important:
JS handlers do NOT run immediately in parallel.

Browser pushes event task into the event loop queue.

Mouse click becomes a macrotask.

9. During handler execution

Your JS may:

modify DOM
change styles
schedule timers
trigger fetches
prevent default behavior
stop propagation

10. preventDefault()

Stops browser default action.

Examples:

link navigation
form submit
checkbox toggle
context menu
scrolling

11. stopPropagation()

Stops event traveling further.

Example:

child.addEventListener("click", e => {
e.stopPropagation();
});

Parent listeners won't execute. Also may affect capturing phase

12. Passive listeners

Huge performance topic.

Example:

addEventListener("touchmove", handler, {
passive: true
});

Means:

"I promise not to call preventDefault."

This lets browser scroll immediately without waiting for JS.

Critical for:

touch
wheel
scroll performance

13. Rendering interaction

After event handlers finish:

Browser may need:

style recalculation
layout
paint
compositing

14. Some events are special

Not all events bubble.

Examples:

focus
blur
mouseenter
mouseleave

Some have alternative bubbling versions:

focusin
focusout

15. Synthetic event systems

Frameworks often implement their own layer.

Example: React

React historically:

attached few root listeners
normalized browser differences
dispatched synthetic events internally

So:

<button onClick={...} />

is not a direct DOM listener per component.

16. Event delegation

One of the most important browser patterns.

Instead of:

10000 buttons => 10000 listeners

Use:

container.addEventListener("click", e => {
if (e.target.matches(".btn")) {
...
}
});

Benefits:

less memory
dynamic elements work automatically
faster setup

17. Input latency and FPS

Events compete with rendering on the main thread.

If handler blocks:

while(true){}

Browser cannot:

paint
process input
animate
scroll

Result:

Dropped frames
Input lag
Jank