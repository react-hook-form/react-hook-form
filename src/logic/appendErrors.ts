import { FieldError, FieldName, ValidateResult } from '../types';

export default <TFieldValues>(
  name: FieldName<TFieldValues>,
  validateAllFieldCriteria: boolean,
  errors: Record<FieldName<TFieldValues>, FieldError>,
  type: string,
  message: ValidateResult,
) => {
  if (validateAllFieldCriteria) {
    const error = errors[name];

    return {
      ...error,
      types: {
        ...(error && error.types ? error.types : {}),
        [type]: message || true,
      },
    };
  }

  return {};
};
