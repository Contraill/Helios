# Prompt 3 GPU-memory estimate

The estimate uses uncompressed RGBA8 texels plus a 4/3 mip-chain factor. Driver alignment, texture compression, render targets and browser overhead are not included.

| Residency set | RGBA8 | With mipmaps |
|---|---:|---:|
| Primary opening contract (12 assets) | 88.98 MiB | 118.64 MiB |
| All 48 secondary assets (audit-only worst case) | 45.00 MiB | 60.00 MiB |
| Scheduler maximum 12 secondary leases | 24.00 MiB | 32.00 MiB |
| Primary + scheduler maximum | 112.98 MiB | 150.64 MiB |

Geometry/material overhead is expected to remain small relative to textures because sphere, atmosphere and ring geometries are static/cached and body-specific irregular geometries are deterministic cached buffers. Actual VRAM must still be measured on integrated GPUs and mobile devices.
