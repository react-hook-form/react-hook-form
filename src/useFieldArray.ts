import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import getFieldValues from './logic/getFieldValues';
import transformToNestObject from './logic/transformToNestObject';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import removeArrayAt from './utils/remove';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import { FieldValues, Control, UseFieldArrayProps, WithFieldId } from './types';

const getValuesByName = <T, K extends keyof T>(fields: T, name: K, skip: any) =>
  !!skip && transformToNestObject(getFieldValues(fields))[name];

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

  const resetFields = (
    flagOrFields?: WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    if (isDirtyRef) {
      isDirtyRef.current = isUndefined(flagOrFields)
        ? true
        : getIsFieldsDifferent(flagOrFields, memoizedDefaultValues);
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name)) {
        unregister(key);
      }
    }
  };

  const prepend = (value: WithFieldId<Partial<FormArrayValues>>) => {
    resetFields();
    setField([appendId(value), ...fields]);
  };

  const append = (value: WithFieldId<Partial<FormArrayValues>>) => {
    if (isDirtyRef) {
      isDirtyRef.current = true;
    }
    setField([...fields, appendId(value)]);
  };

  const remove = (index?: number) => {
    resetFields(
      removeArrayAt(
        getValuesByName(fieldsRef.current, name, isDirtyRef),
        index,
      ),
    );
    setField(removeArrayAt(fields, index));
  };

  const insert = (
    index: number,
    value: WithFieldId<Partial<FormArrayValues>>,
  ) => {
    resetFields();
    setField([
      ...fields.slice(0, index),
      appendId(value),
      ...fields.slice(index),
    ]);
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getValuesByName(fieldsRef.current, name, isDirtyRef);
    swapArrayAt(fields, indexA, indexB);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    setField([...fields]);
  };

  const move = (from: number, to: number) => {
    const fieldValues = getValuesByName(fieldsRef.current, name, isDirtyRef);
    moveArrayAt(fields, from, to);
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    setField([...fields]);
  };

  const reset = (values: any) => {
    resetFields();
    setField(mapIds(get(values, name)));
  };

  React.useEffect(() => {
    const resetFunctions = resetFieldArrayFunctionRef.current;
    const fieldArrayNames = fieldArrayNamesRef.current;
    fieldArrayNames.add(name);
    resetFunctions[name] = reset;

    return () => {
      resetFields();
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
