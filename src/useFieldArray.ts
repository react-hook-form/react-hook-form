import * as React from 'react';
import { useFormContext } from './useFormContext';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import generateId from './logic/generateId';
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
} from './types';

const mapIds = <
  TFieldArrayValues extends FieldValues = FieldValues,
  TName extends Path<FieldValues> = Path<FieldValues>,
  TKeyName extends string = 'id'
>(
  values: Partial<TFieldArrayValues>[] = [],
  name: TName,
  keyName: TKeyName,
  skipWarn?: boolean,
  // ): Partial<ArrayFieldWithId<TFieldArrayValues, TName, TKeyName>>[] => {
): any => {
  if (process.env.NODE_ENV !== 'production') {
    if (!name) {
      return;
    }

    if (!skipWarn) {
      for (const value of values) {
        if (typeof value === 'object') {
          if (keyName in value) {
            console.warn(
              `📋 useFieldArray fieldValues contain the keyName \`${keyName}\` which is reserved for use by useFieldArray. https://react-hook-form.com/api#useFieldArray`,
            );

            break;
          }
        } else {
          console.warn(
            `📋 useFieldArray input's name should be in object shape instead of flat array. https://react-hook-form.com/api#useFieldArray`,
          );

          break;
        }
      }
    }
  }

  return values.map((value: Partial<TFieldArrayValues>) => ({
    [keyName]: value[keyName] || generateId(),
    ...value,
  }));
};

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

  // @ts-ignore
  const fieldArrayParentName = getFieldArrayParentName(name);
  const memoizedDefaultValues = React.useRef<Partial<TFieldArrayValues>[]>([
    ...(get(fieldArrayDefaultValuesRef.current, fieldArrayParentName)
      ? // @ts-ignore
        get(fieldArrayDefaultValuesRef.current, name, [])
      : // @ts-ignore
        get(defaultValuesRef.current, name, [])),
  ]);
  const [fields, setFields] = React.useState<
    Partial<ArrayFieldWithId<TFieldArrayValues, TName, TKeyName>>[]
    // @ts-ignore
  >(mapIds(memoizedDefaultValues.current, name, keyName));
  // @ts-ignore
  set(fieldArrayValuesRef.current, name, fields);

  const omitKey = <T extends (Partial<TFieldArrayValues> | undefined)[]>(
    fields: T,
  ) => fields.map(({ [keyName]: omitted, ...rest } = {}) => rest);

  // @ts-ignore
  fieldArrayNamesRef.current.add(name);

  const getFieldArrayValue = React.useCallback(
    // @ts-ignore
    () => get(fieldArrayValuesRef.current, name, []),
    [name],
  );

  const getCurrentFieldsValues = () =>
    // @ts-ignore
    mapIds<TFieldArrayValues, TName, TKeyName>(
      get(getValues(), name as string, getFieldArrayValue()).map(
        (item: Partial<TFieldArrayValues>, index: number) => ({
          ...getFieldArrayValue()[index],
          ...item,
        }),
      ),
      name,
      keyName,
      true,
    );

  fieldArrayNamesRef.current.add(name as string);

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
    set(fieldArrayValuesRef.current, name as string, fieldsValues);

    if (readFormStateRef.current.isValid) {
      const values = getValues();
      set(values, name as string, fieldsValues);
      updateIsValid(values);
    }
  };

  const resetFields = () => {
    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name as string)) {
        delete fieldsRef.current[key];
      }
    }
  };

  const cleanup = <T>(ref: T) =>
    !compact(get(ref, name as string, [])).length && unset(ref, name as string);

  const updateDirtyFieldsWithDefaultValues = <
    T extends (Partial<TFieldArrayValues> | undefined)[]
  >(
    updatedFieldArrayValues?: T,
  ) => {
    if (updatedFieldArrayValues) {
      set(
        formStateRef.current.dirty,
        name as string,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues),
          get(defaultValuesRef.current, name as string, []),
          get(formStateRef.current.dirty, name as string, []),
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
    if (get(fieldArrayDefaultValuesRef.current, name as string)) {
      const output = method(
        get(fieldArrayDefaultValuesRef.current, name as string),
        args.argA,
        args.argB,
      );
      shouldSet &&
        set(fieldArrayDefaultValuesRef.current, name as string, output);
      cleanup(fieldArrayDefaultValuesRef.current);
    }

    if (Array.isArray(get(formStateRef.current.errors, name as string))) {
      const output = method(
        get(formStateRef.current.errors, name as string),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.current.errors, name as string, output);
      cleanup(formStateRef.current.errors);
    }

    if (
      readFormStateRef.current.touched &&
      get(formStateRef.current.touched, name as string)
    ) {
      const output = method(
        get(formStateRef.current.touched, name as string),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.current.touched, name as string, output);
      cleanup(formStateRef.current.touched);
    }

    if (readFormStateRef.current.dirty || readFormStateRef.current.isDirty) {
      const output = method(
        get(formStateRef.current.dirty, name as string, []),
        args.argC,
        args.argD,
      );
      shouldSet && set(formStateRef.current.dirty, name as string, output);
      updateDirtyFieldsWithDefaultValues(updatedFieldValues);
      cleanup(formStateRef.current.dirty);
    }

    if (shouldUpdateValid && readFormStateRef.current.isValid) {
      set(
        validFieldsRef.current,
        name as string,
        method(get(validFieldsRef.current, name as string, []), args.argA),
      );
      cleanup(validFieldsRef.current);

      set(
        fieldsWithValidationRef.current,
        name as string,
        method(
          get(fieldsWithValidationRef.current, name as string, []),
          args.argA,
        ),
      );
      cleanup(fieldsWithValidationRef.current);
    }

    formStateSubjectRef.current.next({
      isDirty: isFormDirty(name as string, omitKey(updatedFormValues)),
      // @ts-ignore
      errors: formStateRef.current.errors,
      isValid: formStateRef.current.isValid,
    });
  };

  const append = (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const appendValue = Array.isArray(value) ? value : [value];
    const updateFormValues = [
      ...getCurrentFieldsValues(),
      ...mapIds(appendValue, name as string, keyName),
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
      ? get(fieldArrayValuesRef.current, name as string).length - 1
      : -1;
  };

  const prepend = (
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);
    const updatedFieldArrayValues = prependAt(
      getCurrentFieldsValues(),
      mapIds(Array.isArray(value) ? value : [value], name as string, keyName),
    );
    setFieldAndValidState(updatedFieldArrayValues);
    batchStateUpdate(
      prependAt,
      {
        argA: emptyArray,
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
    value: Partial<TFieldArrayValues> | Partial<TFieldArrayValues>[],
    shouldFocus = true,
  ) => {
    const emptyArray = fillEmptyArray(value);
    const fieldValues = getCurrentFieldsValues();
    const updatedFieldArrayValues = insertAt(
      fieldValues,
      index,
      // @ts-ignore
      mapIds(Array.isArray(value) ? value : [value], name, keyName),
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
      name as string,
    );

    if (defaultValues && fields.length < defaultValues.length) {
      defaultValues.pop();
      set(fieldArrayDefaultValuesRef.current, name as string, defaultValues);
    }

    if (isWatchAllRef.current) {
      formStateSubjectRef.current.next({});
    } else {
      for (const watchField of watchFieldsRef.current) {
        if (watchField.startsWith(name as string)) {
          formStateSubjectRef.current.next({});
          break;
        }
      }
    }

    watchSubjectRef.current.next({ inputName: name as string });

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

    if (!getFieldArrayParentName(name as string)) {
      resetFunctions[name as string] = <TFieldValues>(
        data?: UnpackNestedValue<DeepPartial<TFieldValues>>,
      ) => {
        resetFields();
        !data && unset(fieldArrayDefaultValuesRef.current, name as string);
        memoizedDefaultValues.current = get(
          data || defaultValuesRef.current,
          name as any,
        );
        // @ts-ignore
        setFields(mapIds(memoizedDefaultValues.current, name, keyName));
      };
    }

    return () => {
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      resetFields();
      delete resetFunctions[name as string];
      unset(fieldArrayValuesRef, name as string);
      fieldArrayNames.delete(name as string);
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
