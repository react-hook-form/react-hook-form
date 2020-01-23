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
import prependAt from './utils/prepend';
import insertAt from './utils/insert';
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
    removeRef,
    errorsRef,
    isDirtyRef,
    touchedFieldsRef,
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
        if (
          fieldsRef.current[key] &&
          (fieldsRef.current[key] as any).ref instanceof HTMLElement
        ) {
          removeRef(fieldsRef.current[key], true);
          delete fieldsRef.current[name];
        }
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
    setField(prependAt(fields, appendId(value)));
    if (errorsRef.current[name]) {
      errorsRef.current[name] = prependAt(errorsRef.current[name]);
    }
    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = prependAt(
        touchedFieldsRef.current[name],
      );
    }
  };

  const remove = (index?: number) => {
    resetFields(
      removeArrayAt(getFieldValuesByName(fieldsRef.current, name), index),
    );
    setField(removeArrayAt(fields, index));
    if (errorsRef.current[name]) {
      errorsRef.current[name] = removeArrayAt(errorsRef.current[name], index);
    }
    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = removeArrayAt(
        touchedFieldsRef.current[name],
        index,
      );
    }
  };

  const insert = (
    index: number,
    value: WithFieldId<Partial<FormArrayValues>>,
  ) => {
    resetFields();
    setField(insertAt(fields, index, appendId(value)));
    if (errorsRef.current[name]) {
      errorsRef.current[name] = insertAt(errorsRef.current[name], index);
    }
    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = insertAt(
        touchedFieldsRef.current[name],
        index,
      );
    }
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getFieldValuesByName(fieldsRef.current, name);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    swapArrayAt(fields, indexA, indexB);
    setField([...fields]);
    if (errorsRef.current[name]) {
      swapArrayAt(errorsRef.current[name], indexA, indexB);
    }
    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      swapArrayAt(touchedFieldsRef.current[name], indexA, indexB);
    }
  };

  const move = (from: number, to: number) => {
    const fieldValues = getFieldValuesByName(fieldsRef.current, name);
    moveArrayAt(getFieldValuesByName(fieldsRef.current, name), from, to);
    resetFields(fieldValues);
    moveArrayAt(fields, from, to);
    setField([...fields]);
    if (errorsRef.current[name]) {
      moveArrayAt(errorsRef.current[name] as [], from, to);
    }
    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      moveArrayAt(touchedFieldsRef.current[name], from, to);
    }
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
