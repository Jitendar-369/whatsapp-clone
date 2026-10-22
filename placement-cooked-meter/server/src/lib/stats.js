// Counts real (non-cached) roasts. Same swap-for-a-DB shape as cache.js.
export function createStats() {
  let totalRoasts = 0;
  return {
    async increment() {
      totalRoasts += 1;
    },
    async get() {
      return { totalRoasts };
    },
  };
}
