import type { ScaleMode } from "@/features/solar-system/types/experience-settings";

import type { Locale } from "./locale";

type Widen<T> = T extends (...args: infer A) => infer R
  ? (...args: A) => Widen<R>
  : T extends string
    ? string
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

const EN = Object.freeze({
  title: "Explore",
  description:
    "A moving overview of the Sun, planets, selected moons, small worlds and system regions, built from the sourced Helios catalog.",
  eyebrow: "Solar System overview",
  sceneLabel: (scaleMode: ScaleMode, reducedMotion: boolean) => {
    const motion = reducedMotion ? "Static" : "Animated";
    const scale =
      scaleMode === "scientific" ? "scientific-scale" : "exploration-scale";
    return `${motion} ${scale} model of the Solar System`;
  },
  loading: "Preparing the Solar System",
  fallbackTitle: "The 3D view is unavailable",
  fallbackBody:
    "The celestial navigator and reference pages remain available without WebGL.",
  keyboardHint:
    "Drag or touch the scene to control the camera. Use Tab and Enter to select a body; Escape returns to guided view.",
  freeCameraHint:
    "Free camera: drag or touch to orbit, wheel or pinch to zoom, arrow keys to pan, and Escape to return to guided view.",
  scientificMarkerCaption: "Scientific view locator",
  scientificSelectedMarkerCaption: "Selected · shared physical scale",
  scaleNotices: {
    exploration: "Explore view",
    scientific: "Scientific view · shared physical scale",
  } satisfies Record<ScaleMode, string>,
  cameraStatus: (
    name: string | undefined,
    mode: "overview" | "transition" | "focus" | "free",
  ) => {
    if (mode === "free") {
      return name
        ? `Free camera around ${name}.`
        : "Free camera around the Solar System.";
    }
    if (!name) {
      return mode === "transition"
        ? "Returning to the Solar System overview."
        : "Solar System overview.";
    }
    return mode === "focus" ? `${name} is in focus.` : `Moving toward ${name}.`;
  },
  galactic: {
    marker: "Solar System · Orion Spur",
    title: "Milky Way, from outside",
    description:
      "NASA/JPL-informed barred-spiral model. The Sun is about 26,000 light-years from the center, between the Sagittarius and Perseus arms. This map uses a separate galactic scale.",
  },
  loader: {
    ariaLabel: "Solar System loading progress",
    renderer: "Preparing the scene",
    sun: "Preparing the Sun",
    planets: "Preparing the planets",
    finalLayers: "Preparing final layers",
    progress: (ready: number, total: number) =>
      `${ready} of ${total} planets ready`,
  },
  controls: {
    label: "View controls",
    eyebrow: "Scene presentation",
    title: "View",
    scale: "View scale",
    visibility: "Visibility",
    visibilityLabels: {
      planets: "Planets",
      moons: "Moons",
      asteroids: "Asteroids",
      "dwarf-kuiper": "Dwarf & Kuiper worlds",
      comets: "Comets",
      regions: "Regions",
    },
    orbits: "Orbit paths",
    labels: "Body labels",
    camera: "Camera",
    freeCamera: "Free",
    guidedCamera: "Guided",
    resetView: "Reset view",
    restoreVisibility: "Restore all visibility",
    restoreAlready: "All categories, orbits and labels are already visible.",
    restoreAction:
      "Shows every category, clears object overrides and enables orbits and labels.",
    scaleOptions: { exploration: "Explore", scientific: "Scientific" },
    scaleDescriptions: {
      exploration:
        "Explore view preserves orbital order while enlarging bodies and compressing distance for clear navigation.",
      scientific:
        "Scientific view applies one shared linear scale to body radii and orbital distance. Screen-space labels locate bodies without enlarging them.",
    } satisfies Record<ScaleMode, string>,
    freeStatus:
      "Free camera keeps the current pose while selection remains available.",
    overviewStatus: "Guided overview is active.",
    guidedStatus:
      "Guided camera follows the selected target without locking rotation or zoom.",
    visualContract:
      "Helios uses one automatic visual profile. Staged loading and fixed resource limits keep the scene consistent across devices.",
    visibilityState: (visible: boolean) => (visible ? "On" : "Off"),
    visibilityAria: (label: string, visible: boolean) =>
      `${label}: ${visible ? "visible" : "hidden"}`,
  },
});

type ExplorePageCopy = Widen<typeof EN>;

const TR: ExplorePageCopy = Object.freeze({
  title: "Keşfet",
  description:
    "Kaynaklı Helios kataloğundan oluşturulan Güneş, gezegenler, seçili uydular, küçük dünyalar ve sistem bölgelerinin hareketli görünümü.",
  eyebrow: "Güneş Sistemi genel görünümü",
  sceneLabel: (scaleMode: ScaleMode, reducedMotion: boolean) => {
    const motion = reducedMotion ? "Statik" : "Hareketli";
    const scale =
      scaleMode === "scientific" ? "bilimsel ölçekli" : "keşif ölçekli";
    return `${motion} ${scale} Güneş Sistemi modeli`;
  },
  loading: "Güneş Sistemi hazırlanıyor",
  fallbackTitle: "3B görünüm kullanılamıyor",
  fallbackBody:
    "Gök cismi gezgini ve referans sayfaları WebGL olmadan da kullanılabilir.",
  keyboardHint:
    "Kamerayı kontrol etmek için sahneyi sürükle veya dokun. Bir cisim seçmek için Tab ve Enter kullan; Escape yönlendirmeli görünüme döner.",
  freeCameraHint:
    "Serbest kamera: yörüngelemek için sürükle veya dokun, yakınlaştırmak için tekerlek ya da iki parmak kullan, kaydırmak için ok tuşlarına bas ve yönlendirmeli görünüme dönmek için Escape kullan.",
  scientificMarkerCaption: "Bilimsel görünüm konum işareti",
  scientificSelectedMarkerCaption: "Seçili · ortak fiziksel ölçek",
  scaleNotices: {
    exploration: "Keşif görünümü",
    scientific: "Bilimsel görünüm · ortak fiziksel ölçek",
  },
  cameraStatus: (
    name: string | undefined,
    mode: "overview" | "transition" | "focus" | "free",
  ) => {
    if (mode === "free") {
      return name
        ? `${name} çevresinde serbest kamera.`
        : "Güneş Sistemi çevresinde serbest kamera.";
    }
    if (!name) {
      return mode === "transition"
        ? "Güneş Sistemi genel görünümüne dönülüyor."
        : "Güneş Sistemi genel görünümü.";
    }
    return mode === "focus"
      ? `${name} odakta.`
      : `${name} hedefine ilerleniyor.`;
  },
  galactic: {
    marker: "Güneş Sistemi · Orion Kolu",
    title: "Dışarıdan Samanyolu",
    description:
      "NASA/JPL verilerine dayalı çubuklu sarmal model. Güneş, merkezden yaklaşık 26.000 ışık yılı uzakta; Yay ve Kahraman kolları arasındadır. Bu harita ayrı bir galaktik ölçek kullanır.",
  },
  loader: {
    ariaLabel: "Güneş Sistemi yükleme ilerlemesi",
    renderer: "Sahne hazırlanıyor",
    sun: "Güneş hazırlanıyor",
    planets: "Gezegenler hazırlanıyor",
    finalLayers: "Son katmanlar hazırlanıyor",
    progress: (ready: number, total: number) =>
      `${total} gezegenden ${ready} tanesi hazır`,
  },
  controls: {
    label: "Görünüm kontrolleri",
    eyebrow: "Sahne sunumu",
    title: "Görünüm",
    scale: "Görünüm ölçeği",
    visibility: "Görünürlük",
    visibilityLabels: {
      planets: "Gezegenler",
      moons: "Uydular",
      asteroids: "Asteroitler",
      "dwarf-kuiper": "Cüce ve Kuiper dünyaları",
      comets: "Kuyruklu yıldızlar",
      regions: "Bölgeler",
    },
    orbits: "Yörünge yolları",
    labels: "Cisim etiketleri",
    camera: "Kamera",
    freeCamera: "Serbest",
    guidedCamera: "Yönlendirmeli",
    resetView: "Görünümü sıfırla",
    restoreVisibility: "Tüm görünürlüğü geri yükle",
    restoreAlready: "Bütün kategoriler, yörüngeler ve etiketler zaten görünür.",
    restoreAction:
      "Bütün kategorileri gösterir, cisim bazlı istisnaları temizler ve yörüngelerle etiketleri etkinleştirir.",
    scaleOptions: { exploration: "Keşif", scientific: "Bilimsel" },
    scaleDescriptions: {
      exploration:
        "Keşif görünümü açık gezinme için cisimleri büyütüp mesafeyi sıkıştırırken yörünge sırasını korur.",
      scientific:
        "Bilimsel görünüm cisim yarıçaplarıyla yörünge uzaklığına ortak doğrusal ölçek uygular. Ekran alanı etiketleri cisimleri büyütmeden konumlandırır.",
    },
    freeStatus:
      "Serbest kamera, seçim kullanılabilir kalırken mevcut konumu korur.",
    overviewStatus: "Yönlendirmeli genel görünüm etkin.",
    guidedStatus:
      "Yönlendirmeli kamera dönüşü veya yakınlaştırmayı kilitlemeden seçili hedefi izler.",
    visualContract:
      "Helios tek bir otomatik görsel profil kullanır. Aşamalı yükleme ve sabit kaynak sınırları sahneyi farklı cihazlarda tutarlı tutar.",
    visibilityState: (visible: boolean) => (visible ? "Açık" : "Kapalı"),
    visibilityAria: (label: string, visible: boolean) =>
      `${label}: ${visible ? "görünür" : "gizli"}`,
  },
});

export const explorePageCopyByLocale: Readonly<
  Record<Locale, ExplorePageCopy>
> = Object.freeze({ en: EN, tr: TR });

export function getExplorePageCopy(locale: Locale = "en") {
  return explorePageCopyByLocale[locale];
}
