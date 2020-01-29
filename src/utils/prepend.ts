import isArray from './isArray';

export default (data: any, value?: any) => [
  ...(isArray(value) ? value : [value || null]),
  ...data,
];
