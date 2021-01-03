import * as React from 'react';
import { useFormContext } from './useFormContext';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import mapIds from './logic/mapId';
import getFieldArrayParentName from './logic/getNodeParentName';
import get from './utils/get';
import set from './utils/set';
import removeArrayAt from './utils/remove';
import unset from './utils/unset';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import prependAt from './utils/prepend';
import insertAt from './utils/insert';
import fillEmptyArray from './utils/fillEmptyArray';
import fillBooleanArray from './utils/fillBooleanArray';
import compact from './utils/compact';
import cloneObject from './utils/cloneObject';
import {
  FieldValues,
  UseFieldArrayProps,
  Path,
  ArrayFieldWithId,
  UnpackNestedValue,
  DeepPartial,
  UseFieldArrayMethods,
  ArrayField,
  InternalFieldName,
} from './types';

export const useFieldArray = <
  TFieldArrayValues extends FieldValues = FieldValues,
  TName extends Path<TFieldArrayValues> = Path<TFieldArrayValues>,
  TKeyName extends string = 'id'
>({
  control,
  name,
  keyName = 'id' as TKeyName,
}: UseFieldArrayProps<
  TFieldArrayValues,
  TName,
  TKeyName
>): UseFieldArrayMethods<TFieldArrayValues, TName, TKeyName> => {
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
    watchFieldsRef,
    isFormDirty,
    watchSubjectRef,
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fieldsRef,
    defaultValuesRef,
    formStateRef,
    formStateSubjectRef,
    readFormStateRef,
    validFieldsRef,
    fieldsWithValidationRef,
    fieldArrayDefaultValuesRef,
    updateIsValid,
    getValues,
    fieldArrayValuesRef,
  } = control || methods.control;

  const fieldArrayParentName = getFieldArrayParentName(
    name as InternalFieldName,
  );
  const memoizedDefaultValues = React.useRef<Partial<TFieldArrayValues>[]>([
    ...(get(fieldArrayDefaultValuesRef.current, fieldArrayParentName)
      ? get(fieldArrayDefaultValuesRef.current, name as InternalFieldName, [])
      : get(defaultValuesRef.current, name as InternalFieldName, [])),
  ]);
  const [fields, setFields] = React.useState<
    Partial<ArrayFieldWithId<TFieldArrayValues, TName, TKeyName>>[]
  >(mapIds(memoizedDefaultValues.current, keyName));
  set(fieldArrayValuesRef.current, name as InternalFieldName, fields);

  const omitKey = <T extends (Partial<TFieldArrayValues> | undefined)[]>(
    fields: T,
  ) => fields.map(({ [keyName]: omitted, ...rest } = {}) => rest);

  fieldArrayNamesRef.current.add(name as InternalFieldName);

  const getFieldArrayValue = React.useCallback(
    () => get(fieldArrayValuesRef.current, name as InternalFieldName, []),
    [name],
  );

  const getCurrentFieldsValues = () =>
    mapIds<TFieldArrayValues, TKeyName>(
      get(getValues(), name as InternalFieldName, getFieldArrayValue()).map(
        (item: Partial<TFieldArrayValues>, index: number) => ({
          ...getFieldArrayValue()[index],
          ...item,
        }),
      ),
      keyName,
      true,
    );

  fieldArrayNamesRef.current.add(name as InternalFieldName);

  if (
    fieldArrayParentName &&
    !get(fieldArrayDefaultValuesRef.current, fieldArrayParentName)
  ) {
    set(
      fieldArrayDefaultValuesRef.current,
      fieldArrayParentName,
      cloneObject(get(defaultValuesRef.current, fieldArrayParentName)),
    );
  }

  const setFieldAndValidState = (
    fieldsValues: Partial<
      ArrayFieldWithId<TFieldArrayValues, TName, TKeyName>
    >[],
  ) => {
    setFields(fieldsValues);

    if (readFormStateRef.current.isValid) {
      const values = getValues();
      set(values, name as InternalFieldName, fieldsValues);
      updateIsValid(values);
    }
  };

  const resetFields = () => {
    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name as InternalFieldName)) {
        delete fieldsRef.current[key];
      }
    }
  };

  const cleanup = <T>(ref: T) =>
    !compact(get(ref, name as InternalFieldName, [])).length &&
    unset(ref, name as InternalFieldName);

  const updateDirtyFieldsWithDefaultValues = <
    T extends (Partial<TFieldArrayValues> | undefined)[]
  >(
    updatedFieldArrayValues?: T,
  ) => {
    if (updatedFieldArrayValues) {
      set(
        formStateRef.current.dirty,
        name as InternalFieldName,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues),
          get(defaultValuesRef.current, name as InternalFieldName, []),
          get(formStateRef.current.dirty, name as InternalFieldName, []),
        ),
      );
    }
  };

  const batchStateUpdate = <
    T extends Function,
    K extends (Partial<TFieldArrayValues> | undefined)[]
  >(
    method: T,
    args: {
      argA?: unknown;
      argB?: unknown;
      argC?: unknown;
      argD?: unknown;
    },
    updatedFieldValues?: K,
    updatedFormValues: (Partial<TFieldArrayValues> | undefined)[] = [],
    shouldSet = true,
    shouldUpdateValid = false,
  ) => {
    if (get(fieldArrayDefaultValuesRef.current, name as InternalFieldName)) {
      const output = method(
        get(fieldArrayDefaultValuesRef.current, name as InternalFieldName),
        args.argA,
        args.argB,
      );
      shouldSet &&
        set(
          fieldArrayDefaultValuesRef.current,
          name as InternalFieldName,
          output,
        );
      cleanup(fieldArrayDefaultValuesRef.current);
    }

    if (
      Array.isArray(get(formStateRef.current.errors, name as InternalFieldName))
    ) {
      const output = method(
        get(formStateRef.current.errors, name as InternalFieldName),
        args.argA,
        args.argB,
      );
      shouldSet &&
        set(formStateRef.current.errors, name as InternalFieldName, output);
      cleanup(formStateRef.current.errors);
    }

    if (
      readFormStateRef.current.touched &&
      get(formStateRef.current.touched, name as InternalFieldName)
    ) {
      const output = method(
        get(formStateRef.current.touched, name as InternalFieldName),
        args.argA,
        args.argB,
      );
      shouldSet &&
        set(formStateRef.current.touched, name as InternalFieldName, output);
      cleanup(formStateRef.current.touched);
    }

    if (readFormStateRef.current.dirty || readFormStateRef.current.isDirty) {
      set(
        formStateRef.current.dirty,
        name as InternalFieldName,
        setFieldArrayDirtyFields(
          omitKey(updatedFormValues),
          get(defaultValuesRef.current, name as InternalFieldName, []),
          get(formStateRef.current.dirty, name as InternalFieldName, []),
        ),
      );
      updateDirtyFieldsWithDefaultValues(updatedFieldValues);
      cleanup(formStateRef.current.dirty);
    }

    if (shouldUpdateValid && readFormStateRef.current.isValid) {
      set(
        validFieldsRef.current,
        name as InternalFieldName,
        method(
          get(validFieldsRef.current, name as InternalFieldName, []),
          args.argA,
        ),
      );
      cleanup(validFieldsRef.current);

      set(
        fieldsWithValidationRef.current,
        name as InternalFieldName,
        method(
          get(fieldsWithValidationRef.current, name as InternalFieldName, []),
          args.argA,
        ),
      );
      cleanup(fieldsWithValidationRef.current);
    }

    formStateSubjectRef.current.next({
      isDirty: isFormDirty(
        name as InternalFieldName,
        omitKey(updatedFormValues),
      ),
      // @ts-ignore
      errors: formStateRef.current.errors,
      isValid: formStateRef.current.isValid,
    });
  };

  const append = (
    value:
      | Partial<ArrayField<TFieldArrayValues, TName>>
      | Partial<ArrayField<TFieldArrayValues, TName>>[],
    shouldFocus = true,
  ) => {
    const appendValue = Array.isArray(value) ? value : [value];
    const updateFormValues = [
      ...getCurrentFieldsValues(),
      ...mapIds(appendValue, keyName),
    ];
    setFieldAndValidState(updateFormValues);

    if (readFormStateRef.current.dirty || readFormStateRef.current.isDirty) {
      updateDirtyFieldsWithDefaultValues(updateFormValues);

      formStateSubjectRef.current.next({
        isDirty: true,
        // @ts-ignore
        dirty: formStateRef.current.dirty,
      });
    }

    focusIndexRef.current = shouldFocus
      ? get(fieldArrayValuesRef.current, name as InternalFieldName).length - 1
      : -1;
  };

  const prepend = (
    value:
      | Partial<ArrayField<TFieldArrayValues, TName>>
      | Partial<ArrayField<TFieldArrayValues, TName>>[],
    shouldFocus = true,
  ) => {
    const updatedFieldArrayValues = prependAt(
      getCurrentFieldsValues(),
      mapIds(Array.isArray(value) ? value : [value], keyName),
    );
    setFieldAndValidState(updatedFieldArrayValues);
    batchStateUpdate(
      prependAt,
      {
        argA: fillEmptyArray(value),
        argC: fillBooleanArray(value),
      },
      updatedFieldArrayValues,
    );
    focusIndexRef.current = shouldFocus ? 0 : -1;
  };

  const remove = (index?: number | number[]) => {
    const fieldValues = getCurrentFieldsValues();
    const updatedFieldValues: (
      | Partial<TFieldArrayValues>
      | undefined
    )[] = removeArrayAt(fieldValues, index);
    resetFields();
    batchStateUpdate(
      removeArrayAt,
      {
        argA: index,
        argC: index,
      },
      updatedFieldValues,
      removeArrayAt(fieldValues, index),
      true,
      true,
    );
    setFieldAndValidState(updatedFieldValues as any);
  };

  const insert = (
    index: number,
    value:
      | Partial<ArrayField<TFieldArrayValues, TName>>
      | Partial<ArrayField<TFieldArrayValues, TName>>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);
    const fieldValues = getCurrentFieldsValues();
    const updatedFieldArrayValues = insertAt(
      fieldValues,
      index,
      mapIds(Array.isArray(value) ? value : [value], keyName),
    );

    setFieldAndValidState(updatedFieldArrayValues);
    batchStateUpdate(
      insertAt,
      {
        argA: index,
        argB: emptyArray,
        argC: index,
        argD: fillBooleanArray(value),
      },
      updatedFieldArrayValues,
      insertAt(fieldValues, index),
    );
    focusIndexRef.current = shouldFocus ? index : -1;
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getCurrentFieldsValues();
    swapArrayAt(fieldValues, indexA, indexB);
    batchStateUpdate(
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
        argC: indexA,
        argD: indexB,
      },
      undefined,
      fieldValues,
      false,
    );
    setFieldAndValidState([...fieldValues]);
  };

  const move = (from: number, to: number) => {
    const fieldValues = getCurrentFieldsValues();
    moveArrayAt(fieldValues, from, to);
    setFieldAndValidState([...fieldValues]);
    batchStateUpdate(
      moveArrayAt,
      {
        argA: from,
        argB: to,
        argC: from,
        argD: to,
      },
      undefined,
      fieldValues,
      false,
    );
  };

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (!name) {
        console.warn(
          '📋 useFieldArray is missing `name` attribute. https://react-hook-form.com/api#useFieldArray',
        );
      }
    }

    const defaultValues = get(
      fieldArrayDefaultValuesRef.current,
      name as InternalFieldName,
    );

    if (defaultValues && fields.length < defaultValues.length) {
      defaultValues.pop();
      set(
        fieldArrayDefaultValuesRef.current,
        name as InternalFieldName,
        defaultValues,
      );
    }

    if (isWatchAllRef.current) {
      formStateSubjectRef.current.next({});
    } else {
      for (const watchField of watchFieldsRef.current) {
        if (watchField.startsWith(name as InternalFieldName)) {
          formStateSubjectRef.current.next({});
          break;
        }
      }
    }

    watchSubjectRef.current.next({ inputName: name as InternalFieldName });

    if (focusIndexRef.current > -1) {
      for (const key in fieldsRef.current) {
        const field = fieldsRef.current[key];
        if (
          key.startsWith(`${name}.${focusIndexRef.current}`) &&
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

    if (!getFieldArrayParentName(name as InternalFieldName)) {
      resetFunctions[name as InternalFieldName] = <TFieldValues>(
        data?: UnpackNestedValue<DeepPartial<TFieldValues>>,
      ) => {
        resetFields();
        !data &&
          unset(fieldArrayDefaultValuesRef.current, name as InternalFieldName);
        memoizedDefaultValues.current = get(
          data || defaultValuesRef.current,
          name as any,
        );
        setFields(mapIds(memoizedDefaultValues.current, keyName));
      };
    }

    return () => {
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      resetFields();
      delete resetFunctions[name as InternalFieldName];
      unset(fieldArrayValuesRef, name as InternalFieldName);
      fieldArrayNames.delete(name as InternalFieldName);
    };
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [name]),
    insert: React.useCallback(insert, [name]),
    fields: fields as ArrayFieldWithId<TFieldArrayValues, TName, TKeyName>,
  };
};
