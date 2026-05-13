1. Container Queries

Instead of adapting to viewport size (@media), components adapt to their container size.

2. CSS Layers (@layer)

Helps control cascade order explicitly.

```css
@layer reset, base, components, utilities;

@layer components {
    .button {
        color: red;
    }
}
```

3. :has() Parent Selector

```css
.card:has(img) {
    padding-top: 0;
}

form:has(:invalid) {
  border: 1px solid red;
}
```

4. Subgrid

Nested grid alignment.

```css
.parent {
  display: grid;
  grid-template-columns: 100px 1fr 100px;
}

.child {
  display: grid;
  grid-template-columns: subgrid;
  /*  reuses parent grid tracks */
  grid-column: 1 / 4;
}
```

5. Modern Viewport Units

On mobile, 100vh could be larger than visible area because browser chrome collapses/expands.

Modern units:

svh — small viewport height
stable minimum visible height
lvh — large viewport height
maximum possible viewport height
dvh — dynamic viewport height
updates as browser UI changes

6. Logical Properties

Instead of physical directions.

margin-inline: 16px;
padding-block: 8px;

(internatialization)

7. CSS Nesting

```css
.card {
  padding: 1rem;

  & .title {
    font-size: 2rem;
  }
}
```

8. Cascade & Specificity Modern Understanding

Still extremely important.

Know:

Specificity calculation
:where() → zero specificity
:is() specificity behavior
!important
inheritance
cascade layers

9. Modern Layout Mastery

### Axis model

Flexbox is 1D layout:

* `main axis` → controlled by `flex-direction`
* `cross axis` → perpendicular

```css id="5zy02y"
display: flex;
flex-direction: row;
```

* main = horizontal
* cross = vertical

---

### Growing / shrinking

```css id="n9mf7z"
flex: grow shrink basis;
```

Example:

```css id="d2oyjm"
flex: 1 1 200px;
```

* `grow` → take extra space
* `shrink` → compress when needed
* `basis` → initial size

---

### Intrinsic sizing issues

Flex items default to:

```css id="tx1r8j"
min-width: auto;
```

Meaning:

* content refuses to shrink below intrinsic size
* long text may overflow

---

### `min-width: 0`

Fixes overflow/truncation issues.

```css id="w4d4yc"
.child {
  min-width: 0;
}
```

Allows flex item to shrink smaller than content width.

Very common with:

* ellipsis
* long strings
* nested flex layouts

---

### Equal height columns

Flexbox naturally stretches items on cross axis:

```css id="7d4qyh"
display: flex;
align-items: stretch;
```

Columns become equal height automatically.

### Explicit vs implicit grid

Explicit grid = tracks you define:

```css id="fyb5ri"
grid-template-columns: 1fr 1fr;
```

Implicit grid = tracks browser creates automatically when items overflow defined grid.

Controlled by:

```css id="l2it6o"
grid-auto-rows
grid-auto-columns
```

---

### Auto-placement

Grid automatically places items into next free cell.

```css id="yyv2v8"
grid-auto-flow: row;
```

Options:

* `row` (default)
* `column`
* `dense` (backfill gaps)

---

### `minmax()`

Defines size range:

```css id="ls5mjd"
minmax(200px, 1fr)
```

Meaning:

* never smaller than `200px`
* can grow up to `1fr`

Very useful for responsive layouts.

---

### `auto-fit` vs `auto-fill`

Usually used with:

```css id="kpscy5"
repeat(..., minmax(...))
```

Example:

```css id="2ajb4r"
grid-template-columns:
  repeat(auto-fit, minmax(200px, 1fr));
```

Difference:

* `auto-fill`

    * keeps empty columns
    * preserves track structure

* `auto-fit`

    * collapses empty columns
    * existing items stretch wider

`auto-fit` is more common for responsive cards/grids.

* **Intrinsic sizing** → size based on content itself

Examples:

* text width
* image natural dimensions
* `max-content`
* `min-content`
* `fit-content`

Example:

```css id="h8rny4"
width: max-content;
```

Element becomes as wide as its content needs.

---

* **Extrinsic sizing** → size imposed by external constraints

Examples:

* parent width
* flex/grid distribution
* viewport size
* fixed width

```css id="x1z7ib"
width: 100%;
```

Size depends on parent/container.

* `min-content`
  → smallest possible size without overflow
  (text wraps aggressively)

```css id="cd9w8d"
width: min-content;
```

---

* `max-content`
  → size needed with no wrapping/truncation

```css id="5i0d9z"
width: max-content;
```

---

* `fit-content`
  → shrink-to-fit within available space

Behaves roughly like:

```text id="u4i1af"
min(max-content, available-space)
```

Example:

```css id="1qljlwm"
width: fit-content;
```

Useful for chips/buttons/popovers.

11. Modern Color Functions
    color: oklch(62% 0.18 250);

12. Scroll-Driven Features
    Scroll Snap

13. aspect-ratio

```css id="cv0gq2"
aspect-ratio: 16 / 9;
```

means:

```text id="2xjlwm"
width / height = 16 / 9
```

Browser automatically calculates missing dimension.

Example:

```css id="r8z4dn"
.video {
  width: 320px;
  aspect-ratio: 16 / 9;
}
```

Height becomes:

```text id="0xq9lz"
180px
```

Useful for:

* videos
* images
* cards
* placeholders
* responsive layouts

Works even before content loads, helping prevent layout shifts.

14. content-visibility

Massive rendering optimization.

```css
content-visibility: auto;
```

Why important:

skips rendering offscreen content

15. Modern Animation Performance

Know:

compositor-only properties
transform
opacity
avoiding layout thrashing
will-change

NEED TO EMULATE INTERVIEW WITH GPT