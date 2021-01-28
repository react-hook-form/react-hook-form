import isUndefined from '../utils/isUndefined';
import { FieldArrayMethodsOption } from '../types';

export default (index: number, options?: FieldArrayMethodsOption): string => {
  if (options) {
    if (!isUndefined(options.focusIndex)) {
      return `${name}.${options.focusIndex}`;
    }
    if (options.focusName) {
      return options.focusName;
    }
    if (!options.shouldFocus) {
      return '';
    }
  }
  return `${name}.${index}`;
};
