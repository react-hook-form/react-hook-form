import isEmptyObject from '../utils/isEmptyObject';
import { ReadFormState } from '../types';
import { VALIDATION_MODE } from '../constants';

export default <T, K extends ReadFormState>(
  state: T,
  readFormStateRef: K,
  isRoot?: boolean,
) =>
  isEmptyObject(state) ||
  Object.keys(state).length >= Object.keys(readFormStateRef).length ||
  Object.keys(state).find(
    (key) =>
      readFormStateRef[key as keyof ReadFormState] ===
      (isRoot ? VALIDATION_MODE.all : true),
  );
