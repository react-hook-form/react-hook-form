import isRegex from '../utils/isRegex';
import { FieldValues, Ref } from '../types';
import { PATTERN_ATTRIBUTE, REQUIRED_ATTRIBUTE } from '../constants';

export default function attachNativeValidation(
  ref: Ref,
  rules: FieldValues,
): void {
  Object.entries(rules).forEach(([key, value]) => {
    if (key === PATTERN_ATTRIBUTE && isRegex(value)) {
      ref[key] = value.source;
    } else {
      ref[key] = key === REQUIRED_ATTRIBUTE ? true : value;
    }
  });
}
