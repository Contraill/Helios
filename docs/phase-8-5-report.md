# Faz 8.5 Sonu — Efemeris, Zaman Navigasyonu ve Özgür Kamera

## Sonuç

Blok B.5 / Faz 8.5 kabul kapısı kapandı. Explore artık seçilen tarih için sekiz gezegenin kaynaklı JPL Horizons state vector'larını kullanıyor; merkezi tarih-saat navigasyonu ve tek otoriteli serbest kamera sunuyor. Faz 9 / Blok C başlamadı.

## Ön koşul: Blok B onarımı

Faz 8.5 başlamadan önce Blok B tekrar kabul edildi:

- GitHub Actions kök nedeni async Server Component testinin senkron render edilmesi olarak bulundu ve düzeltildi.
- Ana sayfa, data ve planet rotalarına runtime revalidation eklendi.
- APOD, EPIC ve GIBS snapshot URL'leri doğrulanmış güncel kayıtlarla değiştirildi.
- InSight yüzeyi açık tarihli tek-iniş-sahası arşivi olarak yeniden yazıldı.
- Mission-media fallback'i gezegen sorgusuna göre filtrelendi.
- Home/Mercury gradient ve Explore link/panel aralıkları düzeltildi.

## Horizons veri katmanı

- Ayrı `server-only` adapter; NASA key sözleşmesinden bağımsız
- Merkezi sekiz gezegen target registry'si
- `EPHEM_TYPE=VECTORS`, `VEC_TABLE=2`
- Güneş gövde merkezi `500@10`
- Ecliptic J2000 / ICRF
- AU ve AU/day
- TDB vector epoch'u
- Zod ile normalize bundle ve sekiz-vector zorunluluğu
- 20 saniye target timeout'u ve en fazla iki eşzamanlı Horizons isteği
- Target başına 24 saat server fetch cache'i; API response için 1 saat edge cache ve stale-while-revalidate
- Provider kesintisinde tarih sınırı açık, doğrulanmış 18 Temmuz 2026 snapshot fallback'i
- Fallback nedeni `X-Helios-Fallback` response header'ıyla gözlenebilir

Güncel endpoint response signature değeri `1.2` olarak gözlendi; plan belgesindeki önceki `1.3` varsayımı düzeltildi.

## Tarih ve hareket modeli

- Tek simulation date/time anchor'ı
- UTC `datetime-local`, Now, ±1 gün, ±30 gün ve ±3650 günlük timeline
- 1900–2100 kullanıcı tarih sınırı
- URL `?at=<ISO>` ile reload/paylaşım
- Açılışta `Date.now()` tabanlı, duraklatılmamış gerçek zaman (`1 gerçek saniye = 1 simülasyon saniyesi`)
- Pause/resume ve gerçek saniye başına `6 saat`, `1 gün`, `1 hafta`, `1 ay` hızları
- Altı saatlik kararlı Horizons sample epoch'u
- Frame loop API çağrısı yok
- State vector'dan türetilen, ±370 günle sınırlı oskülatör yörünge yayılımı
- Exploration modunda yalnız non-lineer mesafe sunumu; scientific modda doğrusal `12 scene unit / AU`
- Ham CSV/text client'a sızmıyor

## Canlı kabul sonrası onarımlar

- Gezegen gövdeleri ile yörünge çizgileri aynı Horizons state vector'ından ve aynı sahne dönüşümünden üretiliyor; katalog elipsi / efemeris koordinatı ayrışması kaldırıldı.
- Gezegen eksen dönüşü frame sayısından değil merkezi simülasyon timestamp'inden türetiliyor.
- Efemeris paneli kalıcı tercihle kompakt dock'a kapanabiliyor ve varsayılan olarak kapalı açılıyor.
- Canvas üzerinde mouse drag/wheel ve dokunma, ayrıca kontrol düğmesine basmak gerektirmeden free camera yetkisini devralıyor.
- Ana sayfa ve Mercury hero geçişleri sıfır-alfa uçlar ve geniş bulanık ışık alanlarıyla yumuşatıldı; Mercury'deki sert dikey renk kenarı kaldırıldı.
- Potentially hazardous açıklaması yalnız görüntülenen kayıtlardan en az biri bu sınıfa sahipse gösteriliyor.
- Data sayfası dolu bir stale fallback'i güncel sağlayıcı sonucunun önüne geçirmiyor; aynı işlevi gören kullanılmayan stale servis kartı yüzeye eklenmiyor.

## Kaynak doğrulaması

Doğrudan JPL Horizons çıktısıyla doğrulanan Dünya zamanları:

- Geçmiş: `2024-01-15 12:30:00 TDB`
- Mevcut çalışma tarihi: `2026-07-18 00:00:00 TDB`
- Gelecek: `2030-01-15 12:30:00 TDB`

Üretim `/api/ephemeris` rotası `2026-07-18T12:30:00.000Z` isteğinde sekiz hedefi, `current` statüsünü, `observedAt=2026-07-18T12:00:00.000Z` epoch'unu ve tam frame/center/unit/time metadata'sını döndürdü. İlk uncached sekiz-hedef isteği yerel kabul ortamında yaklaşık 20 saniye sürdü; doğrulanmış fallback bu sırada Explore'u kullanılabilir tutar, sonraki aynı sample istekleri cache'den gelir.

Interpolation kontrolünde 18 Temmuz 2026 state'inden 30 gün yayılan Earth ve Mercury sonuçları doğrudan 17 Ağustos 2026 Horizons vector'larıyla karşılaştırıldı; ikisi de `0.005 AU` kabul sınırının altında kaldı.

## Kamera

- Modlar: overview, focus, free; transition yalnız kontrollü ara state
- Tek `CameraRig` ve tek OrbitControls örneği
- Mouse drag/orbit, pan, wheel/dolly
- Tek parmak rotate, iki parmak pan ve pinch zoom
- Ok tuşlarıyla pan; input, textarea, select, button ve link odaklarında tuş yakalama yok
- Görünür free-camera yardım metni
- Escape ile guided moda dönüş
- Reset view ve overview
- Exploration/scientific için ayrı min/max distance güvenliği
- Scale mode değişiminde free controller devreden çıkıyor
- Reduced-motion guided geçişi snap ediyor; doğrudan free girdiyi engellemiyor

## Doğrulama

- format: geçti
- lint: geçti; sıfır hata, sıfır warning
- typecheck: geçti
- unit/component: `37` dosyada `133/133` geçti
- production build: geçti; `/api/ephemeris` dynamic route, Explore static shell
- production route kabulü: ana sayfa, Explore, Compare, Data ve sekiz planet rotası `200`
- production Horizons API kabulü: sekiz hedef, `current`, tam metadata
- Playwright Chrome Headless Shell: `81/81` geçti
- masaüstü: `1280×720`, yatay overflow yok, Next error overlay yok
- tablet: `768×1024`, yatay overflow yok, Next error overlay yok
- mobil: `390×844`, yatay overflow yok, Next error overlay yok
- gerçek viewport görüntülerinde time panel, selected summary, control deck ve navigator çakışmadan incelendi

## Bilinen sınırlar

- Horizons sekiz ayrı body isteği gerektirdiği için ilk uncached çözüm yavaştır; cache ve doğrulanmış fallback ürünün temel kullanılabilirliğini korur.
- Örnekler arası hareket tam N-body/JPL integrasyonu değildir; açıkça sınırlı oskülatör yayılımdır ve sınır yaklaşınca yeni source sample alınır.
- TDB vector epoch'u ile kullanıcıya gösterilen UTC zamanı aynı kavram olarak sunulmaz.
- Axial attitude, SPICE body orientation, uydular ve görev rotaları kapsam dışıdır.
- Local kabul Node `v24.14.0` üzerinde engine warning ile çalıştı; repository ve GitHub Actions sözleşmesi Node `22.x` olarak değişmeden kaldı.

## Kapı kararı

Faz 8.5 için açık ürün, veri, kamera, responsive veya test blocker'ı kalmadı. Blok C / Faz 9 otomatik olarak başlatılmadı.
