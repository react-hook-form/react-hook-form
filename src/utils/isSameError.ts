import { ReactHookFormError } from '../types';
import isObject from "./isObject";

export default (
  error: ReactHookFormError | undefined,
  type: string,
  message: string | undefined,
): boolean => isObject(error) && (error.type === type && error.message === message);
