import isArray from './isArray';

export default (value: [] | string) =>
  !isArray(value) &&
  (/^\w*$/.test(value) ||
    !/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/.test(value));
