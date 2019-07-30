import isUndefined from './isUndefined';

export default (value: any): boolean => value === null || isUndefined(value);
