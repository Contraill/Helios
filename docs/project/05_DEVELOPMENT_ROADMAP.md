# HELIOS — GELİŞTİRME YOL HARİTASI

**Belge sürümü:** 1.1  
**Güncelleme tarihi:** 17 Temmuz 2026  
**Yürürlük:** Faz 4 tamamlandıktan sonra  
**Koruma notu:** Faz 0–4 kapsamı, görevleri ve kabul kriterleri bu güncellemeyle değiştirilmemiştir.

## 1. Genel yaklaşım

Proje faz bazlı geliştirilecektir. Her faz, çalışır ve doğrulanmış bir dikey veya yatay parça üretir. Bir fazın kabul kriterleri sağlanmadan sonraki faz otomatik başlamaz.

Fazlar ürün kapsamını ve kabul kriterlerini tanımlamaya devam eder. Faz 4 tamamlandıktan sonra, ortak altyapıyı tekrar tekrar kurmamak ve bağlam geçişlerini azaltmak amacıyla Faz 5–11 dört birleşik çalışma bloğu içinde yürütülür. **Birleşen şey kabul kriterleri değil, uygulama akışıdır.** Her faz kendi kalite kapısını, testlerini ve tamamlanma kaydını korur.

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
- Blok C, temel içerik ve etkileşim yüzeyleri tamamlanmadan başlamaz
- Faz 10 sonradan başlayan bir temizlik değildir; Faz 9 boyunca uygulanır ve Blok C sonunda kapsamlı final audit yapılır
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
