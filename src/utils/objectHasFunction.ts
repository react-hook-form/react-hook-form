import isFunction from './isFunction';

export default <T>(data: T): boolean => {
  for (const key in data) {
    if (
      isFunction(data[key]) &&
      data[key] !== Object.prototype[key as keyof typeof Object.prototype]
    ) {
      return true;
    }
  }
  return false;
};
