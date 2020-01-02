import get from '../utils/get';
import isUndefined from '../utils/isUndefined';
import { DeepPartial, FieldValues, FieldValue, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  defaultValues: DeepPartial<FormValues>,
  name: FieldName<FormValues>,
  defaultValue?: Record<string, any>,
): FieldValue<FormValues> | DeepPartial<FormValues> | undefined =>
  isUndefined(defaultValues[name])
    ? get(defaultValues, name, defaultValue)
    : defaultValues[name];
