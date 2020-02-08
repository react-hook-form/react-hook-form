import isArray from './isArray';
import isUndefined from './isUndefined';

export default (data: any, index?: number | number[]) =>
  isUndefined(index)
    ? []
    : data.filter(
        (_: any, i: number) =>
          (isArray(index) ? index : [index]).indexOf(i) < 0,
      );
