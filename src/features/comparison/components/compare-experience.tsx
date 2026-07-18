"use client";

import { useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { ComparePlanet } from "@/features/comparison/types/comparison";
import type { PlanetId } from "@/lib/data/schemas/planet";

import styles from "./compare.module.css";

const EARTH_GRAVITY = 9.80665;
const EARTH_YEAR_DAYS = 365.256;

export function CompareExperience({
  planets,
}: {
  readonly planets: readonly ComparePlanet[];
}) {
  const pathname = usePathname();
  const search = useSearchParams();
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
  const same = first.id === second.id;

  function select(side: "a" | "b", id: PlanetId) {
    const params = new URLSearchParams(search.toString());
    params.set(side, id);
    window.history.pushState(null, "", `${pathname}?${params.toString()}`);
  }

  const maxRadius = Math.max(first.radiusKm, second.radiusKm);
  const minVisual = 52;
  const size = (radius: number) =>
    Math.max(minVisual, (radius / maxRadius) * 220);
  const weight = Number(earthWeight);
  const age = Number(earthAge);

  return (
    <div className={styles.experience}>
      <section className={styles.selectors} aria-label="Choose two planets">
        <label>
          First world
          <select
            aria-label="First planet"
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
        <span aria-hidden="true">versus</span>
        <label>
          Second world
          <select
            aria-label="Second planet"
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
      </section>

      {same ? (
        <p className={styles.sameWorld} role="status">
          You selected the same world twice. Helios keeps the reference visible,
          but difference-only personal comparisons are hidden.
        </p>
      ) : null}

      <section className={styles.scaleStage} aria-labelledby="size-heading">
        <header>
          <p>Relative diameter</p>
          <h2 id="size-heading">Two circles, one radius scale</h2>
          <small>
            A minimum visible size keeps small worlds selectable. Numerical
            values remain the source of truth.
          </small>
        </header>
        <div className={styles.worlds}>
          {[first, second].map((planet) => (
            <figure key={`${planet.id}-${planet === first ? "a" : "b"}`}>
              <div
                className={styles.worldOrb}
                style={{
                  width: size(planet.radiusKm),
                  height: size(planet.radiusKm),
                  background: `radial-gradient(circle at 34% 28%, #fff8 0 4%, ${planet.accentColor} 32%, #08090d 82%)`,
                }}
              />
              <figcaption>
                <strong>{planet.name}</strong>
                <span>{formatNumber(planet.diameterKm)} km diameter</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className={styles.personal} aria-labelledby="personal-heading">
        <header>
          <p>Human-scale differences</p>
          <h2 id="personal-heading">Change the reference, not the science</h2>
        </header>
        <div className={styles.inputs}>
          <label>
            Earth scale reading
            <input
              inputMode="decimal"
              aria-label="Earth weight"
              value={earthWeight}
              onChange={(event) => setEarthWeight(event.target.value)}
            />
          </label>
          <label>
            Earth age
            <input
              inputMode="decimal"
              aria-label="Earth age"
              value={earthAge}
              onChange={(event) => setEarthAge(event.target.value)}
            />
          </label>
        </div>
        {!same &&
        Number.isFinite(weight) &&
        weight >= 0 &&
        Number.isFinite(age) &&
        age >= 0 ? (
          <div className={styles.personalGrid}>
            <PersonalPlanet planet={first} weight={weight} age={age} />
            <PersonalPlanet planet={second} weight={weight} age={age} />
          </div>
        ) : null}
      </section>

      <section className={styles.tableSection} aria-labelledby="table-heading">
        <header>
          <p>Accessible reference table</p>
          <h2 id="table-heading">Definitions stay beside the values</h2>
        </header>
        <div className={styles.tableWrap}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>Measure</th>
                <th>{first.name}</th>
                <th>{second.name}</th>
              </tr>
            </thead>
            <tbody>
              <Row
                label="Mean radius"
                a={`${formatNumber(first.radiusKm)} km`}
                b={`${formatNumber(second.radiusKm)} km`}
              />
              <Row
                label="Mass"
                a={first.massKg.toExponential(3) + " kg"}
                b={second.massKg.toExponential(3) + " kg"}
              />
              <Row
                label="Density"
                a={`${formatNumber(first.densityKgM3)} kg/m³`}
                b={`${formatNumber(second.densityKgM3)} kg/m³`}
              />
              <Row
                label="Gravity"
                a={`${first.gravityMS2.toFixed(2)} m/s² · ${gravityDefinition(first)}`}
                b={`${second.gravityMS2.toFixed(2)} m/s² · ${gravityDefinition(second)}`}
              />
              <Row
                label="Average Sun distance"
                a={`${first.semiMajorAxisAu.toFixed(3)} AU`}
                b={`${second.semiMajorAxisAu.toFixed(3)} AU`}
              />
              <Row
                label="Orbital period"
                a={`${formatNumber(first.orbitalPeriodDays)} Earth days`}
                b={`${formatNumber(second.orbitalPeriodDays)} Earth days`}
              />
              <Row
                label="Sidereal rotation"
                a={`${formatNumber(first.siderealRotationHours)} h`}
                b={`${formatNumber(second.siderealRotationHours)} h`}
              />
              <Row
                label="Solar day"
                a={
                  first.solarDayHours
                    ? `${formatNumber(first.solarDayHours)} h`
                    : "No single surface-day value"
                }
                b={
                  second.solarDayHours
                    ? `${formatNumber(second.solarDayHours)} h`
                    : "No single surface-day value"
                }
              />
              <Row
                label="Axial tilt"
                a={`${first.axialTiltDeg.toFixed(1)}°`}
                b={`${second.axialTiltDeg.toFixed(1)}°`}
              />
              <Row
                label="Temperature reference"
                a={`${first.temperatureC.toFixed(0)} °C · ${first.temperatureDefinition}`}
                b={`${second.temperatureC.toFixed(0)} °C · ${second.temperatureDefinition}`}
              />
              <Row
                label="Atmosphere"
                a={first.atmosphere}
                b={second.atmosphere}
              />
              <Row
                label="Recognized moons"
                a={`${first.moonCount}${first.moonCountAsOf ? ` · ${first.moonCountAsOf}` : ""}`}
                b={`${second.moonCount}${second.moonCountAsOf ? ` · ${second.moonCountAsOf}` : ""}`}
              />
              <Row label="Rings" a={first.rings} b={second.rings} />
              <Row
                label="Escape velocity"
                a={`${first.escapeVelocityKmS.toFixed(1)} km/s`}
                b={`${second.escapeVelocityKmS.toFixed(1)} km/s`}
              />
              <Row
                label="Sunlight travel"
                a={`${first.sunlightMinutes.toFixed(1)} min`}
                b={`${second.sunlightMinutes.toFixed(1)} min`}
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
}: {
  readonly planet: ComparePlanet;
  readonly weight: number;
  readonly age: number;
}) {
  const scaleEquivalent = weight * (planet.gravityMS2 / EARTH_GRAVITY);
  const localYears = (age * EARTH_YEAR_DAYS) / planet.orbitalPeriodDays;
  const dayRatio = planet.solarDayHours
    ? (24 / planet.solarDayHours) * 100
    : null;
  return (
    <article>
      <h3>{planet.name}</h3>
      <dl>
        <div>
          <dt>{weight.toFixed(0)} kg on Earth</dt>
          <dd>{scaleEquivalent.toFixed(1)} kg-equivalent</dd>
        </div>
        <div>
          <dt>{age.toFixed(0)} Earth years</dt>
          <dd>{localYears.toFixed(2)} local years</dd>
        </div>
        <div>
          <dt>One Earth day</dt>
          <dd>
            {dayRatio
              ? `${dayRatio.toFixed(2)}% of this world's solar day`
              : "No single surface solar-day comparison"}
          </dd>
        </div>
      </dl>
      {planet.gravityDefinition === "one-bar-reference-level" ? (
        <p>
          Gravity is defined at the one-bar atmospheric reference level. There
          is no solid surface to stand on.
        </p>
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
function gravityDefinition(planet: ComparePlanet) {
  return planet.gravityDefinition === "one-bar-reference-level"
    ? "one-bar reference"
    : "surface-equatorial reference";
}
function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 1 }).format(
    value,
  );
}
