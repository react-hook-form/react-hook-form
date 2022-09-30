import { VALIDATION_MODE } from '../constants';
import { ReadFormState } from '../types';
import isEmptyObject from '../utils/isEmptyObject';

export default <T extends Record<string, any>, K extends ReadFormState>(
  { name, ...formState }: T,
  _proxyFormState: K,
  isRoot?: boolean,
) =>
  isEmptyObject(formState) ||
  Object.keys(formState).length >= Object.keys(_proxyFormState).length ||
  Object.keys(formState).find(
    (key) =>
      _proxyFormState[key as keyof ReadFormState] ===
      (!isRoot || VALIDATION_MODE.all),
  );
