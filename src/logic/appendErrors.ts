import { FieldError, InternalFieldName, ValidateResult } from '../types/form';

export default <TFieldValues>(
  name: InternalFieldName<TFieldValues>,
  validateAllFieldCriteria: boolean,
  errors: Record<InternalFieldName<TFieldValues>, FieldError>,
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
