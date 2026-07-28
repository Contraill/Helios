import type { Locale } from "./locale";

export const dataPageCopy = {
  en: {
    metadataDescription:
      "A dated, sourced view of solar activity, near-Earth space, Earth observation and the Mars archive.",
    hero: {
      kicker: "Observation, archive, reference",
      title: "Data",
      body: "Helios keeps separate clocks separate. An observation time describes when an instrument or service recorded something. Retrieval time describes when Helios obtained the record. A fallback is identified as a fallback rather than quietly presented as current.",
      navLabel: "Data page sections",
      nav: {
        solar: "Solar activity",
        nearEarth: "Near-Earth",
        earth: "Earth observation",
        mars: "Mars archive",
        provenance: "Provenance",
      },
    },
    legend: {
      kicker: "Status language",
      title: "One service can have several valid states",
      items: [
        [
          "Current",
          "A validated provider response inside its service-specific freshness window.",
        ],
        [
          "Stale",
          "A usable record whose age is visible and no longer presented as current.",
        ],
        [
          "Fallback",
          "A verified snapshot or static explanation used after the provider path fails.",
        ],
        [
          "Unavailable",
          "No record can be shown without inventing or mislabelling information.",
        ],
      ],
    },
    solar: {
      title: "Solar activity",
      intro:
        "DONKI records solar and geospace events. Helios shows a restrained timeline instead of exposing the provider's raw response.",
      official: "Official event record",
      officialLabel: (title: string) => `Open the official record for ${title}`,
    },
    nearEarth: {
      title: "Near-Earth space",
      intro:
        "NeoWs provides object properties. JPL CNEOS provides close-approach and historical fireball tables. The same approach is not duplicated as two competing cards.",
      miss: (value: string) => `${value} km miss`,
      velocity: (value: string) => `${value} km/h`,
      diameterUnavailable: "Diameter unavailable",
      hazardTrue: "Potentially hazardous classification",
      hazardFalse: "Not classified as potentially hazardous",
      hazardUnknown: "Potentially hazardous classification unknown",
      objectRecord: "Object/source record",
      objectLabel: (name: string) => `Open the source record for ${name}`,
      hazardNote:
        "describes an object’s size and orbit relative to Earth. It does not mean the object is predicted to collide with Earth.",
      hazardStrong: "Potentially hazardous",
      fireballs: "Historical atmospheric fireballs",
      radiated: (value: string) => `${value} × 10¹⁰ J total radiated energy`,
      impact: (value: string) => `${value} kt estimated impact energy`,
    },
    earth: {
      title: "Earth in observation",
      intro:
        "EPIC, EONET and GIBS answer different questions. Their status is shown together, but their observations are not collapsed into one false present moment.",
      imageUnavailable: "Earth image unavailable",
      captured: (date: string) =>
        `Captured ${date} from DSCOVR's L1 perspective.`,
      noImage: "The Earth page remains available without the remote image.",
      curated: (count: number) => `${count} curated event records`,
      curatedBody:
        "Wildfires, storms, volcanoes, floods, ice, dust and haze are filtered on the Earth page.",
      layers: (count: number) => `${count} selected imagery layers`,
      layersBody:
        "Layer ID, instrument, observation date, color mode and latency remain visible.",
    },
    mars: {
      title: "Mars archive",
      intro:
        "InSight measured one location at Elysium Planitia. The record is historical and is never labelled as Mars's current weather.",
      sol: "Sol",
      temperature: "Mean temperature",
      pressure: "Mean pressure",
      unavailable: "Unavailable",
    },
    provenance: {
      title: "Provenance and service health",
      intro:
        "This is a user-facing account of what is current, historical, cached or unavailable—not a technical log.",
      sourceRecord: "Source record",
      sourceLabel: (title: string) => `Open ${title}`,
      serviceNotes: {
        "NASA APOD": "Daily media archive; the record date remains visible.",
        "NASA DONKI":
          "Space-weather event families may return independently; partial responses are labelled.",
        "NASA NeoWs":
          "Object properties and hazard classification; not an impact prediction.",
        "JPL CNEOS":
          "Close-approach table with a version-checked provider signature.",
        "NASA EPIC":
          "Dated natural-color records from the DSCOVR L1 perspective.",
        "NASA EONET":
          "Natural-event context; not an emergency-warning service.",
        "NASA Earthdata GIBS":
          "Dated imagery layers with instrument, color treatment and latency context.",
        "NASA InSight":
          "Dated historical landing-site observation; Helios does not present it as current weather.",
        "JPL CNEOS Fireball Data":
          "Historical atmospheric detections; radiated and estimated impact energy stay separate.",
      },
      ledgers: [
        [
          "Observed versus retrieved",
          "Observed time belongs to the event, image or measurement. Retrieved time belongs to the Helios request or bundled snapshot.",
        ],
        [
          "Fallback chain",
          "Provider response → verified snapshot → static explanation → unavailable. A snapshot never inherits a current label.",
        ],
        [
          "Scientific limits",
          "Planetary reference values are not local weather. One lander record is not a global Mars state. Event trackers are not emergency alert services.",
        ],
        [
          "Cache",
          "Each provider has its own revalidation policy. Serverless process memory is not treated as durable cache.",
        ],
      ],
    },
    empty: "No usable record is available for this source.",
    opensNewTab: "opens in a new tab",
  },
  tr: {
    metadataDescription:
      "Güneş etkinliği, Dünya'ya yakın uzay, Dünya gözlemi ve Mars arşivini tarih ve kaynak bağlamıyla sunan veri görünümü.",
    hero: {
      kicker: "Gözlem, arşiv, referans",
      title: "Veri",
      body: "Helios farklı zamanları birbirine karıştırmaz. Gözlem zamanı, bir araç veya servisin kaydı ne zaman oluşturduğunu; alınma zamanı ise Helios'un kayda ne zaman eriştiğini anlatır. Yedek kayıtlar sessizce güncelmiş gibi sunulmaz, açıkça yedek olarak işaretlenir.",
      navLabel: "Veri sayfası bölümleri",
      nav: {
        solar: "Güneş etkinliği",
        nearEarth: "Dünya'ya yakın uzay",
        earth: "Dünya gözlemi",
        mars: "Mars arşivi",
        provenance: "Kaynak geçmişi",
      },
    },
    legend: {
      kicker: "Durum dili",
      title: "Bir servis aynı anda farklı geçerli durumlar taşıyabilir",
      items: [
        [
          "Güncel",
          "Servise özel güncellik penceresi içinde doğrulanmış sağlayıcı yanıtı.",
        ],
        [
          "Eski",
          "Yaşı görünür olan ve artık güncel diye sunulmayan kullanılabilir kayıt.",
        ],
        [
          "Yedek",
          "Sağlayıcı yolu başarısız olduğunda kullanılan doğrulanmış tarihli kayıt veya statik açıklama.",
        ],
        [
          "Kullanılamıyor",
          "Bilgi uydurmadan veya yanlış etiketlemeden gösterilebilecek bir kayıt yok.",
        ],
      ],
    },
    solar: {
      title: "Güneş etkinliği",
      intro:
        "DONKI, Güneş ve jeouzay olaylarını kaydeder. Helios sağlayıcının ham yanıtını göstermek yerine sınırlı ve okunabilir bir zaman çizelgesi sunar.",
      official: "Resmî olay kaydı",
      officialLabel: (title: string) => `${title} için resmî kaydı aç`,
    },
    nearEarth: {
      title: "Dünya'ya yakın uzay",
      intro:
        "NeoWs cisim özelliklerini; JPL CNEOS ise yakın geçiş ve tarihsel atmosferik ateş topu tablolarını sağlar. Aynı yaklaşma iki rakip kart olarak çoğaltılmaz.",
      miss: (value: string) => `${value} km geçiş uzaklığı`,
      velocity: (value: string) => `${value} km/sa`,
      diameterUnavailable: "Çap bilgisi yok",
      hazardTrue: "Potansiyel olarak tehlikeli sınıfında",
      hazardFalse: "Potansiyel olarak tehlikeli sınıfında değil",
      hazardUnknown: "Potansiyel tehlike sınıflandırması bilinmiyor",
      objectRecord: "Cisim/kaynak kaydı",
      objectLabel: (name: string) => `${name} için kaynak kaydını aç`,
      hazardNote:
        "bir cismin boyutu ve Dünya'ya göre yörüngesiyle ilgili sınıflandırmadır. Cismin Dünya'ya çarpacağının öngörüldüğü anlamına gelmez.",
      hazardStrong: "Potansiyel olarak tehlikeli",
      fireballs: "Tarihsel atmosferik ateş topları",
      radiated: (value: string) => `${value} × 10¹⁰ J toplam yayılan enerji`,
      impact: (value: string) => `${value} kt tahminî çarpma enerjisi`,
    },
    earth: {
      title: "Gözlem altındaki Dünya",
      intro:
        "EPIC, EONET ve GIBS farklı sorulara cevap verir. Durumları birlikte gösterilir; ancak gözlemler tek ve sahte bir 'şimdi' anına birleştirilmez.",
      imageUnavailable: "Dünya görseli kullanılamıyor",
      captured: (date: string) =>
        `DSCOVR'un L1 bakış açısından ${date} tarihinde kaydedildi.`,
      noImage: "Uzak görsel olmadan da Dünya sayfası kullanılabilir kalır.",
      curated: (count: number) => `${count} düzenlenmiş olay kaydı`,
      curatedBody:
        "Orman yangınları, fırtınalar, volkanlar, seller, buz, toz ve pus Dünya sayfasında filtrelenir.",
      layers: (count: number) => `${count} seçili görüntü katmanı`,
      layersBody:
        "Katman kimliği, araç, gözlem tarihi, renk modu ve gecikme bilgisi görünür kalır.",
    },
    mars: {
      title: "Mars arşivi",
      intro:
        "InSight, Elysium Planitia'daki tek bir konumu ölçtü. Kayıt tarihseldir ve hiçbir zaman Mars'ın güncel hava durumu diye etiketlenmez.",
      sol: "Sol",
      temperature: "Ortalama sıcaklık",
      pressure: "Ortalama basınç",
      unavailable: "Kullanılamıyor",
    },
    provenance: {
      title: "Kaynak geçmişi ve servis durumu",
      intro:
        "Bu bölüm teknik log değil; hangi kaydın güncel, tarihsel, önbellekte veya kullanılamaz olduğunu kullanıcıya açıklayan bir hesap dökümüdür.",
      sourceRecord: "Kaynak kaydı",
      sourceLabel: (title: string) => `${title} kaynağını aç`,
      serviceNotes: {
        "NASA APOD": "Günlük medya arşivi; kayıt tarihi görünür kalır.",
        "NASA DONKI":
          "Uzay hava olayı aileleri bağımsız dönebilir; kısmi yanıtlar etiketlenir.",
        "NASA NeoWs":
          "Cisim özellikleri ve tehlike sınıflandırması; çarpma tahmini değildir.",
        "JPL CNEOS":
          "Sağlayıcı imzası sürüm denetiminden geçen yakın geçiş tablosu.",
        "NASA EPIC":
          "DSCOVR'un L1 bakış açısından tarihli doğal renk kayıtları.",
        "NASA EONET": "Doğal olay bağlamı; acil durum uyarı servisi değildir.",
        "NASA Earthdata GIBS":
          "Araç, renk uygulaması ve gecikme bağlamı görünen tarihli görüntü katmanları.",
        "NASA InSight":
          "Tarihli tarihsel iniş alanı gözlemi; Helios bunu güncel hava durumu olarak sunmaz.",
        "JPL CNEOS Fireball Data":
          "Tarihsel atmosferik tespitler; yayılan ve tahminî çarpma enerjisi ayrı tutulur.",
      },
      ledgers: [
        [
          "Gözlem ve alınma zamanı",
          "Gözlem zamanı olay, görsel veya ölçüme aittir. Alınma zamanı Helios isteğine veya paketlenmiş doğrulanmış kayda aittir.",
        ],
        [
          "Yedek içerik zinciri",
          "Sağlayıcı yanıtı → doğrulanmış kayıt → statik açıklama → kullanılamıyor. Doğrulanmış kayıt hiçbir zaman güncel etiketi devralmaz.",
        ],
        [
          "Bilimsel sınırlar",
          "Gezegen referans değerleri yerel hava durumu değildir. Tek bir iniş aracı kaydı Mars'ın küresel durumu değildir. Olay takip servisleri acil durum uyarı sistemi değildir.",
        ],
        [
          "Önbellek",
          "Her sağlayıcının kendi yeniden doğrulama politikası vardır. Sunucusuz süreç belleği kalıcı önbellek sayılmaz.",
        ],
      ],
    },
    empty: "Bu kaynak için kullanılabilir bir kayıt yok.",
    opensNewTab: "yeni sekmede açılır",
  },
} as const satisfies Record<Locale, object>;
