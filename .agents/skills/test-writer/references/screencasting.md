# Screencasting

Screencasts demonstrate browser-test interactions and assertions without replacing screenshot baselines or behavioral
checks.

## Prepare

Run each selected suite normally first. When it fails, offer to fix it or explicitly record the failure. A requested
failure recording skips the passing pre-run.

Temporarily request the `screencast` fixture and annotate the existing scenario:

```typescript
test('creates a Product and displays it', async ({ productService, screencast }) => {
  // arrange generated RPC spies
  const products = createProductsPage();
  await products.open();
  await screencast.start();

  await screencast.step(1, 'Введите название');
  await products.name().fill('Кольцо');
  await screencast.pause();

  await screencast.step(2, 'Создайте штучку');
  await products.submit();

  await expect.element(products.product('Кольцо')).toBeVisible();
  await screencast.highlight(products.product('Кольцо'), 'Штучка появилась в каталоге');
});
```

Start after route opening and mock installation. Group interactions with numbered steps. Actions are captured
automatically; `pause()` makes dense sequences readable.

- DOM assertion: `highlight(locator, label)`.
- DOM absence: highlight the containing region.
- URL, request, or other non-DOM assertion: `notify(label)`.
- Failed assertion: use `{ color: 'failure' }` with the same annotation kind, then rethrow.

Straightforward one-use annotation code is preferred over reusable abstractions.

## Record and deliver

```shell
npx cross-env PLAYWRIGHT_BROWSERS_PATH=.local/playwright SCREENCAST=true vitest run --project browser --testTimeout=120000 <test-file>
```

Videos are written under `test-results/`; the runner prints `[screencast] Saved: <absolute path>`. Link each video using
`Suite > case` as its title.

After recording, remove every screencast-only fixture parameter and annotation, rerun the ordinary suite, and keep the
committed test free of recording markup.
