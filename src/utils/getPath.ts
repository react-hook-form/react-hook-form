import flatArray from './flatArray';
import isString from './isString';
import isObject from './isObject';
import { FieldValues } from '../types';
import isArray from './isArray';

const getPath = (path: string, values: FieldValues | string[] | string): any =>
  isArray(values)
    ? values.map((item, index) => {
        const pathWithIndex = `${path}[${index}]`;

        if (isArray(item)) {
          return getPath(pathWithIndex, item);
        } else if (isObject(item)) {
          return Object.entries(item).map(([key, objectValue]: [string, any]) =>
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

export default (parentPath: string, value: FieldValues) =>
  flatArray(getPath(parentPath, value));
