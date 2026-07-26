import { type CacheRecord, type CacheStore } from "@lucid-softworks/cache-core";

export class CacheTagIndex {
  readonly #keysByTag = new Map<string, Set<string>>();
  readonly #tagsByKey = new Map<string, Set<string>>();

  index(key: string, tags: readonly string[]): void {
    this.deleteKey(key);
    const normalized = new Set(tags);
    if (normalized.size === 0) return;
    this.#tagsByKey.set(key, normalized);
    for (const tag of normalized) {
      const keys = this.#keysByTag.get(tag) ?? new Set<string>();
      keys.add(key);
      this.#keysByTag.set(tag, keys);
    }
  }

  keys(tag: string): readonly string[] {
    return [...(this.#keysByTag.get(tag) ?? [])];
  }

  deleteKey(key: string): boolean {
    const tags = this.#tagsByKey.get(key);
    if (tags === undefined) return false;
    this.#tagsByKey.delete(key);
    for (const tag of tags) {
      const keys = this.#keysByTag.get(tag) as Set<string>;
      keys.delete(key);
      if (keys.size === 0) this.#keysByTag.delete(tag);
    }
    return true;
  }

  clear(): void {
    this.#keysByTag.clear();
    this.#tagsByKey.clear();
  }
}

export class TaggedCacheStore<T = unknown> implements CacheStore<T> {
  constructor(
    readonly store: CacheStore<T>,
    readonly index: CacheTagIndex = new CacheTagIndex(),
  ) {}

  get(key: string): Promise<CacheRecord<T> | undefined> {
    return Promise.resolve(this.store.get(key));
  }

  async set(key: string, record: CacheRecord<T>): Promise<void> {
    await this.store.set(key, record);
    this.index.index(key, record.tags);
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await this.store.delete(key);
    this.index.deleteKey(key);
    return deleted;
  }

  async invalidateTag(tag: string): Promise<number> {
    const keys = this.index.keys(tag);
    const deleted = await Promise.all(
      keys.map((key) => this.store.delete(key)),
    );
    for (const key of keys) this.index.deleteKey(key);
    return deleted.filter(Boolean).length;
  }

  clearTags(): void {
    this.index.clear();
  }
}
