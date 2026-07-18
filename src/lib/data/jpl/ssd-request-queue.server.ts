import "server-only";

let jplSsdQueue: Promise<void> = Promise.resolve();

/** Enforces the SSD/CNEOS fair-use rule: one active JPL SSD API request. */
export function serializeJplSsdRequest<T>(
  request: () => Promise<T>,
): Promise<T> {
  const result = jplSsdQueue.then(request, request);
  jplSsdQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}
