export default (value: any): value is string =>
  value !== undefined && typeof value === 'string';
