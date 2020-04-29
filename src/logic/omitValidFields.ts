import { ErrorMessages } from '../types';

export default <Data>(
  errorFields: ErrorMessages<Data>,
  validFieldNames: string[],
) =>
  Object.entries(errorFields).reduce(
    (previous, [name, error]) =>
      validFieldNames.some(validFieldName => validFieldName === name)
        ? previous
        : { ...previous, [name]: error },
    {},
  );
