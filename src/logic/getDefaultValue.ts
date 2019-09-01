import get from '../utils/get';
import { FieldValue } from '../types';
import isUndefined from '../utils/isUndefined';

export default <
  Data extends FieldValue,
  FieldName extends keyof Data = keyof Data
>(
  defaultValues: Partial<Data>,
  name: FieldName,
  defaultValue?: any,
): Data[FieldName] | undefined =>
  isUndefined(defaultValues[name])
    ? get(defaultValues, name as string, defaultValue)
    : defaultValues[name];
