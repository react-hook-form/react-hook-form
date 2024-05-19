/**
 * Promises that resolves after given amount of time.
 * in milliseconds.
 */
export default (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
