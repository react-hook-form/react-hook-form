import { FieldErrors } from '../types';

export default <Data, FieldName>(
  errorFields: FieldErrors<Data>,
  validFieldNames: FieldName[],
) =>
  Object.entries(errorFields).reduce(
    (previous, [name, error]) =>
      validFieldNames.some((validFieldName: any) => validFieldName === name)
        ? previous
        : { ...previous, [name]: error },
    {},
  );
