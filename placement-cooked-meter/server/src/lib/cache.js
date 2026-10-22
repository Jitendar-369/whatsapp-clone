// Tiny in-memory LRU. Keep the async get/set interface so MongoDB/Redis can replace it later.
export function createCache({ max = 500 } = {}) {
  const map = new Map();
  return {
    async get(key) {
      if (!map.has(key)) return undefined;
      const value = map.get(key);
      map.delete(key);
      map.set(key, value);
      return value;
    },
    async set(key, value) {
      map.delete(key);
      map.set(key, value);
      if (map.size > max) map.delete(map.keys().next().value);
    },
    get size() {
      return map.size;
    },
  };
}
