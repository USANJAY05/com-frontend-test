# Feature boundaries

The main application now imports the largest CRM views through feature entry
points (`features/dialer`, `features/agents`, `features/reports`, etc.). The
legacy component files remain in place as compatibility implementations so
there is no high-risk import-path rewrite in this change.

This is an intentional strangler-step: new hooks/components for a feature can
be added beside its `index.ts`, then the legacy implementation can be reduced
incrementally. Existing routes and tests continue to resolve the same runtime
components.
