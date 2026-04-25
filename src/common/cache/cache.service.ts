import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Lightweight in-memory cache for hot read endpoints.
 *
 * - Only intended for the single-instance NestJS process. If we ever scale
 *   horizontally we'll swap this for Redis behind the same interface.
 * - Read endpoints wrap their work with `getOrSet`. Write endpoints call
 *   `invalidatePrefix('properties:')` (etc.) to immediately purge stale
 *   entries — no 1-2 minute staleness window after a property edit.
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /** Clear every entry whose key starts with `prefix`. */
  invalidatePrefix(prefix: string): number {
    let cleared = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        cleared++;
      }
    }
    if (cleared > 0) {
      this.logger.debug(`Invalidated ${cleared} cache entries with prefix "${prefix}"`);
    }
    return cleared;
  }

  clear(): void {
    this.store.clear();
  }

  /**
   * Convenience wrapper. If `key` is in cache and fresh, return it; otherwise
   * call `loader` and cache the result for `ttlMs`.
   */
  async getOrSet<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const value = await loader();
    this.set(key, value, ttlMs);
    return value;
  }
}
