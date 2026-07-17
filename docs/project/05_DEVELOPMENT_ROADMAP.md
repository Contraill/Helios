# HELIOS — GELİŞTİRME YOL HARİTASI

## 1. Genel yaklaşım

Proje faz bazlı geliştirilecektir. Her faz, çalışır ve doğrulanmış bir dikey veya yatay parça üretir. Bir fazın kabul kriterleri sağlanmadan sonraki faz başlamaz. Kabul kriterleri gerçek repository üzerinde doğrulandığında ve açık blocker kalmadığında, yol haritasındaki bir sonraki güvenli işe geçilebilir.

Öncelik sırası:

1. Ürün ve veri doğruluğu
2. Sağlam domain ve proje temeli
3. Çalışan temel 3B sistem
4. Etkileşim ve kamera
5. Gezegen içerikleri
6. Dinamik veriler
7. Görsel kalite
8. Performans, erişilebilirlik ve yayın

---

## Faz 0 — Araştırma ve kararlar

### Amaç

Kod yazmadan önce kapsam, görsel yön, veri kaynakları ve riskleri netleştirmek.

### Görevler

- Ürün farklılaştırıcısını kesinleştir
- Benzer ürün analizi
- MVP / sonraki sürüm ayrımı
- Gezegen bilgi modeli
- Kaynak registry taslağı
- Ölçek stratejisi
- Mars verisi politikası
- Görsel lisans yaklaşımı
- Erişilebilirlik hedefleri
- Risk kaydı

### Çıktılar

```text
docs/
├── product-brief.md
├── architecture-decisions.md
├── data-sources.md
├── visual-direction.md
├── accessibility-plan.md
└── risk-register.md
```

### Kabul kriterleri

- Ürünün neden var olduğu tek paragrafta açıklanabiliyor
- NASA Eyes ile fark net
- Her dinamik veri için fallback tanımlı
- “Canlı veri” tanımı yazılı
- MVP sınırı anlaşılır

---

## Faz 1 — Proje temeli

### Görevler

- Next.js App Router
- TypeScript strict
- ESLint / Prettier
- path alias
- CSS token sistemi
- temel layout
- route iskeleti
- environment validation
- Vitest / RTL / Playwright
- CI
- health endpoint
- README başlangıcı

### Kabul kriterleri

- lint geçer
- typecheck geçer
- test geçer
- build geçer
- route’lar açılır
- eksik environment anlaşılır hata verir
- API key repository’de yoktur

---

## Faz 2 — Domain ve gezegen verisi

### Görevler

- PlanetData tipi
- Zod schema
- Source registry tipi
- Sekiz gezegen için ilk referans içerik
- unit conversion
- kilo hesabı
- yaş hesabı
- ışık süresi
- ölçek fonksiyonları
- unit testler

### Kabul kriterleri

- Sekiz gezegen aynı schema’dan geçer
- eksik zorunlu alan test/build hatası üretir
- hesaplamalar `NaN` üretmez
- değişebilir değerlerde tarih alanı vardır
- bütün sayısal değerlerin kaynak ID’si bulunur

---

## Faz 3 — Temel 3B sahne

### Görevler

- dynamic Canvas
- Güneş
- sekiz gezegen
- yörünge çizgileri
- yörünge hareketi
- eksen dönüşü
- star field
- lighting
- loading
- resize
- WebGL fallback

### Bu fazda yapılmayacaklar

- gelişmiş shader
- NASA API
- sinematik kamera
- yoğun post-processing
- görev modelleri

### Kabul kriterleri

- sekiz gezegen doğru sırada
- hareket frame-rate bağımsız
- resize bozmuyor
- mobil temel sahne çalışıyor
- fallback açılıyor
- unmount sonrası belirgin resource leak yok

---

## Faz 4 — Seçim ve kamera

### Görevler

- hover
- click
- touch
- keyboard selection
- selected state
- CameraRig
- overview / focus
- geçiş iptali
- gezegen etiketi
- özet panel
- Escape davranışı
- hızlı art arda seçim testi

### Kabul kriterleri

- her gezegen seçilir
- kamera nesne içine girmez
- hızlı seçimde bozulmaz
- mobil touch çalışır
- klavye çalışır
- panel ve kamera senkron hissedilir

---

## Faz 5 — Simülasyon kontrolleri

### Görevler

- pause
- time scale
- reset
- keşif ölçeği
- bilimsel ölçek
- orbit görünürlüğü
- label görünürlüğü
- kalite seviyesi
- reduced motion
- preferences persistence

### Kabul kriterleri

- pause bütün simülasyon hareketini durdurur
- reset deterministik başlangıca döner
- ölçek modu açıklaması görünür
- düşük kalite ölçülebilir fark yaratır
- tercihler reload sonrası korunur

---

## Faz 6 — Gezegen detay sayfaları

### Görevler

- dynamic route
- static params
- metadata
- hero
- temel değerler
- burada olsaydın
- atmosfer
- gün / yıl
- yüzey veya katman
- uydular / halkalar
- görevler
- kaynaklar
- previous / next

### Kabul kriterleri

- sekiz sayfa çalışır
- sayfalar yalnızca renk değişimi değildir
- kişisel hesaplamalar doğru
- kaynaklar görünür
- Canvas olmadan da içerik anlamlı
- mobil düzen tamamlanmıştır

---

## Faz 7 — İlk NASA entegrasyonları

Önerilen ilk iki entegrasyon:

1. APOD
2. NEO

Mars görsel veya ölçüm entegrasyonu, endpoint güncelliği doğrulandıktan sonra üçüncü olarak eklenebilir.

### Görevler

- server client
- adapter
- Zod schema
- normalize model
- cache
- timeout
- fallback
- metadata
- loading / empty / error
- test mock’ları

### Kabul kriterleri

- key client’a sızmaz
- gereksiz tekrar istek yok
- API kesildiğinde sayfa çalışır
- observed / retrieved ayrımı vardır
- yanlış “live” etiketi yok
- response schema hatası yönetilir

---

## Faz 8 — Karşılaştırma

### Görevler

- iki selector
- URL query
- paylaşılabilir link
- oransal boyut
- veri kartları
- kilo karşılaştırması
- gün / yıl
- atmosfer
- mobil layout
- erişilebilir tablo alternatifi

### Kabul kriterleri

- aynı gezegen seçimi yönetilir
- eksik veri layout’u bozmaz
- URL ile durum geri yüklenir
- görsel oran açıklanır
- klavyeyle kullanılabilir

---

## Faz 9 — Görsel derinlik

### Görevler

- atmosfer shader
- Güneş corona
- kontrollü bloom
- Satürn halkası
- Uranüs / Neptün görsel ayrımı
- texture kalite katmanları
- focus’a göre asset yükleme
- küçük UI polish

### Kabul kriterleri

- efektler düşük kalitede kapanır
- gezegen yüzey detayı bloom altında kaybolmaz
- Satürn halkası farklı açılarda doğru
- mobil bellek kullanımı kabul edilebilir
- görsel kalite bilimsel açıklamayla çelişmez

---

## Faz 10 — Performans ve erişilebilirlik

### Görevler

- bundle analiz
- draw call
- texture audit
- DPR kontrolü
- frame allocation audit
- keyboard flow
- screen reader
- focus management
- reduced motion
- contrast
- WebGL fallback polish
- E2E

### Kabul kriterleri

- production debug araçları yok
- ana sayfa 3B bundle’ı zorunlu yüklemiyor
- düşük kalite zayıf cihazlarda anlamlı
- temel görevler klavyeyle tamamlanıyor
- Canvas dışında gezegen listesi var
- API error ve fallback E2E testli

---

## Faz 11 — Case study ve yayın

### Görevler

- production deploy
- environment
- domain
- sitemap / robots
- analytics tercihi
- README final
- case study
- mimari diyagram
- ekran görüntüleri
- demo video
- ölçümler
- attribution listesi
- release checklist

### Kabul kriterleri

- canlı demo çalışır
- repository kurulabilir
- `.env.example` vardır
- gerçek key yok
- case study kararları ve sorunları anlatır
- mobil demo gösterilebilir
- kaynak ve lisans bilgileri tamamdır

---

## 2. Dependency sırası

- Faz 2, Faz 3’ten önce
- Faz 3, Faz 4’ten önce
- Faz 4 ve 5, Faz 6’yı tamamen engellemez; ancak ortak state sözleşmesi gerekir
- Faz 7, veri politikası doğrulanmadan başlamaz
- Faz 9, temel etkileşim tamamlanmadan başlamaz
- Faz 10 sonradan başlayan bir temizlik değildir; önceki fazlarda kalite korunur, burada kapsamlı audit yapılır

---

## 3. Issue yapısı

Her issue:

```md
## Problem

## Kullanıcı değeri

## Kapsam

## Kapsam dışı

## Teknik yaklaşım

## Kabul kriterleri

## Test planı

## Veri / kaynak etkisi

## Erişilebilirlik etkisi

## Performans etkisi
```

Etiketler:

- `mvp`
- `post-mvp`
- `3d`
- `data`
- `content`
- `performance`
- `accessibility`
- `testing`
- `design`
- `bug`
- `decision-needed`

---

## 4. Risk kaydı

### 4.1 3B performans

Risk: mobil cihazlarda düşük FPS veya yüksek bellek.

Önlem:

- kalite seviyeleri
- lazy asset
- düşük DPR
- ölçüm
- shader fallback

### 4.2 NASA endpoint değişikliği

Risk: veri kartlarının çalışmaması.

Önlem:

- adapter
- schema
- cache
- snapshot
- statik fallback
- endpoint doğrulama

### 4.3 Kapsam büyümesi

Risk: uydular, görevler ve gerçek yörüngeler MVP’yi geciktirir.

Önlem:

- kapsam sınıflandırması
- karar kaydı
- faz kabul kriteri

### 4.4 Bilimsel yanlışlık

Risk: portföy güvenilirliğinin düşmesi.

Önlem:

- kaynak registry
- birincil kaynak
- fact-check workflow
- güncellik etiketi
- editoryal metin review

### 4.5 Hazır demo görünümü

Risk: proje “Three.js tutorial” gibi algılanır.

Önlem:

- kişisel modül
- veri politikası
- özgün editoryal sayfalar
- case study
- karşılaştırma

---

## 5. Faz sonu kararları

Her fazdan sonra şu sorular cevaplanır:

- Kullanıcı değeri oluştu mu?
- Yeni teknik borç nedir?
- Performans geriledi mi?
- Erişilebilirlik bozuldu mu?
- Veri kaynağı değişti mi?
- Doküman güncellenmeli mi?
- Sonraki faz için blocker var mı?
