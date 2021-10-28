import { FieldValues, InternalFieldName, Names } from '../types';
import convertToArrayPayload from '../utils/convertToArrayPayload';
import get from '../utils/get';

export function generateWatchOutput(
  names: string | string[] | undefined,
  _names: Names,
  formValues?: FieldValues,
  isGlobal?: boolean,
) {
  if (names) {
    const result = convertToArrayPayload(names).map(
      (fieldName) => (
        isGlobal && _names.watch.add(fieldName as InternalFieldName),
        get(formValues, fieldName as InternalFieldName)
      ),
    );

    return Array.isArray(names) ? result : result[0];
  }

  isGlobal && (_names.watchAll = true);
  return formValues;
}
