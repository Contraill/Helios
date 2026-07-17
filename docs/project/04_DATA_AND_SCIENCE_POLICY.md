# HELIOS — VERİ, BİLİMSEL DOĞRULUK VE KAYNAK POLİTİKASI

## 1. Amaç

Bu belge, Helios içinde kullanılan bilimsel değerlerin, NASA verilerinin, görev ölçümlerinin, görsellerin ve anlatısal yorumların nasıl ele alınacağını tanımlar.

Temel ilke:

> Bir veriyi göstermek kadar, o verinin neyi temsil etmediğini açıklamak da ürünün sorumluluğudur.

---

## 2. Veri sınıfları

### 2.1 Referans veri

Uzun süre değişmeyen veya seyrek güncellenen değerler:

- gezegen yarıçapı,
- kütle,
- ortalama yerçekimi,
- yörünge süresi,
- dönüş süresi,
- ortalama Güneş uzaklığı,
- atmosferin ana bileşenleri,
- kaçış hızı.

Etiket: `reference`

### 2.2 Tarihsel gözlem

Geçmiş bir görev veya araç tarafından belirli zaman ve konumda ölçülen değer:

- InSight ölçümü
- belirli rover sol verisi
- geçmiş uzay hava olayı
- belirli tarihli görüntü.

Etiket: `historical`

### 2.3 Son mevcut veri

Kaynağın sunduğu en yeni kayıt, fakat bugüne ait olma garantisi yoktur.

Etiket: `latest-available`

UI örneği:

> Son mevcut Curiosity çevre ölçümü — gözlem tarihi: 14 Temmuz 2026

### 2.4 Yakın canlı veri

Belirli gecikmeyle düzenli güncellenen kaynak.

Etiket: `near-live`

Gecikme veya güncelleme aralığı açıklanmalıdır.

### 2.5 Canlı veri

Gerçekten devam eden ve çok kısa gecikmeli akış.

Etiket: `live`

Bu etiket istisnai kullanılmalıdır.

---

## 3. Her dinamik kaydın metadata’sı

```ts
interface ObservationMetadata {
  provider: string;
  sourceTitle: string;
  sourceUrl: string;
  freshness: DataFreshness;
  observedAt?: string;
  retrievedAt: string;
  location?: string;
  instrument?: string;
  notes?: LocalizedText;
}
```

Zorunlu ayrım:

- `observedAt`: ölçüm veya olay zamanı
- `retrievedAt`: Helios’un veriyi aldığı zaman

Bu iki tarih aynı şey değildir.

---

## 4. NASA entegrasyon adayları

NASA Open APIs kataloğu uygulama sırasında yeniden kontrol edilmelidir:

- https://api.nasa.gov/

### 4.1 APOD

Kullanım:

- Ana sayfada günün uzay görseli
- Tarih, başlık, kısa açıklama
- Görsel veya video türü

Kurallar:

- Video response’u görsel gibi işlenmez
- Açıklama çok uzunsa editoryal özet oluşturulabilir; kaynak metin uzun biçimde kopyalanmaz
- Günlük cache
- Medya lazy load
- Kaynak ve copyright alanı korunur

### 4.2 Near Earth Object Web Service

Kullanım:

- Dünya’ya yaklaşan nesneler
- Tahmini çap
- kaçırma mesafesi
- göreli hız
- yaklaşma tarihi
- potansiyel tehlike sınıflandırması

Kurallar:

- “Potansiyel olarak tehlikeli” sınıfı “Dünya’ya çarpacak” şeklinde çevrilmez
- Tarih aralığı sınırlandırılır
- Ham response UI’a aktarılmaz
- Birimler normalize edilir

### 4.3 Mars Rover Photos veya görev görsel kaynağı

Kullanım:

- Mars sayfasında görev galerisi
- Rover, kamera ve tarih filtreleri
- Görev bağlamı

Kurallar:

- Endpoint’in güncel katalogda bulunup bulunmadığı uygulama anında doğrulanır
- Boş sonuç hata değildir
- Görsel tarihi ve kamera adı gösterilir
- Büyük listeler sınırlandırılır

### 4.4 Mars çevresel ölçümleri

En riskli entegrasyondur.

- Bir rover ölçümü belirli konuma ve zamana aittir
- Tek nokta ölçümü tüm Mars’ın “hava durumu” değildir
- Eski InSight API veya veri seti tarihsel kaynak olarak ele alınmalıdır
- Güncel ve resmî, kararlı bir endpoint doğrulanmadan “Mars bugün” widget’ı yapılmamalıdır
- Scraping, kritik ürün bağımlılığı olmamalıdır

Önerilen UI etiketleri:

- `Curiosity — latest available observation`
- `InSight — historical observation`
- `Mars planetary reference range`
- `No recent observation available`

---

## 5. NASA Eyes ile konumlandırma

NASA’nın Eyes on the Solar System ürünü kapsamlı, simüle edilmiş 3B Güneş Sistemi, zaman kontrolü, küçük gökcisimleri ve görevler sunar.

Resmî kaynaklar:

- https://science.nasa.gov/eyes/
- https://eyes.nasa.gov/apps/solar-system

Bu nedenle Helios’un değeri “NASA Eyes’tan daha çok nesne göstermek” değildir. Helios:

- daha kişisel,
- daha editoryal,
- daha sınırlı ama derin,
- gezegenler arası gündelik karşılaştırmalara odaklı,
- veri güncellik dilini görünür kılan

bir ürün olarak konumlanmalıdır.

---

## 6. Referans gezegen verisi

Önerilen kaynak önceliği:

1. NASA Science gezegen sayfaları
2. NASA fact sheet veya görev sayfaları
3. JPL / NAIF gibi NASA birimleri
4. Hakemli veya resmî bilim kurumları
5. İkincil kaynaklar yalnızca açıklayıcı destek için

Her değer kaynak registry’de kaydedilmelidir.

Örnek:

```ts
{
  id: "nasa-mars-overview",
  provider: "NASA",
  title: "Mars",
  url: "https://science.nasa.gov/mars/",
  sourceType: "article",
  freshness: "reference"
}
```

---

## 7. Değişebilen değerler

Aşağıdaki veriler tarih gerektirir:

- uydu sayısı,
- aktif görev durumu,
- en yeni rover ölçümü,
- NEO yaklaşmaları,
- görev takvimi,
- keşif veya sınıflandırma bilgisi.

Örneğin `moonCount` tek başına tutulmamalıdır:

```ts
moons: {
  count: 95,
  countAsOf: "YYYY-MM-DD",
  sourceId: "..."
}
```

Uygulama anında gerçek rakam resmi kaynakla doğrulanır; bu belgedeki örnek rakamlar kullanılmaz.

---

## 8. Sıcaklık ve “yüzey” problemi

Gezegen sıcaklığı tek, kolay bir alan değildir.

- Gaz devlerinde katı yüzey yoktur
- “Sıcaklık” belirli basınç seviyesinde veya bulut tepesinde tanımlanabilir
- Venüs’te yüzey sıcaklığı ile bulut katmanı çok farklıdır
- Mars’ta gün, gece, konum ve mevsim büyük fark yaratır
- Merkür’de aydınlık ve karanlık yüzey arasında aşırı fark bulunur

Bu nedenle modelde tanım alanı zorunludur:

```ts
temperature: {
  averageC?: number;
  minimumC?: number;
  maximumC?: number;
  definition:
    | "surface"
    | "cloud-top"
    | "reference-level"
    | "location-observation"
    | "not-applicable";
}
```

---

## 9. Atmosfer verisi

- Yüzdeler yaklaşık ise `approximately` notu
- Trace bileşenler gereksiz hassasiyetle gösterilmez
- Atmosfer olmayan veya çok ince eksosfer bulunan cisimlerde doğru terminoloji
- Basınç birimi kullanıcıya uygun biçimde dönüştürülür
- Dünya deniz seviyesi karşılaştırması açıklayıcı olabilir

---

## 10. “Hayatta kalma” dili

Helios tıbbi veya yaşam destek hesaplayıcısı değildir.

Kaçınılacak:

- kesin saniye cinsinden yaşam süresi,
- koruyucu ekipmanla ilgili garanti,
- insan fizyolojisini aşırı basitleştirme.

Tercih:

- temel tehlikeleri sıralama,
- korumasız ortamın yaşanabilir olmadığını açıklama,
- sıcaklık, basınç, oksijen, radyasyon ve yüzey durumu gibi ayrı nedenleri belirtme.

---

## 11. Duyusal anlatım politikası

Duyusal metinler iki türe ayrılır:

### Doğrudan bilimsel çıkarım

Örnek:

> İnce Mars atmosferi nedeniyle ses Dünya’ya kıyasla daha zayıf ve farklı yayılırdı.

Kaynak veya bilimsel dayanak bulunmalıdır.

### Editoryal benzetme

Örnek:

> Güneş, Neptün gökyüzünde uzaktaki keskin bir ışık gibi görünürdü.

Bu tür metinler şiirsel olabilir fakat bilimsel gerçeğe ters düşmemelidir. Kesin ölçüm gibi yazılmamalıdır.

---

## 12. API hata ve fallback politikası

Her entegrasyon üç katmanlı olmalıdır:

1. Güncel normal response
2. Son başarılı normalize edilmiş snapshot
3. Statik açıklayıcı fallback

UI durumları:

- `current`
- `stale`
- `fallback`
- `unavailable`

`stale` kullanıldığında gözlem ve cache tarihi görünür.

---

## 13. Doğrulama

Harici response:

- Zod ile doğrulanır
- Beklenmeyen alanlara güvenilmez
- `null`, eksik array ve birim farkları ele alınır
- Tarih ISO formatına normalize edilir
- Sayısal string’ler kontrollü parse edilir
- `NaN` domain katmanına geçmez

---

## 14. Rate limit ve anahtar

NASA API anahtarı server tarafında kalır.

- İstemci bundle’ına yazılmaz
- Kullanıcı başına gereksiz proxy çağrısı üretilmez
- Cache zorunludur
- `DEMO_KEY` production çözümü değildir
- Rate limit hatası normalleştirilir
- API katalog ve limit bilgileri deployment öncesi tekrar doğrulanır

---

## 15. Görsel ve telif

- Görsel sağlayıcı ve copyright alanı korunur
- NASA içeriğinin kullanım kuralları incelenir
- NASA logosu ürünün resmî NASA uygulaması olduğu izlenimini verecek şekilde kullanılmaz
- Üçüncü taraf texture lisansları repository’de kayıt altına alınır
- Kaynaksız Pinterest / wallpaper görselleri kullanılmaz
- AI ile oluşturulan görseller bilimsel fotoğraf gibi sunulmaz
- “Enhanced color”, “artist concept” veya “simulation” bilgisi gerekiyorsa gösterilir

---

## 16. Kaynak registry

Önerilen dosya:

```text
content/sources/
├── planetary-reference.ts
├── nasa-apis.ts
├── mission-sources.ts
└── image-attributions.ts
```

Her kaynak için:

- id
- provider
- title
- URL
- veri türü
- güncellik türü
- erişim tarihi
- lisans / attribution notu
- hangi alanlarda kullanıldığı

tutulur.

---

## 17. Fact-check workflow

Yeni içerik eklenirken:

1. İddia türünü belirle
2. Birincil kaynak bul
3. Değerin tanımını kontrol et
4. Birimini normalize et
5. Tarih gerekip gerekmediğini belirle
6. İkinci kaynakla çelişki kontrolü yap
7. Kaynak registry’ye ekle
8. İçerikte uygun hassasiyet kullan
9. Test veya schema ekle
10. Case study’de önemli veri kararını kaydet

---

## 18. Veri kabul kriterleri

- Dinamik verinin kaynağı ve tarihi görünür
- “Canlı” etiketi yanlış kullanılmaz
- Rover verisi tüm gezegene genellenmez
- Gaz devinde yüzey sıcaklığı belirsiz bırakılmaz
- Değişebilir değerlerin tarih bilgisi vardır
- API yokken temel gezegen sayfası çalışır
- Ham response UI’a sızmaz
- Görsellerin attribution kaydı vardır
- Referans değerler birincil kaynakla desteklenir
