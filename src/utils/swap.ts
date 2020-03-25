import isArray from './isArray';

export default (fields: any, indexA: number, indexB: number) => {
  if (isArray(fields)) {
    const temp = [fields[indexB], fields[indexA]];
    fields[indexA] = temp[0];
    fields[indexB] = temp[1];
  }
};
