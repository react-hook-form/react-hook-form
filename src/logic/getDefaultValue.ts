import get from '../utils/get';
import { FieldValue } from '../types';
import isUndefined from '../utils/isUndefined';

export default function getDefaultValue<
  Data extends FieldValue,
  Name extends keyof Data = keyof Data
>(
  defaultValues: Partial<Data>,
  name: Name,
  defaultValue?: any,
): Data[Name] | undefined {
  return isUndefined(defaultValues[name])
    ? get(defaultValues, name as string, defaultValue)
    : defaultValues[name];
}
