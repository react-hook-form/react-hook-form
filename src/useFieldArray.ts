import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import { REGEX_ID } from './constants';
import { FieldValues, Control, UseFieldArrayProps, WithFieldId } from './types';

export function useFieldArray<
  FormArrayValues extends FieldValues = FieldValues,
  ControlProp extends Control = Control
>({ control, name }: UseFieldArrayProps<ControlProp>) {
  const methods = useFormContext();
  const {
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fieldsRef,
    defaultValuesRef,
    unregister,
    isDirtyRef,
  } = control || methods.control;
  const memoizedDefaultValues = React.useMemo(
    () => get(defaultValuesRef.current, name, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name],
  );
  const [fields, setField] = React.useState<
    WithFieldId<Partial<FormArrayValues>>[]
  >(mapIds(memoizedDefaultValues));

  const setFieldsRef = ({
    forceDirty,
    removeIndex,
    fieldsToCompare,
    isPrepend,
    insertIndex,
    swapIndexA,
    swapIndexB,
    moveFromIndex,
    moveToIndex,
  }: {
    forceDirty?: boolean;
    removeIndex?: number;
    prependIndex?: number;
    fieldsToCompare?: any;
    isPrepend?: boolean;
    insertIndex?: number;
    swapIndexA?: number;
    swapIndexB?: number;
    moveFromIndex?: number;
    moveToIndex?: number;
  } = {}) => {
    isDirtyRef.current = isUndefined(forceDirty)
      ? true
      : getIsFieldsDifferent(fieldsToCompare, memoizedDefaultValues);

    for (const key in fieldsRef.current) {
      const currentIndexString = key.match(REGEX_ID)![0].slice(1, -1);
      const currentIndex = parseInt(currentIndexString);

      if (isMatchFieldArrayName(key, name)) {
        if (swapIndexA && swapIndexB) {
        } else if (moveFromIndex && moveToIndex) {
        } else if (insertIndex) {
          if (insertIndex >= currentIndex) {
            fieldsRef.current[
              key.replace(REGEX_ID, `[${(currentIndex + 1).toString()}]`)
            ] = fieldsRef.current[key];
          }

          if (insertIndex === currentIndex) {
            unregister(key, true);
          }
        } else if (isPrepend) {
          fieldsRef.current[
            key.replace(REGEX_ID, `[${(currentIndex + 1).toString()}]`)
          ] = fieldsRef.current[key];

          if (currentIndex === 0) {
            unregister(key, true);
          }
        } else if (isUndefined(removeIndex) || fields.length < 2) {
          unregister(key, true);
        } else if (currentIndex > removeIndex) {
          fieldsRef.current[
            key.replace(REGEX_ID, `[${(currentIndex - 1).toString()}]`)
          ] = fieldsRef.current[key];

          if (currentIndex === fields.length - 1) {
            unregister(key, true);
          }
        }
      }
    }
  };

  const prepend = (value: WithFieldId<Partial<FormArrayValues>>) => {
    setFieldsRef({
      forceDirty: true,
      isPrepend: true,
    });
    setField([appendId(value), ...fields]);
  };

  const append = (value: WithFieldId<Partial<FormArrayValues>>) => {
    isDirtyRef.current = true;
    setField([...fields, appendId(value)]);
  };

  const remove = (index?: number) => {
    const data = isUndefined(index)
      ? []
      : [...fields.slice(0, index), ...fields.slice(index + 1)];
    setFieldsRef({
      removeIndex: index,
    });
    setField(data);
  };

  const insert = (
    index: number,
    value: WithFieldId<Partial<FormArrayValues>>,
  ) => {
    setFieldsRef({
      insertIndex: index,
    });
    setField([
      ...fields.slice(0, index),
      appendId(value),
      ...fields.slice(index),
    ]);
  };

  const swap = (indexA: number, indexB: number) => {
    [fields[indexA], fields[indexB]] = [fields[indexB], fields[indexA]];
    setFieldsRef({
      swapIndexA: indexA,
      swapIndexB: indexB,
    });
    setField([...fields]);
  };

  const move = (from: number, to: number) => {
    fields.splice(to, 0, fields.splice(from, 1)[0]);
    setFieldsRef({
      moveFromIndex: from,
      moveToIndex: to,
    });
    setField([...fields]);
  };

  const reset = (values: any) => {
    setFieldsRef();
    setField(mapIds(get(values, name)));
  };

  React.useEffect(() => {
    const resetFunctions = resetFieldArrayFunctionRef.current;
    const fieldArrayNames = fieldArrayNamesRef.current;
    fieldArrayNames.add(name);
    resetFunctions[name] = reset;

    return () => {
      setFieldsRef();
      delete resetFunctions[name];
      fieldArrayNames.delete(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return {
    swap,
    move,
    prepend,
    append,
    remove,
    insert,
    fields,
  };
}
