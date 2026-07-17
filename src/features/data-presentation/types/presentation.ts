import type { DataFreshness } from "@/lib/data/schemas/source";

export interface SourcePresentation {
  readonly accessedAt: string;
  readonly freshness: DataFreshness;
  readonly id: string;
  readonly notes?: string;
  readonly provider: string;
  readonly publishedOrUpdatedAt?: string;
  readonly title: string;
  readonly url: string;
}

export interface ContentSectionModel {
  readonly body: readonly string[];
  readonly eyebrow?: string;
  readonly id: string;
  readonly sourceIds: readonly string[];
  readonly title: string;
}

export interface MetricPresentation {
  readonly context?: string;
  readonly id: string;
  readonly label: string;
  readonly sourceId: string;
  readonly unit?: string;
  readonly value: string;
}
