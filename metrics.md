# 1. Correctness

## Goal

Does the system produce the right result?

## Questions to ask

* What does “correct” mean for this system?
* What errors are acceptable vs unacceptable?
* Can invalid state exist?
* Can data become inconsistent?
* What invariants must always hold?
* Are operations transactional?
* Is eventual consistency acceptable?
* Can user actions be replayed safely?
* How do we validate inputs and outputs?
* What happens when BE and FE disagree?
* Can stale data cause incorrect decisions?

## Examples

### FE form system

Questions:

* Can partially invalid form state exist?
* Should validation be realtime?
* Must FE enforce domain rules or only UX hints?

Solutions:

* zod runtime validation
* typed DTOs
* state machines
* immutable state
* optimistic update rollback

---

# 2. Reliability

## Goal

Does the system continue working over time?

## Questions to ask

* What failures are expected?
* Can network disappear?
* Can APIs timeout?
* Should app recover automatically?
* What is acceptable failure rate?
* Must operations be retryable?
* What happens after refresh/crash?
* Can operations be duplicated?
* Are retries idempotent?
* How is corrupted state handled?

## Examples

### Offline-first mobile app

Questions:

* What if user loses internet during upload?
* Can queued operations survive restart?
* What if same packet sent twice?

Solutions:

* retry queues
* persistent storage
* MQTT QoS
* idempotency keys
* reconnect logic

---

# 3. Performance

## Goal

Does the system respond fast enough?

## Questions to ask

* What are latency requirements?
* What are FPS requirements?
* Largest expected dataset?
* What devices are targeted?
* What operations are frequent?
* What blocks main thread?
* Are updates realtime?
* Is SSR required?
* What are memory limits?
* Is startup speed critical?

## Examples

### Large GIS map

Questions:

* How many features visible simultaneously?
* Is clustering acceptable?
* Can rendering degrade gracefully?
* Is WebGL needed?

Solutions:

* vector tile pyramid
* clustering
* spatial index
* virtualization
* workers
* incremental rendering

---

# 4. Security

## Goal

Can attackers misuse the system?

## Questions to ask

* What data is sensitive?
* What capabilities should browser have?
* Can untrusted HTML/scripts appear?
* Are uploads allowed?
* Can tokens leak?
* Is XSS possible?
* Are CSP restrictions required?
* Can users escalate privileges?
* Should FE trust BE data?
* Can local state be tampered with?

## Examples

### Enterprise dashboard

Questions:

* Can FE expose hidden admin routes?
* Are permissions enforced server-side?
* Are secrets stored in localStorage?

Solutions:

* CSP
* sandboxing
* HttpOnly cookies
* permission boundaries
* schema validation
* escaping/sanitization

---

# 5. Scalability

## Goal

Can the system handle growth?

## Questions to ask

* What grows over time?
* Users?
* Data size?
* Teams?
* Features?
* Deploy frequency?
* Concurrent sessions?
* API calls?
* Bundle size?
* Rendering workload?

## Examples

### Multi-team frontend platform

Questions:

* Can 5 teams deploy independently?
* Can modules evolve separately?
* How are shared dependencies managed?

Solutions:

* Module Federation
* app-shell
* manifests
* independent deployments
* shared contracts
* monorepo boundaries

---

# 6. Maintainability

## Goal

Can engineers safely modify the system?

## Questions to ask

* How hard is onboarding?
* How isolated are changes?
* How much duplication exists?
* Are abstractions leaking?
* Is architecture documented?
* How painful are refactors?
* How quickly can bugs be fixed?
* Are tests trustworthy?
* Is naming consistent?
* Are side effects explicit?

## Examples

### Large React app

Questions:

* Can features be developed independently?
* Is business logic mixed with rendering?
* Can tests run without backend?

Solutions:

* feature boundaries
* clean architecture
* Storyshots
* MSW
* typed APIs
* domain separation

---

# 7. Observability

## Goal

Can we understand system behavior?

## Questions to ask

* How are errors tracked?
* Can user actions be reconstructed?
* Can performance bottlenecks be found?
* Are logs correlated?
* Can we inspect production state?
* Are traces available?
* Can crashes be reproduced?
* What metrics matter most?
* Are failures visible quickly?
* Can regressions be detected automatically?

## Examples

### Production FE app

Questions:

* What did user do before crash?
* Which API slowed rendering?
* Which route causes memory spikes?

Solutions:

* Sentry
* tracing
* session replay
* breadcrumbs
* performance marks
* structured logging

---

# 8. Simplicity

## Goal

Is the system as simple as possible?

## Questions to ask

* Is this abstraction necessary?
* Can fewer technologies solve this?
* Is architecture premature?
* Is indirection justified?
* Can junior engineers understand this?
* Can we remove layers?
* Is this optimization measurable?
* Are we solving current or hypothetical problems?
* Can defaults handle this?
* Is custom infrastructure required?

## Examples

### Early-stage product

Bad:

* microfrontends
* event sourcing
* Kubernetes
* CQRS
* custom build system

Good:

* monolith
* simple API layer
* local state
* direct deployment

---

# 9. Modularity

## Goal

Can parts evolve independently?

## Questions to ask

* What are natural boundaries?
* Which modules change together?
* Can modules be replaced?
* Are dependencies directional?
* Can cycles appear?
* What is shared vs private?
* Are contracts explicit?
* Can teams own modules independently?
* Are runtime boundaries enforced?
* Can modules be loaded dynamically?

## Examples

### Plugin platform

Questions:

* Can plugin crash entire app?
* How are capabilities exposed?
* How are versions managed?

Solutions:

* capability contracts
* runtime isolation
* manifests
* typed interfaces
* dependency graph validation

---

# 10. Evolvability

## Goal

Can the system adapt to future unknowns?

## Questions to ask

* What requirements may change?
* What assumptions are risky?
* Which parts are hardest to replace?
* Are integrations tightly coupled?
* Can architecture support new workflows?
* Can storage/backend/runtime change?
* Can sync become offline-first later?
* Can rendering model change?
* Can features be extracted later?
* Are business rules centralized?

## Examples

### Enterprise platform

Questions:

* Can system later support realtime collaboration?
* Can modules become standalone apps?
* Can backend APIs change without rewriting FE?

Solutions:

* adapters
* anti-corruption layers
* domain boundaries
* event-driven contracts
* typed schemas
* feature isolation

# All

* Correctness
* Reliability
* Performance
* Security
* Scalability
* Maintainability
* Observability
* Simplicity
* Modularity
* Evolvability
