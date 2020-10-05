import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import generateId from './logic/generateId';
import deepEqual from './utils/deepEqual';
import getFieldArrayParentName from './logic/getFieldArrayParentName';
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
import filterBooleanArray from './utils/filterBooleanArray';
import filterOutFalsy from './utils/filterOutFalsy';
import {
  Field,
  FieldValues,
  UseFieldArrayOptions,
  Control,
  ArrayField,
  UnpackNestedValue,
  DeepPartial,
} from './types';

const appendId = <TValue extends object, TKeyName extends string>(
  value: TValue,
  keyName: TKeyName,
): Partial<ArrayField<TValue, TKeyName>> => ({
  [keyName]: generateId(),
  ...value,
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

  if (process.env.NODE_ENV !== 'production') {
    if (!control && !methods) {
      throw new Error(
        '📋 useFieldArray is missing `control` prop. https://react-hook-form.com/api#useFieldArray',
      );
    }
  }

  const focusIndexRef = React.useRef(-1);
  const {
    isWatchAllRef,
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fieldsRef,
    defaultValuesRef,
    removeFieldEventListener,
    formStateRef,
    formStateRef: {
      current: { dirtyFields, touched },
    },
    shallowFieldsStateRef,
    updateFormState,
    readFormStateRef,
    watchFieldsRef,
    validFieldsRef,
    fieldsWithValidationRef,
    fieldArrayDefaultValuesRef,
    validateResolver,
    renderWatchedInputs,
    getValues,
    shouldUnregister,
  } = control || methods.control;

  const fieldArrayParentName = getFieldArrayParentName(name);
  const getDefaultValues = () => [
    ...(get(fieldArrayDefaultValuesRef.current, fieldArrayParentName)
      ? get(fieldArrayDefaultValuesRef.current, name, [])
      : get(
          shouldUnregister
            ? defaultValuesRef.current
            : shallowFieldsStateRef.current,
          name,
          [],
        )),
  ];
  const memoizedDefaultValues = React.useRef<Partial<TFieldArrayValues>[]>(
    getDefaultValues(),
  );
  const [fields, setFields] = React.useState<
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
  fieldArrayNamesRef.current.add(name);

  if (!get(fieldArrayDefaultValuesRef.current, fieldArrayParentName)) {
    set(
      fieldArrayDefaultValuesRef.current,
      fieldArrayParentName,
      get(defaultValuesRef.current, fieldArrayParentName),
    );
  }

  const appendValueWithKey = (values: Partial<TFieldArrayValues>[]) =>
    values.map((value: Partial<TFieldArrayValues>) => appendId(value, keyName));

  const setFieldAndValidState = (
    fieldsValues: Partial<ArrayField<TFieldArrayValues, TKeyName>>[],
  ) => {
    setFields(fieldsValues);

    if (readFormStateRef.current.isValid && validateResolver) {
      const values = {};
      set(values, name, fieldsValues);
      validateResolver(values);
    }
  };

  const getIsDirtyState = (
    flagOrFields?: (Partial<TFieldArrayValues> | undefined)[],
  ): boolean =>
    (readFormStateRef.current.isDirty ||
      readFormStateRef.current.dirtyFields) &&
    (isUndefined(flagOrFields) ||
      !deepEqual(
        flagOrFields.map(({ [keyName]: omitted, ...rest } = {}) => rest),
        get(defaultValuesRef.current, name),
      ));

  const resetFields = () => {
    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name) && fieldsRef.current[key]) {
        removeFieldEventListener(fieldsRef.current[key] as Field, true);
      }
    }
  };

  const cleanup = <T>(ref: T) =>
    !filterOutFalsy(get(ref, name, [])).length && unset(ref, name);

  const batchStateUpdate = <T extends Function>(
    method: T,
    args: {
      argA?: unknown;
      argB?: unknown;
      argC?: unknown;
      argD?: unknown;
    },
    isDirty = true,
    shouldSet = true,
    shouldUpdateValid = false,
  ) => {
    if (get(shallowFieldsStateRef.current, name)) {
      const output = method(
        get(shallowFieldsStateRef.current, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(shallowFieldsStateRef.current, name, output);
      cleanup(shallowFieldsStateRef.current);
    }

    if (get(fieldArrayDefaultValuesRef.current, name)) {
      const output = method(
        get(fieldArrayDefaultValuesRef.current, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(fieldArrayDefaultValuesRef.current, name, output);
      cleanup(fieldArrayDefaultValuesRef.current);
    }

    if (isArray(get(formStateRef.current.errors, name))) {
      const output = method(
        get(formStateRef.current.errors, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.current.errors, name, output);
      cleanup(formStateRef.current.errors);
    }

    if (readFormStateRef.current.touched && get(touched, name)) {
      const output = method(get(touched, name), args.argA, args.argB);
      shouldSet && set(touched, name, output);
      cleanup(touched);
    }

    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty
    ) {
      const output = method(get(dirtyFields, name, []), args.argC, args.argD);
      shouldSet && set(dirtyFields, name, output);
      cleanup(dirtyFields);
    }

    if (
      shouldUpdateValid &&
      readFormStateRef.current.isValid &&
      !validateResolver
    ) {
      set(
        validFieldsRef.current,
        name,
        method(get(validFieldsRef.current, name, []), args.argA),
      );
      cleanup(validFieldsRef.current);

      set(
        fieldsWithValidationRef.current,
        name,
        method(get(fieldsWithValidationRef.current, name, []), args.argA),
      );
      cleanup(fieldsWithValidationRef.current);
    }

    updateFormState({
      errors: formStateRef.current.errors,
      dirtyFields,
      isDirty,
      touched,
    });
  };

  const append = (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
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
      set(dirtyFields, name, [
        ...(isArray(get(dirtyFields, name))
          ? get(dirtyFields, name)
          : fillEmptyArray(allFields.current)),
        ...filterBooleanArray(value),
      ]);
      updateFormState({
        isDirty: true,
        dirtyFields,
      });
    }

    if (!shouldUnregister) {
      shallowFieldsStateRef.current[name] = [
        ...shallowFieldsStateRef.current[name],
        value,
      ];
    }
    focusIndexRef.current = shouldFocus ? allFields.current.length : -1;
  };

  const prepend = (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);

    setFieldAndValidState(
      prependAt(
        getCurrentFieldsValues(),
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );
    resetFields();
    batchStateUpdate(prependAt, {
      argA: emptyArray,
      argC: filterBooleanArray(value),
    });
    focusIndexRef.current = shouldFocus ? 0 : -1;
  };

  const remove = (index?: number | number[]) => {
    const fieldValues = getCurrentFieldsValues();
    setFieldAndValidState(removeArrayAt(fieldValues, index));
    resetFields();
    batchStateUpdate(
      removeArrayAt,
      {
        argA: index,
        argC: index,
      },
      getIsDirtyState(removeArrayAt(fieldValues, index)),
      true,
      true,
    );
  };

  const insert = (
    index: number,
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);
    const fieldValues = getCurrentFieldsValues();

    setFieldAndValidState(
      insertAt(
        fieldValues,
        index,
        isArray(value) ? appendValueWithKey(value) : [appendId(value, keyName)],
      ),
    );
    resetFields();
    batchStateUpdate(
      insertAt,
      {
        argA: index,
        argB: emptyArray,
        argC: index,
        argD: filterBooleanArray(value),
      },
      getIsDirtyState(insertAt(fieldValues, index)),
    );
    focusIndexRef.current = shouldFocus ? index : -1;
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getCurrentFieldsValues();
    swapArrayAt(fieldValues, indexA, indexB);
    resetFields();
    setFieldAndValidState([...fieldValues]);
    batchStateUpdate(
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
        argC: indexA,
        argD: indexB,
      },
      getIsDirtyState(fieldValues),
      false,
    );
  };

  const move = (from: number, to: number) => {
    const fieldValues = getCurrentFieldsValues();
    moveArrayAt(fieldValues, from, to);
    resetFields();
    setFieldAndValidState([...fieldValues]);
    batchStateUpdate(
      moveArrayAt,
      {
        argA: from,
        argB: to,
        argC: from,
        argD: to,
      },
      getIsDirtyState(fieldValues),
      false,
    );
  };

  const reset = <TFieldValues>(
    data?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ) => {
    resetFields();
    !data && unset(fieldArrayDefaultValuesRef.current, name);
    unset(shallowFieldsStateRef.current, name);
    memoizedDefaultValues.current = get(data || defaultValuesRef.current, name);
    setFields(mapIds(memoizedDefaultValues.current, keyName));
  };

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!name) {
        console.warn(
          '📋 useFieldArray is missing `name` attribute. https://react-hook-form.com/api#useFieldArray',
        );
      }
    }

    const defaultValues = get(fieldArrayDefaultValuesRef.current, name);

    if (defaultValues && fields.length < defaultValues.length) {
      defaultValues.pop();
      set(fieldArrayDefaultValuesRef.current, name, defaultValues);
    }

    if (isWatchAllRef.current) {
      updateFormState();
    } else if (watchFieldsRef) {
      let shouldRenderUseWatch = true;
      for (const watchField of watchFieldsRef.current) {
        if (watchField.startsWith(name)) {
          updateFormState();
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
  }, [fields, name]);

  React.useEffect(() => {
    const resetFunctions = resetFieldArrayFunctionRef.current;
    const fieldArrayNames = fieldArrayNamesRef.current;

    if (!getFieldArrayParentName(name)) {
      resetFunctions[name] = reset;
    }

    return () => {
      resetFields();
      delete resetFunctions[name];
      fieldArrayNames.delete(name);
    };
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [name]),
    insert: React.useCallback(insert, [name]),
    fields,
  };
};
