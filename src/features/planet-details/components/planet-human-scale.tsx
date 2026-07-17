"use client";

import { useMemo, useState } from "react";

import { ComparisonRow } from "@/features/data-presentation/components";
import { calculateScaleWeightKg } from "@/lib/calculations/planet";
import {
  formatMinutesAsDuration,
  formatOneDecimal,
  formatTwoDecimals,
} from "@/lib/i18n/formatters";
import { uiStrings } from "@/lib/i18n/ui-strings";
import type { PlanetData } from "@/lib/data/schemas/planet";

import styles from "./planet-detail.module.css";

interface PlanetHumanScaleProps {
  readonly body: string;
  readonly dayDifferenceMinutes?: number;
  readonly gravityDefinition: PlanetData["physical"]["gravityMS2"]["definition"];
  readonly gravityEarthRatio: number;
  readonly gravityMS2: number;
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
  planetName,
  sunlightTravelMinutes,
  title,
}: PlanetHumanScaleProps) {
  const copy = uiStrings.pages.planet.detail.humanScale;
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
          <p className={styles.inputError} id={errorId}>
            {copy.inputError}
          </p>
        ) : (
          <p className={styles.inputHelp} id={helpId}>
            {copy.inputHelp}
          </p>
        )}

        <div aria-live="polite" className={styles.result}>
          <p className={styles.microLabel}>{copy.resultLabel(planetName)}</p>
          <p className={styles.resultValue}>
            {result === null ? "—" : formatOneDecimal(result)}
            <small>kg</small>
          </p>
          <p>{copy.resultExplanation}</p>
        </div>

        <div className={styles.comparisonRows}>
          <ComparisonRow
            label={copy.gravityLabel}
            note={copy.gravityNotes[gravityDefinition]}
            value={`${formatOneDecimal(gravityEarthRatio * 100)}%`}
          />
          {dayDifferenceMinutes !== undefined ? (
            <ComparisonRow
              label={copy.dayLabel}
              note={copy.dayNote}
              value={formatMinutesAsDuration(dayDifferenceMinutes)}
            />
          ) : null}
          <ComparisonRow
            label={copy.lightLabel}
            note={copy.lightNote}
            value={`${formatTwoDecimals(sunlightTravelMinutes)} min`}
          />
        </div>
      </div>
    </div>
  );
}
