import {
  InternalFieldName,
  ValidateResult,
  FlatFieldErrors,
} from '../types/form';

export default <TFieldValues>(
  name: InternalFieldName<TFieldValues>,
  validateAllFieldCriteria: boolean,
  errors: FlatFieldErrors<TFieldValues>,
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
