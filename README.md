# `@lucid-softworks/cache-tags`

Process-local tag indexing and group invalidation for any `CacheStore`.

```ts
import { createCacheRecord } from "@lucid-softworks/cache-core";
import { MemoryCacheStore } from "@lucid-softworks/cache-store-memory";
import { TaggedCacheStore } from "@lucid-softworks/cache-tags";

const store = new MemoryCacheStore<{ readonly id: string }>();
const tagged = new TaggedCacheStore(store);
const key = "product-42";
const value = { id: "42" };
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
