import { ValidateResult } from '../types';

export default (
  name: string,
  validateAllFieldCriteria: boolean,
  errors: Record<string, any>,
  type: string,
  message: ValidateResult,
) => {
  if (!validateAllFieldCriteria) {
    return {};
  }
  const error = errors[name];

  return {
    ...error,
    types: {
      ...(error && error.types ? error.types : {}),
      [type]: message || true,
    },
  };
};
