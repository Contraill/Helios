# Prompt 3 removal and orphan audit

`node scripts/audit-runtime-textures.mjs` result:

```json
{
  "assets": 60,
  "referencedPaths": 54,
  "dynamicReferencedPaths": 9,
  "runtimeFiles": 60,
  "errors": [],
  "warnings": []
}
```

Checks include manifest ownership, SHA-256, byte size, decoded dimensions, 2K ceiling, orientation fields, source/license fields, stale quality variants, duplicate runtime paths and orphan files. The old unused moon `surfaceVariation`/roughness metadata and component-local generic visual branches were removed.
