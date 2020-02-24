import isNullOrUndefined from '../utils/isNullOrUndefined';
import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';

export default (event: any) =>
  isNullOrUndefined(event) || !isObject(event.target)
    ? event
    : isUndefined(event.target.value)
    ? event.target.checked
    : event.target.value;
