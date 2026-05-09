* Optional checking for unknown prop pass (zod runtime validation). To avoid overhead -> must be optionally enabled
* Prefer strict static type checking
* For any callbacks and functions output format must be ensured
* Any function should be treated as not pure (try/catch must be provided)
* Resource management must be explicit (using disposable interface)
* Context fallbacks must be defined (error handling strategy must be defined)
* In general, data is unbound so different opt patterns must be used. Some of them will affect visual behaviour, so
  there must be options to configure compositions easily
* Optimizations on style level can be also applied (nested structure, intrinsic sizes)
* SEO, accessibility, internationalization
* Responsiveness
* Runtime isomorphic. For runtime specific elements, separate public entry points must be provided
* Tree-shakable
* Deps versions must be pinned
* Avoid script injections, evals and function constructors
* As number of clients grow it is important to use semver with api-extractor to make public API updates transparent
* Also, it would be wise to track usage of components, so that certain elements can be extracted (that are used only on
  limited number of project). It would allow to stabilize releases (single reuse)
* Documents (in static/dynamic forms) must be provided
* Release strategies must be implemented (canary releases through feature flags or sep packages, Blue-Green Deployment, A/B Testing)
* Release channels must also be used (Alpha, Beta, RC, Stable and Nightly)
* Release support policies must be described (for example, support last four versions)
* Lib structure must be described precisely (maybe with agents use)
* SRP must be respected to cluster changes
* OCP must be used to protect core elements from direct changes
* Encapsulation must be watched closely via direct control under public API (to protect clients)
* static and dynamic checks must be used extensively
* Optional error tracking system with performance measurements (INP, CLS)
* Solutions must be simple and monolithic first (future divides are possible with usage of facade as ACL)
