import isUndefined from '../utils/isUndefined';
import { FieldRefs } from '../types';

export default (fields: FieldRefs, callback: (name: string) => boolean) => {
  for (const key in fields) {
    if (callback(key)) {
      const field = fields[key];

      if (field) {
        if (field.ref.focus && isUndefined(field.ref.focus())) {
          break;
        } else if (field.refs) {
          field.refs[0].focus();
          break;
        }
      }
    }
  }
};
