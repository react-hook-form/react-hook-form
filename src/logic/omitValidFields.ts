import { FieldErrors, FieldName, FieldValues } from '../types';

export default <FormValues extends FieldValues>(
  errorFields: FieldErrors<FormValues>,
  validFieldNames: FieldName<FormValues>[],
) =>
  Object.entries(errorFields).reduce(
    (previous, [name, error]) =>
      validFieldNames.some(validFieldName => validFieldName === name)
        ? previous
        : { ...previous, [name]: error },
    {},
  );
