"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ComparePlanet } from "@/features/comparison/types/comparison";
import { comparisonCopy } from "@/lib/i18n/comparison-copy";
import { localeTag } from "@/lib/i18n/locale";
import type { PlanetId } from "@/lib/data/schemas/planet";
import { useLocaleStore } from "@/stores/locale-store";

import styles from "./compare.module.css";

const EARTH_GRAVITY = 9.80665;
const EARTH_YEAR_DAYS = 365.256;
const MAX_PERSONAL_REFERENCE = 1_000_000;

export function CompareExperience({
  planets,
}: {
  readonly planets: readonly ComparePlanet[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const locale = useLocaleStore((state) => state.locale);
  const copy = comparisonCopy[locale];
  const numberLocale = localeTag(locale);
  const validIds = useMemo(
    () => new Set(planets.map((planet) => planet.id)),
    [planets],
  );
  const firstId = validIds.has(search.get("a") as PlanetId)
    ? (search.get("a") as PlanetId)
    : "earth";
  const secondId = validIds.has(search.get("b") as PlanetId)
    ? (search.get("b") as PlanetId)
    : "mars";
  const first = planets.find((planet) => planet.id === firstId) ?? planets[2];
  const second = planets.find((planet) => planet.id === secondId) ?? planets[3];
  const [earthWeight, setEarthWeight] = useState("70");
  const [earthAge, setEarthAge] = useState("23");
  const [shareStatus, setShareStatus] = useState("");
  const same = first.id === second.id;

  function updateComparison(firstPlanet: PlanetId, secondPlanet: PlanetId) {
    setShareStatus("");
    const params = new URLSearchParams(search.toString());
    params.set("a", firstPlanet);
    params.set("b", secondPlanet);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function select(side: "a" | "b", id: PlanetId) {
    updateComparison(
      side === "a" ? id : first.id,
      side === "b" ? id : second.id,
    );
  }

  async function copyShareLink() {
    try {
      const shareUrl = new URL(window.location.href);
      shareUrl.searchParams.set("a", first.id);
      shareUrl.searchParams.set("b", second.id);
      await navigator.clipboard.writeText(shareUrl.toString());
      setShareStatus(copy.controls.copied);
    } catch {
      setShareStatus(copy.controls.unavailable);
    }
  }

  const maxRadius = Math.max(first.radiusKm, second.radiusKm);
  const minVisual = 52;
  const size = (radius: number) =>
    Math.max(minVisual, (radius / maxRadius) * 220);
  const weight = Number(earthWeight);
  const age = Number(earthAge);
  const weightValid =
    earthWeight.trim() !== "" &&
    Number.isFinite(weight) &&
    weight >= 0 &&
    weight <= MAX_PERSONAL_REFERENCE;
  const ageValid =
    earthAge.trim() !== "" &&
    Number.isFinite(age) &&
    age >= 0 &&
    age <= MAX_PERSONAL_REFERENCE;
  const formatNumber = (value: number, digits = 1) =>
    new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: digits,
    }).format(value);

  return (
    <div className={styles.experience}>
      <section
        className={styles.comparisonControls}
        aria-label={copy.controls.label}
      >
        <div className={styles.selectors}>
          <label>
            {copy.controls.firstWorld}
            <select
              aria-label={copy.controls.firstPlanet}
              value={first.id}
              onChange={(event) => select("a", event.target.value as PlanetId)}
            >
              {planets.map((planet) => (
                <option value={planet.id} key={planet.id}>
                  {planet.name}
                </option>
              ))}
            </select>
          </label>
          <span aria-hidden="true">{copy.controls.versus}</span>
          <label>
            {copy.controls.secondWorld}
            <select
              aria-label={copy.controls.secondPlanet}
              value={second.id}
              onChange={(event) => select("b", event.target.value as PlanetId)}
            >
              {planets.map((planet) => (
                <option value={planet.id} key={planet.id}>
                  {planet.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={styles.controlActions}>
          <button
            type="button"
            onClick={() => updateComparison(second.id, first.id)}
          >
            {copy.controls.swap}
          </button>
          <button type="button" onClick={copyShareLink}>
            {copy.controls.copy}
          </button>
          <p aria-atomic="true" role="status">
            {shareStatus}
          </p>
        </div>
      </section>

      {same ? (
        <p className={styles.sameWorld} role="status">
          {copy.controls.same}
        </p>
      ) : null}

      <section className={styles.scaleStage} aria-labelledby="size-heading">
        <header>
          <p>{copy.scale.kicker}</p>
          <h2 id="size-heading">{copy.scale.title}</h2>
          <small>{copy.scale.note}</small>
        </header>
        <div className={styles.worlds}>
          {[
            { planet: first, side: "a" },
            { planet: second, side: "b" },
          ].map(({ planet, side }) => (
            <figure key={`${planet.id}-${side}`}>
              <div
                className={styles.worldOrb}
                style={{
                  width: size(planet.radiusKm),
                  height: size(planet.radiusKm),
                  backgroundColor: planet.accentColor,
                  backgroundImage: `radial-gradient(circle at 34% 28%, #fff8 0 4%, transparent 24%), linear-gradient(112deg, transparent 34%, #0002 58%, #020306dd), url("${planet.texturePath}")`,
                  backgroundPosition: "center, center, 48% center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "100% 100%, 100% 100%, auto 104%",
                }}
              />
              <figcaption>
                <strong>{planet.name}</strong>
                <span>
                  {copy.scale.diameter(formatNumber(planet.diameterKm))}
                </span>
                <Link href={`/body/${planet.id}`}>
                  {copy.scale.open(planet.name)}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.personal} aria-labelledby="personal-heading">
        <header>
          <p>{copy.personal.kicker}</p>
          <h2 id="personal-heading">{copy.personal.title}</h2>
        </header>
        <div className={styles.inputs}>
          <label>
            {copy.personal.weightLabel}
            <input
              type="number"
              min="0"
              max={MAX_PERSONAL_REFERENCE}
              step="any"
              inputMode="decimal"
              aria-label={copy.personal.weightAria}
              aria-describedby="weight-help"
              aria-invalid={!weightValid}
              value={earthWeight}
              onChange={(event) => setEarthWeight(event.target.value)}
            />
            <span id="weight-help" role={weightValid ? undefined : "alert"}>
              {weightValid
                ? copy.personal.weightHelp
                : copy.personal.weightError}
            </span>
          </label>
          <label>
            {copy.personal.ageLabel}
            <input
              type="number"
              min="0"
              max={MAX_PERSONAL_REFERENCE}
              step="any"
              inputMode="decimal"
              aria-label={copy.personal.ageAria}
              aria-describedby="age-help"
              aria-invalid={!ageValid}
              value={earthAge}
              onChange={(event) => setEarthAge(event.target.value)}
            />
            <span id="age-help" role={ageValid ? undefined : "alert"}>
              {ageValid ? copy.personal.ageHelp : copy.personal.ageError}
            </span>
          </label>
        </div>
        {!same && weightValid && ageValid ? (
          <div className={styles.personalGrid}>
            <PersonalPlanet
              planet={first}
              weight={weight}
              age={age}
              locale={locale}
            />
            <PersonalPlanet
              planet={second}
              weight={weight}
              age={age}
              locale={locale}
            />
          </div>
        ) : null}
      </section>

      <section className={styles.tableSection} aria-labelledby="table-heading">
        <header>
          <p>{copy.table.kicker}</p>
          <h2 id="table-heading">{copy.table.title}</h2>
        </header>
        <div className={styles.tableWrap}>
          <table className={styles.comparisonTable}>
            <caption>{copy.table.caption(first.name, second.name)}</caption>
            <thead>
              <tr>
                <th scope="col">{copy.table.measure}</th>
                <th scope="col">{first.name}</th>
                <th scope="col">{second.name}</th>
              </tr>
            </thead>
            <tbody>
              <Row
                label={copy.table.rows.radius}
                a={`${formatNumber(first.radiusKm)} km`}
                b={`${formatNumber(second.radiusKm)} km`}
              />
              <Row
                label={copy.table.rows.mass}
                a={first.massKg.toExponential(3) + " kg"}
                b={second.massKg.toExponential(3) + " kg"}
              />
              <Row
                label={copy.table.rows.density}
                a={`${formatNumber(first.densityKgM3)} kg/m³`}
                b={`${formatNumber(second.densityKgM3)} kg/m³`}
              />
              <Row
                label={copy.table.rows.gravity}
                a={`${first.gravityMS2.toFixed(2)} m/s² · ${gravityDefinition(first, locale)}`}
                b={`${second.gravityMS2.toFixed(2)} m/s² · ${gravityDefinition(second, locale)}`}
              />
              <Row
                label={copy.table.rows.distance}
                a={`${formatNumber(first.semiMajorAxisAu, 3)} AU`}
                b={`${formatNumber(second.semiMajorAxisAu, 3)} AU`}
              />
              <Row
                label={copy.table.rows.orbit}
                a={`${formatNumber(first.orbitalPeriodDays)} ${copy.table.earthDays}`}
                b={`${formatNumber(second.orbitalPeriodDays)} ${copy.table.earthDays}`}
              />
              <Row
                label={copy.table.rows.rotation}
                a={formatRotation(first, locale, formatNumber)}
                b={formatRotation(second, locale, formatNumber)}
              />
              <Row
                label={copy.table.rows.solarDay}
                a={
                  first.solarDayHours
                    ? `${formatNumber(first.solarDayHours)} h`
                    : copy.table.noSurfaceDay
                }
                b={
                  second.solarDayHours
                    ? `${formatNumber(second.solarDayHours)} h`
                    : copy.table.noSurfaceDay
                }
              />
              <Row
                label={copy.table.rows.tilt}
                a={`${formatNumber(first.axialTiltDeg, 1)}°`}
                b={`${formatNumber(second.axialTiltDeg, 1)}°`}
              />
              <Row
                label={copy.table.rows.temperature}
                a={`${formatNumber(first.temperatureC, 0)} °C · ${formatDefinition(first.temperatureDefinition, locale)}`}
                b={`${formatNumber(second.temperatureC, 0)} °C · ${formatDefinition(second.temperatureDefinition, locale)}`}
              />
              <Row
                label={copy.table.rows.atmosphere}
                a={first.atmosphere}
                b={second.atmosphere}
              />
              <Row
                label={copy.table.rows.moons}
                a={formatMoonCount(first, locale)}
                b={formatMoonCount(second, locale)}
              />
              <Row
                label={copy.table.rows.rings}
                a={first.rings}
                b={second.rings}
              />
              <Row
                label={copy.table.rows.escape}
                a={`${formatNumber(first.escapeVelocityKmS)} km/s`}
                b={`${formatNumber(second.escapeVelocityKmS)} km/s`}
              />
              <Row
                label={copy.table.rows.sunlight}
                a={`${formatNumber(first.sunlightMinutes)} min`}
                b={`${formatNumber(second.sunlightMinutes)} min`}
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function PersonalPlanet({
  planet,
  weight,
  age,
  locale,
}: {
  readonly planet: ComparePlanet;
  readonly weight: number;
  readonly age: number;
  readonly locale: "en" | "tr";
}) {
  const copy = comparisonCopy[locale].personal;
  const numberLocale = localeTag(locale);
  const scaleEquivalent = weight * (planet.gravityMS2 / EARTH_GRAVITY);
  const localYears = (age * EARTH_YEAR_DAYS) / planet.orbitalPeriodDays;
  const dayRatio = planet.solarDayHours
    ? (24 / planet.solarDayHours) * 100
    : null;
  const format = (value: number, digits: number) =>
    new Intl.NumberFormat(numberLocale, {
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(value);
  return (
    <article>
      <h3>{planet.name}</h3>
      <dl>
        <div>
          <dt>{copy.earthWeight(format(weight, 0))}</dt>
          <dd>{copy.equivalent(format(scaleEquivalent, 1))}</dd>
        </div>
        <div>
          <dt>{copy.earthAge(format(age, 0))}</dt>
          <dd>{copy.localYears(format(localYears, 2))}</dd>
        </div>
        <div>
          <dt>{copy.oneEarthDay}</dt>
          <dd>
            {dayRatio ? copy.dayFraction(format(dayRatio, 2)) : copy.noDay}
          </dd>
        </div>
      </dl>
      {planet.gravityDefinition === "one-bar-reference-level" ? (
        <p>{copy.giantNote}</p>
      ) : null}
    </article>
  );
}

function Row({
  label,
  a,
  b,
}: {
  readonly label: string;
  readonly a: string;
  readonly b: string;
}) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{a}</td>
      <td>{b}</td>
    </tr>
  );
}

function formatRotation(
  planet: ComparePlanet,
  locale: "en" | "tr",
  formatNumber: (value: number, digits?: number) => string,
) {
  const copy = comparisonCopy[locale].table;
  return `${formatNumber(planet.siderealRotationHours)} h · ${
    planet.retrograde ? copy.retrograde : copy.prograde
  }`;
}

function formatMoonCount(planet: ComparePlanet, locale: "en" | "tr") {
  if (!planet.moonCountAsOf) return String(planet.moonCount);
  const date = new Date(`${planet.moonCountAsOf}T00:00:00Z`);
  const asOf = Number.isNaN(date.getTime())
    ? planet.moonCountAsOf
    : new Intl.DateTimeFormat(localeTag(locale), {
        dateStyle: "medium",
        timeZone: "UTC",
      }).format(date);
  return `${planet.moonCount} · ${comparisonCopy[locale].table.asOf} ${asOf}`;
}

function formatDefinition(value: string, locale: "en" | "tr") {
  const definitions = comparisonCopy[locale].table.definitions;
  return (
    definitions[value as keyof typeof definitions] ?? value.replaceAll("-", " ")
  );
}

function gravityDefinition(planet: ComparePlanet, locale: "en" | "tr") {
  const definitions = comparisonCopy[locale].table.definitions;
  return planet.gravityDefinition === "one-bar-reference-level"
    ? definitions["one-bar-reference-level"]
    : definitions["surface-equatorial"];
}
