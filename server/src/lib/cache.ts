interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class SimpleCache {
  private store = new Map<string, CacheEntry<unknown>>()

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.data as T
  }

  set<T>(key: string, data: T, ttlMs: number): void {
    this.store.set(key, { data, expiresAt: Date.now() + ttlMs })
  }

  delete(key: string): void {
    this.store.delete(key)
  }
}

// Singleton cache instance — shared across all route handlers
export const cache = new SimpleCache()
