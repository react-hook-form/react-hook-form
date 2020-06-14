import * as React from 'react';
import {
  FieldValues,
  InternalFieldName,
  DefaultValuesAtRender,
  ReadFormState,
  Touched,
  FieldRefs,
  FieldValue,
  UnpackNestedValue,
} from './types/form';
import getFieldValue from './logic/getFieldValue';
import { get } from './utils';
import isNameInFieldArray from './logic/isNameInFieldArray';
import set from './utils/set';
import unset from './utils/unset';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import getFieldArrayParentName from './logic/getFieldArrayParentName';
import getFieldArrayValueByName from './logic/getFieldArrayValueByName';
import isEmptyObject from './utils/isEmptyObject';
import { DeepPartial } from './types/utils';

interface UseFormDirtyProps<TFieldValues extends FieldValues = FieldValues> {
  fieldsRef: React.MutableRefObject<FieldRefs<TFieldValues>>;
  readFormStateRef: React.MutableRefObject<ReadFormState>;
  defaultValuesAtRenderRef: React.MutableRefObject<
    DefaultValuesAtRender<TFieldValues>
  >;
  fieldArrayNamesRef: React.MutableRefObject<Set<string>>;
  defaultValuesRef: React.MutableRefObject<
    | FieldValue<UnpackNestedValue<TFieldValues>>
    | UnpackNestedValue<DeepPartial<TFieldValues>>
  >;
}

export function useFormDirty<TFieldValues extends FieldValues = FieldValues>({
  fieldsRef,
  readFormStateRef,
  defaultValuesAtRenderRef,
  fieldArrayNamesRef,
  defaultValuesRef,
}: UseFormDirtyProps<TFieldValues>) {
  const dirtyFieldsRef = React.useRef<Touched<TFieldValues>>({});
  const isDirtyRef = React.useRef(false);

  const setDirty = React.useCallback(
    (name: InternalFieldName<TFieldValues>): boolean => {
      const { isDirty, dirtyFields } = readFormStateRef.current;

      if (!fieldsRef.current[name] || (!isDirty && !dirtyFields)) {
        return false;
      }

      const isFieldDirty =
        defaultValuesAtRenderRef.current[name] !==
        getFieldValue(fieldsRef.current, fieldsRef.current[name]!.ref);
      const isDirtyFieldExist = get(dirtyFieldsRef.current, name);
      const isFieldArray = isNameInFieldArray(fieldArrayNamesRef.current, name);
      const previousIsDirty = isDirtyRef.current;

      if (isFieldDirty) {
        set(dirtyFieldsRef.current, name, true);
      } else {
        unset(dirtyFieldsRef.current, name);
      }

      isDirtyRef.current =
        (isFieldArray &&
          getIsFieldsDifferent(
            getFieldArrayValueByName(
              fieldsRef.current,
              getFieldArrayParentName(name),
            ),
            get(defaultValuesRef.current, getFieldArrayParentName(name)),
          )) ||
        !isEmptyObject(dirtyFieldsRef.current);

      return (
        (isDirty && previousIsDirty !== isDirtyRef.current) ||
        (dirtyFields && isDirtyFieldExist !== get(dirtyFieldsRef.current, name))
      );
    },
    [
      defaultValuesAtRenderRef,
      defaultValuesRef,
      fieldArrayNamesRef,
      fieldsRef,
      readFormStateRef,
    ],
  );

  return {
    isDirtyRef,
    dirtyFieldsRef,
    setDirty,
  };
}
