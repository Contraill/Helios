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

import styles from "./mars-detail.module.css";

interface MarsHumanScaleProps {
  dayDifferenceMinutes: number;
  gravityEarthRatio: number;
  gravityMS2: number;
  locale?: Locale;
  sunlightTravelMinutes: number;
}

function parseScaleReading(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1_000
    ? parsed
    : Number.NaN;
}

export function MarsHumanScale({
  dayDifferenceMinutes,
  gravityEarthRatio,
  gravityMS2,
  locale = "en",
  sunlightTravelMinutes,
}: MarsHumanScaleProps) {
  const copy = planetPageCopy[locale].mars.humanScale;
  const [earthReading, setEarthReading] = useState("");
  const parsedReading = useMemo(
    () => parseScaleReading(earthReading),
    [earthReading],
  );
  const invalid = Number.isNaN(parsedReading);
  const marsReading =
    parsedReading !== null && !invalid
      ? calculateScaleWeightKg(parsedReading, gravityMS2)
      : null;

  return (
    <div className={styles.humanScale}>
      <div className={styles.humanIntro}>
        <p className={styles.humanEyebrow}>{copy.eyebrow}</p>
        <h3>{copy.title}</h3>
        <p>{copy.body}</p>
      </div>

      <div className={styles.calculator}>
        <label className={styles.inputLabel} htmlFor="earth-scale-reading">
          {copy.inputLabel}
        </label>
        <div className={styles.inputRow}>
          <input
            aria-describedby={
              invalid ? "earth-scale-error" : "earth-scale-help"
            }
            aria-invalid={invalid}
            autoComplete="off"
            id="earth-scale-reading"
            inputMode="decimal"
            max="1000"
            min="0"
            onChange={(event) => setEarthReading(event.target.value)}
            placeholder="70"
            type="text"
            value={earthReading}
          />
          <span className={styles.inputUnit}>kg</span>
        </div>
        {invalid ? (
          <p className={styles.inputError} id="earth-scale-error" role="alert">
            {copy.inputError}
          </p>
        ) : (
          <p className={styles.inputHelp} id="earth-scale-help">
            {copy.inputHelp}
          </p>
        )}

        <div className={styles.result}>
          <p className={styles.resultLabel}>{copy.resultLabel}</p>
          <p
            aria-atomic="true"
            aria-live="polite"
            className={styles.resultValue}
          >
            {marsReading === null ? "—" : formatOneDecimal(marsReading, locale)}
            <small>kg</small>
          </p>
          <p className={styles.resultExplanation}>{copy.resultExplanation}</p>
        </div>

        <div className={styles.comparisonRows}>
          <ComparisonRow
            label={copy.gravityLabel}
            note={copy.gravityNote}
            value={`${formatOneDecimal(gravityEarthRatio * 100, locale)}%`}
          />
          <ComparisonRow
            label={copy.dayLabel}
            note={copy.dayNote}
            value={formatMinutesAsDuration(dayDifferenceMinutes, locale)}
          />
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
