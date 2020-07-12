import isUndefined from './isUndefined';
import unique from './unique';

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

  return unique(data);
}

export default <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : Array.isArray(index)
    ? removeAtIndexes(data, index)
    : removeAt(data, index);
