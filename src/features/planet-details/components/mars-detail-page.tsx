import type { CSSProperties } from "react";
import Link from "next/link";

import { marsDetailContent } from "@/content/planet-details/mars";
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

import { MarsHumanScale } from "./mars-human-scale";
import { PlanetMissionList } from "./planet-mission-list";
import styles from "./mars-detail.module.css";

export function MarsDetailPage({ model }: { model: PlanetDetailModel }) {
  const copy = uiStrings.pages.planet.mars;
  const content = marsDetailContent;

  return (
    <article
      className={styles.page}
      style={{ "--planet-accent": model.accentColor } as CSSProperties}
    >
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>{content.heroKicker}</p>
          <h1>{model.name}</h1>
          <p className={styles.heroTagline}>{model.tagline}</p>
          <p className={styles.heroDescription}>{model.description}</p>
          <nav aria-label={copy.heroNavigation} className={styles.heroLinks}>
            <Link href="/explore">{copy.backToExplore}</Link>
            <a href="#human-scale">{copy.jumpToHumanScale}</a>
            <a href="#sources">{copy.jumpToSources}</a>
          </nav>
        </div>

        <div
          aria-label={copy.editorialVisualLabel}
          className={styles.visual}
          role="img"
        >
          <span aria-hidden="true" className={styles.orbitArc} />
          <span aria-hidden="true" className={styles.orbitArcSecondary} />
          <div aria-hidden="true" className={styles.marsOrb} />
          <span className={styles.heroIndex}>04 / 08</span>
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
        <MetricGrid>
          <MetricCard
            context={copy.metrics.radiusContext}
            label={copy.metrics.radius}
            unit="km"
            value={formatOneDecimal(model.meanRadiusKm)}
          />
          <MetricCard
            context={copy.metrics.dayContext}
            label={copy.metrics.solarDay}
            value={
              model.solarDayHours
                ? formatHoursAsClockDuration(model.solarDayHours)
                : "—"
            }
          />
          <MetricCard
            context={copy.metrics.temperatureContext}
            label={copy.metrics.temperature}
            unit="°C"
            value={formatZeroDecimals(model.averageTemperatureC)}
          />
        </MetricGrid>

        <ContentSection
          eyebrow={copy.sections.portraitEyebrow}
          id="portrait"
          lede={copy.sections.portraitLede}
          title={copy.sections.portraitTitle}
        >
          <div className={styles.narrativeStack}>
            {content.sections.map((section, index) => (
              <article className={styles.narrativeBlock} key={section.id}>
                <span className={styles.narrativeNumber}>
                  {(index + 1).toString().padStart(2, "0")}
                </span>
                <div className={styles.narrativeText}>
                  <h3>{section.title}</h3>
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ContentSection>

        <ContentSection
          eyebrow={copy.sections.humanEyebrow}
          id="human-scale"
          lede={copy.sections.humanLede}
          title={copy.sections.humanTitle}
        >
          <MarsHumanScale
            dayDifferenceMinutes={model.dayDifferenceMinutes ?? 0}
            gravityEarthRatio={model.gravityEarthRatio}
            gravityMS2={model.gravityMS2}
            sunlightTravelMinutes={model.sunlightTravelMinutes}
          />
        </ContentSection>

        <ContentSection
          eyebrow={copy.sections.environmentEyebrow}
          lede={model.atmosphereSummary}
          title={copy.sections.environmentTitle}
        >
          <div className={styles.factGrid}>
            <FactCard
              accentColor={model.accentColor}
              body={copy.facts.gravityBody(
                formatOneDecimal(model.gravityEarthRatio * 100),
              )}
              eyebrow={copy.facts.gravityEyebrow}
              title={copy.facts.gravityTitle}
            />
            <FactCard
              accentColor={model.accentColor}
              body={copy.facts.yearBody(
                formatOneDecimal(model.orbitalPeriodEarthDays),
                formatOneDecimal(model.localDaysPerOrbit ?? 0),
              )}
              eyebrow={copy.facts.yearEyebrow}
              title={copy.facts.yearTitle}
            />
            <FactCard
              accentColor={model.accentColor}
              body={copy.facts.moonsBody(
                model.moonCount,
                model.moonCountAsOf ?? copy.facts.undated,
              )}
              eyebrow={copy.facts.moonsEyebrow}
              title={copy.facts.moonsTitle}
            />
          </div>
        </ContentSection>

        <ContentSection
          eyebrow={uiStrings.pages.planet.detail.sections.missionsEyebrow}
          lede={uiStrings.pages.planet.detail.sections.missionsLede}
          title={uiStrings.pages.planet.detail.sections.missionsTitle}
        >
          <PlanetMissionList missions={content.missions} />
        </ContentSection>

        <ContentSection
          eyebrow={copy.sections.methodologyEyebrow}
          id="sources"
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

        <nav aria-label={copy.adjacentPlanets} className={styles.planetNav}>
          {model.previous ? (
            <Link href={`/planet/${model.previous.id}`}>
              <span>{copy.previousPlanet}</span>
              <strong>{model.previous.name}</strong>
            </Link>
          ) : (
            <span />
          )}
          {model.next ? (
            <Link href={`/planet/${model.next.id}`}>
              <span>{copy.nextPlanet}</span>
              <strong>{model.next.name}</strong>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}
