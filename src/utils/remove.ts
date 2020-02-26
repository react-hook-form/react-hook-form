import isUndefined from './isUndefined';
import isArray from './isArray';

const removeAt = (data: any, index: number) => [
  ...data.slice(0, index),
  ...data.slice(index + 1),
];

export default (data: any, index?: number | number[]) =>
  isUndefined(index)
    ? []
    : isArray(index)
    ? index.reduce(
        ({ result, previousIndex }: any, i) => ({
          result:
            previousIndex > -1
              ? removeAt(result, previousIndex < i ? i - 1 : i)
              : removeAt(result, i),
          previousIndex: i,
        }),
        {
          result: data,
          previousIndex: -1,
        },
      ).result
    : removeAt(data, index);
