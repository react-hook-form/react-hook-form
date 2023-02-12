import compact from '../utils/compact';
import get from '../utils/get';
import set from '../utils/set';
import { FieldError, FieldErrors, FieldValues, InternalFieldName } from '..';

export default <T extends FieldValues = FieldValues>(
  errors: FieldErrors<T>,
  error: Partial<Record<string, FieldError>>,
  name: InternalFieldName,
): FieldErrors<T> => {
  const fieldArrayErrors = compact(get(errors, name));
  set(fieldArrayErrors, 'root', error[name]);
  set(errors, name, fieldArrayErrors);
  return errors;
};
