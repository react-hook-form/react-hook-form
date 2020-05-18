import isPrimitive from './isPrimitive';
import { FieldValues, InternalFieldName } from '../types/types';
import isArray from './isArray';

const getPath = <TFieldValues extends FieldValues = FieldValues>(
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

  return isArray(values)
    ? values.map((value, key) => getInnerPath(value, key))
    : Object.entries(values).map(([key, value]) =>
        getInnerPath(value, key, true),
      );
};

export default <TFieldValues extends FieldValues = FieldValues>(
  parentPath: InternalFieldName<TFieldValues>,
  value: TFieldValues,
) => getPath(parentPath, value).flat(Infinity);
