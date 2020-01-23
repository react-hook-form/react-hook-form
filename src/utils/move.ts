import isArray from './isArray';

export default (data: any, from: number, to: number) =>
  isArray(data) ? data.splice(to, 0, data.splice(from, 1)[0]) : [];
