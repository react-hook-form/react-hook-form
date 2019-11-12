import get from '../utils/get';
import isUndefined from '../utils/isUndefined';
import { FieldValues, FieldValue, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  defaultValues: Partial<FormValues>,
  name: FieldName<FormValues>,
  defaultValue?: Record<string, any>,
): FieldValue<FormValues> | Partial<FormValues> | undefined =>
  isUndefined(defaultValues[name])
    ? get(defaultValues, name, defaultValue)
    : defaultValues[name];
