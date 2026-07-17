# Helios — Karar Kaydı

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
