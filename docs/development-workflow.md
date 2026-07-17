# Development workflow

Helios uses separate review tracks so product, implementation and release decisions do not become mixed together.

## Workstreams

- **Product planning:** scope, phase boundaries and feature classification
- **Implementation:** code, tests, builds and phase delivery
- **Repository structure:** module boundaries, naming and refactors
- **Security review:** secrets, dependencies, input validation and deployment risks
- **Release review:** acceptance criteria, regressions and the next executable task

## Decision flow

1. A proposal is classified as MVP, post-MVP, research, rejected or technical debt.
2. Decisions that affect scope, data, design or architecture are recorded in `docs/decisions.md`.
3. Implementation is validated in the real repository.
4. A phase report records checks, known limitations and blockers.
5. The next phase starts only after the current acceptance criteria are met.
