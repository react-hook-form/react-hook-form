import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import getFieldValueByName from './logic/getFieldArrayValueByName';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import getFieldArrayParentName from './logic/getFieldArrayParentName';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import removeArrayAt from './utils/remove';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import prependAt from './utils/prepend';
import isArray from './utils/isArray';
import insertAt from './utils/insert';
import isKey from './utils/isKey';
import fillEmptyArray from './utils/fillEmptyArray';
import isEmptyObject from './utils/isEmptyObject';
import { filterBooleanArray } from './utils/filterBooleanArray';
import unique from './utils/unique';
import {
  Field,
  FieldValues,
  UseFieldArrayOptions,
  Control,
  ArrayField,
} from './types/form';

export const useFieldArray = <
  TFieldArrayValues extends FieldValues = FieldValues,
  TKeyName extends string = 'id',
  TControl extends Control = Control
>({
  control,
  name,
  keyName = 'id' as TKeyName,
}: UseFieldArrayOptions<TKeyName, TControl>) => {
  const methods = useFormContext();
  const focusIndexRef = React.useRef(-1);
  const {
    isWatchAllRef,
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
    fieldArrayDefaultValues,
    validateSchemaIsValid,
    renderWatchedInputs,
  } = control || methods.control;
  let shouldRender;

  const getDefaultValues = () => [
    ...get(
      fieldArrayDefaultValues.current[getFieldArrayParentName(name)]
        ? fieldArrayDefaultValues.current
        : defaultValuesRef.current,
      name,
      [],
    ),
  ];
  const memoizedDefaultValues = React.useRef<Partial<TFieldArrayValues>[]>(
    getDefaultValues(),
  );
  const [fields, setField] = React.useState<
    Partial<ArrayField<TFieldArrayValues, TKeyName>>[]
  >(mapIds(memoizedDefaultValues.current, keyName));
  const [isDeleted, setIsDeleted] = React.useState(false);
  const allFields = React.useRef<
    Partial<ArrayField<TFieldArrayValues, TKeyName>>[]
  >(fields);
  const isNameKey = isKey(name);
  const isReadingDirty =
    readFormStateRef.current.dirtyFields || readFormStateRef.current.isDirty;

  allFields.current = fields;

  if (isNameKey) {
    fieldArrayDefaultValues.current[name] = memoizedDefaultValues.current;
  }

  const appendValueWithKey = (values: Partial<TFieldArrayValues>[]) =>
    values.map((value: Partial<TFieldArrayValues>) => appendId(value, keyName));

  const setFieldAndValidState = (
    fieldsValues: Partial<ArrayField<TFieldArrayValues, TKeyName>>[],
  ) => {
    setField(fieldsValues);

    if (readFormStateRef.current.isValid && validateSchemaIsValid) {
      validateSchemaIsValid({
        [name]: fieldsValues,
      });
    }
  };

  const shouldRenderFieldArray = (
    shouldRender: boolean,
    shouldUpdateDirty = true,
  ) => {
    if (shouldUpdateDirty && isReadingDirty) {
      isDirtyRef.current = !isEmptyObject(dirtyFieldsRef.current);
      shouldRender = true;
    }

    renderWatchedInputs(name);

    shouldRender && !isWatchAllRef.current && reRender();
  };

  const resetFields = (
    flagOrFields?: (Partial<TFieldArrayValues> | null)[],
  ) => {
    if (readFormStateRef.current.isDirty) {
      isDirtyRef.current = isUndefined(flagOrFields)
        ? true
        : getIsFieldsDifferent(
            flagOrFields,
            defaultValuesRef.current[name] || [],
          );
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
        removeFieldEventListener(fieldsRef.current[key] as Field, true);
      }
    }
  };

  const mapCurrentFieldsValueWithState = () => {
    const currentFieldsValue: Partial<TFieldArrayValues>[] = get(
      getValues(),
      name,
    );

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
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    shouldRender = false;
    setFieldAndValidState([
      ...allFields.current,
      ...(isArray(value)
        ? appendValueWithKey(value)
        : [appendId(value, keyName)]),
    ]);

    if (readFormStateRef.current.dirtyFields) {
      dirtyFieldsRef.current[name] = [
        ...(dirtyFieldsRef.current[name] || fillEmptyArray(fields)),
        ...filterBooleanArray(value),
      ];
      shouldRender = true;
    }

    focusIndexRef.current = shouldFocus ? fields.length : -1;

    shouldRenderFieldArray(shouldRender);
  };

  const prepend = (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);
    shouldRender = false;

    resetFields();
    setFieldAndValidState(
      prependAt(
        allFields.current,
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );

    if (isArray(errorsRef.current[name])) {
      errorsRef.current[name] = prependAt(errorsRef.current[name], emptyArray);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = prependAt(
        touchedFieldsRef.current[name],
        emptyArray,
      );
      shouldRender = true;
    }

    if (isReadingDirty && dirtyFieldsRef.current[name]) {
      dirtyFieldsRef.current[name] = prependAt(
        dirtyFieldsRef.current[name],
        filterBooleanArray(value),
      );
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);
    focusIndexRef.current = shouldFocus ? 0 : -1;
  };

  const remove = (index?: number | number[]) => {
    const isIndexUndefined = isUndefined(index);
    shouldRender = false;

    if (!isIndexUndefined) {
      mapCurrentFieldsValueWithState();
    }

    resetFields(
      removeArrayAt(getFieldValueByName(fieldsRef.current, name), index),
    );
    setFieldAndValidState(removeArrayAt(allFields.current, index));
    setIsDeleted(true);

    if (isArray(errorsRef.current[name])) {
      errorsRef.current[name] = removeArrayAt(errorsRef.current[name], index);
      if (!unique(errorsRef.current[name]).length) {
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

    if (isReadingDirty && dirtyFieldsRef.current[name]) {
      dirtyFieldsRef.current[name] = removeArrayAt(
        dirtyFieldsRef.current[name],
        index,
      );
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
    }

    shouldRenderFieldArray(shouldRender, false);
  };

  const insert = (
    index: number,
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
  ) => {
    shouldRender = false;
    const emptyArray = fillEmptyArray(value);

    mapCurrentFieldsValueWithState();
    resetFields(insertAt(getFieldValueByName(fieldsRef.current, name), index));
    setFieldAndValidState(
      insertAt(
        allFields.current,
        index,
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );

    if (isArray(errorsRef.current[name])) {
      errorsRef.current[name] = insertAt(
        errorsRef.current[name],
        index,
        emptyArray,
      );
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = insertAt(
        touchedFieldsRef.current[name],
        index,
        emptyArray,
      );
      shouldRender = true;
    }

    if (isReadingDirty && dirtyFieldsRef.current[name]) {
      dirtyFieldsRef.current[name] = insertAt(
        dirtyFieldsRef.current[name],
        index,
        filterBooleanArray(value),
      );
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);
  };

  const swap = (indexA: number, indexB: number) => {
    shouldRender = false;

    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    swapArrayAt(allFields.current, indexA, indexB);
    setFieldAndValidState([...allFields.current]);

    if (isArray(errorsRef.current[name])) {
      swapArrayAt(errorsRef.current[name], indexA, indexB);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      swapArrayAt(touchedFieldsRef.current[name], indexA, indexB);
      reRender();
      shouldRender = true;
    }

    if (isReadingDirty && dirtyFieldsRef.current[name]) {
      swapArrayAt(dirtyFieldsRef.current[name], indexA, indexB);
      reRender();
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);
  };

  const move = (from: number, to: number) => {
    shouldRender = false;
    mapCurrentFieldsValueWithState();
    const fieldValues = getFieldValueByName(fieldsRef.current, name);
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    moveArrayAt(allFields.current, from, to);
    setFieldAndValidState([...allFields.current]);

    if (isArray(errorsRef.current[name])) {
      moveArrayAt(errorsRef.current[name], from, to);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      moveArrayAt(touchedFieldsRef.current[name], from, to);
      shouldRender = true;
    }

    if (isReadingDirty && dirtyFieldsRef.current[name]) {
      moveArrayAt(dirtyFieldsRef.current[name], from, to);
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);
  };

  const reset = () => {
    resetFields();
    memoizedDefaultValues.current = getDefaultValues();
    setField(mapIds(memoizedDefaultValues.current, keyName));
  };

  React.useEffect(() => {
    if (
      isNameKey &&
      isDeleted &&
      fieldArrayDefaultValues.current[name] &&
      fields.length < fieldArrayDefaultValues.current[name].length
    ) {
      fieldArrayDefaultValues.current[name].pop();
    }

    if (isWatchAllRef && isWatchAllRef.current) {
      reRender();
    } else if (watchFieldsRef) {
      for (const watchField of watchFieldsRef.current) {
        if (watchField.startsWith(name)) {
          reRender();
          break;
        }
      }
    }

    if (focusIndexRef.current > -1) {
      for (const key in fieldsRef.current) {
        const field = fieldsRef.current[key];
        if (
          key.startsWith(`${name}[${focusIndexRef.current}]`) &&
          field!.ref.focus
        ) {
          field!.ref.focus();
        }
      }
    }
  }, [
    fields,
    name,
    fieldArrayDefaultValues,
    isDeleted,
    isNameKey,
    reRender,
    fieldsRef,
    watchFieldsRef,
    isWatchAllRef,
  ]);

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
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [fields, name]),
    insert: React.useCallback(insert, [name]),
    fields,
  };
};
