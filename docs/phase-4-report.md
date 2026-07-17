# Faz 4 Sonu — Seçim ve Kamera

## Tamamlananlar

- Canvas üzerindeki gezegenler hover, click ve touch uyumlu pointer event'leriyle seçilebilir hale getirildi.
- Canvas dışında sekiz gezegen için semantik, klavye erişilebilir bir navigator oluşturuldu.
- `selectedPlanetId`, `hoveredPlanetId` ve sınırlı kamera modu için küçük bir Zustand store eklendi.
- Kamera yönetimi merkezi `CameraRig` altında toplandı.
- Overview, transition ve focus durumları uygulandı.
- Kamera hedefi seçili gezegenin güncel dünya konumunu izlediği için yörüngedeki gezegen focus sırasında takip ediliyor.
- Yeni seçim, devam eden kamera hareketinin hedefini anında değiştiriyor; stale transition tamamlanmaları store tarafından reddediliyor.
- Escape ve görünür Overview kontrolleriyle genel görünüme dönüş ve focus restorasyonu sağlandı.
- Seçili gezegen için sahne etiketi, yörünge/mesh vurgusu ve kaynaklı özet panel eklendi.
- Reduced-motion tercihinde kamera animasyonu yerine doğrudan hedef poza geçiliyor.
- Dar dokunmatik viewportlarda kontrol hedefleri en az 44 px olacak şekilde düzenlendi.
- WebGL başarısız olduğunda semantik navigator ve gezegen detay bağlantıları kullanılabilir kalıyor.

## Değiştirilen Dosyalar

### Yeni

- `src/stores/exploration-store.ts`
- `src/stores/exploration-store.test.ts`
- `src/features/solar-system/components/camera-rig.tsx`
- `src/features/solar-system/components/explore-experience.tsx`
- `src/features/solar-system/components/explore-experience.test.tsx`
- `src/features/solar-system/components/planet-label.tsx`
- `src/features/solar-system/lib/camera-poses.ts`
- `src/features/solar-system/lib/camera-poses.test.ts`
- `src/features/solar-system/lib/explore-planets.ts`
- `src/features/solar-system/lib/explore-planets.test.ts`
- `src/features/solar-system/types/planet-object-registry.ts`

### Güncellenen

- `src/app/explore/page.tsx`
- `src/app/explore/explore.module.css`
- `src/app/globals.css`
- `src/features/solar-system/components/explore-canvas-client.tsx`
- `src/features/solar-system/components/orbit-path.tsx`
- `src/features/solar-system/components/planet-system.tsx`
- `src/features/solar-system/components/solar-system-canvas.tsx`
- `src/features/solar-system/components/solar-system-scene.tsx`
- `src/features/solar-system/lib/scene-planets.ts`
- `src/features/solar-system/lib/scene-planets.test.ts`
- `src/lib/i18n/ui-strings.ts`
- `e2e/smoke.spec.ts`
- `vitest.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- `README.md`
- `docs/decisions.md`

### Kaldırılan

- `src/features/solar-system/components/overview-camera.tsx`

## Teknik Kararlar

### Merkezi kamera otoritesi

Gezegen component'leri kamerayı değiştirmez. Her gezegen sahne içindeki `Object3D` referansını registry'ye kaydeder; `CameraRig` seçili ID ve güncel dünya konumundan hedef pozunu üretir.

### Geçiş iptali

Kamera hareketi promise, timeout veya animasyon kuyruğu kullanmaz. Her frame en güncel seçime göre hedef yeniden hesaplanır. Store'daki `settleCamera` işlemi yalnızca beklenen seçimin hâlâ aktif olması halinde transition durumunu tamamlar.

### Frame-rate bağımsız hareket

Kamera interpolasyonu `1 - exp(-lambda * delta)` formülüyle hesaplanır. Böylece sonuç frame sayısına değil geçen zamana bağlıdır.

### Server/client veri sınırı

Tam `PlanetData` kataloğu, Zod schema ve kaynak registry'si client bundle'a taşınmaz. Server, yalnızca gereken alanları içeren `ScenePlanet` ve `ExplorePlanetSummary` modellerini üretip client component'e geçirir.

### Store sınırı

Zustand yalnızca düşük frekanslı seçim ve kamera modu için kullanılır. Yörünge açısı, gezegen dönüşü, kamera pozisyonu ve look-at hedefi React veya Zustand state'ine yazılmaz.

### Test kararlılığı

Küçük jsdom süitinin çok çekirdekli ortamlarda worker oversubscription nedeniyle kapanmaması önlendi; Vitest tek worker ile deterministik çalışacak şekilde sınırlandı.

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 12 dosyada 46/46 geçti
- production build: geçti
- statik üretim: sekiz gezegen rotası üretildi
- HTTP smoke: ana rotalar, `/explore`, sekiz gezegen rotası ve health endpoint `200`; Pluto `404`
- Playwright discovery: 20 E2E senaryosu başarıyla parse edildi
- Playwright API smoke: 1/1 geçti
- frozen/offline lockfile: geçti
- debug/secret/araç izi taraması: bulgu yok

## Bundle ve Performans

Server/client sınırı düzenlenmeden önce Explore'ın route-specific ilk client chunk toplamı yaklaşık 383.620 bayt ham / 91.838 bayt gzip idi. Düzenleme sonrasında:

- `/` route-specific client chunks: 67.543 bayt ham / 18.260 bayt gzip
- `/explore` route-specific client chunks: 79.960 bayt ham / 22.896 bayt gzip
- ayrık Three.js/R3F chunk: 891.923 bayt ham / 234.524 bayt gzip

3B chunk ana sayfanın ilk client manifestinde bulunmuyor. Frame döngüsünde React state güncellemesi veya her-frame allocation zinciri eklenmedi. Canvas DPR değeri `1–1.5` aralığında sınırlandı.

## Erişilebilirlik ve Mobil Etkisi

- Canvas `aria-hidden`; aynı işlevin semantik DOM karşılığı bulunuyor.
- Gezegen düğmeleri `aria-pressed` ile seçim durumunu açıklıyor.
- Kamera durumu ekran okuyucu için canlı bölgede duyuruluyor.
- Escape sonrası focus seçimi başlatan düğmeye dönüyor.
- Mobil görünümde panel ve navigator normal belge akışına geçiyor.
- Mobil gezegen, Overview ve kapatma kontrolleri en az 44 px dokunma yüksekliğine sahip.
- Reduced-motion kamera hareketini ve sürekli sahne animasyonunu gerçekten değiştiriyor.

## Veri ve Kaynak Etkisi

Yeni bilimsel değer eklenmedi. Özet panelde gösterilen yerçekimi, yörünge süresi ve ışık süresi Faz 2'nin kaynaklı domain verisinden server tarafında türetiliyor. Sahne görünüm modeli mevcut NASA/JPL referans alanlarını kullanmaya devam ediyor.

## Bilinen Eksikler

- Manuel free-camera/orbit kontrolü bu fazın kapsamına alınmadı.
- Pause, time scale, reset, ölçek modu, orbit/label görünürlüğü, kalite seviyesi ve tercih kalıcılığı Faz 5 işidir.
- Texture, atmosfer shader'ı, Satürn halkası, bloom ve post-processing eklenmedi.
- Playwright'ın tam browser akışı bu çalışma ortamında çalıştırılamadı: tarayıcı paketi indirmesi DNS nedeniyle başarısız, sistem Chromium'u ise localhost'u yönetilen politika ile engelliyor.

## Sonraki Fazdan Önce Blocker

Kod ve non-browser kabul kapılarında blocker yok. Merge veya canlı yayın öncesinde GitHub Actions ya da normal bir yerel tarayıcı ortamında 20 Playwright senaryosu; özellikle WebGL seçimi, hızlı seçim, Escape ve 390 px mobil touch akışı çalıştırılmalıdır.
