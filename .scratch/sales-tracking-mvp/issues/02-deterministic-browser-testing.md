# 02: Establish deterministic browser testing

**What to build:** Turn the first Product flow into the reusable browser-testing foundation for the rest of the MVP. Tests exercise the prebuilt application, receive generated typed data and RPC controls, and start from a deterministic isolated state.

**Blocked by:** 01: Create and list the first Product end to end.

**Status:** completed

- [x] Vitest defines distinct server-runtime and Chromium browser-runtime projects and remains the sole test runner.
- [x] Browser global setup builds one test-mode ESM application bundle and CSS bundle before headless tests start.
- [x] The test bundle disables code splitting, minification, source maps, public-directory copying, and compressed-size reporting.
- [x] Vitest/Vite static middleware serves the bundle from a test-only URL, and a tester page derived from the application HTML loads those assets without loading the development entry.
- [x] The test bundle exposes `mount`, `unmount`, the application QueryClient, and a root Connect transport override.
- [x] Route opening uses browser history followed by `mount()` so client-side navigation does not destroy the Vitest runner document.
- [x] Mounting first removes any previous React root, and every test unmounts during cleanup.
- [x] The project-owned Protobuf test generator emits `create<Model>Stub(overrides)` factories with fixed deterministic populated defaults, including nested messages and deterministic algebraic variants.
- [x] The generator emits a typed Vitest spy for every unary RPC with successful-response, failure-response, and latest-typed-request helpers.
- [x] Known RPCs have generated response-stub defaults, while requests outside the installed generated service surface fail instead of reaching a real network.
- [x] Each browser test receives fresh generated spies and an injected Connect transport; no MSW dependency is required for Connect mocking.
- [x] Test setup resets mocks, fake time, local storage, session storage, and the TanStack Query cache before each test; generated stubs use fixed deterministic defaults and carry no resettable identity or random state.
- [x] Browser and iframe viewports, locale, timezone, and the fake clock are fixed for the browser project.
- [x] Screenshot setup prevents tester-style leakage and disables animations, transitions, smooth scrolling, and carets while preserving application CSS. Any future transient notification facility must add its own deterministic screenshot treatment when introduced.
- [x] Small factory-function page objects expose semantic creator actions and accessible locators while leaving scenario assertions in tests.
- [x] Product creation is covered through the mocked prebuilt-client seam and produces a deterministic screenshot.
- [x] Generation has a repeatable verification command that fails when Protobuf, Connect Query, test, or database artifacts are stale.

## Comments

- 2026-11-08 — Acceptance audit completed. Implemented by `96e8c20`; validated against the reconciled current working tree with `npm run check` (formatting, lint, type checking, generated-artifact verification, 16 tests, and client/server builds). Generated stubs use fixed defaults and have no random or sequential identity state to reset.

