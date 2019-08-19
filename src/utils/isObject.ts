export default (value: unknown): value is object =>
  value !== null && !Array.isArray(value) && typeof value === 'object';
