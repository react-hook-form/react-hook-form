import isPrimitive from './isPrimitive';
import { FieldName } from '../types';

export const getPath = <TFieldValues>(
  rootPath: FieldName<TFieldValues>,
  values: any,
  paths: FieldName<TFieldValues>[] = [],
): FieldName<TFieldValues>[] => {
  for (const property in values) {
    for (const key of [`${rootPath}.${property}`, `${rootPath}[${property}]`]) {
      isPrimitive(values[property])
        ? paths.push(key as FieldName<TFieldValues>)
        : getPath(key as FieldName<TFieldValues>, values[property], paths);
    }
  }

  return paths;
};
