import type { PlanetId } from "@/lib/data/schemas/planet";

export type PlanetDetailBlock =
  "metrics" | "story" | "human" | "signals" | "missions" | "methodology";

export interface PlanetDetailSection {
  readonly body: readonly string[];
  readonly eyebrow: string;
  readonly id: string;
  readonly sourceIds: readonly string[];
  readonly title: string;
}

export interface PlanetDetailMission {
  readonly body: string;
  readonly name: string;
  readonly sourceIds: readonly string[];
  readonly status: string;
}

export interface PlanetDetailContent {
  readonly id: PlanetId;
  readonly heroCaption: string;
  readonly heroKicker: string;
  readonly humanScale: {
    readonly body: string;
    readonly title: string;
  };
  readonly layout: readonly PlanetDetailBlock[];
  readonly methodology: {
    readonly body: string;
    readonly title: string;
  };
  readonly missions: readonly PlanetDetailMission[];
  readonly portrait: {
    readonly eyebrow: string;
    readonly lede: string;
    readonly title: string;
  };
  readonly sections: readonly PlanetDetailSection[];
  readonly signals: readonly {
    readonly body: string;
    readonly eyebrow: string;
    readonly title: string;
  }[];
  readonly sourceIds: readonly string[];
  readonly visualLabel: string;
}
