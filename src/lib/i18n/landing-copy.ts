import type { Locale } from "./locale";

export const landingCopy = {
  en: {
    home: {
      metadataDescription:
        "Explore the Solar System through sourced data, human-scale comparisons and a cinematic 3D scene.",
      heroKicker: "A sourced, cinematic Solar System",
      intro:
        "Helios connects planetary science to human scale: your weight on Mars, the length of a day on Venus, or the time sunlight needs to reach Neptune.",
      actions: {
        explore: "Explore the system",
        missions: "Follow the missions",
        compare: "Compare two worlds",
      },
      scope: {
        label: "Helios product scope",
        bodies: "Real bodies",
        regions: "Context regions",
        destinations: "Detail destinations",
        visual: "Visual system",
        high: "Consistent visual profile",
      },
      principles: {
        kicker: "Product position",
        title: "Scale, place and evidence stay connected",
        items: [
          {
            title: "Explore without pretending",
            body: "Readable body sizes and compressed distances are labelled as a presentation choice. Scientific view uses a shared physical ratio without claiming navigation-grade simulation everywhere.",
          },
          {
            title: "Translate numbers into experience",
            body: "Gravity, day length, sunlight delay and atmospheric reference levels are framed around questions a visitor can understand without hiding the definition behind each number.",
          },
          {
            title: "Keep data time visible",
            body: "Reference, historical, latest-available and near-live records keep different labels. Remote failure cannot turn an old observation into a fake current state.",
          },
        ],
      },
      destinations: {
        kicker: "Four ways in",
        title: "Choose a question, not a menu category",
        lede: "Every body page follows the same sourcing and accessibility standards, while its editorial structure changes with the world. These four entries show that range without reducing the library to a grid of identical cards.",
        open: "Open destination →",
        items: [
          {
            href: "/body/sun",
            index: "01",
            label: "Sun",
            title: "Start at the source",
            body: "Read the star as a physical reference: radius, rotation, illumination and the visual limits of a cinematic corona.",
          },
          {
            href: "/body/earth",
            index: "02",
            label: "Earth",
            title: "Keep the baseline visible",
            body: "Earth anchors every human-scale comparison while near-live and historical records remain clearly separated from reference facts.",
          },
          {
            href: "/body/mars",
            index: "03",
            label: "Mars",
            title: "Familiar time, hostile conditions",
            body: "A near-Earth day length meets a thin atmosphere, dated mission evidence and a gravity comparison that never changes mass into a gimmick.",
          },
          {
            href: "/body/saturn",
            index: "04",
            label: "Saturn",
            title: "See a system, not an icon",
            body: "Rings, atmosphere and moons are treated as one planetary architecture with scale and reference-level caveats kept in view.",
          },
        ],
      },
      apod: {
        kicker: "Dated media record",
        title: "A window beyond the planetary catalogue",
        body: "APOD supports the Helios story without replacing it. The record keeps its date, media type, credit and official source. When remote media is unavailable, the dated record remains readable.",
      },
      closing: {
        kicker: "Continue with context",
        title: "The scene is only one layer of the product",
        body: "Browse the body library, compare worlds with an accessible table, follow the mission record, or see how Helios handles sources, unavailable data and visual interpretation.",
        explore: "Enter Explore",
        data: "See the data methods",
        caseStudy: "Read the case study",
      },
    },
    missions: {
      metadataDescription:
        "A source-linked mission index connecting eight editorial planet pages to the spacecraft that changed how those worlds are understood.",
      hero: {
        kicker: "Mission index · dated sources",
        title: "Spacecraft as evidence, not decoration",
        body: "Helios connects each planet portrait to a mission that materially changed what can be said about that world. Status labels are kept with their source context; this page is not a live operations console.",
        explore: "Explore the system",
        data: "Read the data policy",
      },
      scope: {
        label: "Mission catalogue scope",
        records: "Editorial records",
        systems: "Planet systems",
        rule: "Source rule",
        official: "Official record",
      },
      catalogue: {
        kicker: "Selected missions",
        title: "Eight worlds, different kinds of encounter",
        body: "Orbiters, flybys, atmospheric probes and Earth-observing platforms answer different questions. The cards preserve that distinction instead of flattening every mission into the same achievement list.",
        openPlanet: (planet: string) => `Open ${planet}`,
        official: "Official record",
        officialLabel: (source: string, mission: string) =>
          `Open the official ${source} source for ${mission} (opens in a new tab)`,
      },
      method: {
        kicker: "Reading the catalogue",
        title: "Status is dated context",
        first:
          "“Historical” identifies a completed record. “Latest available” means the linked official page is the newest reviewed source in the repository; it does not imply live telemetry or a guaranteed future schedule.",
        second:
          "Mission records remain deliberately selective. They explain why a planet page emphasizes radar mapping, atmospheric descent, polar storms or close-range flyby evidence without claiming to inventory every spacecraft ever launched.",
      },
    },
  },
  tr: {
    home: {
      metadataDescription:
        "Güneş Sistemi'ni kaynaklı veriler, insan ölçeğindeki karşılaştırmalar ve sinematik bir 3B sahneyle keşfedin.",
      heroKicker: "Kaynaklı, sinematik bir Güneş Sistemi",
      intro:
        "Helios gezegen bilimini insan ölçeğine bağlar: Mars'taki tartı karşılığınız, Venüs'te bir günün uzunluğu veya güneş ışığının Neptün'e ulaşma süresi.",
      actions: {
        explore: "Sistemi keşfet",
        missions: "Görevleri takip et",
        compare: "İki dünyayı karşılaştır",
      },
      scope: {
        label: "Helios ürün kapsamı",
        bodies: "Gerçek cisim",
        regions: "Bağlam bölgesi",
        destinations: "Detay hedefi",
        visual: "Görsel sistem",
        high: "Tutarlı görsel profil",
      },
      principles: {
        kicker: "Ürün konumu",
        title: "Ölçek, konum ve kanıt birbirinden ayrılmaz",
        items: [
          {
            title: "Gerçeği saklamadan keşfet",
            body: "Okunabilir cisim boyutları ve sıkıştırılmış uzaklıklar sunum tercihi olarak etiketlenir. Bilimsel görünüm ortak bir fiziksel oran kullanır; her yerde seyir hassasiyeti iddiasında bulunmaz.",
          },
          {
            title: "Sayıları deneyime çevir",
            body: "Yerçekimi, gün uzunluğu, ışık gecikmesi ve atmosfer referans seviyeleri; her değerin tanımını gizlemeden, ziyaretçinin anlayabileceği sorular etrafında anlatılır.",
          },
          {
            title: "Verinin zamanını görünür tut",
            body: "Referans, tarihsel, son mevcut ve yakın canlı kayıtlar farklı etiketler taşır. Uzak kaynağın kesilmesi eski bir gözlemi sahte bir güncel duruma dönüştüremez.",
          },
        ],
      },
      destinations: {
        kicker: "Dört giriş noktası",
        title: "Menü kategorisi değil, bir soru seç",
        lede: "Her cisim sayfası aynı kaynak ve erişilebilirlik standartlarını izler; editoryal yapısı ise dünyaya göre değişir. Bu dört giriş, kütüphaneyi birbirinin aynı kartlara indirgemeden çeşitliliği gösterir.",
        open: "Detayı aç →",
        items: [
          {
            href: "/body/sun",
            index: "01",
            label: "Güneş",
            title: "Kaynağın kendisinden başla",
            body: "Yıldızı fiziksel bir referans olarak oku: yarıçap, dönüş, aydınlatma ve sinematik koronanın görsel sınırları.",
          },
          {
            href: "/body/earth",
            index: "02",
            label: "Dünya",
            title: "Referans çizgisini görünür tut",
            body: "Dünya bütün insan ölçekli karşılaştırmaları sabitler; yakın canlı ve tarihsel kayıtlar referans bilgilerden açıkça ayrılır.",
          },
          {
            href: "/body/mars",
            index: "03",
            label: "Mars",
            title: "Tanıdık zaman, düşmanca koşullar",
            body: "Dünya'ya yakın bir gün uzunluğu; ince atmosfer, tarihli görev kanıtları ve kütleyi bir oyuncağa çevirmeyen yerçekimi karşılaştırmasıyla buluşur.",
          },
          {
            href: "/body/saturn",
            index: "04",
            label: "Satürn",
            title: "Bir ikon değil, bir sistem gör",
            body: "Halkalar, atmosfer ve uydular tek bir gezegen mimarisi olarak ele alınır; ölçek ve referans seviyesi sınırları görünür kalır.",
          },
        ],
      },
      apod: {
        kicker: "Tarihli medya kaydı",
        title: "Gezegen kataloğunun ötesine açılan pencere",
        body: "APOD, Helios anlatısını destekler; onun yerine geçmez. Kayıt tarihini, medya türünü, katkı bilgisini ve resmî kaynağını korur. Uzak medya yüklenemediğinde tarihli kayıt yine okunabilir kalır.",
      },
      closing: {
        kicker: "Bağlamla devam et",
        title: "Sahne, ürünün yalnızca bir katmanı",
        body: "Cisim kütüphanesini incele, dünyaları erişilebilir bir tabloyla karşılaştır, görev kayıtlarını takip et veya Helios'un kaynakları, ulaşılamayan veriyi ve görsel yorumları nasıl ele aldığını oku.",
        explore: "Keşfet'e gir",
        data: "Veri yöntemlerini incele",
        caseStudy: "Vaka çalışmasını oku",
      },
    },
    missions: {
      metadataDescription:
        "Sekiz editoryal gezegen sayfasını, bu dünyalar hakkındaki bilgimizi değiştiren uzay araçlarına bağlayan kaynaklı görev dizini.",
      hero: {
        kicker: "Görev dizini · tarihli kaynaklar",
        title: "Dekor değil, kanıt olarak uzay araçları",
        body: "Helios her gezegen portresini, o dünya hakkında söylenebilecekleri somut biçimde değiştiren bir görevle bağlar. Durum etiketleri kaynak bağlamını korur; bu sayfa canlı bir operasyon konsolu değildir.",
        explore: "Sistemi keşfet",
        data: "Veri politikasını oku",
      },
      scope: {
        label: "Görev kataloğu kapsamı",
        records: "Editoryal kayıt",
        systems: "Gezegen sistemi",
        rule: "Kaynak kuralı",
        official: "Resmî kayıt",
      },
      catalogue: {
        kicker: "Seçili görevler",
        title: "Sekiz dünya, farklı karşılaşma biçimleri",
        body: "Yörünge araçları, yakın geçişler, atmosfer sondaları ve Dünya gözlem platformları farklı sorulara cevap verir. Kartlar her görevi aynı başarı listesine dönüştürmek yerine bu ayrımı korur.",
        openPlanet: (planet: string) => `${planet} sayfasını aç`,
        official: "Resmî kayıt",
        officialLabel: (source: string, mission: string) =>
          `${mission} için resmî ${source} kaynağını aç (yeni sekmede açılır)`,
      },
      method: {
        kicker: "Kataloğu okumak",
        title: "Durum, tarihli bir bağlamdır",
        first:
          "“Tarihsel”, tamamlanmış bir kaydı tanımlar. “Son mevcut”, bağlantılı resmî sayfanın repository'de kabul edilen en yeni kaynak olduğu anlamına gelir; canlı telemetri veya değişmeyecek gelecek takvimi anlamına gelmez.",
        second:
          "Görev kayıtları bilinçli olarak seçicidir. Her uzay aracını listelediğini iddia etmeden, gezegen sayfasının neden radar haritalama, atmosferik iniş, kutup fırtınaları veya yakın geçiş kanıtını vurguladığını açıklar.",
      },
    },
  },
} as const satisfies Record<Locale, object>;
