# Faz 5 Sonu — Acceptance Fix Sonrası

## Tamamlananlar

- Pause, resume, 0.25× / 1× / 4× / 16× zaman hızı ve deterministik reset
- Keşif ve bilimsel ölçek modları
- Yörünge ve etiket görünürlüğü
- Low, medium ve high kalite seviyeleri
- System, reduced ve standard hareket tercihleri
- Ölçek, görünürlük, kalite, hareket ve zaman hızı için cihaz içi persistence
- Faz 5 acceptance turunda Node 22 sözleşmesinin tekilleştirilmesi
- Mobil control deck, seçili gezegen paneli ve navigator için ortak akış layout'u
- Bilimsel ölçekte gerçek mesh boyutlarını değiştirmeyen ekran-uzayı konum marker'ları
- Kaynaklı ve server tarafından küçültülmüş Güneş sahne modeli
- Ölçek ve hareket durumuna göre doğru Canvas erişilebilirlik adı
- Explore özet metinlerinin merkezi formatter ve UI string katmanına taşınması

## Acceptance Bulguları ve Kök Nedenler

### Node sürümü tutarsızlığı

Faz 1 temel commit'inde `.nvmrc` değeri `22` iken `package.json` içine `>=20.9.0` yazılmıştı. Git geçmişinde bu geniş aralığı gerektiren lockfile, Vercel hatası veya karar kaydı bulunmadı. Geniş aralık, framework minimum uyumluluk eşiği olarak eklenmiş fakat repository'nin Node 22 sözleşmesiyle eşleştirilmemişti. `engines.node` yeniden `22.x` yapıldı; pnpm `10.34.4` değişmedi.

### Mobil layout regresyonu

Faz 4'te navigator, özet panelinin doğrudan kardeşiydi ve `.summaryPanel + .navigator` kuralı negatif navigator margin'ini iptal ediyordu. Faz 5'te araya `SimulationControls` girince adjacent-sibling seçicisi artık eşleşmedi; navigator eski negatif margin ile control deck'in üstüne taşındı. Üç yüzey `interfaceStack` altında doğal document flow'a alındı. Mobilde tek negatif offset yalnızca tüm interface katmanını sahneye bağlamak için wrapper üzerinde tutuluyor; çocuklar arasında sabit konum veya z-index workaround'u yok.

### Bilimsel ölçek görünürlüğü

İlk sürümde gerçek mesh'ler doğru ölçekteydi fakat dünya-uzayı wire marker ve size attenuation kullanan sprite etiketleri overview kamera uzaklığında okunmuyordu. Marker'lar `sizeAttenuation: false`, `fog: false` ekran-uzayı sprite'larına dönüştürüldü. Her gezegen için crosshair merkezde gerçek konuma sabit kalırken isim, lider çizgisiyle kontrollü yönde yerleştiriliyor. Seçili marker açıkça “position · not body size” olarak etiketleniyor; scientific focus sırasında sahte büyütülmüş wire sphere gösterilmiyor.

### Güneş verisi provenansı

Güneş yarıçapı component içinde bilimsel sabit olarak tutuluyordu. NASA GSFC Sun Fact Sheet'teki 695.700 km hacimsel ortalama yarıçap, `nasa-sun-fact-sheet` source ID'sine bağlandı. Server `SunData` kaydını doğrulayıp yalnızca minimum `SceneSun` görünüm modelini client'a serileştiriyor.

### Erişilebilirlik ve metin doğruluğu

Canvas açıklaması her durumda “Animated exploration-scale” diyordu. Etiket artık scale mode ve effective reduced-motion sonucundan üretiliyor. `en-US`, gezegen türü, “planet”, “Earth days” ve “min” biçimlendirmeleri Explore component'inden merkezi formatter/UI string katmanına taşındı.

## Değiştirilen Dosyalar

- `package.json`
- `README.md`
- `playwright.config.ts`
- `e2e/smoke.spec.ts`
- `docs/decisions.md`
- `docs/phase-5-report.md`
- `src/app/explore/page.tsx`
- `src/app/explore/explore.module.css`
- `src/content/solar-system/sun.ts`
- `src/content/sources/planetary-reference.ts`
- `src/lib/data/schemas/sun.ts`
- `src/lib/i18n/formatters.ts`
- `src/lib/i18n/ui-strings.ts`
- `src/hooks/use-reduced-motion-preference.ts`
- `src/features/solar-system/components/explore-experience.tsx`
- `src/features/solar-system/components/explore-experience.test.tsx`
- `src/features/solar-system/components/explore-canvas-client.tsx`
- `src/features/solar-system/components/solar-system-canvas.tsx`
- `src/features/solar-system/components/solar-system-scene.tsx`
- `src/features/solar-system/components/planet-system.tsx`
- `src/features/solar-system/components/planet-label.tsx`
- `src/features/solar-system/components/sun.tsx`
- `src/features/solar-system/lib/camera-poses.ts`
- `src/features/solar-system/lib/camera-poses.test.ts`
- `src/features/solar-system/lib/scene-sun.ts`
- `src/features/solar-system/lib/scene-sun.test.ts`

## Node ve Araç Zinciri

- Yerel acceptance ortamı: Node `v22.16.0`
- `.nvmrc`: `22`
- `package.json engines.node`: `22.x`
- GitHub Actions: `actions/setup-node` ile `.nvmrc`
- pnpm: `10.34.4` — değiştirilmedi
- Vercel sözleşmesi: sonraki deployment için `package.json` nedeniyle Node `22.x`; provider minor/patch sürümü build anında seçer
- Mevcut, acceptance fix öncesi Vercel deployment'ının kesin patch sürümü public status verisinden doğrulanamadı; build log görülmeden kesin sürüm iddia edilmedi

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 17 dosyada 60/60 geçti
- production build: geçti
- Playwright Chromium: 26/26 geçti
- 390×844 mobil layout: geçti
- 430 px mobil layout: geçti
- 768×1024 tablet layout: geçti
- desktop exploration overview: gerçek WebGL screenshot ile kontrol edildi
- desktop scientific overview: gerçek WebGL screenshot ile kontrol edildi
- planet focus: gerçek WebGL screenshot ile kontrol edildi
- reduced motion: gerçek WebGL screenshot ve dinamik aria-label ile kontrol edildi
- reload persistence: Playwright ve screenshot ile kontrol edildi
- low/medium/high: ayrı gerçek WebGL screenshot'larıyla aynı sanat yönü doğrulandı

## Performans / Erişilebilirlik Etkisi

- Gerçek gezegen ve Güneş mesh boyutları scientific scale tarafından üretilmeye devam ediyor; marker sistemi bu geometrileri büyütmüyor.
- Scientific marker'lar kamera uzaklığından bağımsız, fog uygulanmayan tek sprite/material katmanı kullanıyor.
- Mobil layout document flow içinde çalışıyor ve 390, 430 ve tablet viewportlarında yatay overflow üretmiyor.
- Canvas region adı hareket ve ölçek durumunu doğru yansıtıyor.
- System Chromium altında gerçek WebGL için SwiftShader kullanılarak ayrıca görsel doğrulama yapıldı.

## Veri ve Kaynak Etkisi

Faz 5 acceptance turunda yeni bir kaynaklı bilimsel kayıt eklendi:

- **Değer:** Güneş hacimsel ortalama yarıçapı — 695.700 km
- **Source ID:** `nasa-sun-fact-sheet`
- **Sağlayıcı:** NASA Goddard Space Flight Center / NSSDCA
- **Kullanım:** Server tarafında oluşturulan `SceneSun` modelinin keşif ve bilimsel ölçek yarıçapları

Önceki “Yeni bilimsel veri eklenmedi” ifadesi bu nedenle kaldırıldı.

## Görsel Kanıt

Acceptance paketi aşağıdaki gerçek Chromium/WebGL kanıtlarını içerir:

- before/after mobil layout
- before/after desktop scientific overview
- desktop exploration overview
- Mars focus
- 768×1024 tablet görünümü
- reduced-motion görünümü
- low / medium / high kalite karşılaştırması
- reload sonrası kalıcı scientific / low / reduced durumu

## Bilinen Sınırlar

- Vercel'in tam minor/patch Node sürümü deployment build log'undan okunmalıdır; repository yalnızca desteklenen major sürümü (`22.x`) deterministik hale getirir.
- Texture, atmosfer, halka ve post-processing hâlâ Faz 9 kapsamındadır.

## Sonraki Fazdan Önce Blocker

Faz 5 acceptance kriterlerinde açık kod, layout, erişilebilirlik veya test blocker'ı kalmadı. Bu rapor Faz 6'yı veya Blok B'yi başlatmaz.
