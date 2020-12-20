import isEmptyObject from '../utils/isEmptyObject';
import { ReadFormState } from '../types';

export default <T, K extends ReadFormState>(state: T, readFormStateRef: K) =>
  isEmptyObject(state) ||
  Object.keys(state).length >= Object.keys(readFormStateRef).length ||
  Object.keys(state).find(
    (key) => readFormStateRef[key as keyof ReadFormState],
  );
