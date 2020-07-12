export default <T>(value: T | T[]): null[] | null =>
  Array.isArray(value) ? Array(value.length).fill(null) : null;
