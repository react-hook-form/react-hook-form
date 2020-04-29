import isUndefined from './isUndefined';
import isArray from './isArray';

const removeAt = <T>(data: T[], index: number): T[] => [
  ...data.slice(0, index),
  ...data.slice(index + 1),
];

function removeAtIndexes<T>(data: T[], index: number[]): T[] {
  let k = -1;

  while (++k < data.length) {
    if (index.indexOf(k) >= 0) {
      delete data[k];
    }
  }

  return data.filter(Boolean);
}

export default <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : isArray(index)
    ? removeAtIndexes(data, index)
    : removeAt(data, index);
