# Prompt 3 visual registry coverage

Generated from the typed visual registry and audited asset manifest.

| Class | Count | Body IDs |
|---|---:|---|
| Featured planetary moons | 22 | `moon-earth-moon`, `moon-jupiter-callisto`, `moon-jupiter-europa`, `moon-jupiter-ganymede`, `moon-jupiter-io`, `moon-mars-deimos`, `moon-mars-phobos`, `moon-neptune-nereid`, `moon-neptune-proteus`, `moon-neptune-triton`, `moon-saturn-dione`, `moon-saturn-enceladus`, `moon-saturn-iapetus`, `moon-saturn-mimas`, `moon-saturn-rhea`, `moon-saturn-tethys`, `moon-saturn-titan`, `moon-uranus-ariel`, `moon-uranus-miranda`, `moon-uranus-oberon`, `moon-uranus-titania`, `moon-uranus-umbriel` |
| Dwarf-system satellites | 8 | `dwarf-satellite-charon`, `dwarf-satellite-dysnomia`, `dwarf-satellite-hiiaka`, `dwarf-satellite-mk2`, `dwarf-satellite-namaka`, `dwarf-satellite-vanth`, `dwarf-satellite-weywot`, `dwarf-satellite-xiangliu` |
| Main-belt bodies | 4 | `ceres`, `hygiea`, `pallas`, `vesta` |
| Dwarf / Kuiper bodies | 8 | `eris`, `gonggong`, `haumea`, `makemake`, `orcus`, `pluto`, `quaoar`, `sedna` |
| Comet nuclei | 6 | `67p`, `encke`, `hale-bopp`, `halley`, `neowise`, `tempel-1` |

## Coverage result

- 22/22 featured planetary moons have a central visual profile.
- 18/18 previously accepted extended bodies have a central visual profile.
- 8/8 dwarf-system satellites have a central visual profile and explicit parent.
- Every profile owns one runtime asset path, orientation metadata, fallback color, geometry strategy and provenance source ID.
- `surfaceVariation` and the previous generic-ID branches were removed rather than retained as dead metadata.
- Representative identity checks cover Europa, Titan, Iapetus, Haumea, Vesta and 67P.
