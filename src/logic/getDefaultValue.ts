import get from '../utils/get';
import { FieldValue } from '../types';

export default function getDefaultValue<
  Data extends FieldValue,
  Name extends keyof Data = keyof Data
>(
  defaultValues: Partial<Data>,
  name: Name,
  defaultValue?: any,
): Data[Name] | undefined {
  return (
    defaultValues[name] || get(defaultValues, name as string, defaultValue)
  );
}
