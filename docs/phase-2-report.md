# Faz 2 Sonu — Domain ve Gezegen Verisi

## Tamamlananlar

- `PlanetData`, `SourcedNumber`, `DataSourceReference` ve güncellik sözleşmeleri
- NASA ve JPL kaynak registry’si
- Sekiz gezegen için aynı Zod şemasından geçen İngilizce ve Türkçe referans içerik
- Sayısal gezegen alanlarında kaynak, türetim biçimi ve gerektiğinde tarih bilgisi
- Kilo, gezegen yaşı, ışık süresi, birim dönüşümü ve ölçek hesapları
- Keşif ve bilimsel ölçek stratejileri
- Katalog, kaynak bütünlüğü, hesaplama ve ölçek testleri
- `/planet/[slug]` rotasının domain kataloğundan statik yollar ve metadata üretmesi
- JPL’nin 17 Temmuz 2026 tarihli tanınmış uydu listesine göre uydu sayısı snapshot’ı

## Değiştirilen Ana Alanlar

- `src/content/planets/`
- `src/content/sources/`
- `src/lib/calculations/`
- `src/lib/data/schemas/`
- `src/app/planet/[slug]/page.tsx`
- `docs/`

## Teknik Kararlar

- Alan düzeyinde provenans, gezegen düzeyindeki tek bir kaynak listesinden daha güvenli kabul edildi.
- Keşif ölçeği ve bilimsel ölçek farklı dönüşüm stratejileri olarak tutuldu.
- Yaklaşık yörünge elemanları kesin efemeris gibi sunulmuyor.
- Dev gezegenlerde sıcaklık ve yerçekimi değerleri katı yüzey değeri olarak etiketlenmiyor.
- Tam editoryal gezegen deneyimi Faz 6’ya ait; Faz 2 sayfaları geçici bir veri panosuna dönüştürülmedi.

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 8 dosyada 30 test geçti
- build: geçti; sekiz gezegen rotası SSG olarak üretildi
- production HTTP smoke: ana rotalar ve sekiz gezegen rotası `200`, bilinmeyen gezegen rotası `404`, health endpoint `ok`
- Playwright: test paketi CI’da çalıştırılıyor; yerel yönetilen Chromium politikası localhost sayfalarını engellediği için bu ortamda tarayıcı adımları tamamlanamadı

## Performans ve Erişilebilirlik Etkisi

- Yeni client-side kütüphane veya 3B bundle eklenmedi.
- Gezegen sayfalarının temel içeriği server tarafında üretildi.
- Canvas, klavye akışı ve hareket tercihleri bu fazda değiştirilmedi.

## Veri ve Kaynak Etkisi

- Referanslar NASA Science, NASA Fact Sheet ve JPL kaynaklarıyla sınırlandı.
- Değişebilen uydu sayıları tek bir tarihli JPL snapshot’ına bağlandı.
- Kaynağı doğrulanmayan basınç, atmosfer yüzdesi veya duyusal iddia eklenmedi.

## Bilinen Eksikler

- Tam gezegen anlatıları, atmosfer bölümleri, görevler ve özgün sayfa kompozisyonları Faz 6 kapsamındadır.
- Kaynak registry’sinin kullanıcıya açık veri sayfası sonraki içerik fazında hazırlanacaktır.
- 3B sahne ve onun fallback’i Faz 3 kapsamındadır.

## Sonraki Fazdan Önce Blocker

Faz 2 kabulü, aynı commit için GitHub Actions kontrolü ve canlı dağıtım smoke testi geçtikten sonra kesinleşir.
