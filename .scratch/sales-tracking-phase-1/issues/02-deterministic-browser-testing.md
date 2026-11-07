# 02: Establish deterministic browser testing

**What to build:** Turn the first Product flow into the reusable browser-testing foundation for the rest of phase one. Tests exercise the prebuilt application, receive generated typed data and RPC controls, and start from a deterministic isolated state.

**Blocked by:** 01: Create and list the first Product end to end.

**Status:** ready-for-agent

- [ ] Vitest defines distinct server-runtime and Chromium browser-runtime projects and remains the sole test runner.
- [ ] Browser global setup builds one test-mode ESM application bundle and CSS bundle before headless tests start.
- [ ] The test bundle disables code splitting, minification, source maps, public-directory copying, and compressed-size reporting.
- [ ] Vitest/Vite static middleware serves the bundle from a test-only URL, and a tester page derived from the application HTML loads those assets without loading the development entry.
- [ ] The test bundle exposes `mount`, `unmount`, the application QueryClient, and a root Connect transport override.
- [ ] Route opening uses browser history followed by `mount()` so client-side navigation does not destroy the Vitest runner document.
- [ ] Mounting first removes any previous React root, and every test unmounts during cleanup.
- [ ] The project-owned Protobuf test generator emits deterministic populated `create<Model>Stub(overrides)` factories, including nested messages and deterministic algebraic variants.
- [ ] The generator emits a typed Vitest spy for every unary RPC with successful-response, failure-response, and latest-typed-request helpers.
- [ ] Known RPCs have generated response-stub defaults, while requests outside the installed generated service surface fail instead of reaching a real network.
- [ ] Each browser test receives fresh generated spies and an injected Connect transport; no MSW dependency is required for Connect mocking.
- [ ] Test setup resets mocks, generated identities, seeded random data, fake time, local storage, session storage, and the TanStack Query cache before each test.
- [ ] Browser and iframe viewports, locale, timezone, and the fake clock are fixed for the browser project.
- [ ] Screenshot setup prevents tester-style leakage and disables animations, transitions, smooth scrolling, carets, and transient notifications while preserving application CSS.
- [ ] Small factory-function page objects expose semantic creator actions and accessible locators while leaving scenario assertions in tests.
- [ ] Product creation is covered through the mocked prebuilt-client seam and produces a deterministic screenshot.
- [ ] Generation has a repeatable verification command that fails when Protobuf, Connect Query, test, or database artifacts are stale.

