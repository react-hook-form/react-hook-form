import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import getFieldValueByName from './logic/getFieldValueByName';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import removeArrayAt from './utils/remove';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import prependAt from './utils/prepend';
import isArray from './utils/isArray';
import insertAt from './utils/insert';
import {
  FieldValues,
  Control,
  UseFieldArrayProps,
  WithFieldId,
  Field,
} from './types';

const { useMemo, useEffect, useRef, useState } = React;

export function useFieldArray<
  FormArrayValues extends FieldValues = FieldValues,
  ControlProp extends Control = Control
>({ control, name }: UseFieldArrayProps<ControlProp>) {
  const methods = useFormContext();
  const {
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fieldsRef,
    getValues,
    defaultValuesRef,
    removeFieldEventListener,
    errorsRef,
    isDirtyRef,
    touchedFieldsRef,
    readFormStateRef,
  } = control || methods.control;
  const memoizedDefaultValues = useRef(get(defaultValuesRef.current, name, []));
  const [fields, setField] = useState<WithFieldId<Partial<FormArrayValues>>[]>(
    mapIds(memoizedDefaultValues.current),
  );
  const { isReadStateDirty, isReadStateTouched } = useMemo(
    () => ({
      isReadStateDirty: readFormStateRef.current.dirty,
      isReadStateTouched: readFormStateRef.current.touched,
    }),
    [readFormStateRef],
  );

  const resetFields = (
    flagOrFields?: WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    if (isReadStateDirty) {
      isDirtyRef.current = isUndefined(flagOrFields)
        ? true
        : getIsFieldsDifferent(flagOrFields, memoizedDefaultValues.current);
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
        removeFieldEventListener(fieldsRef.current[key] as Field, true);
      }
    }
  };

  const mapCurrentFieldsValueWithState = () => {
    const currentFieldsValue = getValues({ nest: true })[name];

    if (isArray(currentFieldsValue)) {
      for (let i = 0; i < currentFieldsValue.length; i++) {
        fields[i] = {
          ...fields[i],
          ...currentFieldsValue[i],
        };
      }
    }
  };

  const append = (value: WithFieldId<Partial<FormArrayValues>>) => {
    if (isReadStateDirty) {
      isDirtyRef.current = true;
    }
    setField([...fields, appendId(value)]);
  };

  const prepend = (value: WithFieldId<Partial<FormArrayValues>>) => {
    mapCurrentFieldsValueWithState();
    resetFields();
    setField(prependAt(fields, appendId(value)));

    if (errorsRef.current[name]) {
      errorsRef.current[name] = prependAt(errorsRef.current[name]);
    }

    if (isReadStateTouched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = prependAt(
        touchedFieldsRef.current[name],
      );
    }
  };

  const remove = (index?: number) => {
    if (!isUndefined(index)) {
      mapCurrentFieldsValueWithState();
    }

    resetFields(
      removeArrayAt(getFieldValueByName(fieldsRef.current, name), index),
    );
    setField(removeArrayAt(fields, index));

    if (errorsRef.current[name]) {
      errorsRef.current[name] = removeArrayAt(errorsRef.current[name], index);
    }

    if (isReadStateTouched && touchedFieldsRef.current[name]) {
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
    mapCurrentFieldsValueWithState();
    resetFields(insertAt(getFieldValueByName(fieldsRef.current, name), index));
    setField(insertAt(fields, index, appendId(value)));

    if (errorsRef.current[name]) {
      errorsRef.current[name] = insertAt(errorsRef.current[name], index);
    }

    if (isReadStateTouched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = insertAt(
        touchedFieldsRef.current[name],
        index,
      );
    }
  };

  const swap = (indexA: number, indexB: number) => {
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    swapArrayAt(fields, indexA, indexB);
    setField([...fields]);

    if (errorsRef.current[name]) {
      swapArrayAt(errorsRef.current[name], indexA, indexB);
    }

    if (isReadStateTouched && touchedFieldsRef.current[name]) {
      swapArrayAt(touchedFieldsRef.current[name], indexA, indexB);
    }
  };

  const move = (from: number, to: number) => {
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    moveArrayAt(fields, from, to);
    setField([...fields]);

    if (errorsRef.current[name]) {
      moveArrayAt(errorsRef.current[name], from, to);
    }

    if (isReadStateTouched && touchedFieldsRef.current[name]) {
      moveArrayAt(touchedFieldsRef.current[name], from, to);
    }
  };

  const reset = () => {
    resetFields();
    memoizedDefaultValues.current = get(defaultValuesRef.current, name, []);
    setField(mapIds(memoizedDefaultValues.current));
  };

  useEffect(() => {
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
