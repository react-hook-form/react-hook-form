import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import generateId from './logic/generateId';
import isObject from './utils/isObject';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import get from './utils/get';
import set from './utils/set';
import isUndefined from './utils/isUndefined';
import removeArrayAt from './utils/remove';
import unset from './utils/unset';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import prependAt from './utils/prepend';
import isArray from './utils/isArray';
import insertAt from './utils/insert';
import fillEmptyArray from './utils/fillEmptyArray';
import { filterBooleanArray } from './utils/filterBooleanArray';
import unique from './utils/unique';
import {
  Field,
  FieldValues,
  UseFieldArrayOptions,
  Control,
  ArrayField,
} from './types/form';

const appendId = <TValue extends object, TKeyName extends string>(
  value: TValue,
  keyName: TKeyName,
): Partial<ArrayField<TValue, TKeyName>> => ({
  [keyName]: generateId(),
  ...(isObject(value) ? value : { value }),
});

const mapIds = <TData extends object, TKeyName extends string>(
  data: TData | TData[],
  keyName: TKeyName,
) => (isArray(data) ? data : []).map((value) => appendId(value, keyName));

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
    getValues,
  } = control || methods.control;
  let shouldRender;

  const getDefaultValues = () => {
    const value = get(fieldArrayDefaultValues.current, name, []);

    return [
      ...(value.length ? value : get(defaultValuesRef.current, name, [])),
    ];
  };

  const memoizedDefaultValues = React.useRef<Partial<TFieldArrayValues>[]>(
    getDefaultValues(),
  );
  const [fields, setField] = React.useState<
    Partial<ArrayField<TFieldArrayValues, TKeyName>>[]
  >(mapIds(memoizedDefaultValues.current, keyName));
  const allFields = React.useRef<
    Partial<ArrayField<TFieldArrayValues, TKeyName>>[]
  >(fields);

  const getCurrentFieldsValues = () =>
    get(getValues() || {}, name, allFields.current).map(
      (item: Partial<TFieldArrayValues>, index: number) => ({
        ...allFields.current[index],
        ...item,
      }),
    );

  allFields.current = fields;

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

  const shouldRenderFieldArray = (shouldRender?: boolean) => {
    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty ||
      readFormStateRef.current.isValid
    ) {
      shouldRender = true;
    }

    renderWatchedInputs(name);

    shouldRender && !isWatchAllRef.current && reRender();
  };

  const resetFields = (
    flagOrFields?: (Partial<TFieldArrayValues> | undefined)[],
  ) => {
    if (
      readFormStateRef.current.isDirty ||
      readFormStateRef.current.dirtyFields
    ) {
      isDirtyRef.current =
        isUndefined(flagOrFields) ||
        getIsFieldsDifferent(
          flagOrFields.map(({ [keyName]: omitted, ...rest } = {}) => rest),
          get(defaultValuesRef.current, name, []),
        );
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
        removeFieldEventListener(fieldsRef.current[key] as Field, true);
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

    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty
    ) {
      dirtyFieldsRef.current[name] = [
        ...(dirtyFieldsRef.current[name] || fillEmptyArray(fields.slice(0, 1))),
        ...filterBooleanArray(value),
      ];
      isDirtyRef.current = true;
      shouldRender = true;
    }

    focusIndexRef.current = shouldFocus ? allFields.current.length : -1;

    shouldRenderFieldArray(shouldRender);
  };

  const prepend = (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);
    shouldRender = false;

    setFieldAndValidState(
      prependAt(
        getCurrentFieldsValues(),
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );
    resetFields();

    if (isArray(get(errorsRef.current, name))) {
      errorsRef.current[name] = prependAt(
        get(errorsRef.current, name),
        emptyArray,
      );
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = prependAt(
        touchedFieldsRef.current[name],
        emptyArray,
      );
      shouldRender = true;
    }

    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty
    ) {
      dirtyFieldsRef.current[name] = prependAt(
        dirtyFieldsRef.current[name] || [],
        filterBooleanArray(value),
      );
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);
    focusIndexRef.current = shouldFocus ? 0 : -1;
  };

  const remove = (index?: number | number[]) => {
    shouldRender = false;

    const fieldValues = getCurrentFieldsValues();
    setFieldAndValidState(removeArrayAt(fieldValues, index));
    resetFields(removeArrayAt(fieldValues, index));

    if (isArray(get(errorsRef.current, name))) {
      set(
        errorsRef.current,
        name,
        removeArrayAt(get(errorsRef.current, name), index),
      );

      if (!unique(get(errorsRef.current, name, [])).length) {
        unset(errorsRef.current, name);
      }
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      touchedFieldsRef.current[name] = removeArrayAt(
        touchedFieldsRef.current[name],
        index,
      );
      shouldRender = true;
    }

    if (
      (readFormStateRef.current.dirtyFields ||
        readFormStateRef.current.isDirty) &&
      dirtyFieldsRef.current[name]
    ) {
      dirtyFieldsRef.current[name] = removeArrayAt(
        dirtyFieldsRef.current[name],
        index,
      );

      if (!dirtyFieldsRef.current[name].length) {
        delete dirtyFieldsRef.current[name];
      }

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

    shouldRenderFieldArray(shouldRender);
  };

  const insert = (
    index: number,
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    shouldRender = false;
    const emptyArray = fillEmptyArray(value);
    const fieldValues = getCurrentFieldsValues();

    setFieldAndValidState(
      insertAt(
        fieldValues,
        index,
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );
    resetFields(insertAt(fieldValues, index));

    if (isArray(get(errorsRef.current, name))) {
      errorsRef.current[name] = insertAt(
        get(errorsRef.current, name),
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

    if (
      (readFormStateRef.current.dirtyFields ||
        readFormStateRef.current.isDirty) &&
      dirtyFieldsRef.current[name]
    ) {
      dirtyFieldsRef.current[name] = insertAt(
        dirtyFieldsRef.current[name],
        index,
        filterBooleanArray(value),
      );
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);

    focusIndexRef.current = shouldFocus ? index : -1;
  };

  const swap = (indexA: number, indexB: number) => {
    shouldRender = false;

    const fieldValues = getCurrentFieldsValues();
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields(fieldValues);
    setFieldAndValidState([...fieldValues]);

    if (isArray(get(errorsRef.current, name))) {
      swapArrayAt(get(errorsRef.current, name), indexA, indexB);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      swapArrayAt(touchedFieldsRef.current[name], indexA, indexB);
      shouldRender = true;
    }

    if (
      (readFormStateRef.current.dirtyFields ||
        readFormStateRef.current.isDirty) &&
      dirtyFieldsRef.current[name]
    ) {
      swapArrayAt(dirtyFieldsRef.current[name], indexA, indexB);
      shouldRender = true;
    }

    shouldRenderFieldArray(shouldRender);
  };

  const move = (from: number, to: number) => {
    shouldRender = false;
    const fieldValues = getCurrentFieldsValues();
    moveArrayAt(fieldValues, from, to);
    resetFields(fieldValues);
    setFieldAndValidState([...fieldValues]);

    if (isArray(get(errorsRef.current, name))) {
      moveArrayAt(get(errorsRef.current, name), from, to);
    }

    if (readFormStateRef.current.touched && touchedFieldsRef.current[name]) {
      moveArrayAt(touchedFieldsRef.current[name], from, to);
      shouldRender = true;
    }

    if (
      (readFormStateRef.current.dirtyFields ||
        readFormStateRef.current.isDirty) &&
      dirtyFieldsRef.current[name]
    ) {
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
    const defaultValues = get(fieldArrayDefaultValues.current, name);

    if (defaultValues && fields.length < defaultValues.length) {
      set(fieldArrayDefaultValues.current, name, defaultValues.pop());
    }

    if (isWatchAllRef.current) {
      reRender();
    } else if (watchFieldsRef) {
      let shouldRenderUseWatch = true;
      for (const watchField of watchFieldsRef.current) {
        if (watchField.startsWith(name)) {
          reRender();
          shouldRenderUseWatch = false;
          break;
        }
      }

      shouldRenderUseWatch && renderWatchedInputs(name);
    }

    if (focusIndexRef.current > -1) {
      for (const key in fieldsRef.current) {
        const field = fieldsRef.current[key];
        if (
          key.startsWith(`${name}[${focusIndexRef.current}]`) &&
          field!.ref.focus
        ) {
          field!.ref.focus();
          break;
        }
      }
    }

    focusIndexRef.current = -1;
  }, [
    fields,
    name,
    fieldArrayDefaultValues,
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

    set(fieldArrayDefaultValues.current, name, memoizedDefaultValues.current);

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
