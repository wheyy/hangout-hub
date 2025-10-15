interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export function setCache<T>(key: string, data: T, expiresIn: number = CACHE_DURATION): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresIn
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    console.error('Failed to set cache:', error)
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    if (!item) return null

    const entry: CacheEntry<T> = JSON.parse(item)

    if (!isCacheValid(entry)) {
      localStorage.removeItem(key)
      return null
    }

    return entry.data
  } catch (error) {
    console.error('Failed to get cache:', error)
    return null
  }
}

export function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  const now = Date.now()
  return (now - entry.timestamp) < entry.expiresIn
}

export function clearCache(key?: string): void {
  try {
    if (key) {
      localStorage.removeItem(key)
    } else {
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('search:') || key?.startsWith('place:')) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  } catch (error) {
    console.error('Failed to clear cache:', error)
  }
}
