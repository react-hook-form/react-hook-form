import flatArray from './flatArray';
import isString from './isString';
import isObject from './isObject';
import { DataType } from '../types';

function getPath(path: string, value: DataType | string[] | string): any {
  if (Array.isArray(value)) {
    return value.map((item, index) => {
      const pathWithIndex = `${path}[${index}]`;
      if (Array.isArray(item)) {
        return getPath(pathWithIndex, item);
      } else if (isObject(item)) {
        return Object.entries(item).map(([key, objectValue]) =>
          isString(objectValue)
            ? `${pathWithIndex}.${key}`
            : getPath(`${pathWithIndex}.${key}`, objectValue),
        );
      }
      return `${path}[${index}]`;
    });
  }

  return Object.entries(value).map(([key, objectValue]) =>
    isString(objectValue) ? `${path}.${key}` : getPath(path, objectValue),
  );
}

export default (parentPath: string, value: any) =>
  flatArray(getPath(parentPath, value));
