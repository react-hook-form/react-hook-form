import isPlainObject from './isPlainObject';

export default function extractFormValues<
  T extends object,
  K extends Record<string, unknown>,
>(fieldsState: T, formData: K) {
  const result: Record<string, unknown> = {};

  for (const key in fieldsState) {
    if (fieldsState.hasOwnProperty(key)) {
      const value = fieldsState[key];

      if (value && isPlainObject(value) && formData[key]) {
        const nested = extractFormValues(value, formData[key] as K);

        if (isPlainObject(nested)) {
          result[key] = nested;
        }
      } else if (fieldsState[key]) {
        result[key] = formData[key];
      }
    }
  }

  return result;
}
