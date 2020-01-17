import isArray from './isArray';

export default (fields: any[], indexA: number, indexB: number) =>
  isArray(fields) &&
  ([fields[indexA], fields[indexB]] = [fields[indexB], fields[indexA]]);
