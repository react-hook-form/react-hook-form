import isUndefined from './isUndefined';
import compact from './compact';

function removeAtIndexes<T>(data: T[], indexes: number[]): T[] {
  let i = 0;
  const temp = [...data];

  for (const index of indexes) {
    temp.splice(index - i, 1);
    i++;
  }

  return compact(temp).length ? temp : [];
}

export default <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : removeAtIndexes(data, (Array.isArray(index) ? index : [index]).sort());
