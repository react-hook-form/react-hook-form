export default (value: [] | string) =>
  !Array.isArray(value) && /^\w*$/.test(value);
