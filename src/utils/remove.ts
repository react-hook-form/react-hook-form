import isUndefined from './isUndefined';
import compact from './compact';

function removeAtIndexes<T>(data: T[], indexes: number[]): T[] {
  indexes.forEach((index) => delete data[index]);
  return compact(data);
}

export default <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : removeAtIndexes(data, Array.isArray(index) ? index : [index]);
