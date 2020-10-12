export default <T>(value: T | T[]): undefined[] | undefined =>
  Array.isArray(value) ? Array(value.length).fill(undefined) : undefined;
