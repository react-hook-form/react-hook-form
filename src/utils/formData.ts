import type { FieldValues } from '../types';

import { flatten } from './flatten';
import isFileList from './isFileList';
import isUndefined from './isUndefined';

function jsonToFormData(json: unknown) {
  const result = new FormData();

  const flattenFormValues = flatten(json as FieldValues);

  for (const key in flattenFormValues) {
    const value = flattenFormValues[key];

    if (isUndefined(value)) {
      continue;
    }

    if (isFileList(value)) {
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
