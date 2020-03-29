import get from '../utils/get';
import { FieldElement, FieldErrors, FieldRefs } from '../types';

export default <FormValues>(
  fields: FieldRefs<FormValues>,
  fieldErrors: FieldErrors<FormValues>,
) => {
  for (const key in fields) {
    if (get(fieldErrors, key)) {
      const field = fields[key];
      if (field) {
        if ((field.ref as FieldElement).focus) {
          (field.ref as FieldElement).focus();
          break;
        } else if (field.options) {
          field.options[0].ref.focus();
          break;
        }
      }
    }
  }
};
