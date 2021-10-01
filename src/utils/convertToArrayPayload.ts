export default <T extends unknown>(value: T) =>
  Array.isArray(value) ? value : [value];
