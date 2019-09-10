import get from '../utils/get';
import isUndefined from '../utils/isUndefined';
import { FieldValue } from '../types';

export default <
  Data extends FieldValue,
  FieldName extends keyof Data = keyof Data
>(
  defaultValues: Partial<Data>,
  name: FieldName,
  defaultValue?: FieldValue,
): Data[FieldName] | undefined =>
  isUndefined(defaultValues[name])
    ? get(defaultValues, name as string, defaultValue)
    : defaultValues[name];
