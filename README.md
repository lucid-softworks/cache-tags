# `@lucid-softworks/cache-tags`

Process-local tag indexing and group invalidation for any `CacheStore`.

```ts
const tagged = new TaggedCacheStore(store);
await tagged.set(
  key,
  createCacheRecord(value, {
    ttl: 60_000,
    tags: ["products", `product:${value.id}`],
  }),
);
await tagged.invalidateTag("products");
```

The tag index follows successful writes and is cleaned during key or tag
invalidation.
