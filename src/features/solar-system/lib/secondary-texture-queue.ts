export const MAX_CONCURRENT_SECONDARY_TEXTURE_REQUESTS = 4;

export type SecondaryTextureRequest = (path: string) => Promise<void>;

/**
 * Re-prioritisable bounded queue. Active requests finish, while pending work can
 * be reordered without starting a second wave of duplicate network requests.
 */
export class SecondaryTextureQueue {
  private readonly active = new Set<string>();
  private readonly completed = new Set<string>();
  private disposed = false;
  private pending: string[] = [];

  constructor(
    private readonly request: SecondaryTextureRequest,
    private readonly concurrency = MAX_CONCURRENT_SECONDARY_TEXTURE_REQUESTS,
  ) {}

  update(paths: readonly string[]): void {
    if (this.disposed) return;
    const unique = new Set(paths);
    this.pending = [...unique].filter(
      (path) => !this.active.has(path) && !this.completed.has(path),
    );
    this.pump();
  }

  dispose(): void {
    this.disposed = true;
    this.pending = [];
  }

  activeCount(): number {
    return this.active.size;
  }

  private pump(): void {
    if (this.disposed) return;
    const limit = Math.max(1, this.concurrency);
    while (this.active.size < limit) {
      const path = this.pending.shift();
      if (!path) return;
      if (this.active.has(path) || this.completed.has(path)) continue;
      this.active.add(path);
      void this.request(path)
        .catch(() => undefined)
        .finally(() => {
          this.active.delete(path);
          this.completed.add(path);
          this.pump();
        });
    }
  }
}
