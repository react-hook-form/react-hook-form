import {
  InternalFieldName,
  ValidateResult,
  InternalFieldErrors,
} from '../types';

export default <TFieldValues>(
  name: InternalFieldName<TFieldValues>,
  validateAllFieldCriteria: boolean,
  errors: InternalFieldErrors<TFieldValues>,
  type: string,
  message: ValidateResult,
) =>
  validateAllFieldCriteria
    ? {
        ...errors[name],
        types: {
          ...(errors[name] && errors[name]!.types ? errors[name]!.types : {}),
          [type]: message || true,
        },
      }
    : {};
