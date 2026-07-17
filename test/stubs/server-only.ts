/**
 * Vitest stub for the `server-only` package.
 *
 * In Next.js, importing `server-only` from client code fails the build —
 * that is the boundary we rely on. Vitest runs outside Next's react-server
 * condition, where the real package throws by design, so tests alias it to
 * this empty module (see vitest.config.ts). The production boundary is
 * unaffected.
 */
export {};
