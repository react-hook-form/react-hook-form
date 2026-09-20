import isObject from './isObject';

export default function extractFormValues<
  T extends object,
  K extends Record<string, unknown>,
>(fieldsState: T, formValues: K) {
  const values = (Array.isArray(fieldsState) ? [] : {}) as Record<
    string,
    unknown
  >;

  for (const key in fieldsState) {
    if (fieldsState.hasOwnProperty(key)) {
      const fieldState = fieldsState[key];
      const fieldValue = formValues[key];

      if (
        fieldState &&
        (isObject(fieldState) || Array.isArray(fieldState)) &&
        fieldValue
      ) {
        values[key] = extractFormValues(fieldState, fieldValue as K);
      } else if (fieldsState[key]) {
        values[key] = fieldValue;
      }
    }
  }

  return values;
}
