import isPrimitive from './isPrimitive';
import isObject from './isObject';
import { FieldValues, InternalFieldName } from '../types';

export const getPath = <TFieldValues extends FieldValues = FieldValues>(
  path: InternalFieldName<TFieldValues>,
  values: TFieldValues | any[],
): any[] => {
  const getInnerPath = (
    value: any,
    key: number | string,
    isObject?: boolean,
  ) => {
    const pathWithIndex = isObject ? `${path}.${key}` : `${path}[${key}]`;
    return isPrimitive(value) ? pathWithIndex : getPath(pathWithIndex, value);
  };

  return Object.entries(values)
    .map(([key, value]) => getInnerPath(value, key, isObject(values)))
    .flat(Infinity);
};
