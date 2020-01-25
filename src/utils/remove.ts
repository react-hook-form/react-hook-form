import isArray from './isArray';
import isUndefined from './isUndefined';

export default (data: any, index?: number) =>
  !isUndefined(index) && isArray(data)
    ? [...data.slice(0, index), ...data.slice(index + 1)]
    : [];
