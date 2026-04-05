import { flatten } from './flatten';

function jsonToFormData(json: object) {
  const result = new FormData();

  const flattenFormValues = flatten(json);

  for (const key in flattenFormValues) {
    result.append(key, flattenFormValues[key]);
  }

  return result;
}

export { jsonToFormData };
