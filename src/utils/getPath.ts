import isPrimitive from './isPrimitive';
import { FieldName } from '../types';

export const getPath = <TFieldValues>(
  rootPath: FieldName<TFieldValues>,
  values: any,
  paths: FieldName<TFieldValues>[] = [],
): FieldName<TFieldValues>[] => {
  for (const property in values) {
    isPrimitive(values[property])
      ? paths.push(`${rootPath}.${property}` as FieldName<TFieldValues>)
      : getPath(
          `${rootPath}.${property}` as FieldName<TFieldValues>,
          values[property],
          paths,
        );
  }

  return paths;
};
