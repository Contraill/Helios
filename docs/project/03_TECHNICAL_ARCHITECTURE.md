# HELIOS — TEKNİK MİMARİ

## 1. Önerilen teknoloji yığını

### Uygulama

- Next.js App Router
- React
- TypeScript strict mode

### 3B

- Three.js
- React Three Fiber
- `@react-three/drei`
- Gerekirse `@react-three/postprocessing`

### Durum ve veri

- Zustand — yalnızca istemciye ait global etkileşim durumu
- Zod — runtime doğrulama
- Next.js server-side `fetch` ve cache / revalidation
- TanStack Query yalnızca gerçekten istemci tarafında senkronize edilmesi gereken server state oluşursa

### Tasarım

- Tailwind CSS veya CSS Modules + CSS custom properties
- Motion for React — DOM animasyonları
- Kendi tasarım token sistemi

### Kalite

- ESLint
- Prettier
- Vitest
- React Testing Library
- Playwright
- React Three Test Renderer gerektiğinde
- CI

---

## 2. Mimari katmanlar

```text
Presentation
├── Server-rendered sayfalar
├── Client UI component’leri
├── 3B sahne component’leri
├── Responsive layout
└── Accessibility fallback

Application
├── Exploration state
├── Camera orchestration
├── Simulation clock
├── Comparison workflow
├── Preferences
└── Error / loading state

Domain
├── Planet model
├── Mission model
├── Data freshness
├── Unit conversion
├── Weight / age calculations
├── Orbital position
└── Scale transforms

Data
├── Static planetary reference data
├── NASA adapters
├── Validation schemas
├── Cache / revalidation
├── Fallback snapshots
└── Source registry
```

UI katmanı NASA’nın ham response formatını bilmemelidir. 3B component’ler içerik metnini veya API çağrı mantığını taşımamalıdır.

---

## 3. Server ve client sınırı

### Server tarafında

- Gezegen detay sayfalarının ana içeriği
- Metadata
- Statik referans veriler
- Harici API istekleri
- API key
- Cache / revalidation
- Response doğrulama
- Fallback seçimi
- Open Graph görselleri

### Client tarafında

- WebGL Canvas
- Kamera ve sahne etkileşimi
- Zaman kontrolü
- Kilo ve yaş gibi cihazda kalabilecek hesaplamalar
- Kullanıcı tercihleri
- Bottom sheet ve interaktif UI
- Karşılaştırma seçimleri

`"use client"` sınırı mümkün olan en alt seviyede tutulmalıdır. Bütün sayfa sırf bir Canvas kullandığı için client component yapılmamalıdır.

---

## 4. Route yapısı

```text
src/app/
├── page.tsx
├── explore/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── planet/[slug]/
│   ├── page.tsx
│   ├── loading.tsx
│   └── not-found.tsx
├── compare/page.tsx
├── missions/page.tsx
├── data/page.tsx
├── about/page.tsx
├── case-study/page.tsx
├── api/
│   ├── nasa/apod/route.ts
│   ├── nasa/neo/route.ts
│   ├── nasa/mars/route.ts
│   ├── nasa/rover/route.ts
│   └── health/route.ts
├── error.tsx
├── not-found.tsx
└── layout.tsx
```

Not: Güncel Next.js davranışında Route Handler’lar varsayılan olarak cache edilmez. GET endpoint’leri için cache davranışı açıkça seçilmeli ve sürüme göre resmi dokümantasyon kontrol edilmelidir.

---

## 5. Önerilen klasör yapısı

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── planet/
│   ├── data/
│   └── accessibility/
├── features/
│   ├── solar-system/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── planet-details/
│   ├── comparison/
│   └── missions/
├── content/
│   ├── planets/
│   └── sources/
├── lib/
│   ├── calculations/
│   ├── data/
│   │   ├── adapters/
│   │   ├── schemas/
│   │   ├── cache/
│   │   └── fallback/
│   ├── i18n/
│   ├── metadata/
│   └── utils/
├── stores/
├── styles/
└── types/
```

Tek bir `SolarSystem.tsx` içinde kamera, veri, bütün gezegenler, UI ve API mantığı toplanmamalıdır.

---

## 6. Domain modeli

### 6.1 Gezegen

```ts
type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

interface LocalizedText {
  tr: string;
  en: string;
}

interface PlanetData {
  id: PlanetId;
  orderFromSun: number;
  name: LocalizedText;
  tagline: LocalizedText;
  description: LocalizedText;
  accentColor: string;

  physical: {
    meanRadiusKm: number;
    equatorialDiameterKm: number;
    massKg: number;
    densityKgM3: number;
    surfaceGravityMS2: number;
    escapeVelocityKmS: number;
  };

  orbit: {
    semiMajorAxisKm: number;
    semiMajorAxisAu: number;
    orbitalPeriodEarthDays: number;
    eccentricity: number;
    inclinationDeg: number;
    averageOrbitalSpeedKmS: number;
  };

  rotation: {
    siderealRotationHours: number;
    solarDayHours?: number;
    axialTiltDeg: number;
    retrograde: boolean;
  };

  environment: {
    temperature: {
      averageC?: number;
      minimumC?: number;
      maximumC?: number;
      definition:
        "surface" | "cloud-top" | "reference-level" | "not-applicable";
    };
    pressurePa?: number;
    atmosphereSummary: LocalizedText;
    majorAtmosphericComponents: Array<{
      name: string;
      percentage?: number;
    }>;
  };

  moons: {
    count: number;
    countAsOf?: string;
    featured: string[];
  };

  rings: {
    hasRings: boolean;
    description?: LocalizedText;
  };

  sensory: {
    sky: LocalizedText;
    surfaceOrLayer: LocalizedText;
    sound: LocalizedText;
    primaryHazards: LocalizedText;
  };

  sourceIds: string[];
}
```

Uydu sayısı gibi değişebilecek değerlerde `countAsOf` veya kaynak tarihi tutulmalıdır.

### 6.2 Veri kaynağı

```ts
type DataFreshness =
  "live" | "near-live" | "latest-available" | "historical" | "reference";

interface DataSourceReference {
  id: string;
  provider: string;
  title: string;
  url: string;
  sourceType: "api" | "dataset" | "article" | "mission" | "image";
  freshness: DataFreshness;
  retrievedAt?: string;
  observedAt?: string;
  notes?: LocalizedText;
}
```

---

## 7. Static ve dinamik veri ayrımı

### Static / reference

Repository içinde version kontrollü:

- çap,
- kütle,
- yerçekimi,
- yörünge süresi,
- dönüş süresi,
- atmosfer özeti,
- gezegen anlatıları,
- kaynak kayıtları.

### Dynamic

Server üzerinden:

- APOD
- NEO yaklaşmaları
- rover görselleri
- doğrulanmış son görev ölçümleri
- güncel uzay hava olayı — eklenirse

Statik veri güncellendiğinde kaynak değişikliği commit’te görünmelidir.

---

## 8. Veri adapter mimarisi

```ts
interface ExternalDataAdapter<TRaw, TNormalized> {
  fetch(input?: unknown): Promise<unknown>;
  parse(raw: unknown): TRaw;
  normalize(raw: TRaw): TNormalized;
}
```

Örnek dosyalar:

```text
lib/data/adapters/
├── apod.adapter.ts
├── neo.adapter.ts
├── rover-images.adapter.ts
└── mars-observation.adapter.ts
```

Adapter sorumlulukları:

- URL ve parametre üretme
- timeout
- ham response alma
- Zod validation
- normalize etme
- kaynak metadata ekleme
- hata türünü standartlaştırma

UI yalnızca normalize edilmiş domain modelini almalıdır.

---

## 9. Cache stratejisi

Her endpoint için ayrı politika:

### APOD

- Günlük içerik
- Gün içinde tekrar tekrar istek atmaya gerek yok
- Tarih parametresi varsa cache anahtarına dahil edilir

### NEO

- Tarih aralığına göre cache
- Çok geniş aralıklar engellenir
- Kullanıcının her etkileşiminde yeniden fetch edilmez

### Rover görselleri

- Rover, kamera ve tarih cache anahtarına dahil
- Boş sonuçlar kısa süreli cache edilebilir
- Büyük response normalize edilip sınırlandırılır

### Mars gözlemi

- Kaynağın gerçek güncelleme sıklığına göre
- “Son mevcut” veri, “bugünün verisi” olarak etiketlenmez
- Kaynak kararsızsa fallback snapshot gerekir

Cache davranışı framework varsayımlarına bırakılmamalı; kodda açıkça tanımlanmalıdır.

---

## 10. Zustand store sınırları

### Exploration store

- selectedPlanetId
- cameraMode
- labelsVisible
- orbitsVisible
- scaleMode
- focus / overview actions

### Simulation store

- isPaused
- timeScale
- simulationEpoch veya elapsedSimulationDays

### Preferences / environment sınırı

- language ve introSeen gibi uygulama tercihleri, ilgili özellik yüzeyinde gerekliyse saklanabilir
- Explore render quality kullanıcı tercihi değildir; tek High visual contract runtime tarafından uygulanır
- reduced motion override saklanmaz; `prefers-reduced-motion` otomatik izlenir
- zaman, pause ve ephemeris request lifecycle'ı persistent Explore controller tarafından yönetilir

API response’ları store’a kalıcı olarak doldurulmamalıdır. Frame içi çok hızlı değerler React’e reaktif biçimde bağlanmamalıdır.

---

## 11. 3B sahne hiyerarşisi

```text
Canvas
└── SolarSystemScene
    ├── Lighting
    ├── StarField
    ├── Sun
    ├── PlanetSystem[]
    │   ├── OrbitPath
    │   ├── OrbitPivot
    │   └── PlanetVisual
    │       ├── Surface
    │       ├── Atmosphere
    │       ├── Rings
    │       └── InteractionTarget
    ├── CameraRig
    ├── SelectionEffects
    └── AdaptiveQuality
```

---

## 12. Yörünge ve dönüş

### Basit deterministik yörünge

```ts
angle =
  initialAngle +
  elapsedSimulationDays * ((Math.PI * 2) / orbitalPeriodEarthDays);

x = semiMajorAxis * Math.cos(angle);
z = semiMinorAxis * Math.sin(angle);
```

MVP’de tam Kepler çözümü zorunlu değildir. Ancak eliptik yörünge ve değişken hız uygulanmıyorsa, içerik bunu bilimsel efemeris gibi sunmamalıdır.

### Dönüş

```ts
rotationY += delta * rotationSpeed * direction;
```

- `delta` kullan
- retrograde yönünü uygula
- frame başına sabit açı ekleme
- gerçek dönüş oranları görsel olarak kullanışsızsa normalize edilmiş görsel hız ile gerçek değer ayrılır

---

## 13. Ölçek sistemi

Tek bir sabit çarpan yeterli olmayabilir.

```ts
interface ScaleStrategy {
  distanceFromAU(au: number): number;
  radiusFromKm(km: number): number;
}
```

Stratejiler:

- `explorationScale`
- `scientificScale`
- opsiyonel `comparisonScale`

Keşif ölçeğinde boyut ve mesafe ayrı fonksiyonlarla dönüştürülmelidir. Böylece gezegenlerin görünürlüğü korunur.

Bilimsel modda kullanılan logarithmic veya piecewise dönüşüm kullanıcıya açıklanmalıdır.

---

## 14. Kamera mimarisi

`CameraRig` merkezi otorite olmalıdır.

```ts
type CameraMode = "overview" | "focus" | "free" | "transition" | "tour";
```

Kamera geçiş girdileri:

- başlangıç pozisyonu
- hedef pozisyon
- look-at hedefi
- minimum güvenli mesafe
- easing
- süre
- iptal token’ı

Gezegen component’i kamerayı doğrudan değiştirmemeli; seçim event’i uygulama katmanına iletilmelidir.

---

## 15. Atmosfer, halkalar ve Güneş

### Atmosfer

- ikinci sphere
- BackSide
- Fresnel benzeri shader
- kalite seviyesine göre sadeleştirme
- bütün gezegenlerde aynı parametreler kullanılmaz

### Satürn halkaları

- ayrı geometri
- iç / dış radius
- alpha texture
- DoubleSide
- gezegen tilt’ine bağlı parent group
- mobilde düşük çözünürlük

### Güneş

- emissive material
- point light
- kontrollü corona
- sınırlı bloom
- uzak gezegenlerin aydınlatması görsel olarak anlaşılır olmalı

---

## 16. Yıldız alanı

Binlerce ayrı mesh oluşturulmaz.

Tercihler:

- `Points`
- `BufferGeometry`
- instancing
- katmanlı dağılım
- düşük maliyetli parallax

Yıldız yoğunluğu kalite seviyesine bağlıdır.

---

## 17. Performans mimarisi

### İlk yükleme

- `/` sayfasında Canvas zorunlu değil
- `/explore` Canvas’ı dynamic import
- texture manifest ve kaliteye göre lazy load
- high-res asset’ler focus anında yüklenebilir

### Render

- hızlı değişen değerler için `useFrame`
- her frame `setState` yok
- gereksiz object allocation yok
- geometry / material tekrar kullanımı
- texture cleanup
- component unmount dispose kontrolü

### Kalite seviyeleri

```ts
type QualityLevel = "low" | "medium" | "high";
```

Low:

- düşük DPR
- bloom kapalı
- düşük texture
- az yıldız
- basit atmosfer

Medium:

- dengeli varsayılan

High:

- daha yüksek texture
- kontrollü post-processing
- gelişmiş atmosfer

Kullanıcı manuel olarak değiştirebilir.

---

## 18. Güvenlik

- `NASA_API_KEY` server-only
- `NEXT_PUBLIC_NASA_API_KEY` kullanılmaz
- Environment Zod ile doğrulanır
- API parametreleri allowlist ve range kontrolünden geçer
- Tarih formatı doğrulanır
- Route timeout
- Response boyutu sınırı
- Rate limit kötüye kullanımına karşı temel koruma
- Kilo / yaş sunucuya gönderilmez
- HTML scraping kritik bağımlılık yapılmaz
- Harici metin doğrudan HTML olarak render edilmez

---

## 19. i18n

İlk mimari Türkçe ve İngilizceyi desteklemelidir.

- Route locale yapısı ilk sürümde zorunlu değil
- İçerik modeli localized field taşır
- UI string’leri merkezi sözlükte
- Sayısal birimler locale’e göre formatlanır
- İçerik içinde hard-coded Türkçe metin dağılmaz

---

## 20. SEO ve metadata

- Gezegen sayfaları server-rendered metin içermeli
- Dinamik title / description
- Open Graph görseli
- canonical
- sitemap
- robots
- JSON-LD yalnızca doğru şema bulunursa
- Canvas SEO içeriğinin yerine geçmez

---

## 21. Gözlemlenebilirlik

Production’da minimum:

- API error log
- endpoint latency
- fallback kullanım sayısı
- client error boundary raporu
- performans ölçümü
- kullanıcı verisi toplamayan veya minimum veri kullanan analytics

Debug panel ve FPS monitor production bundle’da görünmemelidir.

---

## 22. Teknik kabul kriterleri

- Build, lint, typecheck, unit ve E2E geçer
- API key istemci bundle’ında yok
- Harici veriler Zod’dan geçer
- Route cache davranışı açıkça tanımlı
- Frame loop React state’i zorlamaz
- Canvas hata verdiğinde statik fallback açılır
- Gezegen verileri tek şemadan doğrulanır
- Mobil kalite seviyesi fark yaratır
- Kaynaklar dispose edilir
- Büyük component sorumlulukları ayrılmıştır

---

## 23. Resmî teknik referanslar

Uygulama sırasında güncel sürüm davranışı her zaman resmi dokümandan doğrulanmalıdır:

- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Next.js server fetch caching: https://nextjs.org/docs/app/api-reference/functions/fetch
- React Three Fiber: https://r3f.docs.pmnd.rs/
- R3F performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- R3F performance pitfalls: https://r3f.docs.pmnd.rs/advanced/pitfalls
- R3F events: https://r3f.docs.pmnd.rs/api/events
- Three.js: https://threejs.org/docs/
