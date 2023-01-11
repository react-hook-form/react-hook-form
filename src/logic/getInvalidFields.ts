import { FieldRefs, FieldValues } from '../types';

import validateField from './validateField';

async function getInvalidFields<T extends FieldValues>(
  fields: FieldRefs,
  formValues: T,
  validateAllFieldCriteria: boolean,
) {
  const invalidFields: any = {};

  for (const name in fields) {
    const field = fields[name];

    if (field) {
      const { _f } = field;

      if (_f) {
        const fieldError = await validateField(
          field,
          formValues,
          validateAllFieldCriteria,
        );

        if (fieldError[_f.name]) {
          invalidFields[_f.name] = _f;
        }
      }
    }
  }

  return invalidFields;
}

export default getInvalidFields;
