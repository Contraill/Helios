"use client";

import { useMemo, useState } from "react";

import { ComparisonRow } from "@/features/data-presentation/components";
import { calculateScaleWeightKg } from "@/lib/calculations/planet";
import {
  formatMinutesAsDuration,
  formatOneDecimal,
  formatTwoDecimals,
} from "@/lib/i18n/formatters";
import type { Locale } from "@/lib/i18n/locale";
import { planetPageCopy } from "@/lib/i18n/planet-page-copy";
import type { PlanetData } from "@/lib/data/schemas/planet";

import styles from "./planet-detail.module.css";

interface PlanetHumanScaleProps {
  readonly body: string;
  readonly dayDifferenceMinutes?: number;
  readonly gravityDefinition: PlanetData["physical"]["gravityMS2"]["definition"];
  readonly gravityEarthRatio: number;
  readonly gravityMS2: number;
  readonly locale?: Locale;
  readonly planetName: string;
  readonly sunlightTravelMinutes: number;
  readonly title: string;
}

function parseScaleReading(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000
    ? parsed
    : Number.NaN;
}

export function PlanetHumanScale({
  body,
  dayDifferenceMinutes,
  gravityDefinition,
  gravityEarthRatio,
  gravityMS2,
  locale = "en",
  planetName,
  sunlightTravelMinutes,
  title,
}: PlanetHumanScaleProps) {
  const copy = planetPageCopy[locale].detail.humanScale;
  const [earthReading, setEarthReading] = useState("");
  const parsedReading = useMemo(
    () => parseScaleReading(earthReading),
    [earthReading],
  );
  const invalid = Number.isNaN(parsedReading);
  const result =
    parsedReading !== null && !invalid
      ? calculateScaleWeightKg(parsedReading, gravityMS2)
      : null;
  const inputId = `earth-scale-reading-${planetName.toLowerCase()}`;
  const helpId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <div className={styles.humanScale}>
      <div className={styles.humanIntro}>
        <p className={styles.microLabel}>{copy.eyebrow}</p>
        <h3>{title}</h3>
        <p>{body}</p>
      </div>

      <div className={styles.calculator}>
        <label className={styles.microLabel} htmlFor={inputId}>
          {copy.inputLabel}
        </label>
        <div className={styles.inputRow}>
          <input
            aria-describedby={invalid ? errorId : helpId}
            aria-invalid={invalid}
            autoComplete="off"
            id={inputId}
            inputMode="decimal"
            max="1000"
            min="0"
            onChange={(event) => setEarthReading(event.target.value)}
            placeholder="70"
            type="text"
            value={earthReading}
          />
          <span>kg</span>
        </div>
        {invalid ? (
          <p className={styles.inputError} id={errorId} role="alert">
            {copy.inputError}
          </p>
        ) : (
          <p className={styles.inputHelp} id={helpId}>
            {copy.inputHelp}
          </p>
        )}

        <div className={styles.result}>
          <p className={styles.microLabel}>{copy.resultLabel(planetName)}</p>
          <p
            aria-atomic="true"
            aria-live="polite"
            className={styles.resultValue}
            data-testid="planet-weight-result"
          >
            {result === null ? "—" : formatOneDecimal(result, locale)}
            <small>kg</small>
          </p>
          <p>{copy.resultExplanation}</p>
        </div>

        <div className={styles.comparisonRows}>
          <ComparisonRow
            label={copy.gravityLabel}
            note={copy.gravityNotes[gravityDefinition]}
            value={`${formatOneDecimal(gravityEarthRatio * 100, locale)}%`}
          />
          {dayDifferenceMinutes !== undefined ? (
            <ComparisonRow
              label={copy.dayLabel}
              note={copy.dayNote}
              value={formatMinutesAsDuration(dayDifferenceMinutes, locale)}
            />
          ) : null}
          <ComparisonRow
            label={copy.lightLabel}
            note={copy.lightNote}
            value={`${formatTwoDecimals(sunlightTravelMinutes, locale)} min`}
          />
        </div>
      </div>
    </div>
  );
}
