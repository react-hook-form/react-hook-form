import get from '../utils/get';
import { FieldValues, BaseFieldValue, FieldValue, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  defaultValues: Partial<FormValues>,
  name: FieldName<FormValues>,
  defaultValue?: BaseFieldValue,
): FieldValue<FormValues> | Partial<FormValues> | undefined =>
  defaultValues[name] ?? get(defaultValues, name, defaultValue);
