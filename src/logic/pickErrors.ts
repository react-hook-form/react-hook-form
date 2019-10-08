import { FieldErrors, FieldValues, FieldName } from '../types';

export default <FormValues extends FieldValues>(
  errors: FieldErrors<FormValues>,
  pickList: FieldName<FormValues>[],
): FieldErrors<FormValues> =>
  Object.entries(errors).reduce(
    (previous, [key, error]) => ({
      ...previous,
      ...(pickList.includes(key) ? { [key]: error } : null),
    }),
    {},
  );
