import { createCacheRecord } from "@lucid-softworks/cache-core";
import { MemoryCacheStore } from "@lucid-softworks/cache-store-memory";
import { describe, expect, it } from "vitest";

import { CacheTagIndex, TaggedCacheStore } from "../src/index.js";

const record = (value: number, tags: string[]) =>
  createCacheRecord(value, { now: 0, tags, ttl: 10 });

describe("cache tags", () => {
  it("indexes, replaces, removes, and clears key tags", () => {
    const index = new CacheTagIndex();
    expect(index.deleteKey("missing")).toBe(false);
    index.index("a", ["one", "one", "two"]);
    index.index("b", ["one"]);
    expect(index.keys("one")).toEqual(["a", "b"]);
    index.index("a", ["three"]);
    expect(index.keys("one")).toEqual(["b"]);
    expect(index.keys("two")).toEqual([]);
    expect(index.keys("three")).toEqual(["a"]);
    expect(index.deleteKey("a")).toBe(true);
    index.index("untagged", []);
    index.clear();
    expect(index.keys("one")).toEqual([]);
  });

  it("wraps stores and invalidates complete tag groups", async () => {
    const backing = new MemoryCacheStore<number>({ now: () => 0 });
    const store = new TaggedCacheStore(backing);
    await store.set("a", record(1, ["group"]));
    await store.set("b", record(2, ["group"]));
    await store.set("c", record(3, ["other"]));
    await expect(store.get("a")).resolves.toMatchObject({ value: 1 });
    await expect(store.invalidateTag("missing")).resolves.toBe(0);
    await expect(store.invalidateTag("group")).resolves.toBe(2);
    await expect(store.get("a")).resolves.toBeUndefined();
    await expect(store.delete("c")).resolves.toBe(true);
    await expect(store.delete("c")).resolves.toBe(false);
    store.clearTags();
  });
});
