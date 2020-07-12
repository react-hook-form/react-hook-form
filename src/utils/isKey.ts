export default (value: [] | string) =>
  !Array.isArray(value) &&
  (/^\w*$/.test(value) ||
    !/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/.test(value));
