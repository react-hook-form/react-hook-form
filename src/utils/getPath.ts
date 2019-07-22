import flatArray from './flatArray';
import isString from './isString';
import isObject from './isObject';
import { DataType } from '../types';

const getPath = (path: string, values: DataType | string[] | string): any =>
  Array.isArray(values)
    ? values.map((item, index) => {
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
        return pathWithIndex;
      })
    : Object.entries(values).map(([key, objectValue]) =>
        isString(objectValue) ? `${path}.${key}` : getPath(path, objectValue),
      );

export default (parentPath: string, value: any) =>
  flatArray(getPath(parentPath, value));
