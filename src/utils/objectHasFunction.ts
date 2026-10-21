import isFunction from './isFunction';

export default <T>(data: T): boolean => {
  for (const key in data) {
    if (
      Object.prototype.hasOwnProperty.call(data, key) &&
      isFunction(data[key])
    ) {
      return true;
    }
  }
  return false;
};
