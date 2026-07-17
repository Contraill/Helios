# Blok B Açılış Raporu

## Kapsam

Bu dilim Faz 6–8'i tamamlamaz. Blok B; Explore acceptance polish, ortak içerik/veri altyapısı ve ilk güçlü gezegen detay dikeyiyle açılmıştır.

## Explore acceptance polish

- Simulation controls geniş deck ile compact status dock arasında geçer ve tercih cihazda saklanır.
- 768 px tablet görünümü doğal iki sütunlu akışa alındı; summary tam satır, controls ve navigator ayrı sütunlardır.
- 760 px altında bütün yüzeyler tek sütuna düşer.
- Scientific overview crosshair yerine renkli gezegen diskleri, halo ve lider çizgili isimler kullanır.
- Gerçek mesh ölçeği değişmez. Görünür ölçek notu locator disklerinin fiziksel boyut olmadığını açıklar.

## Ortak Blok B temeli

- İçerik bölümü, metric, fact, freshness, methodology, source attribution ve comparison row primitive'leri
- Merkezi birim/sayı/süre formatter'ları
- Saf oran, yüzde farkı, sıcaklık farkı, yerel gün/yıl ve gün uzunluğu helper'ları
- `server-only` NASA client, request policy, Zod parse/normalize, cache/revalidate, timeout ve fallback sözleşmeleri
- Harici API henüz ürün yüzeyinde çağrılmıyor; yarım client fetch veya sahte dinamik içerik yok

## İlk dikey örnek: Mars

Mars seçildi çünkü kaynaklı katalog; Dünya'ya yakın gün ritmi, düşük yerçekimi, ince atmosfer ve geçmiş su kanıtını tek bir insan ölçeği anlatısında birleştiriyor. Sayfa özgün hero, editoryal bölümler, kaynaklı metrikler, kişisel ağırlık karşılaştırması, bilimsel sınırlar ve kaynak provenansı içerir. “Mars bugün” veya güncel rover hava iddiası kullanılmaz.

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 23 dosyada 75/75 geçti
- production build: geçti; 17 statik sayfa ve sekiz SSG gezegen rotası
- Playwright Chromium: 29/29 senaryo production build üzerinde geçti; ortamın serverless Chromium context sınırı nedeniyle deterministik küçük gruplarda çalıştırıldı
- viewport kontrolü: 1440×900 desktop, 768×1024 tablet, 390×844 mobile
- yatay overflow: bulunmadı

## Açık kabul kapıları

- Faz 6: kalan yedi özgün gezegen sayfası ve faz genel kabulü açık
- Faz 7: APOD/NEO production adapter ve yüzeyleri henüz uygulanmadı
- Faz 8: compare deneyimi henüz uygulanmadı

## Sonraki güvenli dilim

Mars kalite çizgisini koruyarak kalan gezegenleri tek tek tamamlamak ve Faz 6 kabul checklist'ini kapatmak. NASA ve compare yüzeyleri ortak temel üzerinde sonraki ayrı alt dilimlerde ilerlemelidir.
