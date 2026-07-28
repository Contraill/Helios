import type { Locale } from "./locale";

export const editorialPageCopy = {
  en: {
    about: {
      metadataTitle: "About",
      metadataDescription:
        "Why Helios combines a cinematic Solar System with sourced data, explicit scale limits and accessible exploration.",
      hero: {
        kicker: "About Helios",
        title: "A quieter way to read the Solar System.",
        lead: "Helios turns scale, orbital motion and planetary data into an exploration experience without hiding where the science ends and the visual interpretation begins.",
        body: "It is an independent portfolio project developed as a complete product: cited reference values, validated external records, clear unavailable states and keyboard-accessible primary pages surround a centrally managed Three.js scene.",
        explore: "Explore the system",
        caseStudy: "Read the case study",
      },
      scopeLabel: "Helios scope",
      metrics: {
        destinations: "Detail destinations",
        destinationsBody: (bodies: number, regions: number) =>
          `${bodies} real bodies and ${regions} regional context layers.`,
        planets: "Planet stories",
        planetsBody:
          "Distinct editorial pages with human-scale and mission context.",
        profiles: "Scene profiles",
        profilesBody:
          "Exploration and scientific scale share one scene and one visual standard.",
        quality: "Quality rule",
        qualityBody:
          "A single High visual direction with automatic capability handling.",
      },
      purpose: {
        number: "01 · Purpose",
        title: "Not a dashboard. Not a physics claim.",
        body: "Helios sits between a reference catalogue and a cinematic scene. The goal is to help a visitor understand why worlds feel different, not merely list their diameters.",
        quote:
          "A useful model explains both what it shows and what it leaves out.",
      },
      principles: {
        number: "02 · Principles",
        title: "The rules behind the experience",
        body: "These constraints govern the 3D scene, editorial routes and data surfaces together.",
        items: [
          [
            "Scientific honesty",
            "The label is part of the data",
            "Reference values, historical observations, latest-available records and fallbacks are not blended into a false present. Source and time context stay visible wherever they change the meaning of a value.",
          ],
          [
            "Cinematic restraint",
            "Visual drama serves orientation",
            "Glow, camera movement and compressed distance make the system legible. They never turn an exploration view into an unstated claim of exact physical scale or current appearance.",
          ],
          [
            "Accessible by design",
            "The canvas is not the only route",
            "Every real body represented in Explore and each regional context layer has a semantic detail page. Core navigation, comparison, data provenance and fallback content remain available without relying on hover or a working WebGL scene.",
          ],
          [
            "Product depth",
            "A world is more than a stat card",
            "Planet pages use different editorial priorities, while moons and small bodies retain their own orbital, visual and source context instead of becoming anonymous points in a catalogue.",
          ],
        ],
      },
      map: {
        number: "03 · Product map",
        title: "Four ways into the same system",
        body: "Each route answers a different question while using the same source and scale language.",
        items: [
          [
            "Explore",
            "Where is it?",
            "Navigate a timed 3D scene, change scale profile and focus any body or regional context included in the catalogue.",
            "Open Explore",
            "/explore",
          ],
          [
            "Body library",
            "What kind of world is it?",
            "Read server-rendered pages for the Sun, planets, moons, dwarf-system satellites, selected small bodies and system regions.",
            "Start with the Sun",
            "/body/sun",
          ],
          [
            "Compare",
            "How different is it?",
            "Place two planets in one reference frame with explicit definitions, human-scale calculations and a shareable URL.",
            "Compare two worlds",
            "/compare",
          ],
          [
            "Data",
            "When and from where?",
            "Inspect observation time, retrieval time, source status, fallback state and the limits of each external service.",
            "Open the data record",
            "/data",
          ],
        ],
        heliosphere: "Read the heliosphere",
      },
      guide: {
        number: "04 · Reading guide",
        title: "Three distinctions matter",
        items: [
          [
            "Scale",
            "Exploration mode prioritizes legibility. Scientific mode preserves shared physical ratios. Neither changes the underlying source records.",
          ],
          [
            "Time",
            "Observation time belongs to an event or instrument. Retrieval time belongs to the Helios request or verified snapshot.",
          ],
          [
            "Representation",
            "A real map, derived map or reference-guided visual reconstruction describes the surface. Orbit precision is documented separately.",
          ],
        ],
      },
      callout: {
        title: "Continue with the decisions, not a feature list.",
        body: "The case study follows the project from the scale problem through scene ownership, asset provenance, data fallbacks and the regression tests that protect established behavior.",
        action: "Open case study",
      },
    },
    caseStudy: {
      metadataDescription:
        "The product, scene architecture, scientific data and quality decisions behind Helios.",
      hero: {
        kicker: "Helios case study",
        title: "Building a Solar System that admits its limits.",
        lead: "The hard part was not drawing spheres. It was keeping cinematic motion, physical scale, changing data, visual provenance and user control inside one coherent product.",
        body: "Helios began as a small planetary explorer and grew into a connected product with clear scene ownership, sourced body records, bounded visual assets, validated external data and tests that protect both scientific language and interaction behavior.",
        product: "Open the product",
        principles: "Read the product principles",
      },
      scopeLabel: "Current product",
      metrics: {
        destinations: "Detail destinations",
        destinationsBody: (bodies: number, regions: number) =>
          `${bodies} real bodies and ${regions} context regions with semantic routes.`,
        moons: "Featured moons",
        moonsBody:
          "Planetary satellites with sourced orbit data and documented visual treatment.",
        bodies: "Small bodies",
        bodiesBody:
          "Asteroids, dwarf and Kuiper objects, and comets in the documented catalogue.",
        texture: "Texture ceiling",
        textureBody: "A fixed ceiling verified from the display asset list.",
      },
      problem: {
        number: "01 · Problem",
        title: "Most Solar System products choose one extreme",
        body: "Rich simulators can be difficult to read. Polished visual demos can hide weak data and scale assumptions. Helios needed editorial depth without giving up a continuous, explorable scene.",
        cards: [
          [
            "User question",
            "What would another world feel like?",
            "Diameter alone does not answer this. The product connects gravity, day and year length, atmosphere, light delay, missions and surface character to a human reference.",
          ],
          [
            "Engineering question",
            "How can the scene stay trustworthy?",
            "Body scale, orbital motion, camera behavior, visual assets and external observations each need clear rules that still resolve into one experience.",
          ],
        ],
      },
      corrections: {
        number: "02 · Early corrections",
        title: "The product improved by removing ambiguity",
        body: "Several early directions were visually convenient but structurally weak. Each correction became an explicit architecture rule.",
        items: [
          [
            "Scene controls",
            "From overlapping controls to owned docks",
            "Selection, Navigator, View and Time became distinct responsibilities. Retired quality and motion controls were removed instead of being left as inactive branches.",
          ],
          [
            "Texture lifecycle",
            "From selection-triggered loading to staged readiness",
            "The Sun loads first, followed by the eight planets and required primary layers. Secondary bodies use a scheduler and never block the opening sequence.",
          ],
          [
            "Time",
            "From local animation state to a persistent simulation clock",
            "Scrubbing, pause, speed, reset and ephemeris requests now share one timestamp. Returning to timestamp A must reproduce the same deterministic scene state.",
          ],
          [
            "Small bodies",
            "From decorative points to source-backed systems",
            "Moons, dwarf systems, asteroids and comets gained central IDs, orbit policies, source metadata, visual profiles and explicit fallback behavior.",
          ],
        ],
      },
      decisions: {
        number: "03 · Key decisions",
        title: "Decisions that keep the product consistent",
        items: [
          [
            "Scene authority",
            "Selection, camera and time have one owner",
            "Bodies publish interaction intent. Central stores and the camera rig resolve focus, overview, the transition to manual control and deterministic time without allowing individual meshes to move the camera or rewrite the clock.",
          ],
          [
            "Scale",
            "Legibility and physical ratio are separate profiles",
            "Exploration mode enlarges bodies and compresses distance. Scientific mode uses a shared ratio. Both reuse the same scene system, materials and catalogue so the switch does not become a second implementation.",
          ],
          [
            "Assets",
            "Every surface documents its representation",
            "Real maps, derived maps and reference-guided visual reconstructions carry source, coverage, orientation and calibration notes. Display textures stay within a fixed ceiling and load from the Sun outward.",
          ],
          [
            "Orbit precision",
            "A smooth animation is not called an ephemeris",
            "Horizons-backed windows, representative mean elements and propagated previews are labelled separately. Missing poles or angular elements remain unresolved rather than being randomized for visual variety.",
          ],
          [
            "External data",
            "External records are prepared before display",
            "Server adapters validate and normalize responses, attach observation and retrieval metadata, apply service-specific cache rules and choose between current data, verified snapshots and static explanations.",
          ],
          [
            "Accessibility",
            "The product survives without the canvas",
            "Semantic navigation, server-rendered body pages, comparison tables, visible focus, reduced-motion behavior and a WebGL fallback ensure that 3D is an enhancement rather than the only information channel.",
          ],
        ],
      },
      architecture: {
        number: "04 · Architecture",
        title: "Server-rendered pages around a focused interactive core",
        body: "The 3D experience stays client-side, while body narratives, metadata and most data presentation remain server-rendered.",
        items: [
          [
            "Presentation",
            "Routes and editorial composition",
            "Next.js App Router pages, responsive CSS modules, semantic tables and body-specific layouts expose content without requiring WebGL.",
          ],
          [
            "Application",
            "Selection, camera and simulation",
            "Zustand stores hold bounded interaction state. Fast Three.js transforms stay inside the frame loop and do not write React state every frame.",
          ],
          [
            "Domain",
            "Bodies, scale and orbital evaluation",
            "Validated planet records, celestial registries, reference frames and shared orbit evaluators keep UI labels and rendered geometry tied to the same model.",
          ],
          [
            "Data",
            "Adapters, cache and fallback",
            "Zod schemas normalize provider responses. Each service defines its own timeout, revalidation, snapshot and unavailable behavior.",
          ],
        ],
      },
      quality: {
        number: "05 · Quality",
        title: "Release confidence comes from evidence, not file presence",
        items: [
          [
            "Static quality",
            "Formatting, lint, Next.js route type generation, strict TypeScript, unit tests and the display-texture audit run together.",
          ],
          [
            "Interaction",
            "Playwright covers smoke routes, keyboard flows, responsive layouts, time behavior, asset readiness and selection/camera contracts.",
          ],
          [
            "Visual evidence",
            "Real canvas screenshots verify surfaces, lighting, orbit context, city-light rejection and small-body framing where DOM assertions are insufficient.",
          ],
          [
            "Scientific language",
            "Tests and source records distinguish accurate windows, representative models, historical observations, latest-available data and fallbacks.",
          ],
        ],
      },
      result: {
        number: "06 · Result",
        title: "A foundation that can grow without changing its story",
        calloutTitle: "The product is broader and clearer about its limits.",
        body: "Explore can represent a body or region, its detail page can explain it, the Data page can state when an observation happened, and the case study can show the shared rules that keep those surfaces aligned. Later visual refinement can build on that foundation without redesigning camera, time, source or scale ownership.",
        library: "Enter the body library",
        outer: "Read the outer context",
        data: "Inspect provenance",
      },
    },
  },
  tr: {
    about: {
      metadataTitle: "Hakkında",
      metadataDescription:
        "Helios'un sinematik Güneş Sistemi deneyimini kaynaklı veri, açık ölçek sınırları ve erişilebilir keşifle neden birleştirdiği.",
      hero: {
        kicker: "Helios hakkında",
        title: "Güneş Sistemi'ni daha sakin okumanın bir yolu.",
        lead: "Helios; ölçek, yörünge hareketi ve gezegen verilerini, bilimin nerede bittiğini ve görsel yorumun nerede başladığını saklamadan bir keşif deneyimine dönüştürür.",
        body: "Bağımsız bir portföy projesidir ve tamamlanmış bir ürün gibi geliştirilmiştir: kaynaklandırılmış referans değerleri, doğrulanmış dış kayıtlar, açık kullanılamaz durumları ve klavyeyle erişilebilen ana sayfaları tek merkezden yönetilen Three.js sahnesini çevreler.",
        explore: "Sistemi keşfet",
        caseStudy: "Vaka çalışmasını oku",
      },
      scopeLabel: "Helios kapsamı",
      metrics: {
        destinations: "Detay hedefleri",
        destinationsBody: (bodies: number, regions: number) =>
          `${bodies} gerçek cisim ve ${regions} bölgesel bağlam katmanı.`,
        planets: "Gezegen hikâyeleri",
        planetsBody:
          "İnsan ölçeği ve görev bağlamı taşıyan birbirinden farklı editoryal sayfalar.",
        profiles: "Sahne profilleri",
        profilesBody:
          "Keşif ve bilimsel ölçek aynı sahneyi ve görsel standardı kullanır.",
        quality: "Kalite kuralı",
        qualityBody: "Otomatik yetenek yönetimiyle tek bir Yüksek görsel yönü.",
      },
      purpose: {
        number: "01 · Amaç",
        title: "Gösterge paneli değil. Fizik iddiası değil.",
        body: "Helios bir referans kataloğu ile sinematik sahne arasında konumlanır. Amaç yalnızca çapları listelemek değil, dünyaların neden farklı hissedildiğini anlatmaktır.",
        quote:
          "Yararlı bir model hem neyi gösterdiğini hem de neyi dışarıda bıraktığını açıklar.",
      },
      principles: {
        number: "02 · İlkeler",
        title: "Deneyimin arkasındaki kurallar",
        body: "Bu sınırlar 3B sahneyi, editoryal sayfa yollarını ve veri yüzeylerini birlikte yönetir.",
        items: [
          [
            "Bilimsel dürüstlük",
            "Etiket verinin bir parçasıdır",
            "Referans değerleri, tarihsel gözlemler, son mevcut kayıtlar ve yedekler sahte bir şimdi anında birleştirilmez. Kaynak ve zaman bağlamı, değerin anlamını değiştirdiği her yerde görünür kalır.",
          ],
          [
            "Sinematik ölçülülük",
            "Görsel drama yön bulmaya hizmet eder",
            "Parlama, kamera hareketi ve sıkıştırılmış uzaklık sistemi okunabilir kılar. Keşif görünümünü, açıklanmamış kesin fiziksel ölçek veya güncel görünüm iddiasına dönüştürmez.",
          ],
          [
            "Erişilebilir tasarım",
            "3B sahne tek yol değildir",
            "Keşfet'teki her gerçek cisim ve bölgesel bağlam katmanı semantik bir detay sayfasına sahiptir. Ana gezinme, karşılaştırma, kaynak geçmişi ve yedek içerikleri fareyle üzerine gelme veya çalışan WebGL olmadan da erişilebilir kalır.",
          ],
          [
            "Ürün derinliği",
            "Bir dünya istatistik kartından fazlasıdır",
            "Gezegen sayfaları farklı editoryal öncelikler kullanır; uydular ve küçük cisimler anonim katalog noktalarına dönüşmeden kendi yörünge, görsel ve kaynak bağlamlarını korur.",
          ],
        ],
      },
      map: {
        number: "03 · Ürün haritası",
        title: "Aynı sisteme dört giriş",
        body: "Her sayfa yolu farklı bir soruyu cevaplar; ancak aynı kaynak ve ölçek dilini kullanır.",
        items: [
          [
            "Keşfet",
            "Nerede?",
            "Zaman kontrollü 3B sahnede gezin, ölçek profilini değiştirin ve katalogdaki herhangi bir cisim veya bölgesel bağlama odaklanın.",
            "Keşfet'i aç",
            "/explore",
          ],
          [
            "Cisim kütüphanesi",
            "Nasıl bir dünya?",
            "Güneş, gezegenler, uydular, cüce sistem uyduları, seçili küçük cisimler ve sistem bölgeleri için sunucuda üretilen sayfaları okuyun.",
            "Güneş ile başla",
            "/body/sun",
          ],
          [
            "Karşılaştır",
            "Ne kadar farklı?",
            "İki gezegeni açık tanımlar, insan ölçekli hesaplamalar ve paylaşılabilir URL ile aynı referans çerçevesine yerleştirin.",
            "İki dünyayı karşılaştır",
            "/compare",
          ],
          [
            "Veri",
            "Ne zaman ve nereden?",
            "Gözlem zamanı, alınma zamanı, kaynak durumu, yedek ve her dış servisin sınırlarını inceleyin.",
            "Veri kaydını aç",
            "/data",
          ],
        ],
        heliosphere: "Heliosferi oku",
      },
      guide: {
        number: "04 · Okuma rehberi",
        title: "Üç ayrım önemlidir",
        items: [
          [
            "Ölçek",
            "Keşif modu okunabilirliği, bilimsel mod ortak fiziksel oranları önceler. Hiçbiri alttaki kaynak kayıtlarını değiştirmez.",
          ],
          [
            "Zaman",
            "Gözlem zamanı olay veya araca; alınma zamanı Helios isteği veya doğrulanmış tarihli kayda aittir.",
          ],
          [
            "Temsil",
            "Gerçek harita, türetilmiş harita veya kaynaklara dayalı görsel yeniden yapılandırma yüzeyi tanımlar. Yörünge hassasiyeti ayrı belgelenir.",
          ],
        ],
      },
      callout: {
        title: "Özellik listesiyle değil, kararlarla devam et.",
        body: "Vaka çalışması; ölçek probleminden sahne sorumluluklarına, varlıkların kaynak geçmişinden veri kesintilerine ve sonraki görsel çalışmaların önceki davranışları bozmamasını sağlayan testlere kadar projenin gelişimini anlatır.",
        action: "Vaka çalışmasını aç",
      },
    },
    caseStudy: {
      metadataDescription:
        "Helios'un arkasındaki ürün, sahne mimarisi, bilimsel veri ve kalite kararları.",
      hero: {
        kicker: "Helios vaka çalışması",
        title: "Sınırlarını kabul eden bir Güneş Sistemi inşa etmek.",
        lead: "Zor olan küre çizmek değildi. Sinematik hareketi, fiziksel ölçeği, değişen veriyi, görsel kaynak geçmişini ve kullanıcı kontrolünü tek tutarlı ürün içinde tutmaktı.",
        body: "Helios küçük bir gezegen keşfi olarak başladı; sahne sorumlulukları belirli, cisim kayıtları kaynaklı, görsel varlıkları sınırlı, dış verileri doğrulanan ve bilimsel dil ile etkileşim davranışını testlerle koruyan bütünlüklü bir ürüne dönüştü.",
        product: "Ürünü aç",
        principles: "Ürün ilkelerini oku",
      },
      scopeLabel: "Mevcut ürün",
      metrics: {
        destinations: "Detay hedefleri",
        destinationsBody: (bodies: number, regions: number) =>
          `${bodies} gerçek cisim ve semantik sayfalara sahip ${regions} bağlam bölgesi.`,
        moons: "Seçili uydular",
        moonsBody:
          "Yörünge verileri kaynaklı ve görsel temsilleri belgelenmiş gezegen uyduları.",
        bodies: "Küçük cisimler",
        bodiesBody:
          "Belgelenmiş katalogdaki asteroitler, cüce/Kuiper cisimleri ve kuyruklu yıldızlar.",
        texture: "Görüntü dokusu sınırı",
        textureBody: "Görüntü varlığı listesinden doğrulanan sabit üst sınır.",
      },
      problem: {
        number: "01 · Problem",
        title: "Çoğu Güneş Sistemi ürünü iki uçtan birini seçer",
        body: "Zengin simülatörleri okumak zor olabilir. Parlak görsel demolar zayıf veri ve ölçek varsayımlarını gizleyebilir. Helios kesintisiz keşfedilebilir sahneden vazgeçmeden editoryal derinlik kurmalıydı.",
        cards: [
          [
            "Kullanıcı sorusu",
            "Başka bir dünya nasıl hissedilirdi?",
            "Çap tek başına cevap vermez. Ürün yerçekimi, gün/yıl uzunluğu, atmosfer, ışık gecikmesi, görevler ve yüzey karakterini insan referansına bağlar.",
          ],
          [
            "Mühendislik sorusu",
            "Sahne nasıl güvenilir kalır?",
            "Cisim ölçeği, yörünge hareketi, kamera davranışı, görsel varlıklar ve dış gözlemler açık kurallarla yönetilmeli, ancak kullanıcıya tek bir deneyim olarak sunulmalıdır.",
          ],
        ],
      },
      corrections: {
        number: "02 · İlk düzeltmeler",
        title: "Ürün belirsizlikleri kaldırdıkça gelişti",
        body: "Bazı ilk yönler görsel olarak kolay ama yapısal olarak zayıftı. Her düzeltme açık bir mimari kuralına dönüştü.",
        items: [
          [
            "Sahne kontrolleri",
            "Üst üste kontrollerden sahipliği belirli panellere",
            "Seçim, Gezgin, Görünüm ve Zaman ayrı sorumluluklar oldu. Kaldırılan kalite ve hareket kontrolleri pasif dallar olarak bırakılmadı.",
          ],
          [
            "Doku yaşam döngüsü",
            "Seçime bağlı yüklemeden aşamalı hazırlığa",
            "Önce Güneş, sonra sekiz gezegen ve gerekli ana katmanlar yüklenir. İkincil cisimler zamanlayıcı kullanır ve açılış kapısını engellemez.",
          ],
          [
            "Zaman",
            "Yerel animasyon durumundan kalıcı simülasyon saatine",
            "Zaman sürgüsü, duraklatma, hız, sıfırlama ve efemeris istekleri tek zaman damgası paylaşır. A zamanına dönüş aynı deterministik sahne durumunu üretmelidir.",
          ],
          [
            "Küçük cisimler",
            "Dekoratif noktalardan kaynaklı sistemlere",
            "Uydular, cüce sistemleri, asteroitler ve kuyruklu yıldızlar merkezi kimlik, yörünge politikası, kaynak üst verisi, görsel profil ve açık yedek davranışı kazandı.",
          ],
        ],
      },
      decisions: {
        number: "03 · Temel kararlar",
        title: "Ürünü tutarlı tutan kararlar",
        items: [
          [
            "Sahne otoritesi",
            "Seçim, kamera ve zamanın tek sahibi vardır",
            "Cisimler etkileşim niyetini yayınlar. Merkezi depolar ve kamera düzeni; ağ yüzeylerinin kamerayı hareket ettirmesine veya saati yeniden yazmasına izin vermeden odak, genel görünüm, manuel kontrole geçiş ve deterministik zamanı çözer.",
          ],
          [
            "Ölçek",
            "Okunabilirlik ve fiziksel oran ayrı profillerdir",
            "Keşif modu cisimleri büyütüp uzaklığı sıkıştırır. Bilimsel mod ortak oran kullanır. İkisi de aynı görüntüleyici, malzeme ve kayıt sistemini paylaşır; mod değişimi ikinci bir sahne uygulamasına dönüşmez.",
          ],
          [
            "Varlıklar",
            "Her yüzeyin temsili belgelenir",
            "Gerçek haritalar, türetilmiş haritalar ve kaynaklara dayalı görsel yeniden yapılandırmalar; kaynak, kapsama, yönelim ve kalibrasyon notları taşır. Görüntü dokuları sabit sınır içinde kalır ve Güneş'ten dışarı doğru aşamalı yüklenir.",
          ],
          [
            "Yörünge hassasiyeti",
            "Akıcı animasyona efemeris denmez",
            "Horizons destekli pencereler, temsili ortalama elemanlar ve ilerletilmiş önizlemeler ayrı etiketlenir. Eksik kutup veya açısal elemanlar görsel çeşitlilik için rastgeleleştirilmez; çözümsüz kalır.",
          ],
          [
            "Dış veri",
            "Dış kayıtlar gösterilmeden önce hazırlanır",
            "Sunucu uyarlayıcıları yanıtları doğrular ve normalize eder; gözlem ve alınma üst verisi ekler, servise özel önbellek kuralını uygular ve güncel veri, doğrulanmış tarihli kayıt veya statik açıklama arasında seçim yapar.",
          ],
          [
            "Erişilebilirlik",
            "Ürün 3B sahne olmadan da yaşar",
            "Semantik navigasyon, sunucuda üretilen cisim sayfaları, karşılaştırma tabloları, görünür odak, azaltılmış hareket ve WebGL yedek; 3B'yi tek bilgi kanalı değil bir geliştirme katmanı yapar.",
          ],
        ],
      },
      architecture: {
        number: "04 · Mimari",
        title: "Odaklı etkileşimli çekirdeğin çevresinde sunucu sayfaları",
        body: "3B deneyim istemcide kalırken cisim anlatıları, üst veri ve veri sunumunun çoğu sunucuda üretilir.",
        items: [
          [
            "Sunum",
            "Sayfa yolları ve editoryal kompozisyon",
            "Next.js App Router sayfaları, uyarlanabilir CSS modülleri, semantik tablolar ve cisme özgü düzenler içeriği WebGL gerektirmeden sunar.",
          ],
          [
            "Uygulama",
            "Seçim, kamera ve simülasyon",
            "Zustand depoları sınırlı etkileşim durumunu taşır. Hızlı Three.js dönüşümleri kare döngüsünde kalır ve her karede React durumu yazmaz.",
          ],
          [
            "Domain",
            "Cisimler, ölçek ve yörünge değerlendirmesi",
            "Doğrulanmış gezegen kayıtları, gök cismi kayıt sistemleri, referans çerçeveleri ve ortak yörünge değerlendiricileri arayüz etiketlerini görüntülenen geometriyle aynı modele bağlar.",
          ],
          [
            "Veri",
            "Uyarlayıcı, önbellek ve yedek",
            "Zod şemaları sağlayıcı yanıtlarını normalize eder. Her servis kendi zaman aşımı, yeniden doğrulama, tarihli yedek ve kullanılamaz durumunu tanımlar.",
          ],
        ],
      },
      quality: {
        number: "05 · Kalite",
        title: "Yayın güveni, dosyaların varlığından değil kanıttan gelir",
        items: [
          [
            "Statik kalite",
            "Biçim denetimi, kod denetimi, sayfa yolu tipleri, sıkı TypeScript, birim testleri ve görüntü dokusu denetimi birlikte çalışır.",
          ],
          [
            "Etkileşim",
            "Playwright; temel sayfa ve klavye akışlarını, uyarlanabilir düzenleri, zaman davranışını, varlık hazırlığını ve seçim ile kamera arasındaki ilişkiyi kapsar.",
          ],
          [
            "Görsel kanıt",
            "Gerçek 3B sahne ekran görüntüleri DOM doğrulamalarının yetmediği yüzey, aydınlatma, yörünge bağlamı, gündüz tarafına şehir ışığı sızmaması ve küçük cisim kadrajını doğrular.",
          ],
          [
            "Bilimsel dil",
            "Test ve kaynak kayıtları doğru pencereleri, temsili modelleri, tarihsel gözlemleri, son mevcut veriyi ve yedekleri birbirinden ayırır.",
          ],
        ],
      },
      result: {
        number: "06 · Sonuç",
        title: "Hikâyesini değiştirmeden büyüyebilen bir temel",
        calloutTitle: "Ürün artık daha geniş ve sınırları konusunda daha açık.",
        body: "Keşfet bir cismi veya bölgeyi gösterir; detay sayfası onu açıklar; Veri sayfası gözlemin ne zaman gerçekleştiğini belirtir; vaka çalışması ise ortak kuralların bu parçaları nasıl uyumlu tuttuğunu anlatır. Son görsel iyileştirmeler kamera, zaman, kaynak veya ölçek sorumluluklarını yeniden tasarlamadan bu temel üzerinde tamamlanabilir.",
        library: "Cisim kütüphanesine gir",
        outer: "Dış bağlamı oku",
        data: "Kaynak geçmişini incele",
      },
    },
  },
} as const satisfies Record<Locale, object>;
