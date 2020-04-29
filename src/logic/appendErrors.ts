import { FieldError, FieldName, ValidateResult } from '../types';

export default <FormValues>(
  name: FieldName<FormValues>,
  validateAllFieldCriteria: boolean,
  errors: Record<FieldName<FormValues>, FieldError>,
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
