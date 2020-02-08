import isArray from './isArray';
import isUndefined from './isUndefined';

export default (data: any, index?: number | number[]) =>
  !isUndefined(index) && isArray(data)
    ? isArray(index)
      ? data.filter((_e, i) => index.indexOf(i) === -1)
      : [...data.slice(0, index), ...data.slice(index + 1)]
    : [];
