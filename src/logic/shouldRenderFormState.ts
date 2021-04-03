import { VALIDATION_MODE } from '../constants';
import { ReadFormState } from '../types';
import isEmptyObject from '../utils/isEmptyObject';

export default <T, K extends ReadFormState>(
  formState: T,
  readFormStateRef: K,
  isRoot?: boolean,
) =>
  isEmptyObject(formState) ||
  Object.keys(formState).length >= Object.keys(readFormStateRef).length ||
  Object.keys(formState).find(
    (key) =>
      readFormStateRef[key as keyof ReadFormState] ===
      (isRoot ? VALIDATION_MODE.all : true),
  );
