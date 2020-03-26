import isUndefined from './isUndefined';
import isArray from './isArray';

const removeAt = (data: any, index: number) => [
  ...data.slice(0, index),
  ...data.slice(index + 1),
];

function removeAtIndexes<T extends []>(data: T, index: number[]) {
  let k = -1;

  while (++k < data.length) {
    if (index.indexOf(k) >= 0) {
      delete data[k];
    }
  }

  return data.filter(Boolean);
}

export default (data: any, index?: number | number[]) =>
  isUndefined(index)
    ? []
    : isArray(index)
    ? removeAtIndexes(data, index)
    : removeAt(data, index);
