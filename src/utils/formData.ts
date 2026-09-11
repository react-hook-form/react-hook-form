import { flatten } from './flatten';
import isUndefined from './isUndefined';

function jsonToFormData(json: any) {
  const result = new FormData();

  const flattenFormValues = flatten(json);

  for (const key in flattenFormValues) {
    const value = flattenFormValues[key];

    if (isUndefined(value)) {
      continue;
    }

    if (typeof FileList !== 'undefined' && value instanceof FileList) {
      for (let index = 0; index < value.length; index++) {
        const file = value[index];

        file && result.append(key, file);
      }

      continue;
    }

    result.append(key, value);
  }

  return result;
}

export { jsonToFormData };
