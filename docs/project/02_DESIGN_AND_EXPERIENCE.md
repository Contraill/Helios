# HELIOS — TASARIM VE DENEYİM SİSTEMİ

## 1. Deneyim hedefi

Helios’un ana duygusu “kontrol paneli kullanmak” değil, sessiz ve merak uyandıran bir keşif yapmaktır. Arayüz, gezegenleri göstermeye hizmet etmeli; görsel efektler ürünün kendisine dönüşmemelidir.

Ana nitelikler:

- sinematik,
- editoryal,
- sakin,
- teknik,
- karanlık fakat okunaklı,
- geniş boşluk kullanan,
- her gezegenin doğal karakterini öne çıkaran.

Kaçınılacak estetikler:

- aşırı neon cyberpunk,
- çocuk eğitim uygulaması,
- kurumsal analitik dashboard,
- her yerde glassmorphism,
- yüksek bloom nedeniyle detayların kaybolması,
- aynı kart bileşeninin sekiz farklı renkte tekrarı.

---

## 2. Açılış deneyimi

### 2.1 İlk ziyaret

- Koyu ekran üzerinde küçük bir ışık veya Güneş parlaması
- Proje adı ve tek cümlelik tanım
- “Sistemi Keşfet” eylemi
- Kullanıcı etkileşiminden sonra sahnenin açılması
- Toplam giriş kısa ve atlanabilir olmalıdır

### 2.2 Tekrar ziyaret

- Giriş animasyonu azaltılabilir veya atlanabilir
- Kullanıcının kalite, dil ve hareket tercihleri korunabilir
- Kullanıcı doğrudan keşif ekranına yönlendirilebilir

### 2.3 Reduced motion

- Uzun kamera uçuşları yerine kısa fade / position geçişi
- Parallax azaltılır
- Otomatik dönme ve sürekli dekoratif hareket minimuma iner

---

## 3. Keşif ekranı yerleşimi

### Masaüstü

- Merkezde 3B Canvas
- Sol üstte logo ve ana navigasyon
- Sağ tarafta seçili gezegen paneli
- Alt veya sağ alt bölgede zaman / ölçek / kalite kontrolleri
- Gezegen navigator’ı ekran altında veya kenarda
- “Gerçek ölçek değil” gibi durum açıklamaları görünür fakat baskın değildir

### Tablet

- Daraltılmış panel
- Kritik kontroller açık, ikincil kontroller menüde
- Dokunmatik hedefler en az rahat kullanım boyutunda
- Kamera ve sayfa scroll hareketleri çakışmamalı

### Mobil

- Canvas üst bölümde veya tam ekran
- Gezegen bilgisi bottom sheet
- Gezegen seçimi yatay kaydırmalı liste
- Kritik özellik hover gerektirmez
- Kamera kontrolü ile sayfa kaydırma arasında net davranış
- Kalite seviyesi otomatik önerilebilir fakat kullanıcı değiştirebilir

---

## 4. Kamera deneyimi

Kamera hareketi projenin karakteridir; fakat kontrol kaybı hissi yaratmamalıdır.

### 4.1 Modlar

- `overview`
- `focus`
- `free`
- `transition`
- `tour` — sonraki sürüm

### 4.2 Gezegen seçimi

1. Yeni seçim alınır
2. Önceki geçiş kontrollü biçimde iptal edilir
3. Gezegenin dünya koordinatı hesaplanır
4. Kamera hedef mesafesi gezegen yarıçapına göre belirlenir
5. Kamera easing ile yaklaşır
6. Panel hareket bitmeden hafifçe görünmeye başlayabilir
7. `Escape` overview’e döner

### 4.3 Güvenlik kuralları

- Kamera gezegenin içine girmez
- Satürn halkalarını kesen kötü açılardan kaçınılır
- Hızlı art arda seçimlerde kamera titremez
- Kullanıcı manuel kontrol başlattığında otomatik geçiş iptal olabilir
- Focus konumu farklı ekran oranlarında test edilir

---

## 5. Gezegen etkileşimi

### Hover

- İsim ve kısa etiket
- Hafif outline veya atmosfer vurgusu
- Cursor değişimi
- Büyük scale sıçraması yok

### Click / touch

- Seçim durumu
- Kamera focus
- Özet paneli
- URL veya state senkronizasyonu
- Seçili nesne için görünür durum

### Klavye

- Gezegen listesinde ok tuşları veya Tab ile gezinme
- Enter / Space ile seçim
- Escape ile çıkış
- Görünür focus halkası
- Canvas dışındaki semantik buton listesi

---

## 6. Gezegen detay sayfası

Her sayfa ortak bir sistem kullanır, ancak gezegenin karakterine göre vurgu değişir.

### Ortak bölüm yapısı

1. Hero
2. Kısa gezegen portresi
3. Temel fiziksel değerler
4. Burada olsaydın
5. Gün, yıl ve ışık
6. Atmosfer ve çevre
7. Yüzey veya katman yapısı
8. Uydular ve halkalar
9. Öne çıkan görevler
10. Görsel içerik
11. Kaynaklar
12. Diğer gezegene geçiş

### Gezegen bazlı vurgu örnekleri

- **Merkür:** sıcaklık farkı, uzun gündüz/gece, kraterli yüzey
- **Venüs:** basınç, sera etkisi, retrograde dönüş, yüzey görüşü
- **Dünya:** yaşam, sıvı su, manyetosfer, karşılaştırma referansı
- **Mars:** rover ölçümleri, ince atmosfer, toz, insan keşfi
- **Jüpiter:** gaz devi, fırtınalar, katı yüzeyin olmaması, manyetosfer
- **Satürn:** halka yapısı, yoğunluk, uydular
- **Uranüs:** aşırı eksen eğikliği, mevsimler, buz devi
- **Neptün:** rüzgâr, uzaklık, düşük ışık, mavi atmosfer

---

## 7. “Burada olsaydın” tasarımı

Bu bölüm eğlenceli görünürken bilimsel çerçeveyi korumalıdır.

### Bileşenler

- Dünya kilosu input’u
- Gezegen ağırlık sonucu
- Yaş karşılaştırması
- Yerel gün / yıl
- Güneş ışığı gecikmesi
- Ortam kartları
- Kısa açıklama ve bilgi tooltip’i

### Dil tonu

İyi:

> Neptün’de Güneş, Dünya’dan gördüğümüzden çok daha küçük ve soluk görünürdü. Gündüz kavramı bile karanlığa daha yakın hissedebilirdi.

Kaçınılacak:

> Neptün’de gündüz tamamen karanlıktır.

İyi:

> Jüpiter’in görünür bulut katmanlarının altında katı bir yüzeye basamazdın; basınç derine indikçe hızla artardı.

Kaçınılacak:

> Jüpiter’in yüzey sıcaklığı X’tir.

---

## 8. Karşılaştırma deneyimi

### Seçim

- İki bağımsız selector
- Aynı gezegen seçildiğinde kullanıcıya anlamlı geri bildirim
- URL’de paylaşılabilir durum
- Son karşılaştırmanın cihazda saklanması opsiyonel

### Görselleştirme

- Oransal çap daireleri veya 3B küreler
- Sayısal veri kartları
- Gün/yıl için zaman ölçeği
- Yerçekimi için insan silueti veya basit gösterge
- Atmosfer bileşimi için erişilebilir barlar

### Yanıltıcılığı önleme

- Çap görseli area ve radius farkı nedeniyle açıklanmalı
- Çok büyük oranlarda minimum görünür boyut kullanılırsa bu belirtilmeli
- Farklı birimler aynı satırda karıştırılmamalı

---

## 9. Görsel tasarım sistemi

### 9.1 Renk

Temel arayüz:

- Arka plan: siyaha yakın
- Yüzey: koyu grafit
- Birincil metin: sıcak beyaz
- İkincil metin: düşük kontrastlı gri fakat WCAG açısından okunabilir
- Çizgiler: düşük opaklıklı açık renk

Gezegen vurgu renkleri veri modelinden gelebilir:

- Merkür: taş grisi
- Venüs: amber
- Dünya: okyanus mavisi
- Mars: oksit kırmızısı
- Jüpiter: sıcak bej
- Satürn: soluk altın
- Uranüs: buz mavisi
- Neptün: derin mavi

Vurgu rengi büyük metin alanlarında otomatik olarak kullanılmamalı; kontrast kontrolü yapılmalıdır.

### 9.2 Tipografi

- Bir display / editorial başlık fontu
- Bir okunaklı sans-serif gövde fontu
- Teknik değerlerde tabular numerals
- Küçük uppercase etiketler sınırlı kullanım
- Mobilde başlık ölçekleri taşma testinden geçirilir

### 9.3 Paneller

- Hafif saydamlık
- İnce border
- Sınırlı blur
- Büyük iç boşluk
- Veri kaynağı ve tarih için net alt bölüm
- Aşırı cam efekti yok

---

## 10. Hareket sistemi

### 10.1 DOM animasyonları

Motion for React veya benzeri çözüm:

- panel açılışı,
- route geçişi,
- accordion,
- bottom sheet,
- kart vurgusu.

### 10.2 3B animasyonlar

React Three Fiber / Three.js:

- yörünge,
- eksen dönüşü,
- kamera,
- atmosfer,
- seçili gezegen vurgusu.

DOM animasyon sistemi ile sahne frame loop’u karıştırılmamalıdır.

### 10.3 Süre ve easing

- Kamera geçişleri gezegen uzaklığına göre sınırlı aralıkta
- UI panelleri kameradan daha hızlı
- Birbiriyle yarışan beş animasyon kullanılmaz
- Kullanıcının tekrar tıklaması gecikmeden işlenir

---

## 11. Ses

Ses opsiyoneldir.

- Otomatik başlamaz
- Kullanıcı açıkça etkinleştirir
- Sessiz kullanım hiçbir özelliği kaybetmez
- Uzay boşluğunda ses yayıldığı iddia edilmez
- Sonifikasyon veya görev kaydı kullanılırsa kaynak gösterilir
- Ses kontrolü kalıcı tercihler arasında olabilir

---

## 12. Loading, empty ve error durumları

### Loading

- Sahte uzun yükleme animasyonu yok
- Texture veya Canvas hazırlanırken kısa durum mesajı
- İçerik skeleton’ı aşırı titreşmez
- APOD gibi medya içerikleri lazy load

### Empty

- Belirli tarih veya kamera için rover görseli yoksa neden açıklanır
- `0 results` teknik metni gösterilmez
- Kullanıcı filtreyi değiştirebilir

### Error

- “NASA verisine şu anda ulaşılamıyor”
- “Son başarılı kayıt gösteriliyor”
- “Bu içerik için referans veri kullanılmaktadır”
- Retry eylemi yalnızca anlamlıysa gösterilir

---

## 13. Erişilebilirlik tasarımı

- Gezegenlerin semantik listesi
- Canvas için anlamlı açıklama
- Klavye kontrolleri yardım paneli
- Focus görünürlüğü
- Reduced motion
- Kontrast testi
- Form label ve hata bağlantısı
- Bottom sheet focus yönetimi
- Modal focus trap
- Renk dışı durum göstergesi
- WebGL fallback
- Screen reader için kısa, düzenli veri özetleri

3B sahne ekran okuyucu için anlamsız bir kara kutu olmamalıdır.

---

## 14. Mobil kontrol ilkeleri

- Tek parmak orbit / swipe davranışı tutarlı
- Pinch zoom sınırlandırılır
- Scroll edilen detay paneli ile sahne kontrolü ayrılır
- Küçük gezegenlerin touch hedefi görünür geometriden daha büyük olabilir
- Kontrol ikonlarının metin etiketi veya tooltip’i bulunur
- Kritik kontroller ekran kenarında çakışmaz

---

## 15. Görsel içerik ve texture politikası

- Kaynak ve kullanım hakkı kaydedilir
- Texture çözünürlüğü cihaz seviyesine göre seçilir
- NASA görselleri olduğu gibi bütün sayfayı kaplayan arka plan yerine editoryal bağlamda kullanılır
- Renk düzeltme bilimsel görünümü tamamen değiştirecek düzeyde yapılmaz
- Görsel temsil ile gerçek renk / geliştirilmiş renk ayrımı gerekiyorsa belirtilir

---

## 16. Tasarım kabul kriterleri

- Kullanıcı bir gezegeni seçtiğini açıkça anlar
- Kamera geçişi bulantı veya kontrol kaybı yaratmaz
- Mobil panel sahneyi tamamen kullanılmaz hale getirmez
- Her gezegen sayfası kendine özgü bir odak taşır
- Kaynak etiketleri görünür fakat ana anlatıyı bölmez
- Hareket azaltma modu gerçek fark oluşturur
- WebGL fallback estetik olarak kırık görünmez
- UI, hazır component library demosu gibi görünmez
