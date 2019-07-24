export default (value: unknown): value is string =>
  value !== undefined && typeof value === 'string';
