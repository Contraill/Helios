# HELIOS — GELİŞTİRME RUNBOOK’U

Bu belge tekrar eden geliştirme ve inceleme işlerinin kısa kontrol listelerini içerir. Ayrıntılı gereksinimler için aynı klasördeki ana belgelere bakılır.

## 1. Yeni çalışma oturumu

- `00_START_HERE.md` ve son faz raporunu oku.
- Repository’nin güncel branch, commit ve çalışma ağacı durumunu doğrula.
- Son tamamlanan fazı ve açık blocker’ları özetle.
- Kod ile belgeler arasında ayrışma olup olmadığını kontrol et.
- Yalnızca istenen kapsamda ilerle.

## 2. Faz uygulama

- İlgili fazın hedefini ve kabul kriterlerini çıkar.
- Mevcut kodu incelemeden yeni mimari kurma.
- 5–8 maddelik uygulama planı hazırla.
- Sonraki fazın özelliklerini erken ekleme.
- Sahte veya çalışıyormuş gibi görünen placeholder bırakma.
- Değişikliklerden sonra format, lint, typecheck, test ve build çalıştır.
- Faz raporunu gerçek sonuçlarla güncelle.

## 3. Kod incelemesi

Bulguları önem sırasıyla sınıflandır:

- **P0:** güvenlik veya ciddi veri doğruluğu
- **P1:** temel işlev, performans veya erişilebilirlik
- **P2:** sürdürülebilirlik ve test
- **P3:** polish

Özellikle kontrol et:

- her frame React state güncellemesi,
- hızlı state’in reaktif store’a bağlanması,
- Three.js resource leak,
- gereksiz remount,
- API key sızıntısı,
- belirsiz cache davranışı,
- eksik Zod doğrulaması,
- mobil ve klavye sorunları,
- kaynaksız bilimsel iddia,
- test edilmeyen hesaplamalar,
- aşırı büyük component’ler,
- gereksiz soyutlama.

## 4. Hata düzeltme

1. Beklenen davranışı tanımla.
2. Gerçek davranışı yeniden üret.
3. En küçük güvenilir yeniden üretim senaryosunu oluştur.
4. Kök nedeni belirle.
5. En küçük güvenli düzeltmeyi uygula.
6. Regression testi ekle.
7. Erişilebilirlik, performans ve veri etkisini kontrol et.

Semptomu gizleyen rastgele timeout veya retry ekleme.

## 5. Bilimsel içerik incelemesi

Her alan için:

- Kaynak var mı?
- Birincil veya resmî kaynak mı?
- Değerin tanımı ve birimi açık mı?
- Değişebiliyorsa tarihi var mı?
- Ortalama, minimum ve maksimum ayrılmış mı?
- Gaz ve buz devlerinde “yüzey” dili doğru mu?
- Gözlem tüm gezegene genellenmiş mi?
- Güncellik etiketi doğru mu?
- Editoryal anlatı bilimle çelişiyor mu?
- Gereksiz kesinlik var mı?

## 6. Tasarım incelemesi

- NASA Eyes kopyası gibi mi?
- Generic dashboard görünümü var mı?
- Her gezegenin kendine ait odağı var mı?
- Kamera kontrol kaybı yaratıyor mu?
- Mobil bottom sheet kullanılabilir mi?
- Kritik özellik hover’a bağlı mı?
- Kaynak etiketleri erişilebilir mi?
- Reduced motion gerçek fark oluşturuyor mu?
- Bloom veya blur içerik hiyerarşisini bozuyor mu?
- Loading, empty ve error durumları tasarlanmış mı?

## 7. Performans incelemesi

Ölç:

- ana sayfa ve explore route JS boyutu,
- texture belleği,
- draw call ve triangle sayısı,
- DPR,
- frame-loop allocation,
- React re-render,
- material ve geometry sayısı,
- post-processing maliyeti,
- low/medium/high kalite farkı,
- tekrarlanan API istekleri.

En yüksek etkili düzeltmelerde önce/sonra ölçümü kaydet.

## 8. Commit öncesi

- Kapsam dışı değişiklik var mı?
- Secret veya hassas veri var mı?
- Debug log, `any`, kullanılmayan kod var mı?
- Test ve dokümantasyon güncel mi?
- Yeni dependency gerçekten gerekli mi?
- Bundle veya asset bütçesi değişti mi?
- Dosyalarda araç adı, otomatik üretim dipnotu veya ortak-yazar etiketi var mı?
- Commit mesajı değişikliğin gerçek kapsamını anlatıyor mu?

## 9. Yayın öncesi

- CI yeşil mi?
- Production environment doğru mu?
- Mobil, klavye, reduced motion ve WebGL fallback kontrol edildi mi?
- API kesintisi temel deneyimi bozuyor mu?
- Sitemap, robots, metadata ve 404 hazır mı?
- README, karar kayıtları ve bilinen sınırlamalar güncel mi?
