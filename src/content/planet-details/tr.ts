import type { PlanetId } from "@/lib/data/schemas/planet";

import type { PlanetDetailContent } from "./types";

const trContent = {
  mercury: {
    id: "mercury",
    heroKicker: "Dünya 01 · karasal gezegen",
    heroCaption:
      "Yüzey fotoğrafı değil, editoryal geometri. Keskin aydınlık sınırı Merkür'ün aşırı gündüz-gece döngüsünü vurgular.",
    visualLabel:
      "Merkür'ü keskin bir Güneş aydınlığı sınırının yanında gösteren editoryal diyagram",
    layout: ["metrics", "story", "human", "missions", "signals", "methodology"],
    portrait: {
      eyebrow: "Güneş'in kıyısı",
      title: "Devasa bir Güneş'in altındaki küçük dünya",
      lede: "Merkür'ün hikâyesi yalnız sıcaklık değildir. Uzun günler, neredeyse yok denecek atmosfer ve enerjiyi Dünya gibi dağıtamayan bir yüzey, gezegeni sürekli açıkta bırakır.",
    },
    sections: [
      {
        id: "light",
        eyebrow: "Işık",
        title: "Gün ışığı koruyucu bir gökyüzü olmadan ulaşır",
        body: [
          "Merkür'ün yoğun bir atmosfer yerine çok seyrek bir ekzosferi vardır. Güneş ışığı yüzeye çok az saçılarak ulaştığı için aydınlık ile karanlık arasındaki sınır hem görsel hem termal olarak serttir.",
          "Gösterilen ortalama sıcaklık küresel bir referanstır. Tek tek bölgeler, aydınlanma ve yerel saate bağlı olarak bu değerin çok üstüne veya altına çıkabilir.",
        ],
        sourceIds: ["nasa-mercury-facts", "nasa-solar-system-temperatures"],
      },
      {
        id: "time",
        eyebrow: "Zaman",
        title: "Bir Güneş günü iki Merkür yılından uzundur",
        body: [
          "Merkür Güneş çevresinde hızlı ilerler, fakat kendi ekseni etrafında yavaş döner. Dönüş-yörünge ilişkisi, Güneş gününü yörünge yılından çok daha uzun hale getirir.",
          "Bu nedenle tanıdık bir saat iki kez yetersiz kalır: gün doğumu çok yavaş ilerlerken gezegen Güneş çevresinde birden fazla tur tamamlar.",
        ],
        sourceIds: ["nasa-mercury-facts", "jpl-planetary-physical-parameters"],
      },
    ],
    humanScale: {
      title: "Daha hafif, fakat Güneş'e bütünüyle açık",
      body: "Tartı Dünya'dakinden çok daha düşük bir değer gösterirdi; ancak düşük yerçekimi radyasyonu, vakumu veya dev gündüz-gece sıcaklık farkını hafifletmez.",
    },
    signals: [
      {
        eyebrow: "Yüzey",
        title: "Kaya, kraterler ve hava örtüsü yok",
        body: "Merkür katı, karasal bir dünyadır. Dünya benzeri hava ve aşınma üreten yoğun bir atmosfer olmadığı için yüzey kaydı keskin biçimde korunur.",
      },
      {
        eyebrow: "Eşlikçiler",
        title: "Uydu yok, halka yok",
        body: "Güncel katalogda Merkür için tanınmış doğal uydu veya gezegen halkası bulunmaz.",
      },
      {
        eyebrow: "Dönüş",
        title: "Yavaş dönüş, hızlı yörünge",
        body: "Kısa yıl ile çok uzun Güneş günü arasındaki karşıtlık Merkür'ün temel zaman ölçeğidir.",
      },
    ],
    missions: [
      {
        name: "MESSENGER",
        status: "Tamamlanmış yörünge görevi",
        body: "Merkür yörüngesine giren ilk uzay aracı gezegeni haritaladı, bileşimini ve manyetik alanını inceledi, kutup bölgelerindeki su buzu ağırlıklı birikimleri doğruladı.",
        sourceIds: ["nasa-messenger-mission"],
      },
    ],
    methodology: {
      title: "Ortalama değer, tahmin değildir",
      body: "Merkür sıcaklığı gezegen yüzeyinin ortalama referansıdır; gündüz en yüksek, gece en düşük veya güncel yerel koşulu anlatmaz. Hero bir editoryal diyagramdır; sayısal değerler kaynak kayıtlarına bağlı kalır.",
    },
    sourceIds: ["nasa-messenger-mission"],
  },
  venus: {
    id: "venus",
    heroKicker: "Dünya 02 · karasal gezegen",
    heroCaption:
      "Katmanlı editoryal atmosfer. Görünen bulut örtüsü doğrudan yüzey görünümü değildir.",
    visualLabel:
      "Venüs'ü katmanlı atmosfer bantları içinde gösteren editoryal diyagram",
    layout: ["story", "metrics", "signals", "human", "missions", "methodology"],
    portrait: {
      eyebrow: "Atmosferin ağırlığı",
      title: "Bulutların altında mühürlenmiş Dünya boyutlarında bir gezegen",
      lede: "Venüs, benzer boyutun benzer koşullar anlamına gelmediğini gösterir. Yoğun karbondioksit atmosferi basıncı, sıcaklığı ve görüşü birlikte dönüştürür.",
    },
    sections: [
      {
        id: "greenhouse",
        eyebrow: "Isı",
        title: "Yüzey ikliminin motoru atmosferdir",
        body: [
          "Venüs, Merkür Güneş'e daha yakın olmasına rağmen en sıcak gezegendir. Kaçak sera etkisi, dev karbondioksit atmosferinin altında ısıyı hapseder.",
          "Helios'un gösterdiği sıcaklık bulut tepesi veya güncel ölçüm değil, yüzey referansıdır.",
        ],
        sourceIds: ["nasa-venus-facts", "nasa-solar-system-temperatures"],
      },
      {
        id: "rotation",
        eyebrow: "Yön",
        title: "Yavaş ve ters yönde dönen bir dünya",
        body: [
          "Venüs çoğu gezegenin tersine retrograd yönde döner. Dönüşü o kadar yavaştır ki yıldız günü ile Güneş günü arasındaki ilişki sezgilere aykırıdır.",
          "Sayfa gün ve yıl değerlerini tek belirsiz rakama sıkıştırmak yerine ayrı gösterir.",
        ],
        sourceIds: ["nasa-venus-facts", "jpl-planetary-physical-parameters"],
      },
    ],
    humanScale: {
      title: "Dünya'ya yakın yerçekimi, Dünya'dan bütünüyle farklı koşullar",
      body: "Tartı değeri Dünya'ya yakın olurdu; fakat bu tanıdık sayı ezici atmosferi, sıcaklığı veya solunabilir hava yokluğunu anlatmaz.",
    },
    signals: [
      {
        eyebrow: "Atmosfer",
        title: "Karbondioksit ve sülfürik asit bulutları",
        body: "Bulut katmanı katı yüzeyi sıradan görünür ışık gözlemlerinden saklar ve Venüs'ün her anlatımında atmosfer katmanlarını merkeze taşır.",
      },
      {
        eyebrow: "Yüzey",
        title: "Aşırı basıncın altındaki katı zemin",
        body: "Venüs bir gaz devi değil, karasal gezegendir. Kayalık yüzeyi yoğun atmosferin altında bulunur; çevreyi basınç ve sıcaklık belirler.",
      },
      {
        eyebrow: "Uydu ve halkalar",
        title: "Ne doğal uydu ne halka sistemi",
        body: "Tarihli referans kataloğunda Venüs için tanınmış uydu veya gezegen halkası bulunmaz.",
      },
    ],
    missions: [
      {
        name: "Magellan",
        status: "Tamamlanmış radar yörünge görevi",
        body: "Magellan sentetik açıklıklı radar kullanarak Venüs'ü bulutlarının ardından haritaladı ve yüzeyin ilk neredeyse küresel görünümünü üretti.",
        sourceIds: ["nasa-magellan-mission"],
      },
      {
        name: "DAVINCI",
        status: "Gelecek atmosfer sondası",
        body: "DAVINCI; bulutların üstünden yüzeye kadar atmosfer kimyası, basınç, sıcaklık ve iniş görüntülerini incelemek üzere tasarlanmıştır.",
        sourceIds: ["nasa-davinci-mission"],
      },
    ],
    methodology: {
      title: "Yüzey, bulut tepesi ve atmosfer farklı referans düzeyleridir",
      body: "Helios Venüs sıcaklığını yüzey referansı olarak etiketler ve bulut görüntülerini doğrudan yüzey fotoğrafı gibi kullanmaz. Görev durumu canlı telemetri yerine tarihli resmî kaynaklardan açıklanır.",
    },
    sourceIds: ["nasa-magellan-mission", "nasa-davinci-mission"],
  },
  earth: {
    id: "earth",
    heroKicker: "Dünya 03 · karasal gezegen",
    heroCaption:
      "Editoryal sistem diyagramı. Okyanuslar, atmosfer ve kara bir fotoğraf küresi yerine birbirine bağlı koşullar olarak gösterilir.",
    visualLabel:
      "Okyanus, atmosfer ve aydınlatılmış karayı gösteren editoryal Dünya ufku",
    layout: ["human", "story", "metrics", "missions", "signals", "methodology"],
    portrait: {
      eyebrow: "Referans dünya",
      title: "Yaşanabilirlik tek bir şanslı sayı değil, bir sistemdir",
      lede: "Dünya Helios'taki birimleri tanımlar, ancak yalnız varsayılan rolüne indirgenmemelidir. Sıvı su, atmosfer, manyetik koruma, kimya ve enerji dengesi birlikte çalışır.",
    },
    sections: [
      {
        id: "system",
        eyebrow: "Bağlı koşullar",
        title: "Okyanuslar ve hava sürekli enerji alışverişi yapar",
        body: [
          "Yüzey okyanusları ile azot-oksijen atmosferi tek bir bağlı sistemin parçalarıdır. Isı, su, karbon ve momentum okyanus, kara, buz ve hava arasında taşınır.",
          "Küresel ortalama sıcaklık karşılaştırma için yararlıdır; ancak gezegenin iklim ve hava çeşitliliğini tek başına temsil edemez.",
        ],
        sourceIds: ["nasa-earth-facts", "nasa-solar-system-temperatures"],
      },
      {
        id: "baseline",
        eyebrow: "Başlangıç ölçüsü",
        title: "Diğer bütün dünyalar buradan ölçülür",
        body: [
          "Dünya yerçekimi, 24 saatlik Güneş günü ve Dünya yılı Helios'un kişisel karşılaştırmalarının temel birimleridir.",
          "Bu tanıdıklık yararlıdır; fakat kararlı yüzey okyanuslarının ve bilinen yaşamın gezegen kataloğunda ne kadar sıra dışı olduğunu gizleyebilir.",
        ],
        sourceIds: ["jpl-planetary-physical-parameters", "nasa-earth-facts"],
      },
    ],
    humanScale: {
      title: "Vücudunun zaten bildiği başlangıç ölçüsü",
      body: "Dünya, kullanıcının girdiği tartı değerini aynen döndürür. Bu özdeş sonuç diğer bütün yerçekimi karşılaştırmaları için kontrol durumudur.",
    },
    signals: [
      {
        eyebrow: "Atmosfer",
        title: "Yüzeyde solunabilir, yukarıda katmanlı",
        body: "Atmosfere azot ve oksijen hâkimdir; ancak yaşanabilirlik basınç, sıcaklık, su ve uzun vadeli gezegen döngülerine de bağlıdır.",
      },
      {
        eyebrow: "Uydu",
        title: "Tek ve büyük bir doğal uydu",
        body: "Ay, tarihli katalogdaki tek tanınmış doğal uydudur ve gezegenine göre alışılmadık ölçüde büyüktür.",
      },
      {
        eyebrow: "Halkalar",
        title: "Gezegen halkası yok",
        body: "Dünya yakınında toz ve geçici parçacık yapıları bulunabilir; ancak dev gezegenlerdeki gibi kalıcı bir halka sistemi yoktur.",
      },
    ],
    missions: [
      {
        name: "Terra",
        status: "Dünya gözlem uydusu",
        body: "Terra; kara, atmosfer, okyanuslar ve ışınım enerjisi arasındaki etkileşimleri inceleyerek Dünya'yı bağlı bir sistem olarak ele alan yaklaşımı destekler.",
        sourceIds: ["nasa-terra-mission"],
      },
    ],
    methodology: {
      title: "Referans değer gezegenin tamamı değildir",
      body: "Dünya değerleri karşılaştırma başlangıcı olarak kullanılır. Küresel ortalamalar bölgesel iklimi, yüksekliği, hava durumunu veya yerel yerçekimi değişimini yok saymaz. Güncel gözlemler tek bir gezegen durumu gibi sunulmaz.",
    },
    sourceIds: ["nasa-terra-mission"],
  },
  mars: {
    id: "mars",
    heroKicker: "Dünya 04 · karasal gezegen",
    heroCaption:
      "Editoryal temsil. Renk ve kabartı yorumlayıcıdır; aşağıdaki ölçümler kaynaklı referans kataloğunu kullanır.",
    visualLabel: "Mars'ı yörünge açıklamalarıyla gösteren editoryal görsel",
    layout: ["metrics", "story", "human", "signals", "missions", "methodology"],
    portrait: {
      eyebrow: "Gezegen portresi",
      title: "Tanıdık ritimler, yabancı koşullar",
      lede: "Mars karşılaştırmaya davet edecek kadar yakın, sezgilerin nerede bozulduğunu gösterecek kadar farklıdır.",
    },
    sections: [
      {
        id: "time",
        eyebrow: "Zaman",
        title: "Tanıdık hissettirecek kadar yakın bir gün",
        body: [
          "Mars Güneş günü Dünya gününden yalnızca yaklaşık kırk dakika uzundur. Bu yakınlık günlük ritmi tanıdık kılar; gezegen yılı ise yaklaşık 687 Dünya gününe uzanır.",
          "Bu benzerlik insan ölçeğinde yararlıdır, ancak çevreyi Dünya benzeri yapmaz: sıcaklık, basınç ve solunabilir hava bütünüyle farklı kısıtlardır.",
        ],
        sourceIds: ["nasa-mars-facts", "jpl-planetary-physical-parameters"],
      },
      {
        id: "environment",
        eyebrow: "Çevre",
        title: "İnce hava bütün tanıdık kuralları değiştirir",
        body: [
          "Mars'ın karbondioksit ağırlıklı ince bir atmosferi vardır. Çok az ısı yalıtımı sağlar ve solunabilir değildir; bu yüzden ortalama yüzey sıcaklığı ile basınç sıradan hava durumu gibi okunamaz.",
          "Helios sıcaklığı bir gezegen referansı olarak sunar; tahmin veya her konum ve mevsim için geçerli ölçüm değildir.",
        ],
        sourceIds: ["nasa-mars-facts", "nasa-solar-system-temperatures"],
      },
      {
        id: "surface",
        eyebrow: "Yüzey kaydı",
        title: "Suyun izlerini taşıyan kuru dünya",
        body: [
          "Kanallar, deltalar, mineraller ve katmanlı arazi, geçmişte sıvı suyun Mars'ın bazı bölgelerini şekillendirdiğini gösterir. Gezegen güncel yüzeyinin ıslak veya yaşanabilir olduğu vaadi olarak değil, jeolojik kayıt olarak sunulur.",
          "Kırmızı görünüm toprak ve tozdaki demirli minerallerden gelir. Sayfanın görsel işlenişi editoryaldir; fiziksel değerler kaynak kayıtlarına bağlıdır.",
        ],
        sourceIds: ["nasa-mars-facts"],
      },
    ],
    humanScale: {
      title: "Mars'ta tartı ne gösterirdi?",
      body: "Dünya'daki tartı değerini gir. Hesap, Mars yüzey yerçekimi ile standart Dünya yerçekimi oranını uygular; kütlen değişmez.",
    },
    signals: [
      {
        eyebrow: "Yerçekimi",
        title: "Kütlen aynı kalır, tartı değeri değişir",
        body: "Mars yüzey yerçekimi Helios'un Dünya referansının belirgin biçimde altındadır. Sonuç kütle değişimi değil, tartı karşılaştırmasıdır.",
      },
      {
        eyebrow: "Yıl",
        title: "Bir yörünge, yüzlerce yerel gün",
        body: "Mars yılı yaklaşık 687 Dünya günü sürerken her Güneş günü Dünya'nın tanıdık ritmine yakındır.",
      },
      {
        eyebrow: "Uydular",
        title: "İki küçük eşlikçi",
        body: "Phobos ve Deimos tarihli referans kataloğunda tanınan iki Mars uydusudur.",
      },
    ],
    missions: [
      {
        name: "Mars 2020 · Perseverance",
        status: "Mars gezgin görevi",
        body: "Perseverance, Jezero Krateri'nde geçmiş yaşanabilirlik kanıtlarını ve eski mikrobiyal yaşam izlerini araştırır; olası gelecek dönüş için kaya ve regolit örnekleri toplar.",
        sourceIds: ["nasa-perseverance-mission"],
      },
    ],
    methodology: {
      title: "Referans dünya, canlı hava akışı değil",
      body: "Bu sayfa sürüm kontrollü gezegen referans değerleri kullanır. Ortalama sıcaklık güncel yerel gözlem değildir; bir gezgin ölçümü tüm gezegeni değil, tek bir araç, konum ve zamanı anlatır. Gözlem ve alınma tarihleri ayrı tutulur, veri yoksa güncel koşul uydurulmaz.",
    },
    sourceIds: ["nasa-perseverance-mission"],
  },
  jupiter: {
    id: "jupiter",
    heroKicker: "Dünya 05 · gaz devi",
    heroCaption:
      "Editoryal atmosfer bantları. Görünen sınır katı zemin değil, bulut sistemidir.",
    visualLabel:
      "Jüpiter'i geniş atmosfer bantları ve fırtınalarla gösteren editoryal yakın görünüm",
    layout: ["metrics", "signals", "story", "human", "missions", "methodology"],
    portrait: {
      eyebrow: "Zeminsiz ölçek",
      title: "Derinlikle tanımlanan bir gezegen",
      lede: "Jüpiter'in görünen bantları derin bir atmosferin üst katmanlarıdır. Aşağı inmek yürünebilir bir yüzeye değil, giderek artan basınç ve yoğunluğa götürür.",
    },
    sections: [
      {
        id: "layers",
        eyebrow: "Katmanlar",
        title: "Bulut tepeleri yüzey değildir",
        body: [
          "Jüpiter'de Dünya zeminiyle karşılaştırılabilir katı yüzey olmadığı için Helios yerçekimi ve sıcaklıkta bir bar referans düzeyini kullanır.",
          "Tanıdık dairesel sınır bulutlardaki görsel bir kenardır; gezegen içeri doğru giderek yoğunlaşan hidrojen ağırlıklı akışkan katmanlarla sürer.",
        ],
        sourceIds: [
          "nasa-jupiter-facts",
          "jpl-planetary-physical-parameters",
          "nasa-solar-system-temperatures",
        ],
      },
      {
        id: "tempo",
        eyebrow: "Ritim",
        title: "En büyük gezegen on saatten kısa sürede döner",
        body: [
          "Jüpiter dev boyutu kısa bir günle birleştirir. Hızlı dönüş bantlı atmosferi şekillendirir ve ekvator şişkinliğine katkı sağlar.",
          "Yılı insan ölçeğinde uzundur; günlük ritmi ise bütün karasal gezegenlerden daha hızlıdır.",
        ],
        sourceIds: ["nasa-jupiter-facts", "jpl-planetary-physical-parameters"],
      },
    ],
    humanScale: {
      title: "Tanımlı bir basınç düzeyindeki tartı karşılaştırması",
      body: "Yerçekimi hesabı Jüpiter'in bir bar referans düzeyini kullanır. Bu bir karşılaştırma sözleşmesidir; orada durulabileceği anlamına gelmez.",
    },
    signals: [
      {
        eyebrow: "Yerçekimi",
        title: "Güçlü, ancak yüzeysiz tanımlanır",
        body: "Referans yerçekimi Dünya'nın iki katından fazladır. Jüpiter atmosferinde sabit zemin sınırı olmadığı için tanım düzeyi önemlidir.",
      },
      {
        eyebrow: "Uydular",
        title: "Güneş Sistemi içinde bir gezegen sistemi",
        body: "Tarihli katalog yüzü aşkın tanınmış uydu içerir; Io, Europa, Ganymede ve Callisto belirgin Galilei grubunu oluşturur.",
      },
      {
        eyebrow: "Halkalar",
        title: "Sönük toz halkaları",
        body: "Jüpiter'in halkaları vardır, ancak Satürn çevresindeki baskın yapının aksine ince ve düşük görünürlüklüdür.",
      },
    ],
    missions: [
      {
        name: "Juno",
        status: "Jüpiter yörünge görevi",
        body: "Juno; Jüpiter'in kökenini, iç yapısını, manyetik alanını, atmosferini ve kutup fırtınalarını incelemek için bulutların altını araştırır.",
        sourceIds: ["nasa-juno-mission"],
      },
    ],
    methodology: {
      title: "Referans düzeyi açıkça belirtilmelidir",
      body: "Sıcaklık ve yerçekimi belirli bir atmosfer basınç düzeyine bağlıdır. Helios bu düzeye yüzey demez; editoryal bantlar fotoğraf veya gerçek zamanlı doğruluk iddia etmez.",
    },
    sourceIds: ["nasa-juno-mission"],
  },
  saturn: {
    id: "saturn",
    heroKicker: "Dünya 06 · gaz devi",
    heroCaption:
      "Şematik halka düzlemi. Okunabilirlik için halka genişliği vurgulanır; parçacıklar tek tek veya gerçek ölçekte çizilmez.",
    visualLabel:
      "Satürn'ü geniş ve eğik halka düzlemiyle gösteren editoryal diyagram",
    layout: ["story", "missions", "metrics", "human", "signals", "methodology"],
    portrait: {
      eyebrow: "Halka mimarisi",
      title: "Sayısız küçük parçacıkla çerçevelenen dev",
      lede: "Satürn'ün halkaları görsel olarak baskın, fiziksel olarak incedir. Altındaki gezegen katı yüzeyi olmayan derin bir hidrojen-helyum dünyasıdır.",
    },
    sections: [
      {
        id: "rings",
        eyebrow: "Halkalar",
        title: "Erişimde geniş, kalınlıkta ince",
        body: [
          "Ana halkalar büyük ölçüde su buzundan ve kayalık maddeden oluşan sayısız parçacıktan meydana gelir. Boşluk ve ayrımlar halka düzleminde yapı oluşturur.",
          "Sayfa halkaları sarı bir gezegenin dekoratif çizgisi değil, ölçeği ve bileşimi olan bir sistem olarak ele alır.",
        ],
        sourceIds: ["nasa-saturn-facts", "nasa-cassini-mission"],
      },
      {
        id: "layers",
        eyebrow: "Gezegen",
        title: "Bulutların altında platform yok",
        body: [
          "Jüpiter gibi Satürn'ün de üzerinde durulabilecek katı yüzeyi yoktur. Yerçekimi ve sıcaklık atmosferdeki bir bar referans düzeyini kullanır.",
          "Düşük ortalama yoğunluk gezegenin tamamını tanımlar; atmosferin yumuşak veya derin iç yapının boş olduğu anlamına gelmez.",
        ],
        sourceIds: ["nasa-saturn-facts", "jpl-planetary-physical-parameters"],
      },
    ],
    humanScale: {
      title: "Dünya'ya yakın yerçekimi, Dünya benzeri zemin değildir",
      body: "Bir bar referans yerçekimi şaşırtıcı biçimde Dünya'ya yakındır; ancak bu benzer tartı değeri altında katı yüzey bulunmayan bir atmosferin içindedir.",
    },
    signals: [
      {
        eyebrow: "Uydular",
        title: "Değişen bir dünyalar kataloğu",
        body: "Keşif ve sınıflandırmalar değiştiği için Satürn'ün tanınmış uydu sayısı tarihlidir. Titan ve Enceladus önemli bilim hedefleri olmaya devam eder.",
      },
      {
        eyebrow: "Gün",
        title: "Sakin renklerin altında hızlı dönüş",
        body: "Satürn yaklaşık on bir saatte döner. Düşük kontrastlı görünür renkler durağan bir atmosfer sanılmamalıdır.",
      },
      {
        eyebrow: "Sıcaklık",
        title: "Yüzey ortalaması değil, referans katman",
        body: "Gösterilen sıcaklık Dünya deniz seviyesi basıncına denk atmosfer referans düzeyine aittir.",
      },
    ],
    missions: [
      {
        name: "Cassini-Huygens",
        status: "Tamamlanmış Satürn sistemi görevi",
        body: "Cassini Satürn'de on üç yıl geçirerek gezegeni, halkaları, manyetosferi ve uyduları inceledi; Huygens Titan atmosferinden aşağı indi.",
        sourceIds: ["nasa-cassini-mission"],
      },
    ],
    methodology: {
      title: "Halka görseli bir okuma aracıdır",
      body: "Hero halka görünürlüğünü artırır ve parçacık ölçeğini çözmez. Uydu sayıları tarih taşırken sıcaklık ve yerçekimi açıkça bir bar atmosfer referans düzeyini kullanır.",
    },
    sourceIds: ["nasa-cassini-mission"],
  },
  uranus: {
    id: "uranus",
    heroKicker: "Dünya 07 · buz devi",
    heroCaption:
      "Eksen öncelikli editoryal diyagram. Gezegen güncel mevsim konumu değil, yönelimi anlatmak için yana yatık gösterilir.",
    visualLabel:
      "Uranüs'ü neredeyse yana yatık ve sönük halkalarıyla gösteren editoryal diyagram",
    layout: ["metrics", "story", "signals", "missions", "human", "methodology"],
    portrait: {
      eyebrow: "Yönelim",
      title: "Mevsimleri yanlamasına yuvarlanan dünya",
      lede: "Uranüs'ün aşırı eksen eğikliği ışık ve zaman geometrisini değiştirir. Sakin görünen dış katmanların altında buz devi iç yapısı ve uzun mevsim döngüsü bulunur.",
    },
    sections: [
      {
        id: "tilt",
        eyebrow: "Eğiklik",
        title: "Belirleyici gerçek eksendir",
        body: [
          "Uranüs yaklaşık 98 derecelik eksen eğikliğiyle döner; kutuplarını yörünge düzlemi boyunca taşır.",
          "Bir yörünge yaklaşık 84 Dünya yılı sürdüğü için her mevsim aylar değil onlarca yıl devam eder.",
        ],
        sourceIds: ["nasa-uranus-facts", "jpl-planetary-physical-parameters"],
      },
      {
        id: "identity",
        eyebrow: "Buz devi",
        title: "Daha küçük mavi bir Jüpiter değildir",
        body: [
          "Uranüs ve Neptün, bileşim ve iç yapıları hidrojen-helyum ağırlıklı gaz devlerinden farklı olduğu için buz devi sınıfındadır.",
          "Metan kırmızı ışığı soğurarak soluk camgöbeği görünüme katkı sağlar; ancak sınıfı yalnız renk tanımlamaz.",
        ],
        sourceIds: ["nasa-uranus-facts"],
      },
    ],
    humanScale: {
      title: "Yabancı bir katmanda tanıdık yerçekimi oranı",
      body: "Bir bar referans yerçekimi Venüs'e yakın ve Dünya'dan düşüktür. Bütün dev gezegenlerde olduğu gibi bu, yürünebilir yüzey ölçümü değildir.",
    },
    signals: [
      {
        eyebrow: "Halkalar",
        title: "Koyu, dar ve kolay gözden kaçan",
        body: "Uranüs'ün sönük bir halka sistemi vardır. Satürn halkaları kadar baskın olmasa da gezegen mimarisinin parçasıdır.",
      },
      {
        eyebrow: "Uydular",
        title: "Yatık bir dünyanın tarihli ailesi",
        body: "Tanınmış uydu sayısı tarih taşır. Miranda, Ariel, Umbriel, Titania ve Oberon referans kataloğunda öne çıkarılır.",
      },
      {
        eyebrow: "Sıcaklık",
        title: "Soğuk atmosfer referansı",
        body: "Gösterilen değer ziyaretçinin ulaşıp üzerinde durabileceği bir yüzeye değil, atmosfer referans düzeyine aittir.",
      },
    ],
    missions: [
      {
        name: "Voyager 2",
        status: "Tamamlanmış yakın geçiş",
        body: "Voyager 2, 1986 karşılaşmasında yeni uydular ve halkalar keşfederek Uranüs'ü yakından inceleyen tek uzay aracı olmayı sürdürür.",
        sourceIds: ["nasa-voyager-2-mission"],
      },
    ],
    methodology: {
      title: "Eğiklik donmuş bir görüntü değil, geometrik ilişkidir",
      body: "Hero sıra dışı ekseni okunabilir diyagramda sabitler; seçili tarihteki güncel mevsimi veya tam yönelimi gösterdiğini iddia etmez. Zaman bağımlı yönelim efemeris modeliyle ayrı ele alınır.",
    },
    sourceIds: ["nasa-voyager-2-mission"],
  },
  neptune: {
    id: "neptune",
    heroKicker: "Dünya 08 · buz devi",
    heroCaption:
      "Uzaklık odaklı editoryal diyagram. Küçük Güneş sinyali ve derin alan uzaklığı anlatır; fotoğraflanmış gökyüzü değildir.",
    visualLabel:
      "Neptün'ü uzak Güneş ışığı sinyaliyle gösteren derin uzay editoryal diyagramı",
    layout: ["human", "metrics", "story", "signals", "missions", "methodology"],
    portrait: {
      eyebrow: "Uzak ışık",
      title: "Uzaklık her deneyimin parçası olur",
      lede: "Neptün yalnızca daha koyu mavi bir Uranüs değildir. Uzaklığı, atmosfer hareketliliği ve uzun yörünge süresi farklı bir ritim ve güçlü bir derinlik duygusu yaratır.",
    },
    sections: [
      {
        id: "distance",
        eyebrow: "Uzaklık",
        title: "Güneş ışığı dakikalar değil saatler sonra ulaşır",
        body: [
          "Neptün'ün ortalama yörünge uzaklığında Güneş ışığının ulaşması birkaç saat sürer. Görev işlemleri ek kısıtlar getirmeden önce bile iletişim ve gözlem bu gecikmeyi taşır.",
          "Güneş göze hâlâ çok parlak görünür, ancak Dünya'dakinden çok daha küçük açısal çap kaplar.",
        ],
        sourceIds: ["nasa-neptune-facts", "jpl-planetary-physical-parameters"],
      },
      {
        id: "motion",
        eyebrow: "Atmosfer",
        title: "Soğuk ama hareketli bir dünya",
        body: [
          "Neptün atmosferi hidrojen, helyum ve metan ağırlıklıdır; buna rağmen son derece dinamik hava olayları ve çok hızlı rüzgârlar üretir.",
          "Referans sıcaklık katı yüzeye veya güncel fırtınaya değil, belirli bir atmosfer basınç düzeyine bağlıdır.",
        ],
        sourceIds: ["nasa-neptune-facts", "nasa-solar-system-temperatures"],
      },
    ],
    humanScale: {
      title: "Gecikme, yerçekiminden daha elle tutulur",
      body: "Bir bar referans düzeyinde tartı karşılaştırması yapılabilir; fakat insan ölçeğinde belirleyici gerçek zamandır: ışık ve radyo sinyalleri dev bir mesafe kat eder.",
    },
    signals: [
      {
        eyebrow: "Uydu",
        title: "Triton alışılmış yönün tersine gider",
        body: "Triton Neptün'ün en büyük öne çıkarılan uydusudur ve retrograd yörüngesiyle uydu sistemini atmosfer kadar ayırt edici kılar.",
      },
      {
        eyebrow: "Halkalar",
        title: "Yoğunlaşmış yaylara sahip sönük halkalar",
        body: "Neptün'ün halka sistemi incedir ve Satürn benzeri parlak sürekli bantlar yerine belirgin yaylar içerir.",
      },
      {
        eyebrow: "Yıl",
        title: "Bir yörünge insan ömrünü aşar",
        body: "Neptün'ün Güneş çevresindeki turu yaklaşık 165 Dünya yılı sürer; günlük atmosfer hareketini olağanüstü uzun mevsim saatinden ayırır.",
      },
    ],
    missions: [
      {
        name: "Voyager 2",
        status: "Tamamlanmış yakın geçiş",
        body: "Voyager 2, 1989 karşılaşmasında uyduları, halkaları ve Büyük Karanlık Leke'yi ortaya çıkararak Neptün'ü ziyaret eden tek uzay aracı olmayı sürdürür.",
        sourceIds: ["nasa-voyager-2-mission"],
      },
    ],
    methodology: {
      title: "Uzaklık ve hava olayları farklı saatler kullanır",
      body: "Işık yolculuk süresi ortalama yörünge uzaklığından hesaplanır. Atmosfer anlatımı canlı tahminden değil referans bilimden gelir. Hero, uzay aracı fotoğrafı yerine bir uzaklık diyagramıdır.",
    },
    sourceIds: ["nasa-voyager-2-mission"],
  },
} as const satisfies Record<PlanetId, PlanetDetailContent>;

export const planetDetailContentTr = trContent;
