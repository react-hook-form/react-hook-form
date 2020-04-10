import isPrimitive from './isPrimitive';
import { FieldValues, FieldName } from '../types';
import isArray from './isArray';

const getPath = <FormValues extends FieldValues = FieldValues>(
  path: FieldName<FormValues>,
  values: FormValues | any[],
): any[] => {
  const getInnerPath = (
    value: any,
    key: number | string,
    isObject?: boolean,
  ) => {
    const pathWithIndex = isObject ? `${path}.${key}` : `${path}[${key}]`;
    return isPrimitive(value) ? pathWithIndex : getPath(pathWithIndex, value);
  };

  return isArray(values)
    ? values.map((value, key) => getInnerPath(value, key))
    : Object.entries(values).map(([key, value]: [string, any]) =>
        getInnerPath(value, key, true),
      );
};

export default <FormValues extends FieldValues = FieldValues>(
  parentPath: FieldName<FormValues>,
  value: FormValues,
) => getPath(parentPath, value).flat(Infinity);
