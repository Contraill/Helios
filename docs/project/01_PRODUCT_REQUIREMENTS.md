# HELIOS — ÜRÜN GEREKSİNİMLERİ DOKÜMANI

## 1. Ürün özeti

Helios; Güneş, sekiz gezegen ve seçili uzay görevlerini etkileşimli bir 3B deneyim içinde anlatan, bilimsel referans verilerini kişisel karşılaştırmalar ve sinematik bir anlatımla birleştiren web uygulamasıdır.

Kullanıcı yalnızca “Mars’ın çapı kaç kilometredir?” sorusuna cevap almamalıdır. Şu sorulara da anlamlı cevaplar bulabilmelidir:

- Mars’ta kilom ne kadar görünürdü?
- Bir Mars günü benim günlük zaman algıma ne kadar benzer?
- Güneş ışığı Neptün’e ne kadar sürede ulaşır?
- Venüs’te asıl tehlike sıcaklık mı, basınç mı?
- Jüpiter’in “yüzeyi” neden Dünya’daki yüzey kavramıyla aynı değildir?
- Gerçek ölçekte gezegenler neden neredeyse görünmez kalır?
- Güncel bir rover ölçümü ile genel gezegen referans değeri arasındaki fark nedir?

---

## 2. Problem

Mevcut Güneş Sistemi sitelerinin önemli bir kısmı şu uçlardan birine düşmektedir:

- Bilimsel olarak zengin fakat genel kullanıcı için yoğun ve zor
- Görsel olarak etkileyici fakat içerik açısından yüzeysel
- Eğitim odaklı fakat çocuk uygulaması estetiğine yakın
- 3B simülasyon odaklı fakat kişisel ve anlatısal bağ kurmayan
- “Canlı veri” iddiası taşıyan fakat veri kapsamını ve tarihini açıklamayan

Helios bu boşluğu; sinematik görselleştirme, güvenilir veri katmanı, kişisel karşılaştırma ve güçlü bir editoryal arayüzle dolduracaktır.

---

## 3. Ürün hedefleri

### 3.1 Birincil hedefler

- Güneş Sistemi’ni keşfetmeyi sezgisel ve görsel olarak etkileyici hale getirmek
- Gezegenler arasındaki ölçek ve çevre farklarını anlaşılır kılmak
- Kullanıcıyı sayısal bilgilerle boğmadan bilimsel derinlik sağlamak
- Veri kaynaklarını ve güncellik seviyesini şeffaf göstermek
- Creative front-end, full-stack ve ürün tasarımı yetkinliklerini aynı projede göstermek
- Masaüstü, mobil, klavye ve düşük performans koşullarında kullanılabilir olmak

### 3.2 İkincil hedefler

- Uzay görevlerini gezegen anlatısına bağlamak
- Paylaşılabilir gezegen karşılaştırmaları üretmek
- Projenin geliştirme sürecini güçlü bir case study’ye dönüştürmek
- İleride uydular, asteroitler, görev rotaları ve WebXR için genişleyebilir temel kurmak

---

## 4. Hedef dışı konular

İlk sürüm aşağıdakileri hedeflemez:

- Tam N-body fizik simülasyonu
- Navigasyon veya akademik araştırma amacıyla kesin efemeris üretimi
- Tüm bilinen uyduların ve küçük gökcisimlerinin modellenmesi
- Kullanıcı hesabı ve sosyal ağ özellikleri
- VR zorunluluğu
- Yapay zekâ sohbet botu
- Tüm NASA görevlerinin gerçek zamanlı konumu
- Gezegen yüzeyine gerçekçi iniş simülasyonu
- Hava tahmini üretme

---

## 5. Hedef kullanıcılar

### 5.1 Meraklı ziyaretçi

Uzay hakkında temel ilgisi vardır. Teknik terimlere boğulmadan güçlü bir keşif deneyimi ister.

### 5.2 Öğrenci

Gezegenler arasındaki çap, yerçekimi, gün, yıl, atmosfer ve sıcaklık farklarını karşılaştırmak ister.

### 5.3 Creative developer veya tasarımcı

3B web, hareket tasarımı ve bilgi mimarisinin nasıl birleştirildiğini inceler.

### 5.4 İşe alım uzmanı veya teknik değerlendirici

Projenin yalnızca görsel demosunu değil; kod kalitesi, API yaklaşımı, performans, erişilebilirlik ve dokümantasyon olgunluğunu görmek ister.

---

## 6. Temel farklılaştırıcılar

### 6.1 “Orada olsaydın” anlatımı

Her gezegen, kullanıcıyla ilişki kuran hesaplamalar ve duyusal anlatımlarla açıklanır:

- Ağırlık karşılaştırması
- Gezegen yılına göre yaş
- Yerel gün uzunluğu
- Güneş ışığı gecikmesi
- Gökyüzü görünümü
- Basınç ve sıcaklık etkisi
- Atmosferde sesin davranışı
- “Yüzey” kavramının o gezegende ne anlama geldiği

### 6.2 Ölçek dürüstlüğü

İki ayrı deneyim açıkça ayrılır:

- **Keşif ölçeği:** Kullanılabilirlik için boyut ve mesafeler dönüştürülür.
- **Bilimsel ölçek:** Gerçek oranların neden ekran üzerinde kullanışsız olduğunu öğretir.

### 6.3 Veri şeffaflığı

Her dinamik veri:

- kaynak,
- veri türü,
- gözlem tarihi,
- alınma tarihi,
- güncellik etiketi

ile birlikte gösterilir.

### 6.4 Editoryal gezegen kimliği

Her gezegen yalnızca farklı renge sahip kart değildir. Kendine özgü:

- başlık,
- anlatı,
- vurgu rengi,
- görsel hareket,
- çevresel odak,
- görev hikâyesi

bulunur.

---

## 7. Deneyim modları

### 7.1 Keşif modu

Varsayılan 3B moddur.

- Gezegen boyutları görünürlük için büyütülür.
- Yörünge mesafeleri sıkıştırılır.
- Yörünge çizgileri ve etiketler açılıp kapatılabilir.
- Kamera kontrollü ve kullanışlıdır.
- Arayüz bunun gerçek ölçek olmadığını belirtir.

### 7.2 Bilimsel ölçek modu

- Boyut ve mesafe oranlarının dramatik farkını gösterir.
- Tam doğrusal ölçek kullanılabilir değilse kullanılan logarithmic veya parçalı dönüşüm açıklanır.
- Görünmeyen gezegenler için işaretçiler kullanılır.
- Mod bir “kesin astronomik simülasyon” gibi sunulmaz.

### 7.3 Sunum modu — MVP sonrası

- Arayüz sadeleşir.
- Kamera otomatik tur yapar.
- Kullanıcı etkileşimi turu durdurur.
- Portföy sunumu ve demo videosu için kullanılır.

---

## 8. Bilgi mimarisi ve route’lar

Önerilen route yapısı:

```text
/
├── /explore
├── /planet/[slug]
├── /compare
├── /missions
├── /data
├── /about
├── /case-study
└── /api/...
```

### 8.1 Ana sayfa

- Kısa ve güçlü hero
- Proje fikri
- Sekiz gezegene hızlı giriş
- Seçili güncel NASA içeriği
- Bilimsel veri yaklaşımı
- Keşfe başlama çağrısı
- Case study bağlantısı

### 8.2 Keşif sayfası

- Tam ekran 3B sahne
- Gezegen seçimi
- Kamera kontrolü
- Zaman ve ölçek kontrolleri
- Bilgi paneli
- Mobil bottom sheet
- Klavye alternatif navigasyonu

### 8.3 Gezegen detay sayfası

- Sinematik hero
- Temel değerler
- “Burada olsaydın”
- Atmosfer ve yüzey
- Gün, yıl ve mevsimler
- Sıcaklık ve basınç
- Uydular ve halkalar
- Öne çıkan görevler
- Görsel galeri
- Veri kaynakları
- Önceki / sonraki gezegen

### 8.4 Karşılaştırma sayfası

İki gezegen şu alanlarda karşılaştırılır:

- çap,
- kütle,
- yerçekimi,
- ortalama Güneş uzaklığı,
- yörünge süresi,
- dönüş süresi,
- eksen eğikliği,
- ortalama sıcaklık,
- atmosfer,
- uydu sayısı,
- kaçış hızı,
- ışık ulaşma süresi,
- kullanıcı ağırlığı.

Tabloya ek olarak oransal görselleştirme bulunmalıdır.

### 8.5 Veri sayfası

- Veri kaynakları
- Güncellik etiketleri
- Referans veri ve gözlemsel veri ayrımı
- Ölçek dönüşümleri
- Yuvarlama politikası
- API kesintisi yaklaşımı
- Görsel ve metin atıfları
- Bilimsel sınırlar

### 8.6 Case study sayfası

- Problem ve hedef
- Rakip / benzer ürün analizi
- Tasarım keşifleri
- Mimari kararlar
- Ölçek problemi
- API ve cache yaklaşımı
- Performans optimizasyonları
- Erişilebilirlik
- Hatalar ve düzeltmeler
- Ölçümler
- Gelecek yol haritası

---

## 9. Ana kullanıcı akışları

### 9.1 İlk ziyaret

1. Kısa ve atlanabilir giriş
2. “Sistemi Keşfet” çağrısı
3. Genel Güneş Sistemi görünümü
4. Gezegen seçimi
5. Kamera yakınlaşması
6. Özet panel
7. Detay sayfası

### 9.2 Kişisel karşılaştırma

1. Kullanıcı bir gezegen sayfasını açar
2. Dünya üzerindeki kilosunu girer
3. Gezegen yerçekimine göre sonucu görür
4. Açıklama, kütlenin değişmediğini; ağırlık hissinin değiştiğini belirtir
5. Değer isteğe bağlı olarak yalnızca cihazda saklanır

### 9.3 Gezegen karşılaştırma

1. Kullanıcı iki gezegen seçer
2. URL query parametreleri güncellenir
3. Oransal boyut görseli ve veri kartları oluşur
4. Paylaşılabilir bağlantı üretilebilir

### 9.4 API kesintisi

1. Harici servis başarısız olur
2. Uygulama genel içeriği göstermeye devam eder
3. Dinamik bölüm “şu anda kullanılamıyor” veya “son başarılı kayıt” durumuna geçer
4. Kullanıcıya ham hata veya boş kart gösterilmez

---

## 10. MVP özellikleri

### 10.1 Zorunlu

- Güneş ve sekiz gezegen
- Animasyonlu yörüngeler
- Eksen dönüşleri
- Seçilebilir gezegenler
- Sinematik kamera focus
- Genel görünüşe dönüş
- Gezegen özet paneli
- Sekiz dinamik gezegen sayfası
- Kilo ve yaş karşılaştırması
- Işık ulaşma süresi
- Keşif / bilimsel ölçek geçişi
- Zaman hızı ve pause
- Etiket ve yörünge görünürlüğü
- Mobil dokunmatik kullanım
- Klavye navigasyonu
- Reduced motion
- Low / medium / high kalite seçimi
- WebGL fallback
- En az iki güvenilir NASA veri entegrasyonu
- Veri kaynağı ve güncellik etiketi
- API fallback’i
- Türkçe ve İngilizceye uygun içerik modeli
- SEO metadata
- Case study sayfası

### 10.2 MVP sonrası

- Önemli uydular
- Cüce gezegenler
- Asteroit görselleştirmeleri
- Görev rotaları
- Otomatik sunum turu
- WebXR
- Kullanıcı favorileri
- Gelişmiş sonifikasyon
- Yüzey keşfi
- Daha kesin Kepler hareketi
- Anlık konuma göre Dünya–gezegen iletişim gecikmesi

---

## 11. “Burada olsaydın” modülü

### 11.1 Ağırlık

```ts
planetWeight = earthWeight * (planetGravity / earthGravity);
```

Arayüz notu:

- Kullanıcının kütlesi değişmez.
- Gösterilen değer, Dünya’daki tartı karşılığına benzetilmiş ağırlık farkıdır.
- Sonuçlar gereksiz ondalık hassasiyetle gösterilmez.

### 11.2 Yaş

- Dünya günü cinsinden geçen süre hesaplanır.
- Gezegen yörünge süresine bölünür.
- “Bu gezegende X yaşında olurdun” ifadesinin yıl tanımına dayandığı açıklanır.

### 11.3 Yerel gün

- Sidereal rotation ve solar day farklıysa içerikte ayrılır.
- Venüs gibi sıra dışı örneklerde tek bir “gün” rakamı belirsiz bırakılmaz.

### 11.4 Çevresel deneyim

Her gezegende aynı başlıkların tamamı zorunlu değildir. Gezegenin karakterini en iyi anlatan konular seçilir:

- gökyüzü,
- ışık,
- basınç,
- sıcaklık,
- rüzgâr,
- yüzey / bulut katmanı,
- yerçekimi,
- ses,
- radyasyon,
- koruyucu ekipman gereksinimi.

Kesin hayatta kalma süresi uydurulmaz.

---

## 12. İçerik modeli

Her gezegen için:

- ad ve kısa tanım,
- ana anlatı,
- temel fiziksel veriler,
- yörünge,
- dönüş,
- çevre,
- atmosfer,
- uydular,
- halkalar,
- duyusal anlatım,
- görevler,
- kaynaklar

aynı domain modeli içinde bulunmalıdır.

İçerik iki katmana ayrılabilir:

- **Referans veri:** sayısal ve kaynaklı değerler
- **Editoryal içerik:** Türkçe / İngilizce açıklamalar ve hikâye

---

## 13. Başarı ölçütleri

### 13.1 Kullanıcı deneyimi

- İlk 5–10 saniye içinde ürünün amacı anlaşılır.
- Bir gezegen seçmek ve overview’e dönmek kolaydır.
- Mobilde kritik özellikler kullanılabilir.
- Bilimsel ölçek farkı anlaşılır.
- Kaynak etiketi kullanıcıyı boğmadan erişilebilir.

### 13.2 Teknik kalite

- Ana sayfa keşif bundle’ına bağımlı değildir.
- API key istemciye sızmaz.
- Dinamik veri kesildiğinde temel deneyim devam eder.
- Kritik hesaplamalar testlidir.
- 3B sahne frame-rate bağımsızdır.
- WebGL fallback çalışır.
- Build, typecheck, lint ve testler CI’da geçer.

### 13.3 Portföy değeri

- README ve case study alınan kararları açıklar.
- Kod yapısı tek bir dev component’e dayanmaz.
- Performans optimizasyonları ölçümle gösterilir.
- Veri sınırlamaları dürüstçe açıklanır.
- Proje özgün bir ürün kimliği taşır.

---

## 14. MVP kabul özeti

MVP, yalnızca sekiz gezegen göründüğünde tamamlanmış sayılmaz. Aşağıdakilerin birlikte çalışması gerekir:

- 3B keşif
- gezegen detayları
- kişisel hesaplamalar
- karşılaştırma
- veri şeffaflığı
- mobil kullanım
- erişilebilir fallback
- performans modu
- en az iki kaliteli dinamik veri entegrasyonu
- test ve dokümantasyon
