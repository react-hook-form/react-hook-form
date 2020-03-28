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
import fillEmptyArray from './utils/fillEmptyArray';
import {
  Field,
  FieldValues,
  UseFieldArrayProps,
  Control,
  ArrayField,
} from './types';

const { useEffect, useCallback, useRef, useState } = React;

export const useFieldArray = <
  FormArrayValues extends FieldValues = FieldValues,
  KeyName extends string = 'id',
  ControlProp extends Control = Control
>({
  control,
  name,
  keyName = 'id' as KeyName,
}: UseFieldArrayProps<KeyName, ControlProp>) => {
  const methods = useFormContext();
  const {
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    reRender,
    fieldsRef,
    getValues,
    defaultValuesRef,
    removeFieldEventListener,
    errorsRef,
    dirtyFieldsRef,
    isDirtyRef,
    touchedFieldsRef,
    readFormStateRef,
    watchFieldsRef,
    validFieldsRef,
    fieldsWithValidationRef,
    validateSchemaIsValid,
  } = control || methods.control;
  const memoizedDefaultValues = useRef(get(defaultValuesRef.current, name, []));
  const [fields, setField] = useState<
    Partial<ArrayField<FormArrayValues, KeyName>>[]
  >(mapIds(memoizedDefaultValues.current, keyName));
  const allFields = useRef(fields);

  allFields.current = fields;

  const appendValueWithKey = (value: Partial<FormArrayValues>[]) =>
    value.map((v: Partial<FormArrayValues>) => appendId(v, keyName));

  const commonTasks = (fieldsValues: any) => {
    setField(fieldsValues);

    if (readFormStateRef.current.isValid && validateSchemaIsValid) {
      validateSchemaIsValid({
        [name]: fieldsValues,
      });
    }
  };

  const resetFields = (flagOrFields?: Partial<FormArrayValues>[]) => {
    if (readFormStateRef.current.dirty) {
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
        allFields.current[i] = {
          ...allFields.current[i],
          ...currentFieldsValue[i],
        };
      }
    }
  };

  const append = (
    value: Partial<FormArrayValues> | Partial<FormArrayValues>[],
  ) => {
    if (readFormStateRef.current.dirty) {
      isDirtyRef.current = true;
      reRender();
    }
    commonTasks([
      ...allFields.current,
      ...(isArray(value)
        ? appendValueWithKey(value)
        : [appendId(value, keyName)]),
    ]);
  };

  const prepend = (
    value: Partial<FormArrayValues> | Partial<FormArrayValues>[],
  ) => {
    resetFields();
    commonTasks(
      prependAt(
        allFields.current,
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );

    if (errorsRef.current[name]) {
      errorsRef.current[name] = prependAt(
        errorsRef.current[name],
        fillEmptyArray(value),
      );
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = prependAt(
        touchedFieldsRef.current[name],
        fillEmptyArray(value),
      );
      reRender();
    }
  };

  const remove = (index?: number | number[]) => {
    let shouldRender = false;
    if (!isUndefined(index)) {
      mapCurrentFieldsValueWithState();
    }

    resetFields(
      removeArrayAt(getFieldValueByName(fieldsRef.current, name), index),
    );
    commonTasks(removeArrayAt(allFields.current, index));

    if (errorsRef.current[name]) {
      errorsRef.current[name] = removeArrayAt(errorsRef.current[name], index);
      if (!(errorsRef.current[name] as []).filter(Boolean).length) {
        delete errorsRef.current[name];
      }
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = removeArrayAt(
        touchedFieldsRef.current[name],
        index,
      );
      shouldRender = true;
    }

    if (readFormStateRef.current.dirty) {
      dirtyFieldsRef.current.forEach(dirtyField => {
        if (isUndefined(name) || dirtyField.startsWith(`${name}[${index}]`)) {
          dirtyFieldsRef.current.delete(dirtyField);
        }
      });
      shouldRender = true;
    }

    if (readFormStateRef.current.isValid && !validateSchemaIsValid) {
      let fieldIndex = -1;
      let isFound = false;
      const isIndexUndefined = isUndefined(index);

      while (fieldIndex++ < fields.length) {
        const isLast = fieldIndex === fields.length - 1;
        const isCurrentIndex =
          (isArray(index) ? index : [index]).indexOf(fieldIndex) >= 0;

        if (isCurrentIndex || isIndexUndefined) {
          isFound = true;
        }

        if (!isFound) {
          continue;
        }

        for (const key in fields[fieldIndex]) {
          const currentFieldName = `${name}[${fieldIndex}].${key}`;

          if (isCurrentIndex || isLast || isIndexUndefined) {
            validFieldsRef.current.delete(currentFieldName);
            fieldsWithValidationRef.current.delete(currentFieldName);
          } else {
            const previousFieldName = `${name}[${fieldIndex - 1}].${key}`;

            if (validFieldsRef.current.has(currentFieldName)) {
              validFieldsRef.current.add(previousFieldName);
            }
            if (fieldsWithValidationRef.current.has(currentFieldName)) {
              fieldsWithValidationRef.current.add(previousFieldName);
            }
          }
        }
      }

      shouldRender = true;
    }

    if (shouldRender) {
      reRender();
    }
  };

  const insert = (
    index: number,
    value: Partial<FormArrayValues> | Partial<FormArrayValues>[],
  ) => {
    mapCurrentFieldsValueWithState();
    resetFields(insertAt(getFieldValueByName(fieldsRef.current, name), index));
    commonTasks(
      insertAt(
        allFields.current,
        index,
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );

    if (errorsRef.current[name]) {
      errorsRef.current[name] = insertAt(
        errorsRef.current[name],
        index,
        fillEmptyArray(value),
      );
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = insertAt(
        touchedFieldsRef.current[name],
        index,
        fillEmptyArray(value),
      );
      reRender();
    }
  };

  const swap = (indexA: number, indexB: number) => {
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    swapArrayAt(allFields.current, indexA, indexB);
    commonTasks([...allFields.current]);

    if (errorsRef.current[name]) {
      swapArrayAt(errorsRef.current[name], indexA, indexB);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      swapArrayAt(touchedFieldsRef.current[name], indexA, indexB);
      reRender();
    }
  };

  const move = (from: number, to: number) => {
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    moveArrayAt(allFields.current, from, to);
    commonTasks([...allFields.current]);

    if (errorsRef.current[name]) {
      moveArrayAt(errorsRef.current[name], from, to);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      moveArrayAt(touchedFieldsRef.current[name], from, to);
      reRender();
    }
  };

  const reset = () => {
    resetFields();
    memoizedDefaultValues.current = get(defaultValuesRef.current, name, []);
    setField(mapIds(memoizedDefaultValues.current, keyName));
  };

  useEffect(() => {
    for (const watchField of watchFieldsRef.current) {
      if (watchField.startsWith(name)) {
        reRender();
        break;
      }
    }
  }, [fields, name, reRender, watchFieldsRef]);

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
  }, []);

  return {
    swap: useCallback(swap, []),
    move: useCallback(move, []),
    prepend: useCallback(prepend, []),
    append: useCallback(append, []),
    remove: useCallback(remove, [fields]),
    insert: useCallback(insert, []),
    fields,
  };
};
