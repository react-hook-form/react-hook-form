import { FieldErrors } from '../types';

export default <FormValues>(
  name: string,
  validateAllFieldCriteria: boolean,
  errors: FieldErrors<FormValues>,
  type: string,
  message: string,
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
