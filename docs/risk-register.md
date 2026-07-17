# Helios — Risk Kaydı

`05_DEVELOPMENT_ROADMAP.md` §4'ten tohumlanmıştır; önem sırasına göre
listelenir. Yeni risk eklerken aynı alanları kullanın ve önem sırasını
yeniden değerlendirin.

| #   | Risk                                                                                                                                         | Alan          | Etki                                                                                 | Olasılık    | Önlemler                                                                                                                                                        | Durum                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | Bilimsel doğruluk ve veri etiketi hataları (yanlış "canlı" etiketi, genellenen rover ölçümü, gaz devinde "yüzey sıcaklığı", uydurulan rakam) | Ürün / Veri   | Çok yüksek — ürünün temel vaadini ve portföy güvenilirliğini çökertir (P0, `06` §15) | Orta        | Kaynak registry; fact-check workflow (`04` §17); freshness taksonomisi; hesaplamaların unit testleri; içerik QA (`06` §13)                                      | Açık — Faz 2'den itibaren aktif yönetim |
| 2   | NASA veri kaynaklarının kararlılığı, özellikle Mars çevresel ölçümleri (`04` §4.4 "en riskli entegrasyon")                                   | Veri / Teknik | Yüksek                                                                               | Yüksek      | Adapter + Zod + cache + snapshot + statik fallback zinciri; ilk entegrasyonlar APOD + NEO; Mars yalnızca resmî doğrulama sonrası; Faz 7 öncesi araştırma komutu | Açık — Faz 7 öncesi doğrulama zorunlu   |
| 3   | Mobil ve zayıf cihazlarda 3B performansı (FPS, texture belleği)                                                                              | Teknik        | Yüksek — mobil kullanılabilirlik MVP kabul kriteri                                   | Orta-yüksek | Kalite seviyeleri (low/medium/high); lazy asset; DPR sınırı; ölçüme dayalı bütçeler (`06` §8); frame loop disiplini; WebGL fallback                             | Açık — Faz 3'ten itibaren ölçüm         |
| 4   | Kapsam büyümesi (uydular, görevler, gerçek yörüngeler MVP'yi geciktirir)                                                                     | Süreç / Ürün  | Yüksek                                                                               | Orta        | Kapsam sınıflandırması (`00` §7); karar kayıtları; faz kabul kapıları; "sonraki faz otomatik başlamaz" kuralı                                                   | Açık — sürekli                          |
| 5   | "Şablon demo" algısı (Three.js tutorial'ı gibi görünme, sekiz renkli aynı kart)                                                              | Ürün          | Orta-yüksek                                                                          | Orta        | Gezegen bazlı editoryal vurgu; kişisel modüller; hazır UI kit yasağı; özgün token/tasarım sistemi; case study                                                   | Açık                                    |

## İzleme listesi

- Kamera ve geçiş orkestrasyon karmaşıklığı (iptal token'ları, hızlı ardışık
  seçim, mobil gesture çakışması) — Faz 4'te risk tablosuna yükseltilip
  yükseltilmeyeceği değerlendirilecek.
- i18n'in geç eklenme maliyeti — `ui-strings` tek-kaynak kuralı ve Faz 2
  `LocalizedText` içerik modeliyle azaltıldı; TR UI yayını planlanırken
  yeniden değerlendirilecek.
