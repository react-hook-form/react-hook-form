import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';
import isPrimitive from '../utils/isPrimitive';

export default (event: any) =>
  isPrimitive(event) ||
  !isObject(event.target) ||
  (isObject(event.target) && !event.type)
    ? event
    : isUndefined(event.target.value)
    ? event.target.checked
    : event.target.value;
