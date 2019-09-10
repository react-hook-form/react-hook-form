import get from '../utils/get';
import isUndefined from '../utils/isUndefined';

export default <Data extends any, FieldName extends keyof Data = keyof Data>(
  defaultValues: Partial<Data>,
  name: FieldName,
  defaultValue?: any,
): Data[FieldName] | undefined =>
  isUndefined(defaultValues[name])
    ? get(defaultValues, name as string, defaultValue)
    : defaultValues[name];
