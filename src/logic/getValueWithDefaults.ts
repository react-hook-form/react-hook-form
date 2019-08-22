import get from '../utils/get';
import { FieldValue } from '../types';

export default function getValueWithDefault<
  Data extends FieldValue,
  Name extends keyof Data = keyof Data
>(defaultValues: Partial<Data>, name: Name): Data[Name] | undefined {
  return defaultValues[name] || get(defaultValues, name as string, '');
}
