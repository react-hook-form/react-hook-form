export default <T>(data: T[], from: number, to: number): T[] =>
  Array.isArray(data) ? data.splice(to, 0, data.splice(from, 1)[0]) : [];
