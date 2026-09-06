import { flatten } from './flatten';

function jsonToFormData(json: any) {
  const result = new FormData();

  const flattenFormValues = flatten(json);

  for (const key in flattenFormValues) {
    result.append(key, flattenFormValues[key]);
  }

  return result;
}

export { jsonToFormData };
