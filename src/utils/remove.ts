import isArray from './isArray';

export default (data: any[], index?: number) =>
  index && isArray(data)
    ? [...data.slice(0, index), ...data.slice(index + 1)]
    : [];
