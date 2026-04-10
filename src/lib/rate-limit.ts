type RateLimitOptions = {
  bucket: string;
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type StoreValue = {
  count: number;
  resetAt: number;
};

const store = globalThis.__elitkidsRateLimitStore ?? new Map<string, StoreValue>();

if (!globalThis.__elitkidsRateLimitStore) {
  globalThis.__elitkidsRateLimitStore = store;
}

declare global {
  var __elitkidsRateLimitStore: Map<string, StoreValue> | undefined;
}

function getStoreKey(bucket: string, key: string) {
  return `${bucket}:${key}`;
}

export function consumeRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const storeKey = getStoreKey(options.bucket, options.key);
  const current = store.get(storeKey);

  if (!current || current.resetAt <= now) {
    store.set(storeKey, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(options.limit - 1, 0),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
    };
  }

  current.count += 1;
  store.set(storeKey, current);

  return {
    allowed: true,
    remaining: Math.max(options.limit - current.count, 0),
    retryAfterSeconds: Math.max(Math.ceil((current.resetAt - now) / 1000), 1),
  };
}

export function buildRateLimitHeaders(result: RateLimitResult) {
  return {
    "x-ratelimit-remaining": String(result.remaining),
    "retry-after": String(result.retryAfterSeconds),
  };
}
