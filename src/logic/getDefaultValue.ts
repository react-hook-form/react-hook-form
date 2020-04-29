import get from '../utils/get';
import { DataType } from '../types';

export default (
  defaultValues: DataType | undefined,
  name: string,
): DataType | string | number | boolean =>
  defaultValues && (defaultValues[name] || get(defaultValues, name));
