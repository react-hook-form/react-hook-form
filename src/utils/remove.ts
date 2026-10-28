import convertToArrayPayload from './convertToArrayPayload';
import isNullOrUndefined from './isNullOrUndefined';
import isUndefined from './isUndefined';

function removeAtIndexes<T>(data: T[], indexes: number[]): T[] {
  let i = 0;
  const temp = [...data];

  for (const index of indexes) {
    temp.splice(index - i, 1);
    i++;
  }

  return temp.filter((v) => !isNullOrUndefined(v)).length ? temp : [];
}

export default <T>(data: T[], index?: number | number[]): T[] =>
  isUndefined(index)
    ? []
    : removeAtIndexes(
        data,
        [...new Set(convertToArrayPayload(index) as number[])].sort(
          (a, b) => a - b,
        ),
      );
