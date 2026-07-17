# Faz 5 Sonu

## Tamamlananlar

- Pause, resume, 0.25× / 1× / 4× / 16× zaman hızı ve deterministik reset
- Keşif ve bilimsel ölçek modları
- Yörünge ve etiket görünürlüğü
- Low, medium ve high kalite seviyeleri
- System, reduced ve standard hareket tercihleri
- Ölçek, görünürlük, kalite, hareket ve zaman hızı için cihaz içi persistence
- Bilimsel ölçekte aynı doğrusal oranla Güneş, gezegen yarıçapı ve yörünge mesafesi
- Gerçek boyutu değiştirmeyen konum işaretçileri
- Mobil kontrol yerleşimi ve 44 px minimum hedefler
- Roadmap 1.1 ve birleşik blok yürütme modelinin repository belgelerine alınması

## Değiştirilen Dosyalar

- `src/stores/exploration-store.ts`
- `src/stores/simulation-store.ts`
- `src/stores/preferences-store.ts`
- `src/hooks/use-hydrate-experience-settings.ts`
- `src/hooks/use-reduced-motion-preference.ts`
- `src/features/solar-system/components/*`
- `src/features/solar-system/lib/scene-planets.ts`
- `src/features/solar-system/lib/quality.ts`
- `src/features/solar-system/types/experience-settings.ts`
- `src/app/explore/explore.module.css`
- `src/lib/i18n/ui-strings.ts`
- `e2e/smoke.spec.ts`
- `docs/project/05_DEVELOPMENT_ROADMAP.md`
- `docs/decisions.md`
- `docs/development-workflow.md`
- `README.md`

## Teknik Kararlar

- Frame içi simülasyon değerleri store'a yazılmıyor.
- Reset, yerel açı ve dönüş referanslarını başlangıç değerine döndüren artan bir sürüm sinyali kullanıyor.
- Geçici seçim, hover, kamera ve pause durumu kalıcılaştırılmıyor.
- Bilimsel ölçek, görünürlük uğruna gezegen yarıçapını büyütmüyor.
- Kalite seviyesi sanat yönünü değil render maliyetini değiştiriyor.

## Doğrulama

- format: geçti
- lint: geçti
- typecheck: geçti
- unit/component: 57/57 geçti
- e2e discovery: 22 senaryo
- production HTTP smoke: geçti
- build: geçti

## Performans / Erişilebilirlik Etkisi

- Low kalite 320 yıldız, 18×12 küre segmenti, 64 orbit segmenti ve 1.0 DPR üst sınırı kullanıyor.
- High kalite 1.800 yıldız, 42×30 küre segmenti, 192 orbit segmenti ve 2.0 DPR üst sınırı kullanıyor.
- Reduced motion sürekli simülasyon hareketini durduruyor ve kamera geçişini anlık hale getiriyor.
- Kontroller fieldset, legend, button ve `aria-pressed` sözleşmeleriyle klavyeden kullanılabiliyor.

## Veri ve Kaynak Etkisi

Yeni bilimsel veri eklenmedi. Mevcut kaynaklı yarıçap ve yörünge değerleri iki ölçek stratejisinin girdisi olarak kullanılıyor.

## Bilinen Eksikler

- Yönetilen çalışma ortamındaki Chromium başlatma kısıtları nedeniyle gerçek browser screenshot ve WebGL E2E burada tamamlanamadı.
- Texture, atmosfer, halka ve post-processing Faz 9 kapsamındadır.

## Sonraki Fazdan Önce Blocker

Kod veya build blocker'ı yoktur. Blok B başlamadan önce Faz 5'in deploy edilen build üzerinde masaüstü ve mobil görsel kontrolü yapılmalıdır.
