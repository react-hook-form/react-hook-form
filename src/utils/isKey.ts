export default (value: [] | string) =>
  !Array.isArray(value) &&
  !/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/.test(value);
