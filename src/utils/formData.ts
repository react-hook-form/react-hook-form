import type { FieldValues } from '../types';

import { flatten } from './flatten';
import isUndefined from './isUndefined';

function jsonToFormData(json: unknown) {
  const result = new FormData();

  const flattenFormValues = flatten(json as FieldValues);

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
