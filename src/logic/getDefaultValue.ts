import get from '../utils/get';
import isUndefined from '../utils/isUndefined';
import { FieldValues, BaseFieldValue, FieldValue, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  defaultValues: Partial<FormValues>,
  name: FieldName<FormValues>,
  defaultValue?: BaseFieldValue,
): FieldValue<FormValues> | undefined =>
  isUndefined(defaultValues[name])
    ? get(defaultValues, name as string, defaultValue)
    : defaultValues[name];
