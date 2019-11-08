import isRegex from '../utils/isRegex';
import { INPUT_VALIDATION_RULES } from '../constants';
import { FieldValues, Ref } from '../types';

export default function attachNativeValidation(
  ref: Ref,
  rules: FieldValues,
): void {
  Object.entries(rules).forEach(([key, value]) => {
    if (key === INPUT_VALIDATION_RULES.pattern && isRegex(value)) {
      ref[key] = value.source;
    } else {
      ref[key] = key === INPUT_VALIDATION_RULES.pattern || value;
    }
  });
}
