import isPlainObject from './isPlainObject';

export default function extractFormValues<
  T extends object,
  K extends Record<string, unknown>,
>(fieldsState: T, formValues: K) {
  const values: Record<string, unknown> = {};

  for (const key in fieldsState) {
    if (fieldsState.hasOwnProperty(key)) {
      const fieldState = fieldsState[key];
      const fieldValue = formValues[key];

      if (fieldState && isPlainObject(fieldState) && fieldValue) {
        const nested = extractFormValues(fieldState, fieldValue as K);

        if (isPlainObject(nested)) {
          values[key] = nested;
        }
      } else if (fieldsState[key]) {
        values[key] = fieldValue;
      }
    }
  }

  return values;
}
