import flatten from './flatten';
import isString from './isString';
import isObject from './isObject';

function getPath(parentPath: string, value: any): any {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      if (Array.isArray(item)) {
        return getPath(`${parentPath}[${index}]`, item);
      } else if (isObject(item)) {
        return Object.entries(item).map(([key, value]) => {
          return isString(value)
            ? `${parentPath}[${index}].${key}`
            : getPath(`${parentPath}[${index}].${key}`, value);
        });
      }

      return `${parentPath}[${index}]`;
    });
  } else if (isObject(value)) {
    return Object.entries(value).map(([key, value]) => {
      return isString(value)
        ? `${parentPath}.${key}`
        : getPath(parentPath, value);
    });
  }
}

export default (parentPath: string, value: any) => {
  return flatten(getPath(parentPath, value));
};
