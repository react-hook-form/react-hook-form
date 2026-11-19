import { ROOT_ERROR_TYPE } from '../constants';
import isString from '../utils/isString';

/**
 * Keeps the errors of touched fields and the array-level `root` errors.
 */
const filterTouchedErrors = (error: any, touched: any): any => {
  if (touched === true || isString(error.type)) {
    return touched && error;
  }

  const isArray: boolean = Array.isArray(error);
  const result: any = isArray ? [] : {};
  let hasError;

  for (const key in error) {
    const value =
      isArray && key === ROOT_ERROR_TYPE
        ? error[key]
        : touched &&
          error[key] &&
          filterTouchedErrors(error[key], touched[key]);

    if (value) {
      hasError = result[key] = value;
    }
  }

  return hasError && result;
};

export default filterTouchedErrors;
