import type { ExtendedBodyId } from "@/features/solar-system/types/celestial-body";

export interface ExtendedBodyCopyTr {
  readonly tagline: string;
  readonly description: string;
}

export const EXTENDED_BODY_COPY_TR = {
  ceres: {
    tagline: "Asteroit kuşağındaki en büyük dünya.",
    description:
      "Ceres farklılaşmış bir cüce gezegendir ve iç Güneş Sistemi'ndeki tek cüce gezegendir.",
  },
  vesta: {
    tagline: "Dev güney kutup havzasıyla yaralanmış öngezegen.",
    description:
      "Vesta ana kuşakta kütle bakımından ikinci büyük cisimdir ve Dawn uzay aracı tarafından ziyaret edilmiştir.",
  },
  pallas: {
    tagline: "Yüksek eğimli bir ana kuşak dünyası.",
    description:
      "Pallas asteroit kuşağında belirgin biçimde eğimli ve dışmerkezli bir yörünge izler.",
  },
  hygiea: {
    tagline: "Dış kuşakta bulunan koyu, neredeyse küresel cisim.",
    description:
      "Hygiea dış ana kuşaktaki karbonca zengin büyük asteroit ailesinin en büyük üyesidir.",
  },
  pluto: {
    tagline: "Kuiper Kuşağı'nın iç sınırında karmaşık ve etkin dünya.",
    description:
      "Plüton dağlara, buzullara, pus katmanlarına ve Neptün ötesinde rezonanslı yörüngeye sahiptir.",
  },
  eris: {
    tagline: "Uzak ve eğimli yörüngedeki büyük cüce gezegen.",
    description:
      "Eris modern gezegen tanımını tetikleyen keşiflerden biridir ve yörüngesinin çoğunu Plüton'dan çok uzakta geçirir.",
  },
  haumea: {
    tagline: "Hızla dönen, uzamış cüce gezegen.",
    description:
      "Haumea'nın hızlı dönüşü sıra dışı uzamış şekil oluşturur; ayrıca halkası ve uyduları vardır.",
  },
  makemake: {
    tagline: "Metan bakımından zengin parlak Kuiper Kuşağı dünyası.",
    description:
      "Makemake klasik Kuiper Kuşağı'nda bilinen en büyük cisimlerden biridir.",
  },
  quaoar: {
    tagline: "Uzak halkaya sahip büyük klasik Kuiper Kuşağı cismi.",
    description:
      "Quaoar yuvarlak bir Neptün ötesi dünyadır; bir uydusu ve beklenmedik ölçüde uzak halkası bulunur.",
  },
  gonggong: {
    tagline: "Dışmerkezli yörüngedeki kızıl saçılmış disk dünyası.",
    description:
      "Gonggong su buzu izleri ve küçük bir uydusu bulunan büyük Neptün ötesi cisimdir.",
  },
  sedna: {
    tagline: "Güneş Sistemi'nin uzak sınırından aşırı ayrık cisim.",
    description:
      "Sedna'nın dev ve dışmerkezli yörüngesi erken Güneş Sistemi çevresine ilişkin kanıtları koruyor olabilir.",
  },
  orcus: {
    tagline: "Plüton'un yörünge ailesine rezonanslı eşlikçi.",
    description:
      "Orcus Neptün'le 2:3 rezonanstadır ve Vanth adlı büyük bir uyduya sahiptir.",
  },
  halley: {
    tagline: "En iyi bilinen geri dönen kuyruklu yıldız.",
    description:
      "Halley'in retrograd yörüngesi onu yaklaşık 76 yılda bir iç Güneş Sistemi'ne getirir.",
  },
  "hale-bopp": {
    tagline: "Dev yörüngeye sahip büyük uzun dönemli kuyruklu yıldız.",
    description:
      "Hale–Bopp'un 1997 görünümü fiziksel olarak ayrı toz ve iyon kuyruklarını belirgin biçimde sergiledi.",
  },
  encke: {
    tagline: "Her 3,3 yılda geri dönen kısa dönemli kuyruklu yıldız.",
    description:
      "Encke bilinen en kısa kuyruklu yıldız dönemlerinden birine sahiptir ve Taurid meteoroid kompleksini besler.",
  },
  "67p": {
    tagline: "Rosetta'nın iki loblu kuyruklu yıldızı.",
    description:
      "67P, ESA'nın Rosetta görevi tarafından yörüngeden incelendi ve üzerine iniş yapıldı; gözenekli ve etkin çekirdeği ortaya çıkarıldı.",
  },
  neowise: {
    tagline: "2020'nin parlak kuzey gökyüzü kuyruklu yıldızı.",
    description:
      "C/2020 F3 NEOWISE, toz ve iyon kuyrukları geniş biçimde gözlenen uzun dönemli kuyruklu yıldızdır.",
  },
  "tempel-1": {
    tagline: "Deep Impact görevinin hedefi.",
    description:
      "Tempel 1 hem Deep Impact hem Stardust-NExT tarafından incelenmiş Jüpiter ailesi kuyruklu yıldızıdır.",
  },
} as const satisfies Record<ExtendedBodyId, ExtendedBodyCopyTr>;
