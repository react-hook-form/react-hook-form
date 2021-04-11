import { VALIDATION_MODE } from '../constants';
import {
  FieldValues,
  FormState,
  InternalFieldName,
  ReadFormState,
} from '../types';
import isEmptyObject from '../utils/isEmptyObject';

export default <
  T extends Partial<FormState<FieldValues>> & { name?: InternalFieldName },
  K extends ReadFormState
>(
  { name, ...formState }: T,
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
