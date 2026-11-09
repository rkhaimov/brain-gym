# Shared UI Test Ownership

Shared client modules have one contract-owner suite. The owner tests behavior through a real adopting route and marks its complete `describe` block with the module's registered Vitest tag.

Current ownership:

| Tag | Module | Owner suite |
| --- | --- | --- |
| `shared-catalog-table` | `MaintenanceCatalog` | `browser-tests/products/maintenance-catalog.test.ts` |
| `shared-maintenance-form` | `MaintenanceFormDialog` | `browser-tests/products/maintenance-form-dialog.test.ts` |

For another adopter, test its data, request mapping, response mapping, and domain lifecycle. Rely on the tagged owner cases for loading, errors, retries, empty states, focus, dismissal, pending state, and refresh sequencing.

Each shared module and its owner suite import the same lightweight named contract (`maintenanceCatalogContract` or `maintenanceFormContract`). The module also exposes the contract tag as `Module.testTag`, while the browser project registers that same contract with `strictTags`. This keeps the module, suite, and runner linked without importing client TSX into the test runner.

When shared behavior changes, update the module and its owner suite. When an adopter reveals new shared behavior, add the case to the owner suite instead of copying the scenario into every adopter.

Tags are registered with `strictTags` in the browser project. Search `shared-` to find every definition and owner, or use Vitest's tag listing and filtering commands.
