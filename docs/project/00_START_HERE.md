# HELIOS — PROJE BAŞLANGIÇ VE ÇALIŞMA PROTOKOLÜ

**Proje çalışma adı:** Helios  
**Ürün tanımı:** Bilimsel veriyi sinematik ve kişisel bir Güneş Sistemi keşif deneyimine dönüştüren interaktif web uygulaması  
**Proje sahibi:** İzzet  
**Belge sürümü:** 1.1  
**Son güncelleme:** 17 Temmuz 2026

## 1. Belge önceliği

Bu klasördeki belgeler birbirini tamamlar. Aynı konuda çelişki oluşursa aşağıdaki sıra uygulanır:

1. `00_START_HERE.md` — çalışma yöntemi, kapsam disiplini ve karar protokolü
2. `01_PRODUCT_REQUIREMENTS.md` — ürün gereksinimleri
3. `02_DESIGN_AND_EXPERIENCE.md` — tasarım ve etkileşim ilkeleri
4. `03_TECHNICAL_ARCHITECTURE.md` — teknik mimari
5. `04_DATA_AND_SCIENCE_POLICY.md` — veri doğruluğu ve kaynak politikası
6. `05_DEVELOPMENT_ROADMAP.md` — faz sırası ve kabul kriterleri
7. `06_TESTING_QUALITY_RELEASE.md` — kalite ve yayın standardı
8. `07_DEVELOPMENT_RUNBOOK.md` — uygulama ve inceleme kontrol listeleri

Kolay uygulanan seçenek ürün gereksinimiyle çelişiyorsa ürün gereksinimi tercih edilir. Gerçek boyut veya mesafe kullanılmıyorsa arayüz bunun temsili bir keşif ölçeği olduğunu açıkça belirtir.

## 2. Çalışma alanları

Proje kararları beş çalışma alanında tutulur:

- **Ürün ve kapsam:** hedefler, faz sınırları, yeni fikirlerin sınıflandırılması
- **Ana geliştirme:** kodlama, test, build ve faz teslimi
- **Repository yapısı:** dosya organizasyonu, modül sınırları ve refactor kararları
- **Güvenlik:** secret yönetimi, bağımlılıklar, girdi doğrulama ve yayın riskleri
- **Kalite incelemesi:** tamamlanan işin kabul kriterleri ve sonraki uygulanabilir adım

Bir alanda alınan karar diğer alanları etkiliyorsa `docs/decisions.md` güncellenir. Kod ile karar kayıtlarının sessizce ayrışmasına izin verilmez.

## 3. Temel ürün cümlesi

> Helios, kullanıcının Güneş Sistemi’ni yalnızca izlemesini değil; gezegenler arasındaki fiziksel farkları, zaman ölçeklerini, görev verilerini ve orada olmanın nasıl hissedilebileceğini kişisel ve etkileşimli biçimde keşfetmesini sağlar.

## 4. Ürünün dönüşmemesi gereken şeyler

Helios:

- kısa bir Three.js demosu,
- NASA Eyes kopyası,
- kurumsal dashboard,
- kaynağı belirsiz “canlı gezegen hava durumu” sitesi,
- mobilde çalışmayan masaüstü vitrini,
- hazır UI kitinin yeniden renklendirilmiş hali,
- yalnızca texture ve bloom ile etkileyici görünmeye çalışan yüzeysel demo

olmamalıdır.

## 5. Değişmez ilkeler

### Bilimsel dürüstlük

- Gerçek zamanlı olmayan veriye “canlı” denmez.
- Tek bir rover ölçümü tüm Mars’ın hava durumu gibi sunulmaz.
- Ortalama, minimum, maksimum ve gözlemsel değerler ayrılır.
- Kaynak, gözlem tarihi ve alınma tarihi mümkün olduğunda görünürdür.
- Değişebilen referans değerler tarihli snapshot olarak tutulur.

### Ürün odağı

- Her özellik bir kullanıcı sorusuna cevap verir.
- Bir güvenilir entegrasyon, beş yarım entegrasyondan değerlidir.
- Gezegen sayfaları yalnızca renk değiştiren aynı şablon gibi hissettirilmez.
- Büyük yeni fikirler yol haritasına eklenmeden kodlanmaz.

### Performans

- Her frame React state güncellenmez.
- Ana sayfa 3B bundle’ı zorunlu yüklemez.
- Mobil ve düşük güçlü cihazlar için kalite seviyesi bulunur.
- Texture, shader, yıldız sayısı ve post-processing ölçülerek yönetilir.
- API veya asset hatası bütün uygulamayı çökertmez.

### Erişilebilirlik

- Kritik bilgi yalnızca hover ile verilmez.
- Canvas dışında semantik gezegen navigasyonu bulunur.
- Temel keşif klavyeyle yapılabilir.
- `prefers-reduced-motion` desteklenir.
- WebGL çalışmadığında içerik erişilebilir kalır.

### Kod ve metin kalitesi

- TypeScript strict mode korunur.
- Domain verisi JSX içine gömülmez.
- Harici response UI katmanında normalize edilmez.
- Sorumlulukları karışan büyük component’ler bölünür.
- Gereksiz manager/service/factory katmanları kurulmaz.
- Yorumlar kodu tekrar etmez; yalnızca kararın nedenini açıklar.
- Repository içinde araç adı, otomatik üretim dipnotu veya otomatik ortak-yazar etiketi bulunmaz.
- Ürün metinleri reklam dili, kalıp üçlü sıfatlar ve yapay şiirsellikten kaçınır.
- Geçici içerik nihai metin gibi bırakılmaz.

## 6. Faz çalışma sırası

Her fazda:

1. İlgili kaynak belgeleri okunur.
2. Mevcut repository durumu incelenir.
3. En fazla 5–8 maddelik uygulama planı çıkarılır.
4. Yalnızca ilgili fazın kapsamı uygulanır.
5. Lint, typecheck, ilgili testler ve build çalıştırılır.
6. Mobil, klavye, reduced motion, veri ve performans etkisi değerlendirilir.
7. Faz raporu güncellenir.
8. Kabul kriterleri sağlanıyorsa ve açık blocker yoksa yol haritasındaki bir sonraki güvenli işe geçilebilir.

Bir faz gerçek repository üzerinde doğrulanmadan tamamlanmış sayılmaz.

## 7. Kapsam yönetimi

Yeni fikirler şu sınıflardan birine alınır:

- MVP
- MVP sonrası
- Araştırma gerekli
- Reddedildi
- Teknik borç / iyileştirme

Karar kaydı:

```md
### Karar: [başlık]

- Durum:
- Tarih:
- Problem:
- Seçenekler:
- Karar:
- Gerekçe:
- Etkilediği belgeler veya dosyalar:
```

## 8. Varsayım kuralları

- Küçük ve geri döndürülebilir kararlar uygulanıp raporlanabilir.
- Kapsamı, bilimsel doğruluğu, görsel kimliği veya mimari yönü değiştiren karar sessizce alınmaz.
- Bilimsel değerden emin olunmadığında sayı uydurulmaz; araştırma kaydı açılır.
- Placeholder gerekiyorsa geçici olduğu açıkça anlaşılır.

## 9. Faz sonu raporu

```md
# Faz [N] Sonu

## Tamamlananlar

## Değiştirilen Dosyalar

## Teknik Kararlar

## Doğrulama

- format:
- lint:
- typecheck:
- unit:
- e2e:
- build:

## Performans / Erişilebilirlik Etkisi

## Veri ve Kaynak Etkisi

## Bilinen Eksikler

## Sonraki Fazdan Önce Blocker
```

## 10. Başarı tanımı

Helios tamamlandığında ürün düşüncesi, bilimsel dürüstlük, 3B mimari, mobil kullanılabilirlik, erişilebilirlik, performans ölçümleri ve karar geçmişi aynı ürün hikâyesini anlatmalıdır.
