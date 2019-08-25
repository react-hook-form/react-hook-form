import { FieldValues, Ref } from '../types';
import isRegex from '../utils/isRegex';

export default function attachNativeValidation(ref: Ref, rules: FieldValues): void {
  Object.entries(rules).forEach(([key, value]) => {
    if (key === 'pattern' && isRegex(value)) {
      ref[key] = value.source;
    } else {
      ref[key] = key === 'required' ? true : value;
    }
  });
}
