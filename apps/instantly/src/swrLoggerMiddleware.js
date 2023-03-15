export function swrLoggerMiddleware(useSWRNext) {
  return (key, fetcher, config) => {
    // Add logger to the original fetcher.
    const extendedFetcher = (...args) => {
      const value = typeof key === "function" ? key() : key;
      console.info("SWR:", value.key, value;
      return fetcher(...args);
    };

    // Execute the hook with the new fetcher.
    return useSWRNext(key, extendedFetcher, config);
  };
}
