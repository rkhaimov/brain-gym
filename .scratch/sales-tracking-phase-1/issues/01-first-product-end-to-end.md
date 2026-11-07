# 01: Create and list the first Product end to end

**What to build:** Establish the first complete path through the local application so the creator can open the Russian interface, create a Product, and see the persisted Product after a refresh or server restart. This tracer bullet establishes the contract-first client/server shape and authoritative local storage that later tickets extend.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A development command starts a localhost-only Node.js server and serves the client application.
- [ ] The client is a full client-side-rendered React application using the agreed router, form, query, and UI component stack.
- [ ] The application shell uses the approved Ceramics identity, Russian lockup, technical slug, primary color, logo treatment, and Lucide icon conventions from the UI design reference.
- [ ] One Protobuf contract generates the Product messages, Connect service descriptors, Node.js handler surface, browser client, and Connect Query integration without hand-editing generated source.
- [ ] The creator can enter a non-empty Product name in the Russian UI, submit it, and see the Product in the catalog.
- [ ] Product creation is rejected when the exact name already exists; case, whitespace, and punctuation are not normalized.
- [ ] The server is authoritative for Product validation and returns a typed application error that the client renders next to the relevant form control.
- [ ] Product data is stored in a same-process SQLite database through Kysely and survives refresh and server restart.
- [ ] Database row types are generated and checked against the database schema.
- [ ] Product identifiers use branded shared/server types with explicit conversion at Protobuf and database boundaries.
- [ ] Product writes run through the process-wide FIFO mutation queue and one SQLite transaction; successful responses are sent only after commit.
- [ ] TanStack Query uses network-first behavior, always attempts localhost requests, performs no optimistic mutation, and invalidates the Product query after successful creation.
- [ ] Nondeterministic server operations are exposed through the shared EnvService so tests can control clocks and identities.
- [ ] A server integration test creates and lists Products through the Connect handler surface using a real isolated temporary SQLite database.
- [ ] A browser-level smoke test proves that the creator can create and then see a Product through the complete application.

