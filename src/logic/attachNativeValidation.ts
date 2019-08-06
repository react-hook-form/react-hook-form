import { DataType, Ref } from '../types';

export default function attachNativeValidation(ref: Ref, rules: DataType) {
  Object.entries(rules).forEach(([key, value]) => {
    if (key === 'pattern' && value instanceof RegExp) {
      ref[key] = value.source;
    } else {
      ref[key] = key === 'required' ? true : value;
    }
  });
}
