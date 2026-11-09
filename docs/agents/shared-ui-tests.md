# Shared UI Test Ownership

Shared client modules have one contract-owner suite. The owner tests behavior through a real adopting route and marks each encapsulated case with a registered Vitest tag whose name starts with `shared-`.

Current ownership:

| Tag | Module | Owner suite |
| --- | --- | --- |
| `shared-catalog-table` | `MaintenanceCatalog` | `browser-tests/products/products.test.ts` |
| `shared-maintenance-form` | `MaintenanceFormDialog` | `browser-tests/products/products.test.ts` |

For another adopter, test its data, request mapping, response mapping, and domain lifecycle. Rely on the tagged owner cases for loading, errors, retries, empty states, focus, dismissal, pending state, and refresh sequencing.

When shared behavior changes, update the module and its tagged owner case. When an adopter reveals new shared behavior, add the case to the owner suite and tag it instead of copying the scenario into every adopter.

Tags are registered with `strictTags` in the browser project. Search `shared-` to find every definition and owner, or use Vitest's tag listing and filtering commands.
