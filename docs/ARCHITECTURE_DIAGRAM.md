# Architecture Diagram

```mermaid
flowchart TD
  Browser[Browser] --> AppRouter[Next.js App Router]
  AppRouter --> ServerPages[Server-rendered pages and metadata]
  AppRouter --> ClientIslands[Client interaction islands]

  ServerPages --> Content[Versioned body, planet, mission and source content]
  ServerPages --> Locale[Cookie-backed EN/TR catalogue]
  ServerPages --> DataLayer[External data application layer]

  DataLayer --> Contracts[Provider contracts]
  DataLayer --> Validation[Zod validation and normalisation]
  DataLayer --> Cache[Timeout, cache and revalidation]
  DataLayer --> Fallback[Verified snapshots and static catalogues]
  Contracts --> NASA[NASA/JPL official services]

  ClientIslands --> Explore[Explore UI]
  Explore --> Stores[Bounded Zustand stores]
  Explore --> Scene[React Three Fiber scene]
  Scene --> Registry[Celestial and visual registries]
  Scene --> Clock[Persistent ephemeris clock]
  Scene --> Assets[Bounded runtime texture manifest]

  Content --> BodyRoutes[57 body routes]
  Content --> RegionRoutes[4 region routes]
  Content --> PlanetPages[8 custom planet compositions]
  Content --> Missions[Missions index]

  Audits[Static release audits] --> Content
  Audits --> Contracts
  Audits --> Locale
  Audits --> Registry
  Audits --> Assets
```

## Ownership summary

- Server pages own metadata, locale resolution and external-data loading.
- Provider adapters own URL construction, timeout, validation, normalisation and fallback selection.
- Client stores own bounded interaction state, never reference scientific truth.
- `CameraRig` and the persistent ephemeris controller are the scene authorities.
- Lightweight route registries feed sitemap/navigation without importing full editorial models.
- Runtime assets enter the release only through the manifest and provenance audits.
