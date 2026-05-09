Modern Core Web Vitals:

Metric  Measures	                    Good
LCP 	Loading performance	            ≤ 2.5s
INP 	Interaction responsiveness	    ≤ 200ms
CLS 	Visual stability	            ≤ 0.1

1. LCP — Largest Contentful Paint

When does the page feel loaded?

```text
Request page
→ HTML received
→ Parse HTML
→ Discover CSS/JS/image
→ Layout
→ Paint largest element
→ LCP fires
```

2. INP — Interaction to Next Paint

How long between user interaction and visible response?

```text
Input delay
+ event handler execution
+ rendering/layout/paint
```

3. CLS — Cumulative Layout Shift

Measures unexpected visual movement.

Example:

reading article
ad loads above text
content jumps downward

→ bad CLS

Important mental model

Core Web Vitals mostly measure:

main-thread contention
rendering efficiency
network prioritization
layout stability

They are basically:

“How painful is the browser pipeline for real users?”

Important advanced nuance
60 FPS budget

At 60 FPS:

60
1000 ms
​

≈16.67 ms

Browser ideally has ~16ms for:

JS
style
layout
paint
composite

If one task takes:

120ms

You skip many frames:

120 / 16.67 ≈ 7 frames

That creates:

jank
poor INP
stuttering

Other Web Vitals

Not “core”, but still important:

Metric	        Meaning
TTFB	        Server response latency
FCP	            First visible paint
TBT	            Total blocking time
Speed Index	    Visual completeness speed

Real-world frontend patterns

Good FE architectures often optimize vitals indirectly:

SSR/streaming → better LCP
island architecture → better INP
virtualization → better INP
image pipelines → better LCP/CLS
granular reactivity → better INP
CSS containment → better layout performance
worker offloading → better INP