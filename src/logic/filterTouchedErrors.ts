import { ROOT_ERROR_TYPE } from '../constants';
import isObject from '../utils/isObject';
import isString from '../utils/isString';

/**
 * Filter field array resolver errors when mode is 'onTouched' and form is not submitted.
 * Only publishes errors for fields that have been touched, while preserving
 * the array-level `root` error and correctly distinguishing fields named `root`.
 */
const filterTouchedErrors = (
  error: any,
  touched: any,
  isTopLevel = true,
): any => {
  if (!error) {
    return undefined;
  }

  if (touched === true || isString(error.type)) {
    return touched ? error : undefined;
  }

  const isArray = Array.isArray(error);
  const isArrayRootError =
    isArray ||
    (isTopLevel &&
      isObject(error) &&
      !Object.keys(error).some((key) => !Number.isNaN(+key)));
  const result: any = isArray ? [] : {};
  let hasError = false;

  for (const key in error) {
    let value;
    if (isArrayRootError && key === ROOT_ERROR_TYPE) {
      value = (error as any)[key];
    } else if (touched && (error as any)[key]) {
      value = filterTouchedErrors((error as any)[key], touched[key], false);
    }

    if (value) {
      (result as any)[key] = value;
      hasError = true;
    }
  }

  return hasError ? result : undefined;
};

export default filterTouchedErrors;
