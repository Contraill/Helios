import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import type { PlanetDetailContent } from "@/content/planet-details";
import {
  ContentSection,
  FactCard,
  MethodologyNote,
  MetricCard,
  MetricGrid,
  SourceAttribution,
} from "@/features/data-presentation/components";
import type { PlanetDetailModel } from "@/features/planet-details/lib/planet-detail-model";
import {
  formatHoursAsClockDuration,
  formatOneDecimal,
  formatZeroDecimals,
} from "@/lib/i18n/formatters";
import { uiStrings } from "@/lib/i18n/ui-strings";

import { PlanetAdjacentNav } from "./planet-adjacent-nav";
import { PlanetEditorialVisual } from "./planet-editorial-visual";
import { PlanetHumanScale } from "./planet-human-scale";
import { PlanetMissionList } from "./planet-mission-list";
import styles from "./planet-detail.module.css";

export function PlanetDetailPage({
  content,
  model,
  supplement,
  showHumanScale = true,
}: {
  readonly content: PlanetDetailContent;
  readonly model: PlanetDetailModel;
  readonly supplement?: ReactNode;
  readonly showHumanScale?: boolean;
}) {
  const copy = uiStrings.pages.planet.detail;
  const blocks: Record<string, ReactNode> = {
    metrics: (
      <MetricGrid key="metrics">
        <MetricCard
          context={`${formatZeroDecimals(model.equatorialDiameterKm)} km equatorial diameter`}
          label={copy.metrics.radius}
          unit="km"
          value={formatOneDecimal(model.meanRadiusKm)}
        />
        <MetricCard
          context={
            model.retrograde ? "Retrograde rotation" : "Prograde rotation"
          }
          label={copy.metrics.solarDay}
          value={
            model.solarDayHours
              ? formatHoursAsClockDuration(model.solarDayHours)
              : "—"
          }
        />
        <MetricCard
          context={
            copy.metrics.temperatureContexts[model.temperatureDefinition]
          }
          label={copy.metrics.temperature}
          unit="°C"
          value={formatZeroDecimals(model.averageTemperatureC)}
        />
      </MetricGrid>
    ),
    story: (
      <ContentSection
        eyebrow={content.portrait.eyebrow}
        id="portrait"
        key="story"
        lede={content.portrait.lede}
        title={content.portrait.title}
      >
        <div className={styles.narrativeStack}>
          {content.sections.map((section, index) => (
            <article className={styles.narrativeBlock} key={section.id}>
              <span className={styles.narrativeNumber}>
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <div>
                <p className={styles.microLabel}>{section.eyebrow}</p>
                <h3>{section.title}</h3>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </ContentSection>
    ),
    human: showHumanScale ? (
      <ContentSection
        eyebrow={copy.sections.humanEyebrow}
        id="human-scale"
        key="human"
        lede={copy.sections.humanLede}
        title={copy.sections.humanTitle}
      >
        <PlanetHumanScale
          body={content.humanScale.body}
          dayDifferenceMinutes={model.dayDifferenceMinutes}
          gravityDefinition={model.gravityDefinition}
          gravityEarthRatio={model.gravityEarthRatio}
          gravityMS2={model.gravityMS2}
          planetName={model.name}
          sunlightTravelMinutes={model.sunlightTravelMinutes}
          title={content.humanScale.title}
        />
      </ContentSection>
    ) : null,
    signals: (
      <ContentSection
        eyebrow={copy.sections.signalsEyebrow}
        key="signals"
        lede={model.atmosphereSummary}
        title={copy.sections.signalsTitle}
      >
        <div className={styles.factGrid}>
          {content.signals.map((signal) => (
            <FactCard
              accentColor={model.accentColor}
              body={signal.body}
              eyebrow={signal.eyebrow}
              key={signal.title}
              title={signal.title}
            />
          ))}
        </div>
        <dl className={styles.referenceLedger}>
          <div>
            <dt>Axial tilt</dt>
            <dd>{formatOneDecimal(model.axialTiltDeg)}°</dd>
          </div>
          <div>
            <dt>Recognized moons</dt>
            <dd>
              {model.moonCount}
              {model.moonCountAsOf ? ` · ${model.moonCountAsOf}` : ""}
            </dd>
          </div>
          <div>
            <dt>Rings</dt>
            <dd>{model.ringsDescription}</dd>
          </div>
          <div>
            <dt>Atmosphere</dt>
            <dd>{model.atmosphereComponents.join(" · ")}</dd>
          </div>
        </dl>
      </ContentSection>
    ),
    missions: (
      <ContentSection
        eyebrow={copy.sections.missionsEyebrow}
        key="missions"
        lede={copy.sections.missionsLede}
        title={copy.sections.missionsTitle}
      >
        <PlanetMissionList missions={content.missions} />
      </ContentSection>
    ),
    methodology: (
      <ContentSection
        eyebrow={copy.sections.methodologyEyebrow}
        id="sources"
        key="methodology"
        lede={copy.sections.methodologyLede}
        title={copy.sections.methodologyTitle}
      >
        <div className={styles.methodologyStack}>
          <MethodologyNote
            body={content.methodology.body}
            label={copy.methodologyLabel}
            title={content.methodology.title}
          />
          <SourceAttribution sources={model.sources} />
        </div>
      </ContentSection>
    ),
  };

  return (
    <article
      className={styles.page}
      data-planet={model.id}
      style={{ "--planet-accent": model.accentColor } as CSSProperties}
    >
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>{content.heroKicker}</p>
          <h1>{model.name}</h1>
          <p className={styles.heroTagline}>{model.tagline}</p>
          <p className={styles.heroDescription}>{model.description}</p>
          <nav
            aria-label={copy.heroNavigation(model.name)}
            className={styles.heroLinks}
          >
            <Link href="/explore">{copy.backToExplore}</Link>
            <a href="#human-scale">{copy.jumpToHumanScale}</a>
            <a href="#sources">{copy.jumpToSources}</a>
          </nav>
        </div>

        <div className={styles.heroVisualWrap}>
          <PlanetEditorialVisual
            id={model.id}
            label={content.visualLabel}
            order={model.orderFromSun}
          />
          <p className={styles.heroCaption}>{content.heroCaption}</p>
          <dl className={styles.heroMeta}>
            <div>
              <dt>{copy.heroMeta.order}</dt>
              <dd>{model.orderFromSun}</dd>
            </div>
            <div>
              <dt>{copy.heroMeta.kind}</dt>
              <dd>{copy.kindLabels[model.kind]}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className={styles.content}>
        {content.layout.map((block) => blocks[block])}
        {supplement}
        <PlanetAdjacentNav model={model} />
      </div>
    </article>
  );
}
