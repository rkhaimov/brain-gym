# SEO

Classic FE mistakes:

empty initial HTML
JS-only meta tags
client-only rendering
incorrect status codes
soft 404s

Core HTML & Metadata
Proper semantic HTML (header, main, article, nav, etc.)
Correct heading hierarchy (h1 → h2 → ...)
Meaningful page titles
Meta description
Canonical URLs
Open Graph / Twitter cards
Language attribute (<html lang="en">)
Accessible markup (often indirectly helps SEO)

SSR / SSG

Search engines prefer fully rendered HTML.

Patterns:

SSR
SSG
ISR
Streaming SSR

Hydration optimization

Too much JS hurts:

LCP
INP
crawl efficiency

Patterns:

partial hydration
islands architecture
server components
lazy hydration

JS Bundle Optimization
Image Optimization

Routing & URL Structure

Good URLs:

/docs/testing/ui-mode

Crawlability

FE can accidentally destroy crawlability.

Common issues:

links implemented as buttons
content hidden behind JS-only flows
infinite scroll without pagination
router states without URLs
hash routing (#/docs)
broken prerendering

# A11Y

Semantic HTML

Keyboard Accessibility
Entire app should work without mouse.

ARIA

Used when semantic HTML is insufficient.

Examples:

<button aria-label="Close modal">×</button>
<div role="dialog" aria-modal="true">

But:

First rule of ARIA:
prefer native HTML when possible.

Bad FE pattern:

<div role="button">

Better:

<button>

Focus Management

Critical in SPAs.

Typical FE issues:

focus lost after navigation
modal does not restore focus
invisible focus rings removed

Color Contrast
Text must be readable.

Screen Reader Support

FE should ensure:

labels exist
landmarks exist
dynamic updates announced

Examples:

<label for="email">Email</label>
<input id="email" />

Dynamic updates:

<div aria-live="polite">
  Saved successfully
</div>

Forms Accessibility

Very important.

Need:

labels
error descriptions
validation messages
correct input types

Motion & Animation Accessibility
Some users are motion sensitive.

Accessibility as Architecture

Good accessibility usually means:

cleaner semantics
more explicit UI state
less fragile interactions
better usability
better SEO
better testability

Interestingly, many accessibility-friendly apps are also easier to test with tools like:

Playwright
Cypress

because accessible apps expose stable semantics instead of relying on fragile visual selectors.