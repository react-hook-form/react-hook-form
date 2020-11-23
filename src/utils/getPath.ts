import isPrimitive from './isPrimitive';
import isObject from './isObject';
import { FieldName } from '../types';

export const getPath = <TFieldValues>(
  rootPath: FieldName<TFieldValues>,
  values: any,
  paths: FieldName<TFieldValues>[] = [],
): FieldName<TFieldValues>[] => {
  for (const property in values) {
    const rootName = (rootPath +
      (isObject(values)
        ? `.${property}`
        : `[${property}]`)) as FieldName<TFieldValues>;

    isPrimitive(values[property])
      ? paths.push(rootName)
      : getPath(rootName, values[property], paths);
  }

  return paths;
};
