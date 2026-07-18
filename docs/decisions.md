# Helios — Karar Kaydı

## Blok C görsel asset ve kalite sözleşmesi

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Güneş ve sekiz gezegenin yüzeyleri makine-okunabilir kaynak/temsil manifestiyle düşük, orta ve yüksek WebP katmanlarına ayrılır. High overview orta yüzeyleri korur, yalnız seçili gövdeyi high'a yükseltir. Texture hatası gövdeye özgü renk material'ına düşer. Atmosfer ayrı shell, Satürn halkası ayrı double-sided alpha geometri olarak kalır; bloom yalnız high ve standart harekette çalışır.
- **Gerekçe:** Görsel derinliği provenance, bellek, fallback ve reduced-motion sınırlarıyla birlikte yönetmek; bütün sahneyi quality/focus değişiminde yeniden yüklememek.
- **Etkilenen dosyalar:** `src/content/sources/planet-textures.ts`, `src/features/solar-system/lib/planet-visual-profiles.ts`, `src/features/solar-system/lib/quality.ts`, `src/features/solar-system/lib/texture-cache.ts`

## Faz 10 ölçüm ve render bütçesi

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Bütçeler Faz 9 production baseline'ı ölçüldükten sonra sabitlenir. Root shared ve Explore 3B gzip sınırları 180/260 KiB; cold Explore script transferi 525 KiB; texture transferi low/medium/focused-high için 50/200/310 KiB; DPR 1/1.25/1.5; SwiftShader regression tabanı 25/18/10 FPS'tir. Tam tablo `docs/phase-10-performance-accessibility-plan.md` içindedir.
- **Gerekçe:** Kalite kararlarını uydurma hedeflerden değil aynı production harness ile tekrarlanabilir gerçek sonuçlardan türetmek.

## Kare döngüsünde efemeris hesaplama sınırı

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Horizons vector/window veya scale değiştiğinde oskülatör sabitleri ve örnek zamanları bir kez derlenir. Her gezegen kare sırasında kendi mutable üçlü tamponunu yeniden kullanır; bundle araması, orbital element yeniden kurulumu ve geçici Cartesian/scene tuple üretimi yapmaz. React/Zustand state kare içinde yazılmaz.
- **Gerekçe:** Efemeris matematiğini değiştirmeden allocation ve CPU maliyetini azaltmak.
- **Etkilenen dosyalar:** `src/lib/data/ephemeris/positions.ts`, `src/features/solar-system/components/planet-system.tsx`

## Post-processing ve route yaşam döngüsü

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Çok geçişli bloom yerine high tier'a özel sınırlı tek shader pass kullanılır; medium bloom kapalıdır. Texture lease'leri son referanstan beş saniye sonra dispose edilir. Hidden/reduced-motion sahne demand render'a geçer. Next App Router history cache'i route ağacını tutabilir; kabul ölçütü route çıkışında live canvas/texture cleanup ve back/forward sırasında tek canvas reuse'dur.
- **Gerekçe:** Varsayılan medium kaliteyi pahalı post-processing'den korumak ve router geçmiş belleğini gerçek WebGL resource leak'iyle karıştırmamak.

## Sayısal veride alan düzeyinde kaynak provenansı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Problem:** Gezegen düzeyinde tek bir `sourceIds` listesi, belirli bir sayının kaynağını veya dönüşüm biçimini yeterince açıklamıyor.
- **Karar:** Her sayısal değer `{ value, sourceId, derivation, asOf?, note? }` sözleşmesini kullanır. Gezegen düzeyindeki `sourceIds` yalnızca toplu erişim için korunur.
- **Gerekçe:** Kaynak değişiklikleri alan bazında izlenebilir ve değişebilen değerler açıkça tarihlenebilir.
- **Etkilenen dosyalar:** `src/lib/data/schemas/planet.ts`, `src/content/planets/*`, `src/content/sources/planetary-reference.ts`

## Faz 2 sınırı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Problem:** Domain modeli tamamlanmadan sahneye başlamak verinin 3B component’lere kopyalanmasına ve erken state sözleşmelerine yol açabilir.
- **Karar:** Faz 2 doğrulanmış domain modeli, referans veri ve saf hesaplama katmanıyla sınırlıdır. Three.js ve React Three Fiber Faz 3’te; Zustand ise gerçek bir global istemci ihtiyacı oluştuğunda eklenir.
- **Gerekçe:** Faz bağımlılık sırasını ve düşük başlangıç maliyetini korur.

## Değişebilen uydu sayıları

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Problem:** NASA Science gezegen sayfaları yeni keşiflerden sonra farklı tarihlerde güncellendiği için uydu sayıları sayfalar arasında geçici olarak ayrışabiliyor.
- **Karar:** Dev gezegenlerin uydu sayısı için JPL Solar System Dynamics’in IAU tarafından tanınan uyduları listeleyen güncel tablosu kullanılır. Değerler erişim tarihiyle snapshot olarak saklanır.
- **Snapshot:** Jüpiter 115, Satürn 293, Uranüs 29, Neptün 16 — 17 Temmuz 2026.
- **Gerekçe:** Tek, resmî ve güncellenen bir kaynak kullanmak tutarsızlığı azaltır. Tarih alanı bu sayıların kalıcı sabitler olmadığını gösterir.

## Faz geçişleri

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Bir faz gerçek repository üzerinde format, lint, typecheck, ilgili testler ve build kontrollerini geçmeden tamamlanmış sayılmaz. Kabul kriterleri sağlanıp açık blocker kalmadığında yol haritasındaki bir sonraki güvenli işe geçilebilir.
- **Gerekçe:** Gereksiz onay döngüsü oluşturmadan faz disiplinini korur.

## Çalışma alanlarının ayrılması

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Ürün planlama, ana geliştirme, repository yapısı, güvenlik ve yayın incelemesi ayrı çalışma alanları olarak ele alınır. Alanlar arası kararlar bu dosyada kaydedilir.
- **Gerekçe:** Kapsam, kod ve güvenlik kararlarının birbirinin üzerine sessizce yazılmasını önler.
- **Etkilenen belge:** `docs/development-workflow.md`

## Repository dili ve katkı izleri

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Repository’de araç adı, otomatik üretim dipnotu, otomatik ortak-yazar etiketi veya tutorial tarzı gereksiz yorum bulunmaz. Kod yorumları yalnızca kararın nedenini açıklar. Ürün metinleri kısa, doğal ve ürün bağlamına özgü tutulur.
- **Gerekçe:** Repository’nin sahibinin kararlarını ve teknik yaklaşımını doğrudan yansıtması gerekir.

## Uzak ölçekte Samanyolu görünümü

- **Durum:** MVP sonrası
- **Tarih:** 17 Temmuz 2026
- **Fikir:** Kullanıcı Güneş Sistemi’nden çok uzaklaştığında stilize bir Samanyolu haritası ve Güneş’in yaklaşık konumunu gösteren “You are here” işareti.
- **Karar:** Mevcut fazlara eklenmeyecek. Ana keşif, gezegen detayları, karşılaştırma, veri entegrasyonları, mobil kalite ve case study stabil olduktan sonra yeniden değerlendirilecek.
- **Gerekçe:** Faz 3 kapsamını büyütmeden ana Güneş Sistemi deneyimini tamamlamak önceliklidir.

## Faz 3 sahne sınırı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Temel sahne; Güneş, sekiz gezegen, yörünge çizgileri, deterministik hareket, yıldız alanı, ışık, responsive overview kamera ve fallback durumlarıyla sınırlıdır. Seçim, kamera focus, zaman kontrolleri, texture, shader, halka geometrisi ve post-processing sonraki fazlara bırakılır.
- **Gerekçe:** Etkileşim ve görsel efekt katmanlarından önce ölçülebilir, veriyle beslenen ve düşük maliyetli bir render tabanı kurmak gerekir.

## 3B veri akışı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Sahne parametreleri `PlanetData` kataloğundan `ScenePlanet` görünüm modeline dönüştürülür. Gezegen component'lerinde yarıçap, yörünge, eğim veya dönüş değerleri tekrar tanımlanmaz.
- **Gerekçe:** Bilimsel veri ile render davranışının sessizce ayrışmasını önler.
- **Etkilenen dosyalar:** `src/features/solar-system/lib/scene-planets.ts`, `src/features/solar-system/components/planet-system.tsx`

## Faz 3 hareket modeli

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Hareket `delta` tabanlı saf fonksiyonlarla hesaplanır; frame döngüsünde React state güncellenmez. Görsel simülasyon hızları gerçek zamanlı efemeris olarak sunulmaz. `prefers-reduced-motion` etkin olduğunda sürekli frame döngüsü durdurulur.
- **Gerekçe:** Farklı yenileme hızlarında tutarlı hareket, düşük render maliyeti ve anlamlı erişilebilirlik davranışı sağlar.

## Faz 3 bağımlılık sınırı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Bu fazda yalnızca `three`, `@react-three/fiber` ve gerekli TypeScript tipleri eklenir. Drei, Zustand, Motion ve post-processing somut ihtiyaç oluşmadan kurulmaz.
- **Gerekçe:** Başlangıç bundle'ını ve soyutlama maliyetini düşük tutar.

## Faz 4 etkileşim durumu

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** `selectedPlanetId`, `hoveredPlanetId` ve sınırlı kamera modu Zustand store içinde tutulur. Yörünge açısı, gezegen dönüşü, kamera pozisyonu ve look-at hedefi frame düzeyinde store'a yazılmaz.
- **Gerekçe:** Canvas, semantik gezegen navigator'ı ve DOM özet panelinin aynı düşük frekanslı etkileşim durumunu paylaşması gerekir; hızlı render değerleri React reaktivitesinin dışında kalmalıdır.
- **Etkilenen dosyalar:** `src/stores/exploration-store.ts`, `src/features/solar-system/components/explore-experience.tsx`, `src/features/solar-system/components/camera-rig.tsx`

## Merkezi CameraRig ve geçiş iptali

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Kamera yalnızca `CameraRig` tarafından yönetilir. Gezegenler mesh referanslarını sahne içi registry'ye kaydeder ve seçim event'i üretir. Kamera her frame güncel seçimi okuduğu için yeni seçim önceki geçişi promise, timeout veya iptal token zinciri olmadan değiştirir.
- **Gerekçe:** Hızlı art arda seçimlerde stale completion riskini azaltır, hareketli gezegeni takip eder ve kamera sorumluluğunu gezegen component'lerinden ayırır.

## Klavye ve Canvas eşdeğerliği

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Canvas seçimi tek erişim yolu değildir. Sekiz gezegen gerçek `button` öğeleriyle aynı store'u kullanır; Tab ve Enter ile seçim, Escape ile overview'e dönüş ve seçilen düğmeye focus restorasyonu sağlanır. WebGL çalışmasa da seçim ve referans sayfasına geçiş korunur.
- **Gerekçe:** 3B sahne ekran okuyucu ve klavye kullanıcıları için kara kutu olmamalıdır.

## Faz 4 görsel sınırı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Hover ve selection vurgusu emissive değişimi, hafif wireframe küre, yörünge vurgusu ve geçici sprite etiketiyle sınırlıdır. Texture, atmosfer shader'ı, halka geometrisi, bloom ve yoğun post-processing eklenmez.
- **Gerekçe:** Etkileşimin okunabilirliğini Faz 9 görsel derinlik işlerinden ayırır.

## Explore client veri sınırı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Tam `PlanetData` kataloğu, Zod schema ve kaynak registry'si Explore client graph'ına girmez. Server yalnızca `ScenePlanet` ve `ExplorePlanetSummary` görünüm modellerini üretip serileştirir.
- **Gerekçe:** Bilimsel doğrulama katmanını server tarafında tutar, client'ın gereksiz veri ve validation kodu yüklemesini engeller.
- **Etkilenen dosyalar:** `src/app/explore/page.tsx`, `src/features/solar-system/lib/scene-planets.ts`, `src/features/solar-system/lib/explore-planets.ts`

## Faz 4 sonrası yürütme modeli

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Faz 5 bağımsız Blok A olarak tamamlanır. Faz 6–8 ortak Blok B, Faz 9–10 ortak Blok C ve Faz 11 ayrı Blok D içinde yürütülür. Faz kabul kriterleri birleşmez; yalnızca ortak altyapıyı tekrar kurmamak için uygulama akışı birleştirilir.
- **Gerekçe:** Bağlam geçişlerini azaltırken her fazın test ve kalite kapısını korur.
- **Etkilenen belge:** `docs/project/05_DEVELOPMENT_ROADMAP.md`

## Simülasyon ve tercih state sınırları

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Seçim, kamera modu ve sahne görünürlüğü exploration store'da; pause, zaman hızı ve reset sürümü simulation store'da; kalite ve hareket tercihi preferences store'da tutulur. Frame içi açı, dönüş ve kamera koordinatları store'a yazılmaz.
- **Gerekçe:** Kalıcı ve düşük frekanslı seçimleri paylaşırken frame döngüsünü React reaktivitesinden ayırır.
- **Etkilenen dosyalar:** `src/stores/exploration-store.ts`, `src/stores/simulation-store.ts`, `src/stores/preferences-store.ts`

## Bilimsel ölçek görünürlüğü

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Bilimsel modda Güneş, gezegen yarıçapları ve yörünge mesafeleri aynı doğrusal oranı kullanır. Görünemeyecek kadar küçük gezegenler, kamera uzaklığından etkilenmeyen ekran-uzayı crosshair ve isim etiketleriyle bulunur. İşaretçiler gerçek mesh'i büyütmez ve boyut temsili olarak sunulmaz.
- **Gerekçe:** Gerçek oranları bozarken bilimsel mod iddiasında bulunmak yerine, görünürlük yardımını açık ve erişilebilir bir sunum katmanı olarak ayırır.

## Kalite seviyelerinin ölçülebilir farkı

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Low, medium ve high seviyeleri aynı sanat yönünü korur; DPR üst sınırı, yıldız sayısı, küre segmentleri ve yörünge örnekleme sayısı üzerinden render maliyetini değiştirir.
- **Gerekçe:** Kalite seçimini yalnızca isim değiştiren bir kontrol olmaktan çıkarır ve zayıf cihazlar için gerçek maliyet farkı oluşturur.

## Kalıcı deneyim tercihleri

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Karar:** Ölçek modu, yörünge ve etiket görünürlüğü, kalite, hareket tercihi ve zaman hızı cihazda saklanır. Seçili gezegen, hover durumu, kamera geçişi ve pause durumu reload sonrasında geri yüklenmez.
- **Gerekçe:** Kullanıcının görünüm tercihlerini korurken geçici etkileşim ve yarım kalmış simülasyon durumunu yeni oturuma taşımamayı sağlar.

## Node sürümü sözleşmesinin Node 22'ye sabitlenmesi

- **Durum:** Kabul edildi
- **Tarih:** 17 Temmuz 2026
- **Problem:** Faz 1 temel commit'inde `package.json` içine `node >=20.9.0` yazılırken `.nvmrc` değeri `22` olarak bırakılmıştı. README de aynı anda Node 22 çalışma ortamını işaret ediyordu. Git geçmişinde bu geniş aralığı gerektiren bir lockfile, Vercel hatası veya karar kaydı bulunmuyor; değer Next.js'in minimum uyumluluk eşiğinin genel bir aralık olarak kopyalanmasından kaynaklanmış görünüyor.
- **Karar:** `engines.node` yeniden `22.x` olarak sabitlenir. `.nvmrc`, README ve GitHub Actions Node 22 sözleşmesini korur. `pnpm@10.34.4` somut bir lockfile veya deployment hatası olmadığı için değiştirilmez.
- **Gerekçe:** Vercel yalnızca major Node sürümlerini destekler ve geniş `>=20.9.0` aralığı güncel platformda en yeni LTS major sürümüne çözümlenebilir. `22.x`, yerel geliştirme, CI ve deployment arasında deterministik major sürüm uyumu sağlar.
- **Etkilenen dosyalar:** `package.json`, `.nvmrc`, `README.md`, `.github/workflows/ci.yml`

## Blok B açılışında kontrol yüzeyi

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Simulation controls, genişletilmiş control deck ile sahneyi minimum örten kalıcı compact dock arasında geçer. Açık/kapalı tercih cihazda saklanır. Tablet ve mobilde summary, controls ve navigator absolute overlay yerine doğal grid akışında yer alır.
- **Gerekçe:** Kontrolleri kaybetmeden sahne alanını geri verir; geçici gizleme butonu veya z-index telafisi üretmez.
- **Etkilenen dosyalar:** `src/features/solar-system/components/simulation-controls.tsx`, `src/app/explore/explore.module.css`, `src/stores/preferences-store.ts`

## Bilimsel ölçekte gezegen kimliği

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Bilimsel ölçekte gerçek mesh ve doğrusal ölçek korunur. Crosshair ana temsil olmaktan çıkar; ekran-uzayı renkli disk, ince halo ve lider çizgili isim etiketi yalnızca konum/kimlik yardımcısı olarak kullanılır. Genel ölçek notu locator disklerinin fiziksel boyut olmadığını görünür biçimde açıklar.
- **Gerekçe:** Bilimsel dürüstlük korunurken sahne radar hedefleri dizisi yerine aynı gezegen ailesi olarak okunur.
- **Etkilenen dosyalar:** `scientific-planet-marker.tsx`, `planet-label.tsx`, `planet-system.tsx`, `explore-experience.tsx`

## Blok B ortak sunum ve veri sınırı

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Kaynak, freshness, methodology, metric, fact ve comparison primitive'leri ortak veri sözleşmesi paylaşır; sayfa kompozisyonunu dayatmaz. NASA erişimi `server-only` adapter sözleşmesi, Zod doğrulama, açık cache/revalidate politikası ve normalize edilmiş hata/fallback modeli üzerinden ilerler.
- **Gerekçe:** Faz 6, 7 ve 8'in tekrar eden altyapısını birleştirirken gezegen sayfalarını tek şablon kopyasına dönüştürmez ve client-side ham API response kullanımını engeller.

## İlk Blok B dikey örneği olarak Mars

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** İlk tam detay dikeyi Mars'tır. Sayfa; editoryal hero, kaynaklı referans değerler, kişisel ağırlık karşılaştırması, metodoloji ve kaynak provenansını birlikte doğrular. Güncel hava veya rover gözlemi bu dilimde gösterilmez.
- **Gerekçe:** Dünya'ya yakın gün uzunluğu, düşük yerçekimi, ince atmosfer ve su geçmişi güçlü bir insan ölçeği anlatısı kurarken kararsız dinamik veri iddialarından kaçınmaya izin verir.
- **Not:** Bu karar Faz 6'yı tamamlamaz; kalan yedi gezegen ve ayrı Faz 6 kabul kapısı açıktır.

## Roadmap v1.2 ve Blok B.5 kapısı

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Blok B ile Blok C arasına bağımsız `Blok B.5 — Faz 8.5: Efemeris, Zaman Navigasyonu ve Özgür Kamera` kapısı eklenir. Faz 0–8 kapsamı ve kabul kriterleri ile Faz 9–11 numaraları değişmez. Faz 6, 7 ve 8 ayrı ayrı kapanmadan Blok B.5; Faz 8.5 kapanmadan Blok C başlamaz.
- **Gerekçe:** Kaynaklı konum, zaman modeli ve kullanıcı kontrollü kamera; içerik/compare/NASA yüzeylerinden ayrı bir veri, etkileşim ve performans riski taşır. Bu çalışma Faz 9 görsel derinliğine sızdırılmadan kendi doğrulama kapısında tamamlanmalıdır.
- **Etkilenen belge:** `docs/project/05_DEVELOPMENT_ROADMAP.md`

## Faz 8.5 Horizons planlama sözleşmesi

- **Durum:** Planlama kararı; Faz 8.5 başlangıcında yeniden doğrulanacak
- **Tarih:** 18 Temmuz 2026
- **Karar:** 3B konum verisi için observer table yerine JPL Horizons Cartesian vector table kullanımı temel alınır. Başlangıç sözleşmesi `EPHEM_TYPE=VECTORS`, `VEC_TABLE=2`, `CENTER=500@10`, `REF_PLANE=ECLIPTIC`, `REF_SYSTEM=ICRF`, `OUT_UNITS=AU-D` ve TDB zaman ölçeğidir. Horizons, APOD/NEO için kurulacak NASA-key client'ına bağlanmaz; ayrı server-only adapter olur.
- **Gerekçe:** Vector table doğrudan üç boyutlu konum ve hız bileşenleri sağlar. Güneş merkezli, sabit J2000 ekliptik düzlemi sahne koordinatlarını ve kontrollü interpolation testlerini observer-table açılarından daha açık hale getirir. Resmî API'nin hedef, center ve tarih yetenekleri uygulama sırasında yeniden doğrulanmalıdır.
- **Kapsam sınırı:** Bu kararla Faz 8.5 kodu, target registry veya API çağrısı eklenmemiştir.

## Faz 6 içerik ve kompozisyon sınırı

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Gezegen detayları dört katmana ayrılır: kaynaklı `PlanetData`, gezegene özgü editoryal içerik, ortak veri-sunum primitive'leri ve gezegene özgü sayfa kompozisyonu. Yedi gezegen ortak bir render sözleşmesi kullanabilir; Mars kendi dikey kompozisyonunu korur. Bölüm sırası içerik kaydından gelir ve bütün gezegenlerde aynı olmak zorunda değildir.
- **Gerekçe:** Kaynak, hesaplama, erişilebilirlik ve navigasyon tekrarını azaltırken tek bir koşullu `PlanetDetailTemplate` veya renk değiştiren sekiz kopya üretmez.
- **Etkilenen dosyalar:** `src/content/planet-details/*`, `src/features/planet-details/components/*`, `src/features/planet-details/lib/planet-detail-model.ts`

## Faz 6 görev provenansı

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Gezegen sayfalarındaki görev özetleri, görev başına resmî NASA kaynağına bağlanır. Mission freshness değeri görev durumuna göre `historical` veya `latest-available` olarak tutulur; görev özeti canlı telemetri sayılmaz.
- **Gerekçe:** Editoryal keşif anlatısını güncel görev statüsü ve referans gezegen değerlerinden ayırır.
- **Etkilenen dosyalar:** `src/content/sources/planetary-reference.ts`, `src/content/planet-details/*`

## Faz 8.5 Horizons uygulama sözleşmesi

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Sekiz gezegen `199`–`899` body ID'lerini taşıyan tek target registry üzerinden, ayrı `server-only` Horizons adapter'ıyla sorgulanır. Normalize model Güneş gövde merkezi `500@10`, Ecliptic J2000, ICRF, AU/AU-day ve TDB metadata'sını zorunlu tutar. Kullanıcı zamanı UTC olarak girilir; `requestedAt`, TDB vector epoch'u olan `observedAt` ve `retrievedAt` ayrı alanlardır. Horizons için `NASA_API_KEY` kullanılmaz.
- **Gerekçe:** Ham text/CSV'yi ve koordinat sabitlerini component'lerden çıkarır; observer açılarından 3B konum türetmek yerine doğrudan kaynaklı Cartesian state vector kullanır.
- **Doğrulama:** Güncel API response signature `1.2` olarak gözlendi. Mevcut, 15 Ocak 2024 geçmiş ve 15 Ocak 2030 gelecek Dünya örnekleri aynı sözleşmeyle doğrudan alındı.

## Efemeris örnekleri arası hareket

- **Durum:** Superseded — aşağıdaki Horizons window ve interpolation kararıyla değiştirildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Server istek zamanı altı saatlik kararlı sample epoch'una yuvarlanır. Client, source position+velocity state'inden iki-cisim oskülatör yörünge elemanlarını türetir ve hareketi en fazla ±370 gün yayar; sınır yaklaşınca yeni Horizons örneği ister. Exploration ölçeği yalnız mesafe sunumunu non-lineer dönüştürür; scientific ölçek tek doğrusal AU oranını kullanır.
- **Gerekçe:** Frame loop içinde API çağrısı veya frame-rate'e bağlı sahte başlangıç açısı üretmeden akıcı hareket sağlar. Sınırlı yayılım, JPL çözümü ile görsel interpolation arasındaki ayrımı görünür tutar.
- **Doğrulama:** 18 Temmuz 2026 state'inden 30 gün yayılan Dünya ve Merkür konumları, doğrudan 17 Ağustos 2026 Horizons referanslarıyla karşılaştırıldı; hata her iki hedefte de `0.005 AU` eşiğinin altında kaldı.

Bu karar ilk Faz 8.5 diliminin geçmiş kaydı olarak korunur. ±370 günlük tek-epoch propagation artık etkin veri sözleşmesi değildir.

## Merkezi zaman ve serbest kamera otoritesi

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Simulation store tek tarih-saat anchor'ını, pause ve hız sözleşmesini taşır; frame döngüsü bu saatten okur fakat her frame store'a yazmaz. URL `at` parametresi, UTC date/time, Now, ±1/±30 gün ve timeline aynı modele bağlanır. `overview`, `focus`, `transition` ve `free` tek `CameraRig` içindeki tek OrbitControls örneğiyle yönetilir. Free mod mouse/touch orbit-pan-zoom ve form alanlarını yakalamayan ok-tuşu pan desteği verir.
- **Gerekçe:** React render döngüsünü zaman akışından ayırır; iki rakip kamera controller'ı, stale focus hedefi ve reload sonrası boş uzay konumu üretmez.
- **Kamera güvenliği:** Exploration için `6`, scientific için `2` minimum camera distance; ölçeğe göre `360/2400` maksimum distance uygulanır. Escape guided moda döner; scale değişimi free otoritesini güvenli geçişe bırakır.

## Faz 8.5 dinamik zaman aralığı ve Jülyen hız sözleşmesi

- **Durum:** Kabul edildi; önceki sabit tarih aralıklarının yerine geçer
- **Tarih:** 18 Temmuz 2026
- **Karar:** Desteklenen tarih aralığı Explore hydrate olurken alınan gerçek UTC oturum anchor'ından −500/+600 takvim yılı olarak hesaplanır. Store, UI, URL ve API aynı sınır otoritesini kullanır. Açılış duraklatılmamış `Real time`dır; diğer hızlar `6 hours / sec`, `1 day / sec`, `1 week / sec`, `1 month / sec` ve saniye başına `31,557,600` simülasyon saniyesi kullanan Jülyen `1 year / sec`tir.
- **Gerekçe:** Dinamik aralık eski 1900–2100 sınırını kaldırırken bütün katmanlarda tek clamp sözleşmesini korur. Jülyen yıl katsayısı takvim ayı/yılı belirsizliğini hız hesabına taşımaz.

## Faz 8.5 Horizons window, cache ve barycenter çözümü

- **Durum:** Kabul edildi; ±370 günlük tek-epoch propagation kararını supersede eder
- **Tarih:** 18 Temmuz 2026
- **Karar:** Her gezegen için merkez tarihin iki yanında 1800 gün bulunan, 30 günlük position/velocity örnekli yaklaşık 3600 günlük Horizons window'u alınır. Window içi konum cubic Hermite interpolation ile çözülür; kenara 90 gün kala kontrollü yenileme değerlendirilir. Aynı target/window isteği birleştirilir ve server cache'i 24 saat revalidate edilir. Uzun tarihte body-center desteklenmiyorsa registry'deki ilgili barycenter target'ı kullanılır ve `mixed-barycenters` metadata'sı istemciye taşınır.
- **Gerekçe:** Bir window kesintisiz oynatmayı tek örnek propagation'ından daha güvenilir kılar, bütün 1100 yıllık aralığı istemciye yüklemez ve fallback koordinat merkezini gizlemez.

## JPL SSD fair-use kuyruğu

- **Durum:** Kabul edildi
- **Tarih:** 18 Temmuz 2026
- **Karar:** Horizons, CAD ve Fireball aynı process-içi seri JPL SSD kuyruğunu kullanır; aynı anda en fazla bir JPL SSD isteği aktiftir. Duplicate Horizons bundle/window çağrıları aynı in-flight Promise'ı paylaşır.
- **Gerekçe:** Provider fair-use sınırlarını gözetir, sekiz hedefli bundle sırasında burst üretmez ve eşzamanlı consumer'ların gereksiz tekrarını engeller.
