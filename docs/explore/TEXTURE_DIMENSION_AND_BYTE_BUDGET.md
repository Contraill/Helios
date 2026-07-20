# Texture dimension and byte budget

## Runtime inventory

| Stage | Files | Encoded | Decoded RGBA | With mipmaps (estimate) |
|---|---:|---:|---:|---:|
| Blocking primary | 12 | 3.46 MiB | 88.98 MiB | 118.64 MiB |
| Background secondary | 48 | 0.41 MiB | 45.00 MiB | 60.00 MiB |
| Total manifest | 60 | 3.86 MiB | 133.98 MiB | 178.64 MiB |

| Runtime dimensions | Count | Encoded | Decoded RGBA |
|---|---:|---:|---:|
| 2048×1024 | 11 | 3.45 MiB | 88.00 MiB |
| 2048×125 | 1 | 0.01 MiB | 0.98 MiB |
| 1024×512 | 14 | 0.28 MiB | 28.00 MiB |
| 512×256 | 34 | 0.13 MiB | 17.00 MiB |

## Gate result

- Maximum celestial surface width: **2048 px** (existing primary contract only).
- New Prompt 3 surface maximum: **1024×512**.
- New Prompt 3 split: 14 at 1024×512 and 34 at 512×256.
- No 4K/8K runtime asset, low/medium/high duplicate, unowned file or orphan file remains.
- Regions (asteroid belt, Kuiper belt, Oort cloud and heliosphere) remain procedural and receive no bitmap surface.
