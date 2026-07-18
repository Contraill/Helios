# Faz 8.5 Uzun Tarih Aralığı ve API Kabul Raporu

## Başlangıç ve Canlı Dağıtım

- Bu kabul onarımının başlangıcı: `865309f47da707d450a6914ff9686884f9d1eb95`
- Çalışma bu commitin temiz klonunda yapıldı.
- `fc40e0b` sonrası Faz 8.5 paketi commit/push edildi ve Vercel üzerinden canlıya dağıtıldı.
- Canlı dağıtım sonrası `/explore` kabulünde React minified `#418` hydration uyuşmazlığı bulundu.
- Bu turda commit veya push yapılmadı; aşağıdaki onarım yerel production build ve production-mode Playwright ile doğrulandı.

## Mevcut Faz 8.5 Denetimi

Canlı kabul notları ve eklenen gereksinim metni birlikte denetlendi. Paket şunları kapsıyor:

- gezegen konumları ile yörünge çizgilerinin aynı efemeris dönüşümünü kullanması;
- açılışta gerçek UTC zamandan başlayan, duraklatılmamış `1 gerçek saniye = 1 simülasyon saniyesi` saat;
- `6 saat`, `1 gün`, `1 hafta`, `1 ay` ve yeni `1 Jülyen yılı / gerçek saniye` hızları;
- gizlenebilir zaman ve simülasyon panelleri;
- canvas üzerinde mouse drag/wheel ve dokunmayla doğrudan free-camera yetkisi;
- yumuşatılmış Home ve Mercury ışık/renk alanlarının başlangıç commitinde korunması;
- potentially-hazardous açıklamasının yalnız gerçekten `true` kayıt bulunduğunda gösterilmesi;
- stale/fallback verinin daha güncel başarılı sonucu ezmemesi;
- dinamik 1100 yıllık ürün aralığı ve dış veri doğruluk düzeltmeleri.

## C0 Canlı Hydration Onarımı

Kök neden, `initialSimulationState = stateAtNow()` çağrısının modül değerlendirmesi sırasında server ve client için ayrı `Date.now()` değerleri üretmesi ve `EphemerisControls` ilk markup'ının bu değerleri doğrudan tarih metnine dönüştürmesiydi. Store başlangıcı deterministik bir sentinel'a taşındı. İlk server/client ağacı `Preparing current UTC…` durumunu aynı biçimde üretir; client hydrate olduktan sonra saat gerçek `Date.now()` anchor'ıyla, duraklatılmamış ve `Real time` olarak başlar. Efemeris isteği beklerken saat akmaya devam eder.

`suppressHydrationWarning`, build-time tarih dondurma, eski statik tarih, timeout tabanlı remount veya geniş console allowlist kullanılmadı. Production E2E; hydration/console hatası olmamasını, yakalanmamış `pageerror` bulunmamasını, gerçek zamana yakın ilk timestamp'i, monoton Real time akışını, Jülyen yıl hızını, Pause'u ve bağımsız Now/Reset dönüşlerini doğrular.

Canlı Vercel dağıtımı bu onarım kullanıcı tarafından push edilene kadar başlangıç commitinde kalır; kabul bu turda üretilen production build üzerinde tamamlandı.

## Yeni Tarih Aralığı Sözleşmesi

`simulation-range.ts` tek sınır otoritesidir. Aralık, Explore hydrate olurken bir kez alınan `Date.now()` UTC anchor’ından hesaplanır:

- minimum: anchor’dan 500 takvim yılı önce;
- maksimum: anchor’dan 600 takvim yılı sonra;
- ay, gün, saat, dakika, saniye ve milisaniye korunur;
- hedef yılda 29 Şubat yoksa Şubat’ın son geçerli gününe clamp edilir;
- range anchor localStorage’a yazılmaz;
- `Now` gerçek zamana döner ve range’i güvenli biçimde yeniden anchor eder.

Aynı modül store, tick/frame hesabı, adım kontrolleri, scrubber, URL, hydration, reset, automatic refresh ve `/api/ephemeris` doğrulamasında kullanılır.

## Horizons Sekiz Hedef Tarih Kapsamı

Doğrudan resmî JPL Horizons yanıtları 18 Temmuz 2026 anchor’ıyla minimuma yakın, minimum, güncel, maksimuma yakın ve maksimum tarihlerde seri olarak kontrol edildi.

| Dünya   | Body center | Doğrudan body-center kapsam sonucu | Uzun aralık çözümü   |
| ------- | ----------: | ---------------------------------- | -------------------- |
| Mercury |         199 | 1526–2626 tarihleri geçti          | 199                  |
| Venus   |         299 | 1526–2626 tarihleri geçti          | 299                  |
| Earth   |         399 | 1526–2626 tarihleri geçti          | 399                  |
| Mars    |         499 | yaklaşık 1600-01-02–2600-01-01     | Mars Barycenter 4    |
| Jupiter |         599 | yaklaşık 1600-01-11–2200-01-09     | Jupiter Barycenter 5 |
| Saturn  |         699 | yaklaşık 1749-12-31–2250-01-05     | Saturn Barycenter 6  |
| Uranus  |         799 | yaklaşık 1600-01-05–2399-12-16     | Uranus Barycenter 7  |
| Neptune |         899 | yaklaşık 1800-01-02–2199-12-30     | Neptune Barycenter 8 |

`499/599/699/799/899` gövde merkezlerinin ortak 1526–2626 kapsamı olmadığı açıkça tespit edildi. Sessiz approximate-orbit fallback yapılmadı. Resmî `4/5/6/7/8` barycenter hedeflerinin hem 1526 hem 2626 uçlarında vector ürettiği doğrulandı; adapter yalnız body-center kernel penceresi yetersiz olduğunda bu hedeflere geçer ve bundle/UI bunu `mixed-barycenters` olarak bildirir.

## Minimum ve Maksimum Tarihler

Kabul anchor’ı: `2026-07-18T16:18:30.100Z`.

| Konum    | İstenen tarih              | HTTP | Bundle                | Vector/window | Horizons imzası |
| -------- | -------------------------- | ---: | --------------------- | ------------- | --------------- |
| Minimum  | `1526-07-18T16:18:30.100Z` |  200 | current, fallback yok | 8 / 8         | 1.2             |
| Güncel   | `2026-07-18T16:18:30.100Z` |  200 | current, fallback yok | 8 / 8         | 1.2             |
| Maksimum | `2626-07-18T16:18:30.100Z` |  200 | current, fallback yok | 8 / 8         | 1.2             |

Her window 121 örnek döndürdü. İstekler altı saatlik kararlı source epoch’una yuvarlandığı için kabul yanıtlarındaki `observedAt` değerleri ilgili tarihte `18:00:00 TDB` oldu.

## Boundary Clamp Davranışı

- Store saati hiçbir hızda minimum veya maksimumu bir milisaniye aşmaz.
- `maximum − 500 ms` durumunda `1 month/sec` ilerleme tam maksimum timestamp’e clamp edilir ve otomatik pause olur.
- Minimumda geri adım tam minimuma clamp edilir.
- Boundary’de yön düğmeleri disabled olur ve doğal durum mesajı gösterilir.
- Boundary’de Resume disabled kalır; seçili hız tercihi korunur.
- Boundary tick’leri yeni Horizons request loop’u üretmez.
- Datetime input ve API tam minimum/maksimumu kabul eder, bir milisaniye dışını reddeder.

## Hızlı Oynatma Davranışı

Seçenekler:

- Real time: `1 s/s`;
- `6 hours / sec`;
- `1 day / sec`;
- `1 week / sec`;
- `1 month / sec`;
- `1 year / sec`: `31,557,600` simülasyon saniyesi, yani 365,25 günlük Jülyen yılı.

Site gerçek zamandan, duraklatılmamış ve `Real time` seçili açılır. Provider yüklenirken de görünür saat donmaz. Yıl hızında her frame yeni JPL isteği gönderilmez; UI `Approximate preview` gösterir. Pause veya kesin tarih seçimi tekrar source window çözümüne döner.

## Horizons Window ve Cache Mimarisi

- Her hedef için merkez tarihin iki yanında 1800 gün, toplam yaklaşık 3600 günlük window kullanılır.
- `START_TIME`, `STOP_TIME`, `STEP_SIZE='30 d'`, `VECTORS`, `VEC_TABLE=2` sözleşmesi kullanılır.
- Her başarılı window 121 position/velocity örneği içerir.
- Client, window içindeki hareketi cubic Hermite interpolation ile çözer.
- Window kenarına 90 gün kalınca kontrollü prefetch değerlendirilir.
- Automatic retry için 60 saniyelik cooldown ve request key koruması vardır.
- Hızlı scrub 450 ms debounce ve pointer/key release commit kullanır.
- Aynı target/window için duplicate in-flight istek tek Promise’ta birleştirilir.
- Next fetch cache’i planet/window tag’iyle 24 saat revalidate edilir; client’a 1100 yıllık veri tek seferde gönderilmez.

## JPL Fair-use Uyumu

Horizons, CAD ve Fireball aynı global JPL SSD kuyruğunu kullanır. Aynı anda en fazla bir JPL SSD isteği aktiftir. Testte eşzamanlı iki aynı sekiz-hedef bundle isteği:

- maksimum active request: 1;
- gerçek fetch sayısı: 8, 16 değil;
- iki consumer da sekiz window aldı.

Kural kaynağı: <https://ssd-api.jpl.nasa.gov/>.

## API Version Kararı

- Horizons canlı imzası: `1.2`.
- Adapter yalnız açıkça doğrulanmış `1.2` ve dokümante edilen `1.3` sürümlerini kabul eder.
- Boş olmayan herhangi bir sürüm kabul edilmez; `9.9` testi açık `version` hatasına düşer.
- Aynı bundle içinde karışık sürümler reddedilir.
- CAD yalnız canlı/dokümante `1.5` ile normalize edilir.
- Fireball canlı imzası `1.2` olarak yeniden doğrulandı ve eski `1.0` varsayımı kaldırıldı.

Horizons sözleşmesi: <https://ssd-api.jpl.nasa.gov/doc/horizons.html>. CAD sözleşmesi: <https://ssd-api.jpl.nasa.gov/doc/cad.html>.

## Fireball Düzeltmesi

- `energy` → `radiatedEnergy10e10J`;
- `impact-e` → `estimatedImpactEnergyKt`;
- UI iki değeri ayrı kart ve doğru birimle gösterir;
- eski birleşik “radiated/impact-energy field” ifadesi kaldırıldı;
- canlı Fireball `1.2` yanıtı `energy=3.2`, `impact-e=0.11` örneğiyle doğrulandı.

## CNEOS CAD Düzeltmesi

- İstek `diameter=true` ve `fullname=true` gönderir.
- `dist-max`, `date-min`, `date-max` gerçek tireli provider parametreleridir.
- Eksik çap `0 m` yapılmaz; alan yok/unavailable olarak kalır.
- CAD hazard üretmediği için `potentiallyHazardous=null` ve UI’da unknown gösterilir.
- `cd` zaman ölçeği UTC değil `TDB` olarak etiketlenir.
- Canlı `1.5` yanıtında ilk kayıt `2026 NF`, yaklaşım `2026-Jul-18 10:21 TDB`, çap `null` olarak doğrulandı.

## EONET Düzeltmesi

- Event bazlı tolerant parse kullanılır; tek bozuk event bütün feed’i düşürmez.
- Point ve Polygon korunur.
- Polygon coordinate dizileri güvenli biçimde düzleştirilir ve representative centroid üretilir.
- Canlı açık feed `200` ve Point geometrileri döndürdü.
- `EONET_21394` kaydı `200`, `Polygon`, son geometry zamanı `2026-07-11T20:00:00Z` olarak ayrıca doğrulandı.

## DONKI Partial-success

FLR, CME, GST ve notifications bağımsız `Promise.allSettled` sonuçlarıdır. Tek endpoint hatasında:

- başarılı aileler görünür kalır;
- status `partial` olur;
- başarısız yollar `metadata.failedEndpoints` içine yazılır;
- bütün feed stale snapshot’a düşmez.

Bu davranış component/provider testinde gerçek partial senaryoyla geçti. Kabul ortamındaki `api.nasa.gov` DEMO_KEY çağrılarının dördü de timeout olduğu için bu canlı turda doğrulanmış fallback kullanıldı; sonuç current olarak sunulmadı.

## InSight On-this-day

- Bütün `sol_keys` taranır.
- Bugünün UTC ay/günüyle tam eşleşme varsa `On this day in the InSight archive` gösterilir.
- Tam eşleşme yoksa yıl döngüsünü dikkate alan en yakın tarih seçilir ve `Nearest archived observation to July 18` gösterilir.
- AT, PRE ve HWS ayrı ayrı optional’dır; rüzgâr eksikliği sıcaklık/basıncı düşürmez.
- Kabul ortamında canlı InSight endpoint’i timeout oldu; `2020-10-19/20`, sol 675 tarihli doğrulanmış nearest snapshot açıkça historical olarak kullanıldı.

## GIBS

GIBS artık her runtime kabulünde güncel EPSG:4326 capabilities belgesini okuyarak seçili üç layer için default tarih, format, tile matrix ve availability üretir. Doğrulanan sözleşme:

| Layer                    | Default tarih        | Format     | Tile matrix | Preview |
| ------------------------ | -------------------- | ---------- | ----------- | ------- |
| MODIS Terra true color   | 2026-07-18           | image/jpeg | 250m        | 200     |
| GOES-East ABI FireTemp   | 2026-07-18T14:40:00Z | image/png  | 1km         | 200     |
| IMERG Precipitation Rate | 2026-07-17           | image/png  | 2km         | 200     |

Geçersiz `0/0/0` tile varsayımı kaldırıldı. Preview’lar gerçek extent’lerle WVS `GetSnapshot` üzerinden üretilir. Capabilities alınamazsa yalnız doğrulanmış tarihli fallback `reference/historical` olarak gösterilir; “latest provider response” denmez.

## Mission Media

Her gezegenin kendi query’si ve yalnız aynı gezegene ait fallback’i vardır. Search item içindeki kırılgan `links[0]` yerine asset manifest okunur; thumbnail/small/original adayları seçilir.

| Gezegen | NASA ID  | Medya sonucu   |
| ------- | -------- | -------------- |
| Mercury | PIA13823 | 200 image/jpeg |
| Venus   | PIA00207 | 200 image/jpeg |
| Earth   | PIA18033 | 200 image/jpeg |
| Mars    | PIA21496 | 200 image/jpeg |
| Jupiter | PIA22968 | 200 image/jpeg |
| Saturn  | PIA05983 | 200 image/jpeg |
| Uranus  | PIA18182 | 200 image/jpeg |
| Neptune | PIA01492 | 200 image/jpeg |

Başka gezegenin snapshot’ı fallback olarak kullanılamaz.

## Canlı API Kabul Sonuçları

Kabul retrieval zamanı: `2026-07-18T16:19:51Z` çevresi.

| Provider/yüzey                                    | Response                  | Observed/source time                    | Freshness            | Fallback                            |
| ------------------------------------------------- | ------------------------- | --------------------------------------- | -------------------- | ----------------------------------- |
| Local production `/api/ephemeris` min/current/max | 200 × 3                   | 1526 / 2026 / 2626, 6 saatlik TDB epoch | current              | hayır                               |
| JPL CAD                                           | 200, v1.5                 | 2026-Jul-18 10:21 TDB ilk kayıt         | latest-available     | hayır                               |
| JPL Fireball                                      | 200, v1.2                 | 2026-06-11 02:00:58 ilk kayıt           | historical           | hayır                               |
| EONET open                                        | 200                       | 2026-07-17T00:00:00Z ilk kayıt          | near-live            | hayır                               |
| EONET Polygon record                              | 200                       | 2026-07-11T20:00:00Z                    | event record         | hayır                               |
| EPIC API                                          | 200, 22 kayıt             | 2026-07-16 00:03:42 ilk kayıt           | latest-available     | hayır                               |
| EPIC image                                        | 200 image/jpeg            | 2026-07-16                              | latest-available     | hayır                               |
| APOD resmî sayfa + görsel                         | 200 + 200 image/jpeg      | 2026-07-18                              | latest-available     | hayır                               |
| APOD JSON (`api.nasa.gov`)                        | timeout                   | 2026-07-18 doğrulanmış snapshot         | fallback             | evet                                |
| NeoWs (`api.nasa.gov`)                            | timeout                   | doğrulanmış dated snapshot              | fallback             | evet                                |
| DONKI dört endpoint                               | timeout                   | doğrulanmış dated snapshot              | fallback             | evet; partial kod yolu ayrıca geçti |
| InSight (`api.nasa.gov`)                          | timeout                   | 2020-10-19/20 sol 675                   | historical           | evet                                |
| GIBS üç preview                                   | 200 × 3, doğru image MIME | 2026-07-17/18                           | capabilities-checked | hayır                               |
| NASA mission thumbnails                           | 200 × 8 image/jpeg        | gezegen başına tarihli arşiv            | historical           | hayır                               |

Provider timeout’ları current veri gibi gizlenmez. `observedAt`, `retrievedAt`, `freshness`, status ve fallback ayrımı UI metadata’sında korunur.

## Test Sonuçları

- Prettier format check: PASS
- ESLint: PASS, 0 error / 0 warning
- Next/TypeScript typecheck: PASS
- Vitest unit/component: 39 dosya, 158/158 PASS
- Production build: PASS
- Production route kabulü: `/`, `/explore`, `/compare`, `/data`, `/about`, `/case-study`, sekiz gezegen ve health PASS
- Production `/api/ephemeris` minimum/current/maximum: 200/current, fallback yok
- Playwright production Chromium: 85/85 PASS
- Responsive: 390 px mobile, 768 px tablet ve desktop kontrol yüzeylerinde horizontal overflow yok
- Kamera: mouse drag ve touch doğrudan free-camera kontrolünü devralıyor; Escape guided moda dönüyor
- Hydration/console: React hydration warning/error, beklenmeyen `console.error` ve `pageerror` yok
- Zaman: gerçek zaman, Jülyen yıl hızı, Pause, bağımsız Now/Reset, gizlenebilir panel, exact boundaries, no request loop ve rapid scrub testleri geçti

Format, lint, typecheck, Vitest, production build ve Playwright kabulü repository sözleşmesine uygun Node `v22.22.0` ile çalıştırıldı.

## Değiştirilen Dosyalar

Zaman, UI ve E2E:

- `src/features/solar-system/lib/simulation-range.ts` ve testi
- `src/stores/simulation-store.ts` ve testi
- `src/features/solar-system/types/experience-settings.ts`
- `src/features/solar-system/components/ephemeris-controls.tsx` ve testi
- `src/features/solar-system/components/simulation-controls.tsx` ve testi
- `src/features/solar-system/components/planet-system.tsx`
- `src/app/explore/explore.module.css`
- `e2e/smoke.spec.ts`

Horizons ve JPL:

- `src/app/api/ephemeris/route.ts` ve testi
- `src/lib/data/ephemeris/horizons-registry.ts`
- `src/lib/data/ephemeris/horizons.server.ts` ve testi
- `src/lib/data/ephemeris/models.ts`
- `src/lib/data/ephemeris/positions.ts` ve testi
- `src/lib/data/jpl/ssd-request-queue.server.ts`

Dış veri ve gezegen yüzeyleri:

- `src/lib/data/external/models.ts`
- `src/lib/data/external/types.ts`
- `src/lib/data/external/prefer-result.ts`
- `src/lib/data/external/request.server.ts`
- `src/lib/data/external/providers/space-data.server.ts` ve yeni provider testi
- `src/lib/env/server.ts`
- `src/content/snapshots/external-data.ts`
- `src/features/space-data/lib/planet-data.server.ts`
- `src/features/space-data/components/data-state.tsx`
- `src/features/space-data/components/earth-observatory.tsx`
- `src/features/space-data/components/mars-archive.tsx`
- `src/features/space-data/components/planet-mission-media.tsx`
- `src/features/space-data/components/space-data.test.tsx`
- `src/app/data/page.tsx`
- `src/app/planet/[slug]/page.tsx`

Rapor:

- `docs/phase-8-5-report.md`

## Faz 8.5 PASS/FAIL

**PASS.** Dinamik tarih sözleşmesi, boundary güvenliği, altı hız, gerçek-zaman açılışı, deterministik hydration, gizlenebilir paneller, source-labelled hızlı preview, seri JPL window mimarisi, uzun tarih barycenter çözümü, dış veri doğruluk düzeltmeleri, production API ve 85 testlik tarayıcı kabulü geçti.

`api.nasa.gov` kabul ortamında timeout olduğunda doğrulanmış fallback/historical davranışı devreye girdi ve current gibi sunulmadı. Bu provider-availability durumu ürün blocker’ı değil; beklenen hata sınırı olarak kabul edildi.

## Faz 9 Öncesi Blocker’lar

Kod veya C0 kabul blocker’ı kalmadı. Faz 9 aynı çalışma akışında başlayabilir. Onarımın canlı URL'ye taşınması için kullanıcı teslim paketini gözden geçirip test ettikten sonra commit/push yapmalıdır; bu tur repository'ye yazma yetkisi içermez.
