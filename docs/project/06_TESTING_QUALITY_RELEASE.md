# HELIOS — TEST, KALİTE VE YAYIN STANDARDI

## 1. Definition of Done

Bir iş aşağıdakiler sağlanmadan tamamlanmış sayılmaz:

- Kullanıcı açısından çalışıyor
- TypeScript hatası yok
- lint hatası yok
- build geçiyor
- ilgili unit veya component test var
- loading durumu var
- empty state var
- error state var
- mobil kontrol edildi
- klavye etkisi değerlendirildi
- reduced motion etkisi değerlendirildi
- veri kaynağı gerekiyorsa eklendi
- gizli key yok
- console log ve kullanılmayan kod yok
- doküman veya karar kaydı gerekiyorsa güncellendi

---

## 2. Unit test kapsamı

### Hesaplamalar

- ağırlık
- gezegen yaşı
- yerel gün dönüşümü
- ışık süresi
- birim dönüşümü
- ölçek fonksiyonları
- yörünge pozisyonu
- retrograde yönü
- tarih formatı
- sayı yuvarlama

### Veri

- adapter normalize
- Zod success / failure
- null ve eksik alan
- tarih parsing
- freshness label
- stale logic
- fallback seçimi
- birim normalizasyonu

Testler yalnızca happy path’i kapsamamalıdır.

---

## 3. Component test

- PlanetStat
- SourceBadge
- FreshnessBadge
- WeightCalculator
- AgeCalculator
- PlanetSelector
- ComparePanel
- ErrorState
- EmptyState
- LoadingState
- QualitySelector
- ReducedMotionToggle
- MobileBottomSheet

Kontrol:

- erişilebilir isim
- keyboard
- validation error
- locale format
- eksik veri
- uzun metin
- dar viewport

---

## 4. 3B test yaklaşımı

Her şeyi pixel-perfect unit test etmek gerekmez.

Test edilecek sözleşmeler:

- sekiz gezegen render edilir
- seçilebilir mesh event’i doğru ID üretir
- CameraRig doğru hedefi alır
- scale strategy doğru değer verir
- pause sırasında zaman ilerlemez
- retrograde dönüş yönü
- fallback component

React Three Test Renderer uygun yerlerde kullanılabilir. Kritik kamera akışı E2E veya kontrollü integration test ile desteklenir.

---

## 5. E2E senaryoları

### Temel keşif

1. Ana sayfayı aç
2. Explore’a git
3. Mars’ı seç
4. Bilgi panelini gör
5. Detay sayfasına git
6. Overview’e dön

### Kişisel hesaplama

1. Dünya kilosunu gir
2. Sonucu doğrula
3. Geçersiz input göster
4. Reload sonrası local preference davranışını doğrula

### Karşılaştırma

1. Dünya ve Jüpiter seç
2. URL query oluşsun
3. Link yeni sayfada aynı durumu açsın
4. Aynı gezegen seçimi yönetilsin

### API kesintisi

1. APOD 500 mock
2. Sayfa çökmesin
3. fallback / unavailable mesajı
4. kaynağı olmayan sahte içerik görünmesin

### Mobil

1. mobile viewport
2. gezegen touch
3. bottom sheet
4. sheet scroll
5. close
6. kalite seçimi

### Klavye

1. gezegen listesine focus
2. ok / tab
3. Enter
4. Escape
5. focus geri dönüşü

---

## 6. Görsel regresyon

Ekranlar:

- home
- explore overview
- Mars focus
- Saturn focus
- Earth detail
- Venus detail
- compare
- data page
- mobile explore
- WebGL fallback
- API unavailable

Dikkat:

- farklı GPU’larda 3B pixel farkları olabilir
- DOM ve layout bölgeleri daha kararlı testlenebilir
- 3B screenshot toleransı gerekebilir

---

## 7. Performans kontrol listesi

### Bundle

- Ana sayfa 3B kodu zorunlu yüklemiyor
- ağır kütüphaneler route bazlı
- production source map kararı
- kullanılmayan icon paketi yok

### WebGL

- draw call
- triangles
- texture bellek
- shader sayısı
- DPR
- frame allocation
- object count
- event raycast maliyeti
- post-processing

### Runtime

- React re-render profili
- her frame setState yok
- visibility değişiminde gereksiz remount yok
- event listener cleanup
- material / geometry dispose
- API request tekrarları

---

## 8. Performans bütçesi yaklaşımı

Kesin sayılar cihaz ve içerik ortaya çıktığında ölçülerek belirlenir. En azından şu bütçeler repository’de yazılı olmalıdır:

- İlk sayfa JS bütçesi
- Explore route JS bütçesi
- Başlangıç texture bütçesi
- High kalite texture bütçesi
- Mobil DPR üst sınırı
- Hedef minimum FPS aralığı
- Maksimum API response sayısı
- Lighthouse hedefleri

Bütçe ihlali CI veya release review’da görünür olmalıdır.

---

## 9. Erişilebilirlik QA

- başlık hiyerarşisi
- landmark
- alt text
- buton isimleri
- focus order
- focus visibility
- modal / bottom sheet trap
- Escape
- form error association
- contrast
- zoom %200
- reduced motion
- screen reader gezegen özeti
- WebGL fallback
- renk körlüğü kontrolü

Canvas’ın yanında semantik alternatif bulunması zorunludur.

---

## 10. Browser ve cihaz matrisi

Minimum test:

- güncel Chrome
- güncel Firefox
- güncel Safari
- Chromium tabanlı Edge
- iOS Safari
- Android Chrome

Koşullar:

- masaüstü yüksek performans
- entegre GPU
- mobil orta seviye
- düşük güç modu
- yavaş ağ
- WebGL kapalı veya başarısız
- reduced motion açık

---

## 11. API kalite testi

Her adapter için:

- başarılı response
- 401 / 403
- 429
- 500
- timeout
- malformed JSON
- schema mismatch
- empty list
- missing media
- stale snapshot
- no fallback

Log’larda API key veya hassas header görünmemelidir.

---

## 12. Güvenlik kontrolü

- env key client bundle’da aranır
- `.env` gitignore
- parametre allowlist
- tarih range
- response size
- XSS
- harici açıklama sanitization
- CSP değerlendirmesi
- dependency audit
- gereksiz kullanıcı verisi yok

---

## 13. İçerik QA

Her gezegen:

- ad ve sıra doğru
- kaynaklı değer
- birim doğru
- sıcaklık tanımı doğru
- gaz devi yüzey dili doğru
- retrograde bilgisi
- gün / yıl ayrımı
- editoryal metin bilimle çelişmiyor
- kaynak bağlantısı
- güncellenebilir değer tarihi

---

## 14. Release checklist

### Kod

- main branch temiz
- CI yeşil
- tag / version
- migration gerekmiyor
- debug flag yok
- console log yok

### Environment

- production API key
- domain
- cache
- timeout
- error reporting
- fallback snapshot

### İçerik

- sekiz gezegen final
- kaynak registry
- attribution
- privacy
- about
- case study

### Deneyim

- mobile
- keyboard
- reduced motion
- low quality
- WebGL fallback
- empty / error

### SEO

- metadata
- sitemap
- robots
- OG
- canonical
- 404

### Portföy

- README
- screenshots
- demo video
- architecture diagram
- performance before / after
- known limitations
- roadmap

---

## 15. Hata önceliği

### P0

- uygulama açılmıyor
- API key sızıntısı
- veri ciddi yanlış
- kullanıcı verisi riski

### P1

- temel keşif çalışmıyor
- kamera kilitleniyor
- mobil kullanılamıyor
- API hatası bütün sayfayı çökertiyor
- klavye çıkmazı

### P2

- görsel hata
- belirli cihaz performansı
- içerik tutarsızlığı
- fallback metin sorunu

### P3

- küçük polish
- düşük etkili animasyon
- kozmetik spacing

---

## 16. Yayın sonrası

- error oranı
- API hata oranı
- fallback kullanım oranı
- route performansı
- mobil kullanım
- kullanıcıların en çok seçtiği gezegen
- karşılaştırma kullanımı

Analytics kullanılırsa minimum ve gizlilik dostu olmalıdır.
