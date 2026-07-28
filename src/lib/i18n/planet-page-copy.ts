import { planetPageEnglishCopy } from "./planet-page-copy.en";
import type { Locale } from "./locale";

const trDetail = {
  backToExplore: "Sisteme dön",
  jumpToHumanScale: "İnsan ölçeği",
  jumpToSources: "Yöntem ve kaynaklar",
  heroNavigation: (name: string) => `${name} sayfası kısayolları`,
  heroMeta: { order: "Güneş'ten sıra", kind: "Dünya türü" },
  kindLabels: {
    terrestrial: "Karasal",
    "gas-giant": "Gaz devi",
    "ice-giant": "Buz devi",
  },
  metrics: {
    radius: "Ortalama yarıçap",
    solarDay: "Güneş günü",
    temperature: "Sıcaklık referansı",
    temperatureContexts: {
      surface: "Küresel yüzey referansı; yerel hava durumu değil",
      "cloud-top": "Bulut tepesi referansı; katı zemin değil",
      "reference-level": "Atmosfer referans düzeyi; yüzey değil",
      "not-applicable": "Tek bir fiziksel yüzey tanımı yok",
    },
  },
  sections: {
    humanEyebrow: "Kişisel karşılaştırma",
    humanTitle: "Sayıları kendi bedeninle karşılaştır",
    humanLede:
      "Yerçekimi, gün uzunluğu ve ışık gecikmesi Dünya referansıyla daha anlaşılır olur.",
    signalsEyebrow: "Referans işaretleri",
    signalsTitle: "Bu dünyayı tanımlayan koşullar",
    missionsEyebrow: "Keşif kaydı",
    missionsTitle: "Bu gezegeni okumayı nasıl öğrendik",
    missionsLede:
      "Görev özetleri tarihli resmî kayıtlara bağlıdır; canlı telemetri olarak sunulmaz.",
    methodologyEyebrow: "Bilimsel sınırlar",
    methodologyTitle: "Bu değerler neyi anlatır, neyi anlatmaz",
    methodologyLede:
      "Referans değerleri tanım, kaynak ve tarih bağlamını korur. Editoryal diyagramlar ölçülmüş gezegen verisinden ayrılır.",
  },
  methodologyLabel: "Yöntem ve sınırlar",
  adjacentPlanets: "Komşu gezegenler",
  previousPlanet: "Önceki dünya",
  nextPlanet: "Sonraki dünya",
  missionSource: "Görev kaynağı",
  ledger: {
    axialTilt: "Eksen eğikliği",
    recognizedMoons: "Tanınmış uydular",
    rings: "Halkalar",
    atmosphere: "Atmosfer",
  },
  humanScale: {
    eyebrow: "Dünya referansın",
    inputLabel: "Dünya tartı değeri",
    inputHelp: "0 ile 1.000 kilogram arasında bir değer kullan.",
    inputError: "0 ile 1.000 arasında bir sayı gir.",
    resultLabel: (name: string) => `${name} tartı karşılığı`,
    resultExplanation:
      "Bu Dünya tipi bir tartı karşılığıdır. Kütlen değişmez; dev gezegen değeri üzerinde durulacak zemin yerine tanımlı atmosfer düzeyine aittir.",
    gravityLabel: "Dünya yerçekimi",
    gravityNotes: {
      "surface-equatorial": "yüzey referans oranı",
      "one-bar-reference-level": "bir bar referans oranı",
    },
    dayLabel: "Güneş günü farkı",
    dayNote: "24 saatle karşılaştırma",
    lightLabel: "Güneş ışığı yolculuğu",
    lightNote: "ortalama yörünge uzaklığı",
  },
} as const;

const trMars = {
  ...trDetail,
  heroNavigation: "Mars sayfası kısayolları",
  editorialVisualLabel:
    "Mars'ın yörünge açıklamalarıyla editoryal görsel yorumu",
  metrics: {
    radius: "Ortalama yarıçap",
    radiusContext: "Dünya çapının yaklaşık yarısı",
    solarDay: "Güneş günü",
    dayContext: "Dünya'dan yalnızca yaklaşık kırk dakika uzun",
    temperature: "Ortalama yüzey referansı",
    temperatureContext: "Gezegen ortalaması; yerel hava durumu değil",
  },
  sections: {
    portraitEyebrow: "Gezegen portresi",
    portraitTitle: "Tanıdık ritimler, yabancı koşullar",
    portraitLede:
      "Mars karşılaştırmaya davet edecek kadar yakın, sezginin nerede bozulduğunu gösterecek kadar farklıdır.",
    humanEyebrow: "Kişisel karşılaştırma",
    humanTitle: "Sayıları kendi bedeninle karşılaştır",
    humanLede:
      "Yerçekimi, gün uzunluğu ve ışık gecikmesi Dünya referansıyla daha anlaşılır olur.",
    environmentEyebrow: "Referans işaretleri",
    environmentTitle: "Bütün deneyimi değiştiren üç sayı",
    methodologyEyebrow: "Bilimsel sınırlar",
    methodologyTitle: "Bu değerler neyi anlatır, neyi anlatmaz",
    methodologyLede:
      "Gösterilen her değer kaynak, tanım ve tarih bağlamını korur. Referans değerleri şu anda gerçekleşen gözlem gibi sunulmaz.",
  },
  facts: {
    gravityEyebrow: "Yerçekimi",
    gravityTitle: "Kütlen aynı kalır, tartı değeri değişir",
    gravityBody: (percent: string) =>
      `Mars yüzey yerçekimi Helios'un Dünya referansının yaklaşık %${percent}'idir. Bu kütle değişimi değil, tartı karşılaştırmasıdır.`,
    yearEyebrow: "Yıl",
    yearTitle: "Bir yörünge, yüzlerce yerel gün",
    yearBody: (earthDays: string, localDays: string) =>
      `Mars yılı yaklaşık ${earthDays} Dünya günü, referans gün uzunluğuyla yaklaşık ${localDays} Mars Güneş günü sürer.`,
    moonsEyebrow: "Uydular",
    moonsTitle: "İki küçük eşlikçi",
    moonsBody: (count: number, asOf: string) =>
      `Mars'ın ${count} tanınmış uydusu vardır: Phobos ve Deimos. Katalog kaydı ${asOf} tarihlidir.`,
    undated: "tarih kaydedilmemiş",
  },
  humanScale: {
    eyebrow: "Dünya referansın",
    title: "Mars'ta tartı ne gösterirdi?",
    body: "Dünya tartı değerini gir. Hesap, Mars yüzey yerçekimi ile standart Dünya yerçekimi oranını uygular; kütlen değişmez.",
    inputLabel: "Dünya tartı değeri",
    inputHelp: "0 ile 1.000 kilogram arasında bir değer kullan.",
    inputError: "0 ile 1.000 arasında bir sayı gir.",
    resultLabel: "Mars tartı karşılığı",
    resultExplanation:
      "Bu Dünya tipi bir tartı karşılığıdır; tıbbi veya vücut kütlesi hesabı değildir.",
    gravityLabel: "Dünya yerçekimi",
    gravityNote: "yüzey referans oranı",
    dayLabel: "Güneş günündeki ek süre",
    dayNote: "24 saatle karşılaştırma",
    lightLabel: "Güneş ışığı yolculuğu",
    lightNote: "ortalama yörünge uzaklığı",
  },
} as const;

export const planetPageCopy = {
  en: {
    detail: {
      ...planetPageEnglishCopy.detail,
      ledger: {
        axialTilt: "Axial tilt",
        recognizedMoons: "Recognized moons",
        rings: "Rings",
        atmosphere: "Atmosphere",
      },
    },
    mars: planetPageEnglishCopy.mars,
  },
  tr: { detail: trDetail, mars: trMars },
} as const satisfies Record<Locale, object>;
