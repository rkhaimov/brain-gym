# Synthesis

Lets synthesise all this a little:

UI is inherently read heavy system, so majority of optimizations will address that (most of which will use supplementary
data structures (caches, indexes)). This forces a tradeoff for speed against consistency.

Typical read-opt principles:
* Retrieve data faster (compress, locate closer to user, use cache, use indexes)
* Prefer lazy retrieval for non-visible parts (by view, virtualization)
* Do not waste idle time (warm cache, prefetch)
* Divide data (priority based retrieval (preload, load shell first), retrieve only relevant parts)
* Redraw only relevant parts
* Backpressure for slow producers (low battery, low-end device)

UI are highly interactive, meaning they can handle a lot of events and must react instantly to maintain responsiveness

Typical write-opt principles
* Backpressure for slow consumers (event -> view, event -> network)
* Divide work (web workers, server)

# Raw

Reduce JS/CSS/HTML size

```text
minify JS/CSS
enable gzip or brotli
remove unused code
```

Use modern formats and responsive sizes.

```text
<img
  src="image-800.webp"
  srcset="image-400.webp 400w, image-800.webp 800w"
  loading="lazy"
/>
```

Use long cache for versioned assets:

```text
Cache-Control: public, max-age=31536000, immutable
```

For HTML:

```text
Cache-Control: no-cache
```

Do not ship the whole app at once.

```text
const SettingsPage = lazy(() => import('./SettingsPage'));
```

Each route loads only what it needs.

```text
/home -> home.chunk.js
/dashboard -> dashboard.chunk.js
/admin -> admin.chunk.js
```

Lazy loading non-critical UI

```text
modals
charts
editors
maps
admin panels
```

Prefetch likely next routes

```text
<link rel="prefetch" href="/dashboard.chunk.js" />
```

Avoid unnecessary re-renders

```text
memo(Component)
useMemo()
useCallback()
stable props
normalized state
selector-based subscriptions
```

For long lists/tables:

```text
render only visible rows

react-window
react-virtual
TanStack Virtual
```

Debounce / throttle expensive work

```text
search input
resize
scroll
drag
mousemove
```

For ui integrated work -> requestAnimationFrame (debounce with sliding timer)

Move heavy work off main thread

```text
Web Workers
server-side preprocessing
```

Batching

```text
GET /user
GET /permissions
GET /settings
```

If multiple components request the same data, share the promise/cache.

```text
Component A -> GET /user
Component B -> same GET /user reused
```

Caching API data

```text
stale-while-revalidate
optimistic updates
background refresh
cache invalidation by tags/keys
```

Pagination / infinite loading

```text
limit/offset
cursor pagination
windowed data loading
```

Streaming SSR

```text
server sends shell
then streams content boundaries
```

React Server Components

Move some rendering and data loading to server, ship less JS to browser.

````text
Less js parsing work
Less JS to execute
Less hydration work (not whole page is sent?)
````

With server rendering / React Server Components / islands architectures, part of this work moves to the server, so the
browser receives:

```text
mostly ready HTML
less JS
less hydration work
less CPU usage
```

HTTP caching

```text
ETag
Last-Modified
Cache-Control
CDN caching
stale-while-revalidate
```

```text
Cache-Control: public, max-age=3600

response may be cached
for 1 hour
```

Caching is fundamentally about:

```text
trading consistency for speed
```

Speculative loading

Predict what user will need next:

```text
hover prefetch
viewport prefetch
route prediction
intent-based preloading
```

Edge rendering

Render close to user using edge functions.

Useful for:

```text
personalized landing pages
geo-specific content
A/B testing
auth-aware caching
```

Progressive enhancement

Basic HTML works first, JS enhances later.

```text
resilience
SEO
performance
accessibility
```

Offline-first

Use service workers and local storage/indexedDB.

```text
cache shell
queue mutations offline
sync later
background sync
```

Adaptive loading

Adjust based on device/network:

```text
low-end device -> less JS
slow network -> lower image quality
battery saving -> lower polling frequency
```

Priority scheduling

Control task priority:

```text
critical UI first
background work later
requestIdleCallback
scheduler.postTask
```

Practical order

Usually optimize in this order:

```text
1. Measure Core Web Vitals
2. Reduce JS bundle
3. Optimize images/fonts
4. Add proper caching/CDN
5. Fix render bottlenecks
6. Optimize API/data fetching
7. Add SSR/streaming/edge only if needed
8. Add advanced adaptive/speculative/offline patterns
```

The most important principle:

```text
Do not optimize blindly.
Measure → find bottleneck → apply targeted pattern.
```