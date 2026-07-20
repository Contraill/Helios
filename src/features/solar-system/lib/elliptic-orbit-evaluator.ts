import {
  applyReferenceBasis,
  eclipticToThreeYUp,
  type MutableVector3,
  type ReferenceBasis,
  type Vector3Tuple,
} from "./reference-frame-math";

export interface EllipticOrbitElements {
  readonly semiMajorAxis: number;
  readonly eccentricity: number;
  readonly inclinationDeg: number;
  readonly longitudeAscendingNodeDeg: number;
  readonly argumentOfPeriapsisDeg: number;
  readonly meanAnomalyAtEpochDeg: number;
  readonly epochJulianDateTdb: number;
  readonly orbitalPeriodDays: number;
}

export interface KeplerSolution {
  readonly eccentricAnomalyRadians: number;
  readonly converged: boolean;
  readonly iterations: number;
  readonly method: "newton" | "bisection";
}

export interface EvaluatedOrbitPosition {
  readonly position: MutableVector3;
  readonly solver: KeplerSolution;
}

const TWO_PI = Math.PI * 2;
const DEG_TO_RAD = Math.PI / 180;
const UNIX_EPOCH_JULIAN_DATE = 2_440_587.5;
const TDB_MINUS_UTC_APPROX_SECONDS = 69.184;

export function normalizeRadiansSigned(value: number): number {
  const normalized =
    ((((value + Math.PI) % TWO_PI) + TWO_PI) % TWO_PI) - Math.PI;
  return normalized === -Math.PI ? Math.PI : normalized;
}

/**
 * Converts a JavaScript UTC timestamp to an approximate JDTDB. The fixed
 * TT-UTC offset is sufficient for representative previews; Horizons windows
 * retain their source-provided TDB epochs and never use this as a precision
 * ephemeris conversion.
 */
export function utcMsToApproxJulianDateTdb(timestampMs: number): number {
  return (
    UNIX_EPOCH_JULIAN_DATE +
    timestampMs / 86_400_000 +
    TDB_MINUS_UTC_APPROX_SECONDS / 86_400
  );
}

export function solveEllipticKepler(
  meanAnomalyRadians: number,
  eccentricity: number,
  tolerance = 1e-12,
  maxIterations = 24,
): KeplerSolution {
  if (
    !Number.isFinite(meanAnomalyRadians) ||
    !Number.isFinite(eccentricity) ||
    eccentricity < 0 ||
    eccentricity >= 1
  ) {
    throw new RangeError("Elliptic Kepler solver requires 0 <= e < 1.");
  }
  const mean = normalizeRadiansSigned(meanAnomalyRadians);
  let estimate =
    eccentricity < 0.8
      ? mean + eccentricity * Math.sin(mean)
      : Math.sign(mean || 1) * Math.PI;
  for (let iteration = 1; iteration <= maxIterations; iteration += 1) {
    const residual = estimate - eccentricity * Math.sin(estimate) - mean;
    const derivative = 1 - eccentricity * Math.cos(estimate);
    if (Math.abs(derivative) < 1e-14) break;
    const correction = residual / derivative;
    estimate -= correction;
    if (Math.abs(correction) <= tolerance && Number.isFinite(estimate)) {
      return {
        eccentricAnomalyRadians: estimate,
        converged: true,
        iterations: iteration,
        method: "newton",
      };
    }
  }

  let low = -Math.PI;
  let high = Math.PI;
  let midpoint = mean;
  for (let iteration = 1; iteration <= 80; iteration += 1) {
    midpoint = (low + high) / 2;
    const residual = midpoint - eccentricity * Math.sin(midpoint) - mean;
    if (Math.abs(residual) <= tolerance) {
      return {
        eccentricAnomalyRadians: midpoint,
        converged: true,
        iterations: iteration,
        method: "bisection",
      };
    }
    if (residual > 0) high = midpoint;
    else low = midpoint;
  }
  return {
    eccentricAnomalyRadians: midpoint,
    converged: false,
    iterations: 80,
    method: "bisection",
  };
}

function rotatePerifocal(
  x: number,
  y: number,
  elements: EllipticOrbitElements,
  target: MutableVector3,
): MutableVector3 {
  const node = elements.longitudeAscendingNodeDeg * DEG_TO_RAD;
  const inclination = elements.inclinationDeg * DEG_TO_RAD;
  const periapsis = elements.argumentOfPeriapsisDeg * DEG_TO_RAD;
  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosInclination = Math.cos(inclination);
  const sinInclination = Math.sin(inclination);
  const cosPeriapsis = Math.cos(periapsis);
  const sinPeriapsis = Math.sin(periapsis);

  const xPeriapsis = x * cosPeriapsis - y * sinPeriapsis;
  const yPeriapsis = x * sinPeriapsis + y * cosPeriapsis;
  target[0] = cosNode * xPeriapsis - sinNode * cosInclination * yPeriapsis;
  target[1] = sinNode * xPeriapsis + cosNode * cosInclination * yPeriapsis;
  target[2] = sinInclination * yPeriapsis;
  return target;
}

export class EllipticOrbitEvaluator {
  readonly elements: EllipticOrbitElements;
  readonly referenceBasis: ReferenceBasis;
  private readonly sourcePosition: MutableVector3 = [0, 0, 0];
  private readonly eclipticPosition: MutableVector3 = [0, 0, 0];

  constructor(elements: EllipticOrbitElements, referenceBasis: ReferenceBasis) {
    this.elements = elements;
    this.referenceBasis = referenceBasis;
  }

  meanAnomalyAtJulianDate(julianDateTdb: number): number {
    const elapsedDays = julianDateTdb - this.elements.epochJulianDateTdb;
    return normalizeRadiansSigned(
      this.elements.meanAnomalyAtEpochDeg * DEG_TO_RAD +
        (elapsedDays / this.elements.orbitalPeriodDays) * TWO_PI,
    );
  }

  positionAtJulianDate(
    julianDateTdb: number,
    target: MutableVector3 = [0, 0, 0],
  ): MutableVector3 {
    return this.positionAtMeanAnomaly(
      this.meanAnomalyAtJulianDate(julianDateTdb),
      target,
    );
  }

  positionAtJulianDateWithMetadata(
    julianDateTdb: number,
    target: MutableVector3 = [0, 0, 0],
  ): EvaluatedOrbitPosition {
    return this.positionAtMeanAnomalyWithMetadata(
      this.meanAnomalyAtJulianDate(julianDateTdb),
      target,
    );
  }

  positionAtUtcMs(
    timestampMs: number,
    target: MutableVector3 = [0, 0, 0],
  ): MutableVector3 {
    return this.positionAtJulianDate(
      utcMsToApproxJulianDateTdb(timestampMs),
      target,
    );
  }

  positionAtUtcMsWithMetadata(
    timestampMs: number,
    target: MutableVector3 = [0, 0, 0],
  ): EvaluatedOrbitPosition {
    return this.positionAtJulianDateWithMetadata(
      utcMsToApproxJulianDateTdb(timestampMs),
      target,
    );
  }

  positionAtMeanAnomaly(
    meanAnomalyRadians: number,
    target: MutableVector3 = [0, 0, 0],
  ): MutableVector3 {
    return this.positionAtMeanAnomalyWithMetadata(meanAnomalyRadians, target)
      .position;
  }

  positionAtMeanAnomalyWithMetadata(
    meanAnomalyRadians: number,
    target: MutableVector3 = [0, 0, 0],
  ): EvaluatedOrbitPosition {
    const solver = solveEllipticKepler(
      meanAnomalyRadians,
      this.elements.eccentricity,
    );
    const eccentricAnomaly = solver.eccentricAnomalyRadians;
    const x =
      this.elements.semiMajorAxis *
      (Math.cos(eccentricAnomaly) - this.elements.eccentricity);
    const y =
      this.elements.semiMajorAxis *
      Math.sqrt(1 - this.elements.eccentricity ** 2) *
      Math.sin(eccentricAnomaly);
    rotatePerifocal(x, y, this.elements, this.sourcePosition);
    applyReferenceBasis(
      this.referenceBasis,
      this.sourcePosition,
      this.eclipticPosition,
    );
    eclipticToThreeYUp(this.eclipticPosition, target);
    return { position: target, solver };
  }

  samplePath(
    segments: number,
    scalePosition: (
      source: Vector3Tuple,
      target: MutableVector3,
    ) => MutableVector3 = (source, target) => {
      target[0] = source[0];
      target[1] = source[1];
      target[2] = source[2];
      return target;
    },
  ): readonly (readonly [number, number, number])[] {
    const safeSegments = Math.max(24, Math.round(segments));
    const points: [number, number, number][] = [];
    const raw: MutableVector3 = [0, 0, 0];
    const scaled: MutableVector3 = [0, 0, 0];
    for (let index = 0; index <= safeSegments; index += 1) {
      this.positionAtMeanAnomaly((index / safeSegments) * TWO_PI, raw);
      scalePosition(raw, scaled);
      points.push([scaled[0], scaled[1], scaled[2]]);
    }
    return points;
  }
}
