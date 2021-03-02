import isPrimitive from './isPrimitive';
import { FieldPath } from '../types';

export const getPath = <TFieldValues>(
  rootPath: FieldPath<TFieldValues>,
  values: any,
  paths: FieldPath<TFieldValues>[] = [],
): FieldPath<TFieldValues>[] => {
  for (const property in values) {
    isPrimitive(values[property])
      ? paths.push(`${rootPath}.${property}` as FieldPath<TFieldValues>)
      : getPath(
          `${rootPath}.${property}` as FieldPath<TFieldValues>,
          values[property],
          paths,
        );
  }

  return paths;
};
