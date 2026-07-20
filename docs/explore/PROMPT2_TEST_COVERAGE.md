# Prompt 2 functional test coverage

The gate intentionally uses a small number of combined scenarios.

1. **Reference-frame math** — ICRF/ecliptic round trip, equatorial/Laplace basis, JPL node convention, Ω/ω/i rotation and approximate TDB progression.
2. **Moon system** — Earth–Moon, Saturn–Titan and Uranus–Miranda position/path equality, frame alignment, tidal lock and profile phase continuity; one catalogue audit covers all 22 records.
3. **Extended body/comet** — distinct Ω/ω, six-element evaluation, high-e convergence, path/position equality and anti-solar distance-bounded tail activity.
4. **Shared-time renderer** — pause/resume, mode continuity, selected orbit persistence, resource identity and acceptance object counts.
5. **Baseline runtime** — `/data` production rendering remains static/revalidated without a static-to-dynamic server error; verified fallback survives provider failure.

Final general gates run format, lint, strict typecheck, full unit/integration, texture audit, production build and targeted Chromium. Firefox/WebKit and native GPU remain documented external gaps if unavailable.
