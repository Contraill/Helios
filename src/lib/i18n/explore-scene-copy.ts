import type { CelestialNavigatorCategory } from "@/features/solar-system/types/celestial-navigation";
import type { ExploreDockPanel } from "@/stores/explore-scene-ui-store";
import type { Locale } from "./locale";

const EN_COPY = Object.freeze({
  dock: {
    label: "Explore scene controls",
    tabsLabel: "Explore panels",
    mobileOpen: (panel: string) => `${panel} · Open controls`,
    mobileClose: "Close Explore controls",
    mobileEyebrow: "Explore controls",
    mobileSelectionLabel: "Info",
    minimize: "Minimize Explore controls",
    expand: "Expand Explore controls",
    panelLabels: {
      selection: "Selection",
      navigator: "Navigator",
      view: "View",
      time: "Time",
    } satisfies Readonly<Record<ExploreDockPanel, string>>,
  },
  navigator: {
    label: "Celestial navigator",
    eyebrow: "Browse by category",
    back: "← Back",
    categories: {
      "sun-planets": {
        label: "Sun & planets",
        description: "The central star and eight planets.",
      },
      "planetary-moons": {
        label: "Planetary moons",
        description: "Choose a parent planet, then a featured major moon.",
      },
      "main-belt": {
        label: "Main-belt worlds",
        description: "Ceres and selected large main-belt bodies.",
      },
      "dwarf-kuiper": {
        label: "Dwarf & Kuiper worlds",
        description: "Selected trans-Neptunian and dwarf worlds.",
      },
      comets: {
        label: "Comets",
        description: "All modelled comets and their orbit previews.",
      },
      "regions-context": {
        label: "Regions & context",
        description: "Belts, heliosphere and schematic outer context.",
      },
    } satisfies Readonly<
      Record<CelestialNavigatorCategory, { label: string; description: string }>
    >,
    featuredMoons: "Featured major moons",
    openMoons: (planet: string) => `Open featured moons of ${planet}`,
    moonShortcut: "Moons",
    featuredMoonCount: (count: number) => `${count} featured major moons`,
    system: "system",
    openSystem: (body: string, count: number) =>
      `Open ${body} system (${count} satellites)`,
  },
  registry: {
    parentPlanetNames: {
      earth: "Earth",
      mars: "Mars",
      jupiter: "Jupiter",
      saturn: "Saturn",
      uranus: "Uranus",
      neptune: "Neptune",
    },
    moonDescription: (parent: string) =>
      `${parent} system · calculated for the shared simulation time from published orbital elements.`,
    extendedRepresentation: "Calculated for simulation time",
    planetRepresentation: "JPL Horizons ephemeris",
    moonRepresentative: "Representative orbit preview",
    moonHorizons: "JPL Horizons ephemeris",
    sunDescription: "The central reference body for the heliocentric scene.",
    sunRepresentation: "Heliocentric reference",
    regions: {
      "asteroid-belt": {
        displayName: "Asteroid belt",
        description:
          "A regional particle population; individual background particles do not receive orbit lines.",
        representation: "Regional context",
      },
      "kuiper-belt": {
        displayName: "Kuiper belt",
        description:
          "A distant population region shown as context rather than thousands of selectable orbit meshes.",
        representation: "Regional context",
      },
      "oort-cloud": {
        displayName: "Oort cloud",
        description:
          "A schematic, inferred outer reservoir. Its particle shell is not a live census.",
        representation: "Schematic regional context",
      },
      heliosphere: {
        displayName: "Heliosphere",
        description:
          "A contextual solar-wind boundary representation, not a solid surface.",
        representation: "Regional context",
      },
    },
  },
  summary: {
    selection: "Selection",
    overviewTitle: "Solar System overview",
    overviewBody:
      "Choose a category, then a body. The scene keeps only low-emphasis spatial anchors outside the active category.",
    closeOverview: "Return to overview",
    closeMoon: "Close moon summary",
    featuredMoon: "Featured major moon",
    featuredSetNote:
      "This is a featured set, not a claim that every known moon is modelled.",
    representativeOrbit: "Representative orbit preview",
    proceduralVisual: "Reference-guided visual",
    calculatedForTime: "Calculated for simulation time",
    publishedElements: "Published orbital elements",
    regionType: "Region & context",
    sceneRole: "Scene role",
    systemOrigin: "System origin",
    positionMethod: "Position method",
    meanRadius: "Mean radius",
    orbitalPeriod: "Orbital period",
    representation: "Representation",
    visual: "Visual",
    gravity: "Gravity",
    year: "Year",
    earthDays: "Earth days",
    knownMoons: "Known moons",
    asOf: "as of",
    sourceBasis: "Source basis",
    provider: "Provider",
    referenceFrame: "Reference frame",
    precisionNote: "Usage note",
    semiMajorAxis: "Semi-major axis",
    openPlanetDetail: (planet: string) => `Open ${planet} detail`,
    openObjectEditorial: (body: string) => `Open ${body} editorial page`,
    openRegionDetail: (region: string) => `Open ${region} context page`,
    planetEyebrow: (order: number) => `Planet ${order}`,
    openSunDetail: "Open Sun detail",
    openBodyDetail: (body: string) => `Open ${body} detail`,
    dwarfSatellite: "Dwarf-system satellite",
    kindLabels: {
      asteroid: "Asteroid",
      comet: "Comet",
      "dwarf-planet": "Dwarf planet",
      "kuiper-object": "Kuiper Belt object",
    },
    regionKindLabels: {
      "main-belt": "Main asteroid belt",
      "trans-neptunian-belt": "Trans-Neptunian belt",
      "distant-shell": "Distant inferred shell",
      "solar-boundary": "Solar-wind boundary",
    },
    regionRepresentationLabels: {
      "context-layer": "Context layer",
      inferred: "Inferred structure",
      schematic: "Schematic structure",
    },
    days: "days",
    heliosphereBoundary: "Heliosphere boundary",
    regionRepresentation: "Representation",
    regionVisualModel: "Visual representation",
    heliosphereNote:
      "Schematic context layer · termination shock and heliopause are visual guides, not a measured final shape.",
    representationLabels: {
      "horizons-window": "Horizons ephemeris window",
      "latest-available": "Latest available source state",
      "representative-mean-elements": "Representative mean-elements preview",
      "propagated-preview": "Propagated preview outside the accurate window",
      "verified-fallback": "Verified fallback orbit",
      unavailable: "Orbit unavailable",
    },
    representationNotes: {
      "horizons-window":
        "Source-provided Horizons vectors are interpolated inside the returned sample window.",
      "latest-available":
        "The nearest sourced state is shown without claiming live telemetry.",
      "representative-mean-elements":
        "The orbit is a representative preview derived from published mean elements.",
      "propagated-preview":
        "The position is a limited orbital preview and is not suitable for navigation.",
      "verified-fallback":
        "A verified bundled source snapshot is retained while the provider is unavailable.",
      unavailable: "No reliable orbital solution is available for this view.",
    },
    proceduralVisualNote:
      "The reference-guided surface is an interpretive scene treatment, not a photographic map.",
    visibility: {
      object: "object",
      layer: "layer",
      hide: (noun: string) => `Hide this ${noun}`,
      show: (noun: string) => `Show this ${noun}`,
      statuses: {
        visible: "Visible",
        "hidden-by-category": "Hidden by category",
        "hidden-individually": "Hidden individually",
        "explicitly-shown": "Explicitly shown",
      },
    },
  },
  labels: {
    star: "Star",
    selectedStar: "Selected star",
    moonRepresentative: "FEATURED MAJOR MOON · REPRESENTATIVE ORBIT",
    antiSolarTail: "ANTI-SOLAR TAIL",
    representativeOrbit: "REPRESENTATIVE ORBIT",
  },
  ephemeris: {
    controlsLabel: "Simulation time controls",
    preparing: "Preparing current UTC…",
    label: "Horizons ephemeris · TDB",
    dateTime: "UTC date and time",
    apply: "Apply",
    now: "Now",
    copyLink: "Copy link",
    copied: "Copied",
    paused: "The simulation is paused.",
    pause: "Pause simulation",
    resume: "Resume simulation",
    speed: "Simulation advance per real second",
    resetNow: "Return to now",
    editingDraft: "Draft date is not applied until you choose Apply.",
    approximatePreview: "Approximate preview",
    computedVector: "JPL computed vector",
    barycenterVector: "JPL barycenter vector",
    verifiedFallback: "Verified JPL fallback",
    computing: "Computing positions…",
    previousRetained: "Previous solution retained",
    maximumReached: "Maximum supported date reached",
    minimumReached: "Minimum supported date reached",
    requestFailed: "The requested ephemeris could not be loaded.",
    chooseInsideRange: "Choose a UTC date inside the supported session range.",
    rangeError: (minimum: string, maximum: string) =>
      `Choose a UTC date from ${minimum} through ${maximum}.`,
    generalDate: (offset: number) =>
      `General date · ${offset > 0 ? "+" : ""}${offset} years from session start`,
    timelinePast: "Past",
    timelineNow: "Now",
    timelineFuture: "Future",
    approximateDescription: (observed: string) =>
      `Approximate local osculating preview from vector epoch ${observed} TDB. Pause or release the scrubber to request the exact date.`,
    vectorDescription: (
      observed: string,
      retrieved: string,
      barycenters: readonly string[],
    ) =>
      `Vector epoch ${observed} TDB. Retrieved ${retrieved} UTC.${
        barycenters.length
          ? ` Long-range Horizons barycenters: ${barycenters.join(", ")}.`
          : ""
      }`,
    method:
      "Sun-centred geometric vectors · Ecliptic J2000 / ICRF · AU. Exact dates use JPL Horizons; accelerated playback and active scrubbing are explicitly labelled osculating-orbit previews.",
  },
});

const TR_COPY: typeof EN_COPY = Object.freeze({
  dock: {
    label: "Keşfet sahne kontrolleri",
    tabsLabel: "Keşfet panelleri",
    mobileOpen: (panel: string) => `${panel} · Kontrolleri aç`,
    mobileClose: "Keşfet kontrollerini kapat",
    mobileEyebrow: "Keşfet kontrolleri",
    mobileSelectionLabel: "Bilgi",
    minimize: "Keşfet kontrollerini küçült",
    expand: "Keşfet kontrollerini genişlet",
    panelLabels: {
      selection: "Seçim",
      navigator: "Gezgin",
      view: "Görünüm",
      time: "Zaman",
    },
  },
  navigator: {
    label: "Gök cismi gezgini",
    eyebrow: "Kategoriye göre gözat",
    back: "← Geri",
    categories: {
      "sun-planets": {
        label: "Güneş ve gezegenler",
        description: "Merkez yıldız ve sekiz gezegen.",
      },
      "planetary-moons": {
        label: "Gezegen uyduları",
        description: "Önce ana gezegeni, ardından öne çıkan büyük uyduyu seç.",
      },
      "main-belt": {
        label: "Ana kuşak dünyaları",
        description: "Ceres ve seçilmiş büyük ana kuşak cisimleri.",
      },
      "dwarf-kuiper": {
        label: "Cüce ve Kuiper dünyaları",
        description: "Seçilmiş Neptün ötesi ve cüce dünyalar.",
      },
      comets: {
        label: "Kuyruklu yıldızlar",
        description:
          "Modellenen bütün kuyruklu yıldızlar ve yörünge önizlemeleri.",
      },
      "regions-context": {
        label: "Bölgeler ve bağlam",
        description: "Kuşaklar, heliosfer ve şematik dış bağlam.",
      },
    },
    featuredMoons: "Öne çıkan büyük uydular",
    openMoons: (planet: string) =>
      `${planet} gezegeninin öne çıkan uydularını aç`,
    moonShortcut: "Uydular",
    featuredMoonCount: (count: number) => `${count} öne çıkan büyük uydu`,
    system: "sistem",
    openSystem: (body: string, count: number) =>
      `${body} sistemini aç (${count} uydu)`,
  },
  registry: {
    parentPlanetNames: {
      earth: "Dünya",
      mars: "Mars",
      jupiter: "Jüpiter",
      saturn: "Satürn",
      uranus: "Uranüs",
      neptune: "Neptün",
    },
    moonDescription: (parent: string) =>
      `${parent} sistemi · yayımlanmış yörünge elemanlarından ortak simülasyon zamanı için hesaplanır.`,
    extendedRepresentation: "Simülasyon zamanı için hesaplandı",
    planetRepresentation: "JPL Horizons efemerisi",
    moonRepresentative: "Temsili yörünge önizlemesi",
    moonHorizons: "JPL Horizons efemerisi",
    sunDescription: "Güneş merkezli sahnenin merkez referans cismi.",
    sunRepresentation: "Güneş merkezli referans",
    regions: {
      "asteroid-belt": {
        displayName: "Asteroit Kuşağı",
        description:
          "Bölgesel parçacık nüfusu; arka plandaki tek tek parçacıklara yörünge çizilmez.",
        representation: "Bölgesel bağlam",
      },
      "kuiper-belt": {
        displayName: "Kuiper Kuşağı",
        description:
          "Binlerce seçilebilir yörünge ağı yerine bağlam olarak gösterilen uzak nüfus bölgesi.",
        representation: "Bölgesel bağlam",
      },
      "oort-cloud": {
        displayName: "Oort Bulutu",
        description:
          "Şematik ve çıkarımsal dış rezervuar. Parçacık kabuğu canlı bir sayım değildir.",
        representation: "Şematik bölgesel bağlam",
      },
      heliosphere: {
        displayName: "Heliosfer",
        description:
          "Katı yüzey değil, Güneş rüzgârı sınırının bağlamsal temsili.",
        representation: "Bölgesel bağlam",
      },
    },
  },
  summary: {
    selection: "Seçim",
    overviewTitle: "Güneş Sistemi genel görünümü",
    overviewBody:
      "Önce kategori, ardından cisim seç. Sahne etkin kategori dışında yalnız düşük vurgulu mekânsal dayanakları korur.",
    closeOverview: "Genel görünüme dön",
    closeMoon: "Uydu özetini kapat",
    featuredMoon: "Öne çıkan büyük uydu",
    featuredSetNote:
      "Bu, öne çıkarılmış bir seçkidir; bilinen bütün uyduların modellendiği iddiası değildir.",
    representativeOrbit: "Temsili yörünge önizlemesi",
    proceduralVisual: "Kaynaklara dayalı görsel",
    calculatedForTime: "Simülasyon zamanı için hesaplandı",
    publishedElements: "Yayımlanmış yörünge elemanları",
    regionType: "Bölge ve bağlam",
    sceneRole: "Sahne rolü",
    systemOrigin: "Sistem başlangıcı",
    positionMethod: "Konum yöntemi",
    meanRadius: "Ortalama yarıçap",
    orbitalPeriod: "Yörünge dönemi",
    representation: "Temsil",
    visual: "Görsel",
    gravity: "Yerçekimi",
    year: "Yıl",
    earthDays: "Dünya günü",
    knownMoons: "Tanınmış uydular",
    asOf: "tarih",
    sourceBasis: "Kaynak temeli",
    provider: "Sağlayıcı",
    referenceFrame: "Referans çerçevesi",
    precisionNote: "Kullanım notu",
    semiMajorAxis: "Yarı büyük eksen",
    openPlanetDetail: (planet: string) => `${planet} detayını aç`,
    openObjectEditorial: (body: string) => `${body} editoryal sayfasını aç`,
    openRegionDetail: (region: string) => `${region} bağlam sayfasını aç`,
    planetEyebrow: (order: number) => `Gezegen ${order}`,
    openSunDetail: "Güneş detayını aç",
    openBodyDetail: (body: string) => `${body} detayını aç`,
    dwarfSatellite: "Cüce sistem uydusu",
    kindLabels: {
      asteroid: "Asteroit",
      comet: "Kuyruklu yıldız",
      "dwarf-planet": "Cüce gezegen",
      "kuiper-object": "Kuiper Kuşağı cismi",
    },
    regionKindLabels: {
      "main-belt": "Ana asteroit kuşağı",
      "trans-neptunian-belt": "Neptün ötesi kuşak",
      "distant-shell": "Uzak çıkarımsal kabuk",
      "solar-boundary": "Güneş rüzgârı sınırı",
    },
    regionRepresentationLabels: {
      "context-layer": "Bağlam katmanı",
      inferred: "Çıkarımsal yapı",
      schematic: "Şematik yapı",
    },
    days: "gün",
    heliosphereBoundary: "Heliosfer sınırı",
    regionRepresentation: "Temsil",
    regionVisualModel: "Görsel temsil",
    heliosphereNote:
      "Şematik bağlam katmanı · sonlanma şoku ve heliopause ölçülmüş kesin bir şekil değil, görsel rehberlerdir.",
    representationLabels: {
      "horizons-window": "Horizons efemeris penceresi",
      "latest-available": "Son mevcut kaynak durumu",
      "representative-mean-elements": "Temsili ortalama elemanlar önizlemesi",
      "propagated-preview": "Doğruluk penceresi dışında ilerletilmiş önizleme",
      "verified-fallback": "Doğrulanmış yedek yörünge",
      unavailable: "Yörünge kullanılamıyor",
    },
    representationNotes: {
      "horizons-window":
        "Kaynak tarafından sağlanan Horizons vektörleri döndürülen örnek penceresi içinde ara değerleme ile gösterilir.",
      "latest-available":
        "En yakın kaynaklı durum, canlı telemetri iddiası olmadan gösterilir.",
      "representative-mean-elements":
        "Yörünge, yayımlanmış ortalama elemanlardan türetilen temsili bir önizlemedir.",
      "propagated-preview":
        "Konum sınırlı bir yörünge önizlemesidir; seyir amacıyla kullanılamaz.",
      "verified-fallback":
        "Sağlayıcı kullanılamazken doğrulanmış paketli kaynak anlık görüntüsü korunur.",
      unavailable: "Bu görünüm için güvenilir bir yörünge çözümü bulunmuyor.",
    },
    proceduralVisualNote:
      "Kaynaklara dayalı yüzey, yorumlayıcı bir sahne uygulamasıdır; fotoğrafik harita değildir.",
    visibility: {
      object: "cisim",
      layer: "katman",
      hide: (noun: string) =>
        noun === "katman" ? "Bu katmanı gizle" : "Bu cismi gizle",
      show: (noun: string) =>
        noun === "katman" ? "Bu katmanı göster" : "Bu cismi göster",
      statuses: {
        visible: "Görünür",
        "hidden-by-category": "Kategori tarafından gizli",
        "hidden-individually": "Tekil olarak gizli",
        "explicitly-shown": "Açıkça gösteriliyor",
      },
    },
  },
  labels: {
    star: "Yıldız",
    selectedStar: "Seçili yıldız",
    moonRepresentative: "ÖNE ÇIKAN BÜYÜK UYDU · TEMSİLİ YÖRÜNGE",
    antiSolarTail: "GÜNEŞ KARŞITI KUYRUK",
    representativeOrbit: "TEMSİLİ YÖRÜNGE",
  },
  ephemeris: {
    controlsLabel: "Simülasyon zamanı kontrolleri",
    preparing: "Güncel UTC hazırlanıyor…",
    label: "Horizons efemerisi · TDB",
    dateTime: "UTC tarih ve saat",
    apply: "Uygula",
    now: "Şimdi",
    copyLink: "Bağlantıyı kopyala",
    copied: "Kopyalandı",
    paused: "Simülasyon duraklatıldı.",
    pause: "Simülasyonu duraklat",
    resume: "Simülasyonu sürdür",
    speed: "Gerçek saniye başına simülasyon ilerlemesi",
    resetNow: "Şimdiye dön",
    editingDraft: "Taslak tarih Uygula seçilene kadar etkinleşmez.",
    approximatePreview: "Yaklaşık önizleme",
    computedVector: "JPL hesaplanmış vektörü",
    barycenterVector: "JPL barycenter vektörü",
    verifiedFallback: "Doğrulanmış JPL yedeği",
    computing: "Konumlar hesaplanıyor…",
    previousRetained: "Önceki çözüm korunuyor",
    maximumReached: "Desteklenen en ileri tarihe ulaşıldı",
    minimumReached: "Desteklenen en erken tarihe ulaşıldı",
    requestFailed: "İstenen efemeris yüklenemedi.",
    chooseInsideRange: "Desteklenen oturum aralığında bir UTC tarihi seç.",
    rangeError: (minimum: string, maximum: string) =>
      `${minimum} ile ${maximum} arasında bir UTC tarihi seç.`,
    generalDate: (offset: number) =>
      `Genel tarih · oturum başlangıcından ${offset > 0 ? "+" : ""}${offset} yıl`,
    timelinePast: "Geçmiş",
    timelineNow: "Şimdi",
    timelineFuture: "Gelecek",
    approximateDescription: (observed: string) =>
      `${observed} TDB vektör çağından yaklaşık yerel oskülatör önizleme. Tam tarihi istemek için duraklat veya scrubber'ı bırak.`,
    vectorDescription: (
      observed: string,
      retrieved: string,
      barycenters: readonly string[],
    ) =>
      `Vektör çağı ${observed} TDB. ${retrieved} UTC tarihinde alındı.${barycenters.length ? ` Uzun menzilli Horizons barycenter'ları: ${barycenters.join(", ")}.` : ""}`,
    method:
      "Güneş merkezli geometrik vektörler · Ekliptik J2000 / ICRF · AU. Tam tarihler JPL Horizons kullanır; hızlandırılmış oynatma ve etkin sürükleme açıkça oskülatör yörünge önizlemesi olarak etiketlenir.",
  },
});

export const exploreSceneCopyByLocale = Object.freeze({
  en: EN_COPY,
  tr: TR_COPY,
}) satisfies Readonly<Record<Locale, typeof EN_COPY>>;
export function getExploreSceneCopy(locale: Locale = "en") {
  return exploreSceneCopyByLocale[locale];
}
export const exploreSceneCopy = EN_COPY;
