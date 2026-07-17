const TAU = Math.PI * 2;

export const SIMULATION_DAYS_PER_SECOND = 4;
export const SIMULATION_HOURS_PER_SECOND = 0.5;

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number.`);
  }
}

export function wrapAngle(angle: number): number {
  if (!Number.isFinite(angle)) {
    throw new RangeError("Angle must be finite.");
  }
  return ((angle % TAU) + TAU) % TAU;
}

export function orbitalAngularVelocity(
  periodEarthDays: number,
  simulationDaysPerSecond = SIMULATION_DAYS_PER_SECOND,
): number {
  assertPositiveFinite(periodEarthDays, "Orbital period");
  assertPositiveFinite(simulationDaysPerSecond, "Simulation speed");
  return (TAU * simulationDaysPerSecond) / periodEarthDays;
}

export function rotationAngularVelocity(
  siderealRotationHours: number,
  retrograde: boolean,
  simulationHoursPerSecond = SIMULATION_HOURS_PER_SECOND,
): number {
  assertPositiveFinite(siderealRotationHours, "Rotation period");
  assertPositiveFinite(simulationHoursPerSecond, "Rotation speed");
  const direction = retrograde ? -1 : 1;
  return (TAU * simulationHoursPerSecond * direction) / siderealRotationHours;
}

export function advanceAngle(
  angle: number,
  angularVelocity: number,
  deltaSeconds: number,
): number {
  if (![angle, angularVelocity, deltaSeconds].every(Number.isFinite)) {
    throw new RangeError("Motion inputs must be finite.");
  }
  if (deltaSeconds < 0) {
    throw new RangeError("Delta time cannot be negative.");
  }
  return wrapAngle(angle + angularVelocity * deltaSeconds);
}

export function orbitalPosition(
  angle: number,
  semiMajorAxis: number,
  semiMinorAxis: number,
): [number, number, number] {
  if (![angle, semiMajorAxis, semiMinorAxis].every(Number.isFinite)) {
    throw new RangeError("Orbit inputs must be finite.");
  }
  if (semiMajorAxis < 0 || semiMinorAxis < 0) {
    throw new RangeError("Orbit axes cannot be negative.");
  }
  return [Math.cos(angle) * semiMajorAxis, 0, Math.sin(angle) * semiMinorAxis];
}
