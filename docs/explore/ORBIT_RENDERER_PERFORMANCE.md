# Orbit renderer performance summary

- Body position and path samples use the same evaluator, epoch, element convention and frame basis.
- Static representative `Line2` geometry is recreated only when orbit data, sampling policy or typed scene profile changes.
- Emphasis changes update the mounted line/material rather than rebuilding orbital geometry.
- Geometry/material UUIDs and real orbit bounds are exposed only in acceptance mode to verify resource reuse.
- Distance fading uses sampled orbit bounds rather than a possibly misleading semi-major-axis shortcut.
- Hidden extended bodies and their hooks remain filtered at the parent policy boundary.
- Selected moon/extended orbits survive Navigator category changes through the derived visibility policy.
- Regional populations remain procedural/instanced; the gate does not add hundreds of individual orbit lines.
- Render-loop evaluators accept caller-owned output tuples to avoid per-frame vector allocation.

No native-GPU timing claim is made from serverless SwiftShader. Frame pacing, VRAM residency and driver-specific line cost remain native-device checks.
