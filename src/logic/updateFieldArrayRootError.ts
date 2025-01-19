import {
  FieldError,
  FieldErrors,
  FieldValues,
  InternalFieldName,
} from '../types';
import convertToArrayPayload from '../utils/convertToArrayPayload';
import get from '../utils/get';
import set from '../utils/set';

export default <T extends FieldValues = FieldValues>(
  errors: FieldErrors<T>,
  error: Partial<Record<string, FieldError>>,
  name: InternalFieldName,
): FieldErrors<T> => {
  const fieldArrayErrors = convertToArrayPayload(get(errors, name));
  set(fieldArrayErrors, 'root', error[name]);
  set(errors, name, fieldArrayErrors);
  return errors;
};
