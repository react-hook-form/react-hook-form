import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';

export default (event: any, isCheckboxInput: boolean) =>
  !isPrimitive(event) &&
  isObject(event.target) &&
  (event.target.value || event.target.checked) &&
  event.target.type
    ? isCheckboxInput
      ? event.target.checked
      : event.target.value
    : event;
