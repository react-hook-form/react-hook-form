import { VALIDATION_MODE } from '../constants';
import { ReadFormState } from '../types';
import isEmptyObject from '../utils/isEmptyObject';
import omit from '../utils/omit';

export default <T extends Record<string, any>, K extends ReadFormState>(
  formStateData: T,
  readFormStateRef: K,
  isRoot?: boolean,
) => {
  const formState = omit(formStateData, 'name');

  return (
    isEmptyObject(formState) ||
    Object.keys(formState).length >= Object.keys(readFormStateRef).length ||
    Object.keys(formState).find(
      (key) =>
        readFormStateRef[key as keyof ReadFormState] ===
        (isRoot ? VALIDATION_MODE.all : true),
    )
  );
};
