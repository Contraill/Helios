# Faz 6 Sonu — Sekiz Gezegen Detay Deneyimi

## Kapsam

Bu rapor yalnızca Faz 6 kabul kapısını kapatır. Faz 7 NASA yüzeyleri, Faz 8 karşılaştırma deneyimi ve Faz 8.5 efemeris/özgür kamera uygulaması başlamamıştır.

## Roadmap v1.2

- Blok B ile Blok C arasına bağımsız Blok B.5 / Faz 8.5 eklendi.
- Faz 0–8 kapsamı ve kabul kriterleri değiştirilmedi.
- Faz 9, 10 ve 11 yeniden numaralandırılmadı.
- Faz 6, 7 ve 8 ayrı kapanmadan Blok B.5; Faz 8.5 kapanmadan Blok C başlamaz.
- JPL Horizons için resmî API sözleşmesine dayalı vector-table planlama kararı kaydedildi; entegrasyon kodu yazılmadı.

## Tamamlananlar

- Mercury, Venus, Earth, Jupiter, Saturn, Uranus ve Neptune için Mars kalite çizgisinde tamamlanmış detail dikeyleri
- Sekiz gezegende SSG, metadata, kaynaklı temel değerler ve anlamlı server-rendered içerik
- Kişisel ağırlık karşılaştırması, gün ritmi ve Güneş ışığı gecikmesi
- Atmosfer, yüzey veya gaz/buz devi katman terminolojisi
- Sıcaklık değerinin yüzey, bulut tepesi veya atmosferik referans seviyesini açıkladığı bağlam
- Tarihli uydu sayıları, halka bilgisi ve öne çıkan görevler
- Methodology/scientific limits, source attribution ve freshness gösterimi
- Önceki/sonraki gezegen navigasyonu
- 390 px mobil, 768 px tablet ve 1440 px masaüstü düzenleri

## Sanat ve kompozisyon kararları

- **Mercury:** sert ışık sınırı, minimal ritim, uzun güneş günü ve korumasız yüzey
- **Venus:** yoğun atmosfer katmanları, kapalı kompozisyon, basınç ve sera etkisi
- **Earth:** tanıdık ölçüleri sistem ilişkisi olarak sunan okyanus/yaşam ufku; nötr “varsayılan” sayfa değil
- **Mars:** mevcut özgün kızıl orb ve su geçmişi dikeyi korundu
- **Jupiter:** kadraja taşan bantlı kütle, kısa gün ve katı yüzey yokluğu
- **Saturn:** geniş eğik halka düzlemi, parçacık ölçeği ve Jupiter'den farklı seyrek ritim
- **Uranus:** yana yatmış eksen ve halka düzlemi, sakin fakat yönelim odaklı kompozisyon
- **Neptune:** daha küçük uzak orb, konsantrik mesafe alanı, ışık gecikmesi ve atmosferik hareket

## Ortaklaştırılan yapılar

- `PlanetData` kaynak ve tanım sözleşmesi
- `PlanetDetailContent` editoryal içerik modeli
- Metric, fact, methodology, freshness ve source primitive'leri
- Saf yerçekimi, zaman ve ışık hesapları
- Kişisel ağırlık component'i
- Görev listesi ve kaynak provenansı
- Komşu gezegen navigasyonu

## Gezegene özel bırakılan yapılar

- Hero geometrisi ve görsel ritim
- Bölüm sırası
- Ana editoryal soru ve lede
- Fact/signals içeriği
- Methodology vurgusu
- Mars'ın dedicated composition component'i

## Bilimsel kaynak etkisi

Görev anlatıları için resmî NASA kayıtları eklendi:

- MESSENGER
- Magellan
- DAVINCI
- Terra
- Mars 2020 / Perseverance
- Juno
- Cassini-Huygens
- Voyager 2

Gezegen fiziksel değerleri mevcut NASA/JPL alan düzeyi kaynak provenansını kullanır. Uydu sayıları 17 Temmuz 2026 tarihli JPL snapshot'ıdır. Faz 7 başlamadığı için APOD, NEO, rover veya “today/live weather” yüzeyi eklenmedi.

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 25 dosyada 85/85 geçti
- production build: geçti
- static generation: sekiz gezegen rotası SSG olarak üretildi
- Playwright Chromium: 47/47 geçti; aynı production build ve aynı izole Chromium üzerinde ortamın uzun context sınırı nedeniyle iki deterministik grupta tamamlandı
- screenshot acceptance: sekiz gezegen × desktop/tablet/mobile = 24 gerçek browser görüntüsü
- yatay overflow: 1440×900, 768×1024 ve 390×844 görünümlerinde bulunmadı

## Faz 6 kabul checklist'i

- [x] Sekiz gezegen detay rotası çalışıyor
- [x] Sekiz sayfa anlamlı ve tamamlanmış içerik taşıyor
- [x] Sayfalar yalnızca renk değişimi değil
- [x] Kişisel hesaplamalar sonlu ve doğrulanmış
- [x] Kaynaklar görünür
- [x] Bilimsel limitler görünür
- [x] Gaz ve buz devi terminolojisi katı yüzey iddiası üretmiyor
- [x] Önceki/sonraki navigasyon çalışıyor
- [x] Metadata doğru
- [x] Canvas/WebGL olmadan sayfalar anlamlı
- [x] 390×844 mobil tamamlandı
- [x] Tablet ve masaüstü görsel kontrol yapıldı
- [x] Klavye/focus navigasyonu çalışıyor
- [x] Reduced-motion değerlendirildi; detail içerikleri hareket zorunluluğu taşımıyor
- [x] Yatay overflow yok
- [x] Eksik opsiyonel veri layout'u bozmuyor
- [x] Sekiz sayfa build sırasında SSG üretildi

## Bilinen eksikler

- Faz 7 APOD ve NEO adapter/yüzeyleri uygulanmadı.
- Faz 8 compare deneyimi uygulanmadı.
- Faz 8.5 yalnızca roadmap ve teknik planlama düzeyindedir.
- Texture, atmosfer shader'ı, halka asset'leri ve post-processing Faz 9 kapsamındadır.

## Faz 7'ye geçiş blocker'ları

Faz 6 kaynaklı bir blocker yoktur. Faz 7 başlamadan önce APOD ve NEO endpoint'lerinin resmî katalog durumu, authentication, response schema, cache süresi, attribution ve fallback snapshot yaklaşımı yeniden doğrulanmalıdır.
