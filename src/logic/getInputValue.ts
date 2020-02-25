import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';

export default (event: any, isCheckboxInput: boolean) =>
  isPrimitive(event) ||
  !isObject(event.target) ||
  (isObject(event.target) && !event.target.type)
    ? event
    : isCheckboxInput || isUndefined(event.target.value)
    ? event.target.checked
    : event.target.value;
