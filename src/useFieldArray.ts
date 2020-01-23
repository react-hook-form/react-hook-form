import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import transformToNestObject from './logic/transformToNestObject';
import getFieldsValues from './logic/getFieldsValues';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import removeArrayAt from './utils/remove';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
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
    readFormStateRef,
  } = control || methods.control;
  const memoizedDefaultValues = React.useRef(
    get(defaultValuesRef.current, name, []),
  );
  const [fields, setField] = React.useState<
    WithFieldId<Partial<FormArrayValues>>[]
  >(mapIds(memoizedDefaultValues.current));
  const getFieldValuesByName = <T, K extends keyof T>(fields: T, name: K) =>
    transformToNestObject(getFieldsValues(fields))[name];

  const resetFields = (
    flagOrFields?: WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    if (readFormStateRef.current.dirty) {
      isDirtyRef.current = isUndefined(flagOrFields)
        ? true
        : getIsFieldsDifferent(flagOrFields, memoizedDefaultValues.current);
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name)) {
        unregister(key);
      }
    }
  };

  const append = (value: WithFieldId<Partial<FormArrayValues>>) => {
    if (readFormStateRef.current.dirty) {
      isDirtyRef.current = true;
    }
    setField([...fields, appendId(value)]);
  };

  const prepend = (value: WithFieldId<Partial<FormArrayValues>>) => {
    resetFields();
    setField([appendId(value), ...fields]);
  };

  const remove = (index?: number) => {
    const updatedFields = removeArrayAt(
      getFieldValuesByName(fieldsRef.current, name),
      index,
    );
    resetFields(updatedFields);
    setField(mapIds(updatedFields));
  };

  const insert = (
    index: number,
    value: WithFieldId<Partial<FormArrayValues>>,
  ) => {
    const fieldValues = getFieldValuesByName(fieldsRef.current, name);
    resetFields();
    setField([
      ...fieldValues.slice(0, index),
      appendId(value),
      ...fieldValues.slice(index),
    ]);
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getFieldValuesByName(fieldsRef.current, name);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    setField(fieldValues);
  };

  const move = (from: number, to: number) => {
    const fieldValues = getFieldValuesByName(fieldsRef.current, name);
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    setField(fieldValues);
  };

  const reset = () => {
    resetFields();
    memoizedDefaultValues.current = get(defaultValuesRef.current, name, []);
    setField(mapIds(memoizedDefaultValues.current));
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
