---
name: client-testing
description: Client browser testing through the full Ceramics application. Use for Chromium tests, visual Product tests, flaky browser-test diagnosis, or test screencasts.
---

# Client browser testing

Write Vitest browser tests only through the prebuilt Ceramics application seam. Open a route with
`window.openApplicationRoute()`, inject the generated Connect transport through the automatic test fixture, and
observe behavior through accessible browser locators. Component rendering and internal collaborator mocks are outside
this seam.

## Run

Install the pinned browser once with `npm run browser:install`.

- Focused browser suite: `npm run test:browser -- <test-file>`
- Update reviewed screenshots: `npm run test:browser -- -u <test-file>`
- Full verification: `npm run check`

## Shape and location

Suites live under `browser-tests/`. Route directories mirror URL segments; dynamic segments use `_paramName_`.
Colocate screenshots in the generated `__screenshots__/<suite>.test.ts/` directory. Keep a page object in the suite
until multiple suites genuinely share it.

```text
browser-tests/
└── products/
    ├── products.test.ts
    └── __screenshots__/
        └── products.test.ts/
```

Use `src/test/browser/runtime/test.ts` instead of importing `test` from Vitest. Every case receives fresh generated
service spies and an injected transport; these client-boundary fixtures replace the server, and unregistered RPCs fail
instead of reaching the network.

## Test structure

```typescript
test.describe('Product catalog', () => {
  test('creates a Product and displays it', async ({ productService }) => {
    const product = createProductStub({ name: 'Кольцо' });
    productService.createProduct.resolves(createCreateProductResponseStub({ product }));

    const products = createProductsPage();
    await products.open();
    await products.name().fill(product.name);
    await products.submit();

    await expect.element(products.product(product.name)).toBeVisible();
    await products.screenshot('Created Product');
  });
});
```

Use generated `create<Model>Stub(overrides)` factories and RPC helpers. Override only values that cause the scenario,
connect entities, or replace generic visual data. Arrange shared valid state in `beforeEach`; keep one-case spy changes
inside that case. Verify through UI when possible. Use `getLastRequest()` only for behavior the UI cannot distinguish.

Page objects are stateless factory functions. Expose repeated creator actions and semantic locators; keep assertions in
the scenario. Prefer role, name, and label locators over CSS or incidental structure.

## Visual ownership

Use screenshots for stable visual regions and targeted assertions for behavior. Avoid screenshots whose areas and
states duplicate another baseline. The shared screenshot helper waits for loading UI, moves the pointer, and compares
only outside screencast mode.

After a new baseline is created, inspect the image before accepting it, then rerun without update mode to prove a real
comparison pass.

## Stability and recordings

For a reported flaky browser test, read [Flakiness](references/flakiness.md) before changing code. For a requested test
video, read [Screencasting](references/screencasting.md); recording annotations are temporary and are removed after the
video is produced.

## Completion

Remove redundant stub overrides, waits, helpers, assertions, and overlapping screenshots. Rerun the focused suite; a
removed item stays removed when the suite remains green. Finish with `npm run check`.
