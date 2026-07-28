import type { SystemRegionId } from "@/features/solar-system/types/celestial-body";

import type { RegionEditorialCopy } from "./region-detail-copy";

export const REGION_EDITORIAL_COPY_TR = {
  "asteroid-belt": {
    kindLabel: "Ana kuşak bölgesi · kayalık nüfus",
    accentColor: "#b79b79",
    tagline: "Sıkışık bir moloz halkası değil, geniş bir yörünge nüfusu.",
    overview:
      "Ana asteroit kuşağı Mars ile Jüpiter arasındaki alanı kaplar. Çok sayıda kayalık ve metalik kalıntı içerir; ancak tek tek cisimler arasındaki uzaklık, boyutlarına göre son derece büyüktür. Helios kuşağı mekânsal bağlam olarak gösterir, bireysel yörüngeleri seçilmiş dünyalar için ayırır.",
    metadataDescription:
      "Mars ile Jüpiter arasındaki seyrek ve yapılı ana asteroit kuşağını, kaynaklı sınırlar ve açık görsel kısıtlarla keşfet.",
    metricTitle: "Kuşağın sınırları ve gösterim kuralları",
    metrics: [
      { label: "Konum", value: "Mars ile Jüpiter arasında" },
      {
        label: "Keşfet bağlam aralığı",
        value: "2,05–3,35 AU",
        note: "Görsel politika aralığıdır; bütün asteroit aileleri için katalog sınırı değildir.",
      },
      {
        label: "Öne çıkan dünyalar",
        value: "4",
        note: "Ceres, Vesta, Pallas ve Hygiea ayrı sayfa ve yörüngelere sahiptir.",
      },
      {
        label: "Bağlam parçacıkları",
        value: "1.050",
        note: "Bilinen asteroitlerin sayımı değil, deterministik görsel nüfustur.",
      },
      { label: "Mekânsal biçim", value: "Halkasal kuşak" },
      {
        label: "Bireysel yörünge politikası",
        value: "Yalnız öne çıkan cisimler",
      },
    ],
    sections: [
      {
        eyebrow: "Yoğunluk",
        title: "Büyük ölçüde boş uzay",
        body: "Tehlikeli bir kaya duvarı görüntüsü yanıltıcıdır. Ana kuşak içinde bile cisimler arasındaki mesafeler rastlantısal yakın geçişleri seyrek kılar. Görsel katman okunabilirlik için yoğunluğu artırır, parçacıkları fiziksel olarak sıkışık gösterdiğini iddia etmez.",
      },
      {
        eyebrow: "Yapı",
        title: "Rezonansla şekillenen bir nüfus",
        body: "Jüpiter'in yerçekimi kuşağın düzenlenmesine katkı sağlar. Rezonanslar seyrek bölgeler oluşturur ve nüfusu farklı eğiklik ve dışmerkezliklere sahip ailelere ayırır. Keşfet bu yapıyı her noktaya yörünge çizmek yerine katmanlı dağılımlarla anlatır.",
      },
      {
        eyebrow: "Seçim davranışı",
        title: "Bağlam hafif, dünyalar incelenebilir kalır",
        body: "Arka plan parçacıklarının kimliği, detay sayfası veya bireysel yörüngesi yoktur. Ceres, Vesta, Pallas ve Hygiea kaynaklı geometri, ortalama eleman ve kendi editoryal sayfalarıyla seçilebilir cisimlerdir.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Asteroit Bilgileri",
        href: "https://science.nasa.gov/solar-system/asteroids/facts/",
      },
      {
        label: "JPL Küçük Cisim Veritabanı API'si",
        href: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
      },
    ],
    related: [
      { id: "ceres", context: "Ana kuşaktaki en büyük dünya" },
      { id: "vesta", context: "Farklılaşmış öngezegen kalıntısı" },
      { id: "pallas", context: "Yüksek eğimli ana kuşak dünyası" },
      { id: "hygiea", context: "Büyük ve koyu dış kuşak cismi" },
    ],
    representationLabel: "Bölgesel bağlam katmanı",
    representationNote:
      "Keşfet kabul edilen sahne sınırları arasında deterministik halkasal nüfus üretir. Parçacık yerleşimi yoğunluk, eğiklik ve geniş boşlukları anlatır; canlı küçük cisim kataloğu veya çarpışma simülasyonu değildir.",
    visualLabel: "Görsel temsil",
    visualValue: "Katmanlı halkasal şerit",
    visualNote:
      "Kuşak üç parçacık katmanı ve düşük opaklıklı makro zarf kullanır. Nokta boyutu ve yoğunluğu iki sahne profilinde de okunabilirlik için artırılır.",
    visualKind: "belt",
  },
  "kuiper-belt": {
    kindLabel: "Neptün ötesi bölge · buzlu nüfus",
    accentColor: "#7fa3bd",
    tagline:
      "Neptün ötesinde ince bir halka değil, soğuk ve geniş bir sınır bölgesi.",
    overview:
      "Kuiper Kuşağı Neptün'ün ötesindeki buzlu cisimlerin çörek biçimli bölgesidir. Klasik, rezonanslı ve saçılmış nüfuslar geniş bir hacimde üst üste gelir; bu nedenle Helios bölgeyi tek bir dairesel iz yerine kalın dış sistem bağlamı olarak sunar.",
    metadataDescription:
      "Neptün ötesindeki geniş ve katmanlı Kuiper Kuşağı'nı öne çıkan dünyalar, kaynaklı bağlam ve açık ölçek modeliyle keşfet.",
    metricTitle: "Dış kuşağın ölçeği ve nüfusları",
    metrics: [
      { label: "İç referans", value: "Neptün'ün ötesi" },
      {
        label: "Keşfet bağlam aralığı",
        value: "30–72 AU",
        note: "Görünür katman geniş Kuiper ve saçılmış disk bağlamını içerir.",
      },
      {
        label: "Öne çıkan ana dünyalar",
        value: "8",
        note: "Plüton, Eris, Haumea, Makemake, Quaoar, Gonggong, Sedna ve Orcus.",
      },
      {
        label: "Öne çıkan uydular",
        value: "8",
        note: "Seçilmiş eşlikçiler ana sistemlerinin içinde gösterilir.",
      },
      {
        label: "Bağlam parçacıkları",
        value: "820",
        note: "Keşfedilmiş cisim sayısı değil, temsili görsel nüfustur.",
      },
      { label: "Mekânsal biçim", value: "Kalın hacimsel kuşak" },
    ],
    sections: [
      {
        eyebrow: "Nüfus",
        title: "Birden fazla yörünge ailesi aynı sınırı paylaşır",
        body: "Kuiper bölgesi dinamik olarak tek biçimli değildir. Klasik cisimler, rezonanslı dünyalar ve daha dışmerkezli saçılmış cisimler farklı yollar izler. Sahne bu geniş nüfusları deterministik katmanlar ve eğiklik aralıklarıyla ayırır.",
      },
      {
        eyebrow: "Korunma",
        title: "Erken Güneş Sistemi tarihinin soğuk kalıntıları",
        body: "Düşük sıcaklıklar uçucu ve buzlu maddenin Güneş'ten uzakta korunmasına izin verdi. Tek tek dünyalar farklı yüzey, yoğunluk, uydu ve halka sistemlerine sahip olduğundan öne çıkan katalog arka plan alanından ayrı kalır.",
      },
      {
        eyebrow: "Ölçek sınırı",
        title: "Sert kenar iddia etmeden okunabilir bağlam",
        body: "30–72 AU sahne aralığı bir sunum sınırıdır. Gerçek Neptün ötesi nüfuslar üst üste gelir ve tek bir düzgün sınırın ötesine uzanır; Sedna gibi ayrık cisimler kendi bireysel yörünge gösterimini gerektirir.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Kuiper Kuşağı Bilgileri",
        href: "https://science.nasa.gov/solar-system/kuiper-belt/facts/",
      },
      {
        label: "JPL Küçük Cisim Veritabanı API'si",
        href: "https://ssd-api.jpl.nasa.gov/doc/sbdb.html",
      },
    ],
    related: [
      { id: "pluto", context: "Keşfedilmiş Kuiper Kuşağı cüce gezegeni" },
      { id: "eris", context: "Büyük saçılmış disk cüce gezegeni" },
      { id: "haumea", context: "Hızlı dönen halkalı cüce gezegen" },
      { id: "makemake", context: "Parlak klasik Kuiper Kuşağı dünyası" },
    ],
    representationLabel: "Bölgesel bağlam katmanı",
    representationNote:
      "Keşfet klasik, rezonanslı ve saçılmış nüfusları sınırlı görsel hacimde birleştirir. Her noktanın bilinen cisim olduğunu veya kuşağın görüntü sınırında keskin biçimde bittiğini ima etmez.",
    visualLabel: "Görsel temsil",
    visualValue: "Hacimsel nüfus kuşağı",
    visualNote:
      "Üç parçacık katmanı ve soluk makro zarf, öne çıkan cisimleri okunabilir tutarken kalınlık, eğiklik ve dış sistem ölçeğini anlatır.",
    visualKind: "belt",
  },
  "oort-cloud": {
    kindLabel: "Çıkarımsal dış rezervuar · kuyruklu yıldız kaynağı",
    accentColor: "#8fb0cd",
    tagline:
      "Güneş'in çok uzakta yıldızlardan biri gibi göründüğü kuramsal kabuk.",
    overview:
      "Oort Bulutu, gezegen sistemini çevrelediği düşünülen son derece uzak buzlu cisim rezervuarıdır. Hiçbir uzay aracı bulutun tamamını görüntülememiştir; varlığı ve yapısı başlıca uzun dönemli kuyruklu yıldızların yörüngelerinden çıkarılır.",
    metadataDescription:
      "Oort Bulutu'nu NASA'nın kenar tahminleri ve açıkça etiketlenmiş sıkıştırılmış görsel temsiliyle uzak bir kuyruklu yıldız rezervuarı olarak oku.",
    metricTitle: "Tahmin edilen, çıkarılan ve sıkıştırılan özellikler",
    metrics: [
      {
        label: "Tahminî iç kenar",
        value: "2.000–5.000 AU",
        note: "NASA referans aralığıdır; ölçülmüş katı sınır değildir.",
      },
      {
        label: "Tahminî dış kenar",
        value: "10.000–100.000 AU",
        note: "NASA referans aralığıdır; çıkarımsal sınır belirsizdir.",
      },
      { label: "Geometri", value: "Yaklaşık küresel kabuk" },
      {
        label: "Kanıt temeli",
        value: "Uzun dönemli kuyruklu yıldız yörüngeleri",
      },
      { label: "Doğrudan küresel görüntü", value: "Yok" },
      {
        label: "Bağlam parçacıkları",
        value: "1.650",
        note: "Tutarlı şematik örneklem.",
      },
      { label: "Sahne ölçeği", value: "Güçlü biçimde sıkıştırılmış" },
    ],
    sections: [
      {
        eyebrow: "Kanıt",
        title: "Ziyaretçilerden yeniden kurulan bölge",
        body: "Uzun dönemli kuyruklu yıldızlar birçok yönden gelir ve son derece uzamış yollar izler. Yörünge dağılımları uzak ve yaklaşık küresel kaynak rezervuarı fikrini destekler; tek tek Oort cisimlerinin fotoğraflanmış haritasını sağlamaz.",
      },
      {
        eyebrow: "Uzaklık",
        title: "Gezegen sistemi yalnızca merkezde küçük bir alan kaplar",
        body: "Oort Bulutu uzaklıklarında gezegenlerin tanıdık yörüngeleri küçücük merkez yapısına çöker. Gerçek ortak ölçek gezinme ve karşılaştırmayı kullanılamaz yapacağından Keşfet bilimsel aralığı sayfada açık tutup bölgeyi sıkıştırır.",
      },
      {
        eyebrow: "Temsil",
        title: "Parlayan balon değil, çıkarımsal kabuk",
        body: "Görünür bulut seyrek iç, dış ve dayanak nüfuslarından oluşan ölçülü bir diyagramdır. Parlaklık, opaklık ve parçacık boyutu arayüz seçimidir; gerçek cisimler küçük, koyu ve birbirinden olağanüstü uzak olurdu.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Oort Bulutu Bilgileri",
        href: "https://science.nasa.gov/solar-system/oort-cloud/facts/",
      },
      {
        label: "NASA Oort Bulutu genel bakışı",
        href: "https://science.nasa.gov/solar-system/oort-cloud/",
      },
    ],
    related: [
      {
        id: "halley",
        context: "Dış sistem geçmişine sahip dönemsel kuyruklu yıldız",
      },
      { id: "hale-bopp", context: "Uzun dönemli kuyruklu yıldız" },
      {
        id: "neowise",
        context: "2020'de gözlenen uzun dönemli kuyruklu yıldız",
      },
      { id: "heliosphere", context: "Uzak rezervuar içindeki Güneş etkisi" },
    ],
    representationLabel: "Çıkarımsal şematik bağlam",
    representationNote:
      "Keşfet, görüntüleme yarıçapı kadraj ve performans için seçilmiş sıkıştırılmış kabuk kullanır. Sayfa çok daha büyük bilimsel uzaklık aralığını korur ve nüfusu çıkarımsal olarak etiketler.",
    visualLabel: "Görsel temsil",
    visualValue: "Seyrek uzak kabuk",
    visualNote:
      "İç, dış ve dayanak katmanları kabuğu yalnız seçiliyken okunabilir kılar. Opaklıkları ölçülmüş yoğunluğu veya yayılan ışığı temsil etmez.",
    visualKind: "cloud",
  },
  heliosphere: {
    kindLabel: "Güneş rüzgârı alanı · dinamik sınır",
    accentColor: "#69b8df",
    tagline:
      "Güneş'in dış akışının yıldızlararası uzayla karşılaştığı hareketli sınır.",
    overview:
      "Heliosfer, Güneş rüzgârı ve Güneş'in manyetik etkisiyle şekillenen dev bölgedir. Sınırı katı bir küre değildir; Güneş etkinliği, yön ve çevredeki yıldızlararası ortam Güneş rüzgârının nerede yavaşladığını ve basınçların nerede dengelendiğini değiştirir.",
    metadataDescription:
      "Heliosferi Voyager dönemi rehber uzaklıkları ve açık şematik temsille dinamik Güneş rüzgârı sınırı olarak keşfet.",
    metricTitle: "Değişen Güneş sınırının katmanları",
    metrics: [
      { label: "Şekillendiren", value: "Güneş rüzgârı" },
      {
        label: "İç sahne rehberi",
        value: "Sonlanma şoku · 84 AU",
        note: "Keşfet kadrajı için şematik dayanak; sabit evrensel uzaklık değildir.",
      },
      {
        label: "Dış sahne rehberi",
        value: "Heliopoz · 121 AU",
        note: "Şematik dayanak; Voyager geçişleri yön ve zamana göre farklıydı.",
      },
      { label: "Rehberler arasındaki bölge", value: "Heliokılıf" },
      { label: "Sınır karakteri", value: "Dinamik ve asimetrik" },
      { label: "Doğrudan geçişler", value: "Voyager 1 ve 2" },
    ],
    sections: [
      {
        eyebrow: "Akış",
        title: "Güneş uzayı hareketli plazmayla doldurur",
        body: "Yüklü parçacıklar Güneş rüzgârı olarak dışarı akar. Güneş'ten uzakta bu akış sonlanma şokunda aniden yavaşlar, heliokılıftan geçerek heliopoza ulaşır.",
      },
      {
        eyebrow: "Sınır",
        title: "Tek ve kalıcı bir yarıçap yoktur",
        body: "Heliopoz Güneş ve yıldızlararası ortam arasındaki basınç dengesini belirtir, fakat konumu değişir. Voyager ölçümleri iki rota üzerindeki doğrudan geçişlerdir; sınırın her andaki tam üç boyutlu biçimi değildir.",
      },
      {
        eyebrow: "Sahne temsili",
        title: "İki rehber yüzey ve yönlü akış",
        body: "Keşfet sonlanma şoku rehberi, heliopoz rehberi ve seyrek radyal parçacıklar çizer. Şekiller iç içe bölgeleri ve Güneş rüzgârının yönünü anlatır; güncel ölçülmüş küresel biçim iddia etmez.",
      },
    ],
    sourceLinks: [
      {
        label: "NASA Heliosfer Bileşenleri",
        href: "https://science.nasa.gov/learn/heat/resource/components-of-the-heliosphere/",
      },
      {
        label: "NASA Voyager 1 görevi",
        href: "https://science.nasa.gov/mission/voyager/voyager-1/",
      },
      {
        label: "NASA Voyager 2 görevi",
        href: "https://science.nasa.gov/mission/voyager/voyager-2/",
      },
    ],
    related: [
      { id: "sun", context: "Güneş rüzgârının kaynağı" },
      {
        id: "oort-cloud",
        context: "Çok daha uzak çıkarımsal kuyruklu yıldız rezervuarı",
      },
      { id: "neptune", context: "Katalogdaki en dış gezegen" },
      {
        id: "sedna",
        context: "Çok daha büyük Güneş yörüngesindeki ayrık dünya",
      },
    ],
    representationLabel: "Şematik dinamik sınır",
    representationNote:
      "Sonlanma şoku ve heliopoz yarıçapları Voyager dönemi bağlamından türetilen kararlı sahne dayanaklarıdır. Gerçek heliosferin küresel, durağan veya her yönde aynı olduğu iddiası değildir.",
    visualLabel: "Görsel temsil",
    visualValue: "İç içe sınır rehberleri",
    visualNote:
      "İki yarı saydam rehber yüzey ve seyrek Güneş rüzgârı akış katmanı yapıyı anlatır. Opaklık ve pürüzsüzlük sunum tercihidir, ölçülmüş plazma yoğunluğu değildir.",
    visualKind: "boundary",
  },
} as const satisfies Record<SystemRegionId, RegionEditorialCopy>;
