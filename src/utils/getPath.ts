import flatArray from './flatArray';
import isPrimitive from './isPrimitive';
import { FieldValues, FieldName } from '../types';
import isArray from './isArray';

const getPath = <FormValues extends FieldValues = FieldValues>(
  path: FieldName<FormValues>,
  values: FormValues | any[],
): any[] =>
  isArray(values)
    ? values.map((item, index) => {
        const pathWithIndex = `${path}[${index}]`;
        return isPrimitive(item) ? pathWithIndex : getPath(pathWithIndex, item);
      })
    : Object.entries(values).map(([key, objectValue]: [string, any]) => {
        const pathWithKey = `${path}.${key}`;
        return isPrimitive(objectValue)
          ? pathWithKey
          : getPath(pathWithKey, objectValue);
      });

export default <FormValues extends FieldValues = FieldValues>(
  parentPath: FieldName<FormValues>,
  value: FormValues,
) => flatArray<FieldName<FormValues>>(getPath<FormValues>(parentPath, value));
