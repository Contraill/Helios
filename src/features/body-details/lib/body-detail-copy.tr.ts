import type {
  DwarfSatelliteId,
  MoonId,
} from "@/features/solar-system/types/celestial-body";

import type { BodyEditorialCopy } from "./body-detail-copy";

export const MOON_EDITORIAL_COPY_TR = {
  "moon-earth-moon": {
    tagline: "Dünya'yı iki cisimli bir hikâyeye dönüştüren tanıdık eşlikçi.",
    overview:
      "Ay, Dünya'nın ötesindeki en yakın dünyadır ve insan ölçeğindeki uzay uçuşu düşüncesinin temel referansıdır. Eşzamanlı dönüşü aynı yarımküreyi büyük ölçüde Dünya'ya dönük tutarken değişen geometrisi evre döngüsünü oluşturur.",
    focusTitle: "Evden görülen sistem",
    focusBody:
      "Bu sayfa Ay'ı dekoratif ışık değil, yörüngedeki bir dünya olarak ele alır; uzaklık, dönem ve referans düzlemini Keşfet'daki ortalama eleman modelinin sınırlarıyla birlikte gösterir.",
  },
  "moon-mars-phobos": {
    tagline: "Mars'ın hemen üzerinde hızla dolaşan koyu uydu.",
    overview:
      "Phobos Mars çevresindeki turunu bir Mars gününden kısa sürede tamamlar; yüzeyden batıdan doğuya hızla ilerliyor gibi görünürdü. Düzensiz şekli ve yakın yörüngesi onu uzak bir aydan çok baş üstünden geçen yakalanmış parçaya benzetir.",
    focusTitle: "İçe doğru ilerleyen bir uydu",
    focusBody:
      "Phobos eşzamanlı yörünge yüksekliğinin altında sıkı bir yol izler. Sayfa bu ölçeği görünür tutar, temsili hareketi seyir hassasiyetinde tahmin gibi sunmaz.",
  },
  "moon-mars-deimos": {
    tagline: "Mars'ın daha küçük, uzak ve sakin dış uydusu.",
    overview:
      "Deimos Phobos'tan daha geniş ve yavaş bir yörünge izler. Düşük yerçekimi ve yumuşak yüzey görünümü, iç kardeşinin daha keskin ve dramatik profiliyle karşıtlık kurar.",
    focusTitle: "Daha sakin Mars eşlikçisi",
    focusBody:
      "İki Mars uydusu arasındaki temel fark ölçek ve yörüngedir: Deimos daha küçük, daha uzakta ve gökyüzünde daha yavaştır.",
  },
  "moon-jupiter-io": {
    tagline:
      "Gelgitler ve durmaksızın volkanizma tarafından yeniden yapılan dünya.",
    overview:
      "Io, Jüpiter'in güçlü çekimi ve komşu uydularla rezonansı nedeniyle yoğun gelgit ısınmasına uğrar. Sürekli volkanik etkinlik yüzeyi jeolojik olarak genç tutar.",
    focusTitle: "Gelgit enerjisinin yüzeyi yeniden yazdığı yer",
    focusBody:
      "Helios Io'yu yalnız renkli bir küre olarak değil, yörünge rezonansının fiziksel sonucu olarak ele alır; hareket ve yüzey temsili ölçülmüş süreçten ayrılır.",
  },
  "moon-jupiter-europa": {
    tagline: "Buz kabuğunun altında küresel okyanus olasılığı taşıyan dünya.",
    overview:
      "Europa'nın genç ve çizgili buz yüzeyi, altta sıvı su okyanusu bulunabileceğine dair güçlü kanıtlar sunar. Jüpiter sistemindeki rezonanslar iç ısı üretimine katkı sağlar.",
    focusTitle: "Buzun altında saklı bir okyanus adayı",
    focusBody:
      "Sayfa yüzey çizgilerini doğrudan derinlik haritası gibi sunmaz; yörünge, gelgit ve yüzey kanıtlarını ayrı bilimsel katmanlarda tutar.",
  },
  "moon-jupiter-ganymede": {
    tagline:
      "Güneş Sistemi'nin en büyük uydusu ve kendi manyetik alanına sahip dünya.",
    overview:
      "Ganymede Merkür'den büyüktür ve katmanlı iç yapısı, buzlu yüzeyi ve doğal manyetik alanıyla küçük bir gezegen gibi davranır.",
    focusTitle: "Uydu ölçeğinin gezegen ölçeğine yaklaştığı yer",
    focusBody:
      "Boyut karşılaştırması Ganymede'yi gezegen yapmaz; sayfa sınıflandırma ile fiziksel ölçeği birbirine karıştırmadan gösterir.",
  },
  "moon-jupiter-callisto": {
    tagline: "Çarpma izleriyle kaplı, eski dış Galilei uydusu.",
    overview:
      "Callisto'nun yoğun kraterli yüzeyi uzun jeolojik geçmişi korur. Europa ve Io'ya kıyasla daha zayıf iç etkinlik, yüzey kaydının daha az yenilenmesine izin verir.",
    focusTitle: "Eski çarpışmaların arşivi",
    focusBody:
      "Callisto'nun görünümü yaş ve yüzey yenilenmesi arasındaki farkı anlatır; krater yoğunluğu tek başına mutlak yaş ölçümü olarak sunulmaz.",
  },
  "moon-saturn-mimas": {
    tagline: "Dev Herschel krateriyle tanınan küçük buzlu uydu.",
    overview:
      "Mimas'ın büyük çarpma havzası küçük gövdesine göre olağanüstü ölçek taşır. Satürn'e yakın yörüngesi onu halka ve uydu sisteminin sıkı geometrisine bağlar.",
    focusTitle: "Tek bir kraterin bütün silueti belirlediği dünya",
    focusBody:
      "Görsel geometri Herschel Krateri'ni vurgular; ayrıntı seviyesi gerçek yükseklik modeli veya güncel aydınlanma iddiası taşımaz.",
  },
  "moon-saturn-enceladus": {
    tagline: "Güney kutbundan uzaya su ve buz püskürten parlak uydu.",
    overview:
      "Enceladus'un çatlaklarından çıkan jetler, yüzey altı okyanusuna ilişkin doğrudan örnekleme fırsatı sunar ve Satürn'ün E halkasına madde sağlar.",
    focusTitle: "Okyanusun uzaya ulaştığı yer",
    focusBody:
      "Jetler kalıcı dekoratif kuyruk olarak değil, kaynaklı etkinliğin kontrollü temsili olarak ele alınır; sayfa gözlem ile görselleştirmeyi ayırır.",
  },
  "moon-saturn-tethys": {
    tagline: "Dev kanyon ve çarpma havzasıyla işaretlenmiş buzlu uydu.",
    overview:
      "Tethys'in düşük yoğunluğu buz ağırlıklı bileşime işaret eder. Ithaca Chasma ve Odysseus havzası küçük dünyanın yüzey tarihini belirgin biçimde şekillendirir.",
    focusTitle: "Buzlu kabukta gezegen ölçeğinde yarık",
    focusBody:
      "Sayfa büyük yüzey yapılarının göreli önemini anlatır, kaynaklara dayalı küreyi ayrıntılı topografya gibi sunmaz.",
  },
  "moon-saturn-dione": {
    tagline: "Parlak buz uçurumları ve eski kraterli araziler taşıyan dünya.",
    overview:
      "Dione'nin yüzeyi genç tektonik izlerle daha eski kraterli bölgeleri yan yana getirir. Bu karşıtlık, küçük buzlu uyduların durağan olmadığını gösterir.",
    focusTitle: "Eski yüzey üzerindeki parlak kırıklar",
    focusBody:
      "Görsel profil renk ve pürüzlülük farkını taşır; çizgilerin konumu güncel jeolojik harita olarak yorumlanmamalıdır.",
  },
  "moon-saturn-rhea": {
    tagline: "Satürn'ün ikinci büyük, yoğun kraterli buzlu uydusu.",
    overview:
      "Rhea büyük ölçüde buz ve kayadan oluşan, eski yüzeyi geniş krater kayıtları taşıyan bir dünyadır. Sönük görünümü sistem içindeki ölçeğini gizleyebilir.",
    focusTitle: "Sessiz görünen büyük uydu",
    focusBody:
      "Sayfa Rhea'yı arka plan cismi olmaktan çıkarır; boyut, yörünge ve yüzey temsilini açık kaynak sınırlarıyla sunar.",
  },
  "moon-saturn-titan": {
    tagline:
      "Yoğun atmosferi, metan döngüsü ve yüzey gölleri olan büyük dünya.",
    overview:
      "Titan kalın azot atmosferine, hidrokarbon bulutlarına, yağmuruna ve göllerine sahiptir. Yüzey, görünür ışıkta atmosfer tarafından gizlenir.",
    focusTitle: "Dünya benzeri döngü, bambaşka kimya",
    focusBody:
      "Helios Titan'ı turuncu bir küreye indirgemez; atmosfer, yüzey ve metan döngüsünü ayrı referanslar olarak okur.",
  },
  "moon-saturn-iapetus": {
    tagline: "İki tonlu yüzeyi ve dev ekvator sırtıyla uzak uydu.",
    overview:
      "Iapetus'un bir yarımküresi diğerinden çok daha koyudur. Uzak yörüngesi ve ekvator boyunca uzanan sırt, Satürn sisteminde benzersiz bir profil yaratır.",
    focusTitle: "Işığı iki farklı biçimde yansıtan dünya",
    focusBody:
      "Görsel kontrast belirginleştirilir; renk farkı güncel aydınlatma yerine kaynaklı yüzey albedo karşıtlığını anlatır.",
  },
  "moon-uranus-miranda": {
    tagline: "Uçurumlar, sırtlar ve parçalı arazilerden oluşan küçük dünya.",
    overview:
      "Miranda'nın yüzeyi farklı jeolojik bölgelerin bir araya gelmiş gibi görünen karmaşık yapısını taşır. Küçük boyutuna rağmen dramatik kabartılar gösterir.",
    focusTitle: "Küçük ölçekte karmaşık jeoloji",
    focusBody:
      "Sayfa dramatik araziyi vurgular, fakat kaynaklara dayalı yüzey temsilini tam bir topografya haritası gibi sunmaz.",
  },
  "moon-uranus-ariel": {
    tagline: "Uranüs sisteminin parlak ve genç görünümlü buzlu uydusu.",
    overview:
      "Ariel'in vadileri ve düzleşmiş bölgeleri, geçmişte iç etkinlik ve yüzey yenilenmesi yaşandığına işaret eder.",
    focusTitle: "Yenilenmiş yüzey izleri",
    focusBody:
      "Yörünge ve yüzey anlatısı Voyager verisine bağlı kalır; güncel etkinlik iddiası oluşturulmaz.",
  },
  "moon-uranus-umbriel": {
    tagline: "Uranüs'ün koyu ve eski görünümlü uydusu.",
    overview:
      "Umbriel düşük yansıtıcılığı ve yoğun kraterli yüzeyiyle Ariel'in parlak, yenilenmiş görünümüne karşıtlık oluşturur.",
    focusTitle: "Karanlık yüzeyde korunmuş geçmiş",
    focusBody:
      "Düşük albedo görsel olarak korunur, ancak renk gerçek zamanlı ışık ölçümü gibi sunulmaz.",
  },
  "moon-uranus-titania": {
    tagline: "Uranüs'ün en büyük uydusu; kanyonlar ve faylarla bölünmüş dünya.",
    overview:
      "Titania'nın geniş yarık ve kanyonları, donmuş yüzeyin geçmişte iç değişimlere tepki verdiğini gösterir.",
    focusTitle: "Buzlu kabuğu yaran büyük yapılar",
    focusBody:
      "Sayfa Titania'nın sistem içindeki ölçeğini ve tektonik karakterini birlikte gösterir; ayrıntı temsili yüzey sınırları içinde kalır.",
  },
  "moon-uranus-oberon": {
    tagline: "Uranüs sisteminin uzak, koyu ve kraterli büyük uydusu.",
    overview:
      "Oberon eski kraterleri ve bazı parlak yüzey izlerini taşıyan dış büyük uydudur. Uzaklığı onu sistemin sakin sınırına yerleştirir.",
    focusTitle: "Uranüs uydu ailesinin dış kenarı",
    focusBody:
      "Yörünge uzaklığı ile yüzey karakteri birlikte okunur; güncel yönelim seyir hassasiyetinde gösterilmez.",
  },
  "moon-neptune-proteus": {
    tagline: "Neredeyse küreselleşecek kadar büyük, düzensiz Neptün uydusu.",
    overview:
      "Proteus koyu, kraterli ve belirgin biçimde düzensizdir. Neptün'e yakın yörüngesi onu dıştaki Triton ve Nereid'den ayırır.",
    focusTitle: "Küresellik sınırındaki düzensiz dünya",
    focusBody:
      "Geometri kaynaklı şekil sınıfını vurgular; ayrıntılı yüzey haritası iddiası taşımaz.",
  },
  "moon-neptune-triton": {
    tagline: "Neptün çevresinde ters yönde dönen, etkin buzlu dünya.",
    overview:
      "Triton'un retrograd yörüngesi yakalanmış bir Kuiper Kuşağı kökenine işaret eder. Voyager 2 yüzeyde genç araziler ve azot gayzerleri gözledi.",
    focusTitle: "Yakalanmış bir dünyanın ters yörüngesi",
    focusBody:
      "Retrograd hareket sahne sözleşmesinin parçasıdır; yüzey etkinliği güncel canlı olay gibi gösterilmez.",
  },
  "moon-neptune-nereid": {
    tagline: "Neptün'ün son derece dışmerkezli uzak uydusu.",
    overview:
      "Nereid, Neptün'e yaklaşım ve uzaklığını büyük ölçüde değiştiren alışılmadık bir yörünge izler. Bu yol, düzenli dairesel uydu sistemi fikrine güçlü bir karşı örnektir.",
    focusTitle: "Uzayı geniş bir yayla kat eden uydu",
    focusBody:
      "Dışmerkezlik görsel yörüngede korunur; kaynaklarda bulunmayan ayrıntılarla doldurulmaz.",
  },
} as const satisfies Record<MoonId, BodyEditorialCopy>;

export const DWARF_SATELLITE_EDITORIAL_COPY_TR = {
  "dwarf-satellite-charon": {
    tagline: "Plüton'la ortak ağırlık merkezi çevresinde dönen büyük eşlikçi.",
    overview:
      "Charon, Plüton'a göre o kadar büyüktür ki sistem basit bir ana cisim-küçük uydu ilişkisinden çok ikili dünya gibi görünür.",
    focusTitle: "İki dünyanın ortak dansı",
    focusBody:
      "Sayfa ortak sistem ölçeğini vurgular; yönelim ve yüzey ayrıntıları kaynakların izin verdiği sınırda tutulur.",
  },
  "dwarf-satellite-dysnomia": {
    tagline: "Eris'in uzak yörüngedeki sönük uydusu.",
    overview:
      "Dysnomia'nın yörüngesi Eris sisteminin kütlesini belirlemede anahtar rol oynar. Uzaklık ve düşük parlaklık yüzey bilgisini sınırlı tutar.",
    focusTitle: "Kütleyi ölçmeyi mümkün kılan eşlikçi",
    focusBody:
      "Helios bilinen yörünge bağlamını gösterir, çözülemeyen yüzeyi dekoratif kesinlikle doldurmaz.",
  },
  "dwarf-satellite-hiiaka": {
    tagline: "Haumea'nın geniş ve düzenli dış uydusu.",
    overview:
      "Hiʻiaka Haumea'nın iki bilinen uydusunun büyüğüdür ve hızlı dönen, halkalı ana dünyanın sistem mimarisini tamamlar.",
    focusTitle: "Uzamış bir dünyanın dış eşlikçisi",
    focusBody:
      "Yörünge ölçeği kaynaklıdır; eksik açısal yönelim temsili olarak etiketlenir.",
  },
  "dwarf-satellite-namaka": {
    tagline: "Haumea'nın küçük ve dinamik olarak karmaşık iç uydusu.",
    overview:
      "Namaka, Hiʻiaka'ya göre daha yakın ve karmaşık bir yörünge izler. Sistem rezonans ve karşılıklı etkileşim açısından dikkat çekicidir.",
    focusTitle: "Karmaşık yörüngeli küçük uydu",
    focusBody:
      "Hiʻiaka ile karşıtlık gerçek yörünge parametreleriyle kurulur; çözülemeyen düğüm ve periapsis yönü rastgele atanmaz.",
  },
  "dwarf-satellite-mk2": {
    tagline: "Makemake'nin yalnız olmadığını gösteren sönük eşlikçi.",
    overview:
      "MK2 parlak Makemake'ye yakın algılanan küçük, koyu bir uydudur. Yörüngesi yeterince ölçüldüğünde ana dünyanın kütlesini sınırlandırmaya yardım eder.",
    focusTitle: "Kontrastla tanımlanan keşif",
    focusBody:
      "Cisim zayıf çözülmüştür; sayfa ölçülmüş sistem bağlamını öne çıkarır ve yüzeyi ölçülü yeniden kurma olarak etiketler.",
  },
  "dwarf-satellite-weywot": {
    tagline:
      "Quaoar çevresinde sıkı ve belirgin dışmerkezli yörünge izleyen uydu.",
    overview:
      "Weywot, Quaoar sistemine halka bağlamının ötesinde yörüngesel referans sağlar. Yolu kusursuz daire gibi ele alınmaz.",
    focusTitle: "Sıra dışı halka sisteminin yanındaki uydu",
    focusBody:
      "Sayfa Weywot'un ölçülmüş yörüngesini daha geniş Quaoar hikâyesinden ayırır ve çözülemeyen yönelimi açık tutar.",
  },
  "dwarf-satellite-xiangliu": {
    tagline: "Gonggong'un uzamış yörüngedeki küçük eşlikçisi.",
    overview:
      "Xiangliu sönük ve uzaktır; yörüngesi Gonggong sisteminin toplam kütlesini sınırlandırmaya yardım eder.",
    focusTitle: "Görünürlük sınırındaki yararlı ölçümler",
    focusBody:
      "Ortalama ölçek, dönem ve dışmerkezlik kullanılır; tam üç boyutlu yönelim doğrulanmadan ileri sürülmez.",
  },
  "dwarf-satellite-vanth": {
    tagline: "Orcus ile eşleşen, göreli olarak büyük uydu.",
    overview:
      "Vanth Orcus'a göre büyüktür ve çifti sıkı bağlanmış Neptün ötesi sistemlerin önemli örneği yapar.",
    focusTitle: "Neptün ötesinde dengeli ortaklık",
    focusBody:
      "Görsel kompozisyon iki cismin göreli büyüklüğünü taşır, seyir hassasiyetinde yönelim iddia etmez.",
  },
} as const satisfies Record<DwarfSatelliteId, BodyEditorialCopy>;
