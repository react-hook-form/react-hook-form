import { FieldArrayMethodProps, InternalFieldName } from '../types';

export default (
  name: InternalFieldName,
  index: number,
  options?: FieldArrayMethodProps,
): string =>
  options
    ? options.shouldFocus === false
      ? ''
      : options.focusName || `${name}.${options.focusIndex}.`
    : `${name}.${index}.`;
