import { useCallback, useMemo } from 'react';

class LruImageCache {
  private readonly limit: number;
  private readonly entries = new Map<string, HTMLImageElement>();

  constructor(limit: number) {
    this.limit = limit;
  }

  preload(src: string): void {
    const existing = this.entries.get(src);
    if (existing) {
      this.entries.delete(src);
      this.entries.set(src, existing);
      return;
    }

    const image = new Image();
    image.decoding = 'async';
    image.loading = 'lazy';
    image.src = src;
    this.entries.set(src, image);
    this.evictIfNeeded();
  }

  markUsed(src: string): void {
    const existing = this.entries.get(src);
    if (!existing) {
      return;
    }

    this.entries.delete(src);
    this.entries.set(src, existing);
  }

  clear(): void {
    for (const image of this.entries.values()) {
      image.removeAttribute('src');
    }

    this.entries.clear();
  }

  private evictIfNeeded(): void {
    while (this.entries.size > this.limit) {
      const oldest = this.entries.keys().next().value as string | undefined;
      if (!oldest) {
        return;
      }

      const image = this.entries.get(oldest);
      image?.removeAttribute('src');
      this.entries.delete(oldest);
    }
  }
}

export interface ImageCacheApi {
  preload: (src: string) => void;
  markUsed: (src: string) => void;
  clear: () => void;
}

export function useImageCache(limit = 24): ImageCacheApi {
  const cache = useMemo(() => new LruImageCache(limit), [limit]);
  const preload = useCallback((src: string) => cache.preload(src), [cache]);
  const markUsed = useCallback((src: string) => cache.markUsed(src), [cache]);
  const clear = useCallback(() => cache.clear(), [cache]);

  return useMemo(() => ({ preload, markUsed, clear }), [clear, markUsed, preload]);
}
