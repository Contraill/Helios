export function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number.`);
  }
}

export function assertPositiveNumber(value: number, name: string): void {
  assertFiniteNumber(value, name);
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than zero.`);
  }
}

export function assertNonNegativeNumber(value: number, name: string): void {
  assertFiniteNumber(value, name);
  if (value < 0) {
    throw new RangeError(`${name} cannot be negative.`);
  }
}
