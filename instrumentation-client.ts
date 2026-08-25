/**
 * Workaround for a Next.js + Turbopack + React 19 dev-only bug:
 * `performance.measure()` throws when a Server Component render is aborted
 * (e.g. navigation / HMR) because childrenEndTime stays at -Infinity.
 * See: https://github.com/vercel/next.js/issues/86060
 */
if (process.env.NODE_ENV === "development" && typeof performance !== "undefined") {
  const originalMeasure = performance.measure.bind(performance);

  performance.measure = ((...args: Parameters<typeof performance.measure>) => {
    try {
      return originalMeasure(...args);
    } catch (error) {
      if (
        error instanceof Error &&
        /negative time stamp|end cannot be negative/i.test(error.message)
      ) {
        return undefined as unknown as PerformanceMeasure;
      }
      throw error;
    }
  }) as typeof performance.measure;
}
