# Faz 3 Sonu

## Tamamlananlar

- `/explore` için route bazlı, istemci tarafında yüklenen React Three Fiber Canvas
- Güneş, sekiz gezegen ve katalog sırasına bağlı sahne üretimi
- Eliptik yörünge çizgileri, yörünge eğimi ve eksen eğikliği
- `delta` tabanlı yörünge ve eksen dönüşü
- Retrograde dönüş yönü
- Deterministik, tek `Points` geometrisi kullanan yıldız alanı
- Responsive overview kamera çerçevesi
- Route loading, Canvas fallback ve render error boundary
- Reduced-motion açıkken sürekli hareketin ve frame döngüsünün durdurulması
- Canvas dışında sekiz gezegene erişilen semantik liste
- Mobil ve masaüstü keşif düzeni

## Değiştirilen Dosyalar

- `src/app/explore/*`
- `src/features/solar-system/components/*`
- `src/features/solar-system/lib/*`
- `src/hooks/use-reduced-motion-preference.ts`
- `src/app/globals.css`
- `src/lib/i18n/ui-strings.ts`
- `src/app/page.tsx`
- `package.json`
- `pnpm-lock.yaml`
- `e2e/smoke.spec.ts`
- `README.md`
- `docs/decisions.md`

## Teknik Kararlar

- Canvas yalnızca `/explore` rotasında dinamik import ile yüklenir. Ana sayfa 3B bundle'a bağımlı değildir.
- `ScenePlanet` görünüm modeli Phase 2 verisinden türetilir; 3B component'lerde bilimsel değer kopyası tutulmaz.
- Frame loop içinde React state kullanılmaz. Hızlı değerler Three.js nesnelerine doğrudan uygulanır.
- Yıldız alanı yüzlerce ayrı mesh yerine tek BufferGeometry kullanır.
- Faz 3'te texture, shader, bloom, halka geometrisi ve seçilebilir mesh event'leri bulunmaz.
- Reduced-motion durumunda sahne statik bir genel görünüm olarak kalır.

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 32 test geçti
- build: geçti; `/explore` ve sekiz `/planet/[slug]` rotası üretildi
- E2E: 18 senaryo tanımlı. API senaryosu geçti; tarayıcı senaryoları çalışma ortamının localhost politikasında `ERR_BLOCKED_BY_ADMINISTRATOR` ile engellendi. Production HTTP smoke testi bütün ana rotalar, sekiz gezegen, 404, health ve sekiz semantik gezegen bağlantısı için geçti.

## Performans / Erişilebilirlik Etkisi

- Canvas route bazlı ayrıldığı için ana sayfa 3B bağımlılıklarını yüklemez.
- DPR 1–1.5 aralığında sınırlandırılmıştır.
- Sahne texture veya post-processing kullanmaz.
- 900 yıldız tek point cloud olarak render edilir.
- Ölçülen 3B dynamic chunk: 1,197,409 bayt sıkıştırılmamış, 305,586 bayt gzip. Ana sayfanın first-load listesinde bu chunk bulunmaz.
- Canvas ekran okuyucudan gizlenir; aynı gezegenler semantik bağlantı listesinde bulunur.
- WebGL çalışmadığında gezegen sayfaları erişilebilir kalır.

## Veri ve Kaynak Etkisi

Faz 2 kaynak modeli değiştirilmedi. Yaklaşık yörünge elemanları yalnızca açıklayıcı hareket ve geometri için kullanılır; sahne kesin efemeris veya gerçek ölçek olarak sunulmaz.

## Bilinen Eksikler

- Gezegen seçimi, hover, touch ve klavye focus akışı Faz 4 kapsamındadır.
- Focus kamera ve geçiş iptali Faz 4 kapsamındadır.
- Pause, zaman hızı, ölçek modu ve kalite seçimi Faz 5 kapsamındadır.
- Texture, atmosfer shader'ı, Satürn halkası ve post-processing Faz 9 kapsamındadır.
- İlk gerçek cihaz FPS, bellek ve WebGL kaynak ölçümleri deployment sonrasında alınmalıdır.

## Sonraki Fazdan Önce Blocker

Kod doğrulama açısından blocker yoktur. `pnpm install --lockfile-only --frozen-lockfile --offline` geçti. Gerçek repository entegrasyonundan sonra GitHub Actions Playwright koşusu ve deploy edilen `/explore` rotasının masaüstü ile orta seviye Android cihazda görsel/performance kontrolü gerekir.
