import isNullOrUndefined from '../utils/isNullOrUndefined';
import isUndefined from '../utils/isUndefined';
import isObject from '../utils/isObject';

export default (event: any, isCheckboxInput: boolean) =>
  isNullOrUndefined(event) || !isObject(event.target)
    ? event
    : isCheckboxInput || isUndefined(event.target.value)
    ? event.target.checked
    : event.target.value;
