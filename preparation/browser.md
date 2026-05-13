Simplified browser event loop priority order:

1. **Current synchronous call stack**
2. **All microtasks**
    * `Promise.then`
    * `await`
    * `queueMicrotask`
    * mutation observers
3. **Render opportunity**
    * style/layout/paint/composite
    * `requestAnimationFrame` runs here (before paint)
4. **One macrotask**
    * `setTimeout`
    * `setInterval`
    * DOM events
    * MessageChannel
    * I/O
5. Repeat loop

# Synthesis

so, the main flow

1. HTML -> DOM
2. CSS -> CSSOM
3. DOM+CSSOM -> Render Tree
4. Style calc
5. Layout
6. Paint
7. Composite
8. Screen

Each stage can be revalidated by JS, so key thing is to keep revalidation part as close to the end of the chain as
possible, because whole process is cascading.

Browser tries to batch rendering work and flush it with respect to monitor refresh rate, but JS may trigger layout
immediately.

In this case it is advised to group read and write operations together

```text
requestAnimationFrame(() => {
    div.style.transform = 'translateX(100px)';
});
```

# Raw

1. HTML bytes → tokens → DOM

Important: DOM can be partially built while the rest of HTML is still downloading.

2. Preload scanner

While main HTML parser works, browser also runs a speculative scanner.

It looks ahead for resources:

```html
<link rel="stylesheet" href="style.css">
<script src="app.js"></script>
<img src="hero.png">
<link rel="preload" href="font.woff2" as="font">
```

Roughly:

HTML parsing discovers resources
Browser assigns priorities
Network layer schedules downloads

Typical priorities:

Critical CSS        → highest
Fonts               → high
Visible images      → medium/high
Deferred JS         → medium
Async JS            → medium
Offscreen images    → low
Prefetch/preload    → special handling

3. CSS download → CSSOM

When browser sees:

<link rel="stylesheet" href="/style.css">

it downloads and parses CSS into CSSOM.

CSSOM = tree/model of CSS rules.

CSS is render-blocking by default because browser needs styles before it can correctly render layout.

4. JavaScript execution

Classic scripts are parser-blocking by default:

<script src="/app.js"></script>

When parser reaches this:

Stop parsing HTML.
Download script if not downloaded yet.
Wait for blocking CSS before executing if script may read styles.
Execute JS.
Continue parsing HTML.

Why CSS can block JS:

const width = getComputedStyle(document.body).width;

JS may need correct CSSOM.

So classic script can be blocked by CSS, and HTML parsing can be blocked by JS.

5. DOM + CSSOM → Render Tree

Browser combines:

DOM + CSSOM = Render Tree

Render tree contains only visible renderable nodes.

6. Style calculation

Browser computes final styles for each element.

```text
"What styles apply to this element?"
```

```text
color = red
display = flex
width = 50%
font-size = 16px
```

7. Layout / Reflow

Layout calculates geometry:

x, y, width, height

Example:

.card {
width: 50%;
padding: 20px;
}

Browser needs parent width to compute child width.

Layout is expensive because changes can affect many nodes.

Examples that trigger layout:

element.offsetWidth
element.getBoundingClientRect()

And mutations like:

element.style.width = "500px";

can invalidate layout.

8. Paint

Paint turns visual instructions into draw commands.

It answers:

draw text here
draw background here
draw border here
draw shadow here
draw image here

9. Layers and compositing

Browser may split page into layers.

Examples that often create separate compositing layers:

transform
opacity
position: fixed
will-change: transform
video
canvas

Then compositor combines layers into final frame.

This is why animations like this are cheap:

transform: translateX(100px);
opacity: 0.5;

They can often run without layout or paint.

But this is expensive:

width: 500px;
height: 500px;
top: 100px;
left: 100px;

Because it may require layout and paint.

Simplified pipeline

```text
Network
  ↓
HTML parser ───────────────┐
  ↓                         │
DOM                         │
                            │
CSS parser → CSSOM ─────────┤
                            ↓
                    Style calculation
                            ↓
                         Layout
                            ↓
                          Paint
                            ↓
                         Composite
                            ↓
                          Screen
```

Key performance idea

```text
Change transform/opacity
→ composite only
→ cheapest

Change color/background/shadow
→ paint + composite

Change width/height/font/content/layout-affecting styles
→ layout + paint + composite
→ expensive
```

Critical rendering path

For first render, the browser needs at minimum:

```text
HTML → DOM
CSS → CSSOM
DOM + CSSOM → render tree → layout → paint
```

Blocking JS can delay this path.

That is why these matter:

<script defer src="/app.js"></script>

defer downloads JS in parallel and executes after HTML parsing.

<script async src="/analytics.js"></script>

async downloads in parallel and executes as soon as ready, possibly interrupting parsing.

Scripts by default are blocking

Blocking script is useful when you need parser-time or pre-paint side effects.

Good examples:

```text
- set theme/class before first paint
- small inline feature/env bootstrap used by following non-defer scripts
- legacy document.write-style scripts
- very early anti-flicker / A/B test snippet
```