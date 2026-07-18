# HELIOS — GELİŞTİRME YOL HARİTASI

**Belge sürümü:** 1.2  
**Güncelleme tarihi:** 18 Temmuz 2026  
**Yürürlük:** Blok B geliştirmesi sırasında; Faz 8.5 Blok B tamamlandıktan sonra  
**Koruma notu:** Faz 0–4 kapsamı, görevleri ve kabul kriterleri bu güncellemeyle değiştirilmemiştir.

## 1. Genel yaklaşım

Proje faz bazlı geliştirilecektir. Her faz, çalışır ve doğrulanmış bir dikey veya yatay parça üretir. Bir fazın kabul kriterleri sağlanmadan sonraki faz otomatik başlamaz.

Fazlar ürün kapsamını ve kabul kriterlerini tanımlamaya devam eder. Faz 4 tamamlandıktan sonra, ortak altyapıyı tekrar tekrar kurmamak ve bağlam geçişlerini azaltmak amacıyla devam çalışması Blok A, Blok B, Blok B.5, Blok C ve Blok D yürütme kapıları içinde ilerler. **Birleşen şey kabul kriterleri değil, uygulama akışıdır.** Her faz kendi kalite kapısını, testlerini ve tamamlanma kaydını korur.

Görsel kalite yalnızca Faz 9’a ertelenmez. Faz 5’ten itibaren oluşturulan her kullanıcı yüzeyi; sinematik kompozisyon, gezegene özgü kimlik, responsive davranış, hareket kalitesi ve düşük kalite fallback’i açısından tamamlanmış kabul edilmelidir. Faz 9, bu temelin üzerine ileri 3B görsel derinlik ekler.

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

## Faz 4 sonrası hızlandırılmış yürütme modeli

Bu model yalnızca Faz 4’ün mevcut kabul kriterleri tamamlandıktan sonra yürürlüğe girer. Devam eden Faz 4 geliştirmesine yeni kapsam eklenmez; Faz 5’e ait kontrol, persistence veya kalite seviyesi işleri Faz 4’e taşınmaz.

### Blok A — Faz 5: Etkileşim sistemini sabitleme

Faz 5 bağımsız tamamlanır. Simülasyon, ölçek, kalite, hareket ve tercih state sözleşmeleri sonraki sayfa ve veri çalışmalarından önce kararlı hale getirilir.

### Blok B — Faz 6 + Faz 7 + Faz 8: İçerik, dinamik veri ve karşılaştırma

Bu fazlar ortak veri sunumu ve içerik altyapısı üzerinden aynı çalışma bloğunda geliştirilir. Uygulama sırası:

1. Ortak içerik, kaynak, güncellik, birim ve hesaplama bileşenleri
2. Bir gezegen için tam görsel ve işlevsel dikey örnek
3. Sekiz gezegenin özgün detay sayfaları
4. NASA server adapter, doğrulama, cache ve fallback altyapısı
5. APOD ve NEO yüzeyleri
6. Karşılaştırma deneyimi
7. Blok geneli mobil, klavye, E2E ve görsel kontrol

Faz 6, 7 ve 8’in kabul kriterleri ayrı ayrı doğrulanır. Bir fazın eksikleri diğerinin tamamlanmış görünmesiyle gizlenmez.

### Blok B.5 — Faz 8.5: Efemeris, Zaman Navigasyonu ve Özgür Kamera

Blok B tamamlandıktan sonra ayrı bir kalite kapısı olarak çalışır. Seçilen tarih için kaynaklı gezegen konumları, merkezi simulation date/time modeli ve mevcut CameraRig otoritesiyle uyumlu özgür kamera bu blokta geliştirilir. Ürün dili canlı telemetri iddiası taşımaz; current-date, historical veya future computed ephemeris olarak açıkça etiketlenir.

Blok B tamamlanmadan Blok B.5 başlamaz. Faz 8.5 kabul kapısı kapanmadan Blok C başlamaz.

### Blok C — Faz 9 + Faz 10: Görsel derinlik, performans ve erişilebilirlik

Her ileri görsel özellik; performans bütçesi, düşük kalite karşılığı, mobil bellek etkisi, reduced-motion davranışı ve fallback’iyle birlikte geliştirilir. Faz 10 blok sonunda ayrıca kapsamlı final audit olarak çalıştırılır.

### Blok D — Faz 11: Yayın ve case study

Faz 11 ayrı kapanış bloğudur. Ölçümler, karar notları ve attribution önceki bloklarda biriktirilir; ancak final deployment, ekran görüntüleri, case study ve release kontrolü ürün stabil olduktan sonra tamamlanır.

### Birleşik blokların değişmez kalite kapıları

Her alt faz veya anlamlı dikey dilim sonunda:

- lint, typecheck, ilgili unit/component testleri ve build çalışır
- kritik kullanıcı akışları gerektiğinde E2E ile doğrulanır
- masaüstü ve mobil görsel kontrol yapılır
- klavye ve reduced-motion etkisi değerlendirilir
- API, performans veya bilimsel veri etkisi kaydedilir
- geri dönüş noktası oluşturan yerel commit hazırlanır
- ilgili faz kabul kriterleri ayrı checklist olarak kapanır

Birleşik blok tamamlanmadan sonraki bloğa geçilmez. Blok büyüklüğü nedeniyle bir kalite kapısı başarısız olursa kapsam küçültülmez; sorun aynı blok içinde düzeltilir.

### Maksimum görsel kalite kuralı

- Gezegen detayları tek şablonun renk değiştiren kopyaları olamaz.
- Ortak component kullanımı, ortak kompozisyon zorunluluğu anlamına gelmez.
- Her gezegenin tipografi, ritim, hareket, vurgu, veri hiyerarşisi ve çevresel anlatımı kendi karakterine göre düzenlenir.
- Low/medium/high kalite seviyeleri görsel yönü değiştirmez; yalnızca teknik maliyeti ölçekler.
- Yüksek kalite hedefi masaüstüne özel bir vitrin olarak kalmaz; mobil için aynı sanat yönünün kontrollü karşılığı tasarlanır.
- Atmosfer, shader, bloom ve texture çalışmaları içerik ve UI okunabilirliğini bastıramaz.
- Görsel onay yalnızca kodun çalışmasıyla verilmez; gerçek viewport’larda ekran görüntüsü ve etkileşim kontrolü gerekir.

---

## Faz 5 — Simülasyon kontrolleri

**Yürütme bloğu:** Blok A — bağımsız kalite kapısı

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

**Yürütme bloğu:** Blok B — Faz 7 ve Faz 8 ile ortak uygulama akışı; ayrı kabul kapısı

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

**Yürütme bloğu:** Blok B — Faz 6 ve Faz 8 ile ortak uygulama akışı; ayrı kabul kapısı

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

**Yürütme bloğu:** Blok B — Faz 6 ve Faz 7 ile ortak uygulama akışı; ayrı kabul kapısı

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

## Faz 8.5 — Efemeris, Zaman Navigasyonu ve Özgür Kamera

**Yürütme bloğu:** Blok B.5 — Blok B’den sonra, Blok C’den önce bağımsız kalite kapısı

### Amaç

Explore sahnesini yalnızca yaklaşık ve sürekli ilerleyen bir yörünge gösteriminden, seçilen tarih için kaynaklı gezegen konumlarını gösterebilen bir zaman deneyimine dönüştürmek ve kullanıcıya kontrollü özgür kamera hareketi vermek. Bu mod “live telemetry” olarak tanımlanmaz.

Doğru ürün dili:

- Current-date ephemeris
- Position computed for [date/time]
- Historical ephemeris
- Future ephemeris
- Retrieved at
- Reference frame / coordinate center
- Approximate visual presentation scale

“Live planet positions” ifadesi veri canlı bir sensör akışıymış gibi kullanılmaz.

### Veri ve efemeris görevleri

**Uygulama doğrulaması — 18 Temmuz 2026:** Resmî JPL Horizons endpoint'inin güncel response signature değeri `1.2` olarak gözlendi; Cartesian `VECTORS` çıktısı ve `CENTER`, `REF_PLANE`, `REF_SYSTEM`, `OUT_UNITS`, `VEC_TABLE`, `CSV_FORMAT` ayarları doğrudan doğrulandı. Faz 8.5 teknik sözleşmesi; `EPHEM_TYPE=VECTORS`, konum ve hız sağlayan `VEC_TABLE=2`, Güneş gövde merkezi `CENTER=500@10`, J2000 ekliptik düzlemi `REF_PLANE=ECLIPTIC`, `REF_SYSTEM=ICRF`, `OUT_UNITS=AU-D` ve TDB zaman ölçeğidir. Merkezi target registry, altı saatlik kararlı örnek epoch'u ve 1900–2100 kullanıcı tarih sınırı uygulandı.

- Resmî JPL Horizons API’yi ana efemeris kaynağı olarak doğrula
- 3B sahne için observer table yerine Cartesian vector table yaklaşımını değerlendir ve teknik seçimi kaydet
- Sekiz gezegen için merkezi Horizons target/body registry oluştur
- Target ID, coordinate center, reference plane/frame, unit ve time scale değerlerini component’lere dağınık sabitler olarak yazma
- Heliocentric veya seçilen coordinate center kararını açıkça belgele
- Efemerisin hesaplandığı zaman ile `retrievedAt` değerini birbirine karıştırma
- Horizons’u mevcut APOD/NEO NASA client’ına zorla bağlama; ayrı server-only adapter oluştur
- Ham text veya CSV response’u UI’a sızdırma
- Parser, Zod doğrulama, normalize model, timeout, hata ve fallback sözleşmeleri ekle
- API’yi frame loop’tan çağırma
- Tarih aralıklarını server tarafında örnekle, cache et ve client tarafında kontrollü interpolation uygula
- Interpolation hatasını doğrudan Horizons referans örnekleriyle test et
- Desteklenen geçmiş ve gelecek tarih aralığını kaynak yetenekleri doğrulandıktan sonra sınırla ve UI’da göster
- API kapalı olduğunda son başarılı normalize snapshot veya mevcut yaklaşık simülasyon açık fallback etiketiyle çalışsın
- `NASA_API_KEY` ile Horizons erişim sözleşmesini birbirine karıştırma; deployment öncesi yeniden doğrula

### Zaman navigasyonu görevleri

- Merkezi ve tek bir simulation date/time modeli
- “Now” kontrolü
- Tarih ve saat seçimi
- Geçmiş ve geleceğe gitme
- Timeline veya scrubber
- Play / pause
- Uygun ileri zaman hızları ve gerekirse geri yönde zaman navigasyonu
- Tarih değişiminde deterministik gezegen konumları
- Reload veya paylaşılabilir URL ile seçilen tarihi geri yükleme
- Exploration ve scientific scale aynı efemeris zamanını kullansın
- Exploration scale yalnızca mesafe sunumunu dönüştürsün; scientific scale doğrusal ölçek sözleşmesini korusun
- Fiziksel yarıçap ile yörünge konumu ayrı kavramlar olarak kalsın
- Axial attitude, tam body orientation ve görev uzay araçlarını kapsam içine sızdırma

### Özgür kamera görevleri

Mevcut merkezi `CameraRig` otoritesi korunur; sahnede iki rakip kamera controller’ı oluşturulmaz.

Kamera modları:

- `overview`
- `focus`
- `free`

Masaüstü:

- orbit / rotate
- pan
- dolly / zoom
- seçili gezegene focus
- overview’e dön
- kamera reset

Klavye hareketi eklenirse form alanlarında tuş yakalanmaz, global sayfa kısayolları bozulmaz, pointer lock tek erişim yolu olmaz ve görünür yardım sağlanır.

Mobil:

- tek parmak rotate
- iki parmak pan
- pinch zoom
- normal sayfa scroll davranışını gereksiz kilitlememe
- yanlış gezegen seçimi veya panel tetiklenmesini önleme

Kamera güvenliği:

- gezegen veya Güneş mesh’inin içine girmeme
- near/far clipping bozulmasını önleme
- scale mode değişiminde kameranın kaybolmaması
- precision hatasına yol açacak aşırı uzaklaşmayı sınırlama
- hızlı focus/free/overview geçişinde stale kamera state’ini önleme
- selected planet ile camera target senkronizasyonu

Exact camera pose persistence zorunlu değildir. Tercih edilen kamera modu saklanabilir; reload kullanıcıyı boş uzayda bırakan bir pozisyonu geri yüklemez. Reduced motion, kamera geçişleri için anlık veya düşük hareketli karşılık sağlar; doğrudan kullanıcı kontrollü free camera girdisini engellemez.

### Kabul kriterleri

- Sekiz gezegen seçilen tarih için kaynaklı konum alabiliyor
- En az bir mevcut, bir geçmiş ve bir gelecek tarih doğrudan JPL Horizons çıktısıyla doğrulanmış
- Position modeli frame, center, unit ve time metadata’sı taşıyor
- UI “live” ve “computed ephemeris” kavramlarını karıştırmıyor
- Tarih değişiminde sahne deterministik
- API çağrısı frame loop’a bağlı değil
- Cache ve fallback çalışıyor
- API kesildiğinde temel Explore kullanılabilir
- Exploration ve scientific scale aynı efemeris zamanını temsil ediyor
- Free camera, focus ve overview birbiriyle çakışmıyor
- Kamera nesnelerin içine girmiyor
- Desktop mouse, keyboard ve mobile touch akışları çalışıyor
- Escape ve reset davranışları tutarlı
- Reduced-motion karşılığı var
- Low quality seviyesi özgür kamera ve zaman navigasyonunda anlamlı performans farkı yaratıyor
- E2E testleri mevcut, geçmiş ve gelecek tarih ile camera mode geçişlerini kapsıyor
- Gerçek desktop, tablet ve mobil viewportlarda görsel kontrol yapılmış

### Kapsam dışı

- Uzay araçlarının gerçek görev rotaları
- Bütün uyduların efemerisi
- Asteroit ve kuyruklu yıldız kataloğu
- Tam SPICE body attitude / orientation sistemi
- Gerçek zamanlı sensör telemetrisi
- Multiplayer veya ortak kamera oturumu
- VR kontrolü

---

## Faz 9 — Görsel derinlik

**Yürütme bloğu:** Blok C — Faz 10 ile sürekli ölçüm ve audit eşliğinde

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

**Yürütme bloğu:** Blok C — Faz 9 boyunca sürekli; blok sonunda bağımsız final audit

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

**Yürütme bloğu:** Blok D — ayrı kapanış ve release kapısı

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

## 2. Dependency ve yürütme sırası

- Faz 2, Faz 3’ten önce
- Faz 3, Faz 4’ten önce
- Bu güncelleme Faz 4 tamamlanmadan uygulama sırasını değiştirmez
- Faz 4 tamamlanmadan Blok A başlamaz
- Blok A tamamlanmadan Blok B başlamaz; quality, scale, simulation ve preference state sözleşmeleri kararlı olmalıdır
- Blok B içinde Faz 6’nın ortak sunum altyapısı önce kurulur; Faz 7 veri politikası doğrulanmadan production adapter’a geçmez
- Faz 6, 7 ve 8 paralel alt işler içerebilir; ancak her biri kendi kabul kapısını geçmeden Blok B tamamlanmaz
- Blok B tamamlanmadan Blok B.5 başlamaz
- Faz 6, 7 ve 8’in ayrı kabul kapıları kapanmadan efemeris geliştirmesine geçilmez
- Faz 8.5 tamamlanmadan Blok C başlamaz
- Faz 9 texture ve atmosfer çalışmaları özgür kamera altında farklı açılardan test edilir
- Faz 10 sonradan başlayan bir temizlik değildir; Faz 9 boyunca uygulanır ve Blok C sonunda zaman navigasyonu, fallback ve free-camera erişilebilirliğini de kapsayan final audit yapılır
- Faz 11 case study, yaklaşık simülasyon ile kaynaklı efemeris arasındaki farkı açıklar
- Blok D, Blok C’nin performans, erişilebilirlik ve görsel kabul kapıları kapanmadan başlamaz
- Faz 11 sırasında ürün davranışını değiştiren büyük geliştirme yapılmaz; zorunlu düzeltme çıkarsa ilgili önceki bloğun kabul kriteri yeniden çalıştırılır

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

### 4.6 Birleşik blokların kontrolsüz büyümesi

Risk: Faz 6–8 veya Faz 9–10 tek büyük değişiklik yığınına dönüşerek görsel detayların, testlerin ya da erişilebilirlik kontrollerinin atlanması.

Önlem:

- dikey dilim sırası
- alt faz bazlı ayrı kabul checklist’i
- yerel commit ve geri dönüş noktaları
- düzenli build ve E2E
- gerçek viewport görsel kontrolü
- başarısız kalite kapısında sonraki alt işe geçmeme

### 4.7 Efemeris ve özgür kamera karmaşıklığı

Risk: Frame, center, time scale veya interpolation kararlarının dağınık uygulanması; free camera ile merkezi kamera otoritesinin çakışması.

Önlem:

- ayrı Horizons adapter ve target registry
- metadata taşıyan normalize position modeli
- doğrudan Horizons referans testleri
- tek simulation date/time sözleşmesi
- tek CameraRig otoritesi
- kamera sınırları, fallback ve erişilebilir kontrol testleri

---

## 5. Faz ve blok sonu kararları

Her alt fazdan sonra şu sorular cevaplanır:

- Kullanıcı değeri oluştu mu?
- Fazın kendi kabul kriterlerinin tamamı geçti mi?
- Görsel sonuç referans deneyim seviyesinde mi, yoksa yalnızca işlevsel mi?
- Masaüstü ve mobil sanat yönü tutarlı mı?
- Yeni teknik borç nedir?
- Performans geriledi mi?
- Erişilebilirlik bozuldu mu?
- Veri kaynağı değişti mi?
- Doküman güncellenmeli mi?
- Sonraki alt faz için blocker var mı?

Her birleşik blok sonunda ayrıca:

- Alt fazların ayrı checklist’leri kapandı mı?
- Ortak altyapı tekrar veya gereksiz soyutlama üretti mi?
- Görsel kalite blok başındaki hedeften geriledi mi?
- Low/medium/high kalite seviyeleri aynı tasarım yönünü koruyor mu?
- E2E, mobil, klavye ve reduced-motion akışları birlikte geçti mi?
- Sonraki bloğa güvenli geri dönüş noktası oluşturan commit hazır mı?
