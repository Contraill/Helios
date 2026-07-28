import type { Locale } from "./locale";

export const siteCopy = {
  en: {
    a11y: {
      mainNavLabel: "Main navigation",
      localeLabel: "Interface language",
      localeCoverage: "Language",
      localeChanging: "Updating interface language…",
      localeChanged: (language: string) =>
        `Interface language changed to ${language}.`,
      languageNames: { en: "English", tr: "Turkish" },
      localeScope:
        "Helios is fully available in English. Changing language preserves the current route, data state and scene selection.",
      skipToContent: "Skip to main content",
    },
    footer:
      "A portfolio project by İzzet Can Öztozlu. Sources and scientific limits are documented throughout the project.",
    apod: {
      title: "Astronomy Picture of the Day",
      emptyTitle: "No dated APOD record is available",
      emptyBody:
        "The Helios home page remains available without the remote record.",
      mediaUnavailable: "APOD media unavailable",
      videoPreview: "Video preview",
      image: "Image",
      previous: "Previous day",
      newer: "Newer day",
      official: "Open official record",
      officialLabel: (title: string) =>
        `Open the official record for ${title} (opens in a new tab)`,
      copyright: "Copyright",
      service: "Service",
    },
    dataPresentation: {
      accessed: "Accessed",
      sources: "Sources and provenance",
      opensNewTab: (title: string) => `${title} (opens in a new tab)`,
      freshness: {
        live: "Live",
        "near-live": "Near-live",
        "latest-available": "Latest available",
        historical: "Historical",
        reference: "Reference",
      },
    },
    dataState: {
      labels: {
        current: "Current response",
        "near-live": "Near-live source",
        "latest-available": "Latest available",
        historical: "Historical record",
        partial: "Partial provider response",
        stale: "Cached record",
        fallback: "Verified fallback",
        unavailable: "Unavailable",
      },
      observed: "Observed",
      retrieved: "Retrieved",
    },
    nav: {
      about: "About",
      caseStudy: "Case study",
      compare: "Compare",
      data: "Data",
      explore: "Explore",
      missions: "Missions",
    },
    errors: {
      notFoundTitle: "Page not found",
      notFoundBody:
        "The requested Helios route does not exist or is no longer available.",
      backHome: "Return home",
      errorTitle: "Something went wrong",
      errorBody:
        "The page could not be completed. The rest of Helios remains available.",
      retry: "Try again",
    },
    site: {
      name: "Helios",
      tagline:
        "An interactive Solar System explorer built around scale, place and perspective.",
    },
  },
  tr: {
    a11y: {
      mainNavLabel: "Ana gezinme",
      localeLabel: "Arayüz dili",
      localeCoverage: "Dil",
      localeChanging: "Arayüz dili güncelleniyor…",
      localeChanged: (language: string) =>
        `Arayüz dili ${language} olarak değiştirildi.`,
      languageNames: { en: "İngilizce", tr: "Türkçe" },
      localeScope:
        "Helios bütünüyle Türkçe kullanılabilir. Dil değişimi mevcut sayfa, veri durumu ve sahne seçimini korur.",
      skipToContent: "Ana içeriğe geç",
    },
    footer:
      "İzzet Can Öztozlu tarafından geliştirilen bir portföy projesi. Kaynaklar ve bilimsel sınırlar proje boyunca açıklanır.",
    apod: {
      title: "Günün Astronomi Görseli",
      emptyTitle: "Tarihli bir APOD kaydı bulunmuyor",
      emptyBody:
        "Uzak kayıt bulunmadığında da Helios ana sayfası kullanılabilir kalır.",
      mediaUnavailable: "APOD medyasına ulaşılamıyor",
      videoPreview: "Video önizlemesi",
      image: "Görsel",
      previous: "Önceki gün",
      newer: "Daha yeni gün",
      official: "Resmî kaydı aç",
      officialLabel: (title: string) =>
        `${title} için resmî kaydı aç (yeni sekmede açılır)`,
      copyright: "Telif",
      service: "Servis",
    },
    dataPresentation: {
      accessed: "Erişim",
      sources: "Kaynaklar ve köken bilgisi",
      opensNewTab: (title: string) => `${title} (yeni sekmede açılır)`,
      freshness: {
        live: "Canlı",
        "near-live": "Yakın canlı",
        "latest-available": "Son mevcut",
        historical: "Tarihsel",
        reference: "Referans",
      },
    },
    dataState: {
      labels: {
        current: "Güncel yanıt",
        "near-live": "Yakın canlı kaynak",
        "latest-available": "Son mevcut kayıt",
        historical: "Tarihsel kayıt",
        partial: "Kısmi sağlayıcı yanıtı",
        stale: "Önbelleğe alınmış kayıt",
        fallback: "Doğrulanmış yedek",
        unavailable: "Kullanılamıyor",
      },
      observed: "Gözlem",
      retrieved: "Alınma",
    },
    nav: {
      about: "Hakkında",
      caseStudy: "Vaka çalışması",
      compare: "Karşılaştır",
      data: "Veri",
      explore: "Keşfet",
      missions: "Görevler",
    },
    errors: {
      notFoundTitle: "Sayfa bulunamadı",
      notFoundBody:
        "İstenen Helios sayfası bulunmuyor veya artık kullanılamıyor.",
      backHome: "Ana sayfaya dön",
      errorTitle: "Bir sorun oluştu",
      errorBody:
        "Sayfa tamamlanamadı. Helios'un geri kalanı kullanılabilir durumda.",
      retry: "Tekrar dene",
    },
    site: {
      name: "Helios",
      tagline:
        "Ölçek, konum ve bakış açısı etrafında kurulan etkileşimli Güneş Sistemi keşfi.",
    },
  },
} as const satisfies Record<Locale, object>;
