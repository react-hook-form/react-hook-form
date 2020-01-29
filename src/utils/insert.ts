import isArray from './isArray';

export default (data: any, index: number, value?: any) => [
  ...data.slice(0, index),
  ...(isArray(value) ? value : [value || null]),
  ...data.slice(index),
];
