import { FieldErrors, ValidateResult } from '../types';

export default <FormValues>(
  name: string,
  validateAllFieldCriteria: boolean,
  errors: FieldErrors<FormValues>,
  type: string,
  message: ValidateResult,
) => {
  if (!validateAllFieldCriteria) {
    return {};
  }
  const error = errors[name] || { types: {} };

  return {
    ...error,
    types: {
      ...error.types,
      [type]: message || true,
    },
  };
};
