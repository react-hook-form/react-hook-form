import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFieldsValues from './logic/getFieldsValues';
import getFieldArrayParentName from './logic/getNodeParentName';
import mapIds from './logic/mapId';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import appendAt from './utils/append';
import compact from './utils/compact';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import isPrimitive from './utils/isPrimitive';
import isString from './utils/isString';
import isUndefined from './utils/isUndefined';
import moveArrayAt from './utils/move';
import omit from './utils/omit';
import prependAt from './utils/prepend';
import removeArrayAt from './utils/remove';
import set from './utils/set';
import swapArrayAt from './utils/swap';
import unset from './utils/unset';
import {
  FieldArray,
  FieldArrayMethodProps,
  FieldArrayPath,
  FieldArrayWithId,
  FieldErrors,
  FieldPath,
  FieldValues,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from './types';
import { useFormContext } from './useFormContext';

export const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>({
  control,
  name,
  keyName = 'id' as TKeyName,
  shouldUnregister,
}: UseFieldArrayProps<
  TFieldValues,
  TFieldArrayName,
  TKeyName
>): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> => {
  const methods = useFormContext();
  const focusNameRef = React.useRef('');
  const isMountedRef = React.useRef(false);
  const {
    getIsDirty,
    watchSubjectRef,
    fieldArraySubjectRef,
    namesRef,
    fieldsRef,
    defaultValuesRef,
    formStateRef,
    formStateSubjectRef,
    readFormStateRef,
    updateIsValid,
    fieldArrayDefaultValuesRef,
    unregister,
    shouldUnmount,
    inFieldArrayActionRef,
  } = control || methods.control;

  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(
    mapIds(
      get(fieldsRef.current, name) && isMountedRef.current
        ? get(getFieldsValues(fieldsRef), name)
        : get(fieldArrayDefaultValuesRef.current, getFieldArrayParentName(name))
        ? get(fieldArrayDefaultValuesRef.current, name, [])
        : get(defaultValuesRef.current, name, []),
      keyName,
    ),
  );

  set(fieldArrayDefaultValuesRef.current, name, [...fields]);
  namesRef.current.array.add(name);

  const omitKey = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[],
  >(
    fields: T,
  ) =>
    fields.map((field) =>
      omit((field || {}) as Record<TKeyName, any>, keyName),
    );

  const getCurrentFieldsValues = () => {
    const values = get(getFieldsValues(fieldsRef), name, []);

    return mapIds<TFieldValues, TKeyName>(
      get(fieldArrayDefaultValuesRef.current, name, []).map(
        (item: Partial<TFieldValues>, index: number) => ({
          ...item,
          ...values[index],
        }),
      ),
      keyName,
    );
  };

  const getFocusDetail = (
    index: number,
    options?: FieldArrayMethodProps,
  ): string =>
    options
      ? !isUndefined(options.focusIndex)
        ? `${name}.${options.focusIndex}`
        : options.focusName
        ? options.focusName
        : !options.shouldFocus
        ? ''
        : `${name}.${index}`
      : `${name}.${index}`;

  const resetFields = <T>(index?: T) =>
    convertToArrayPayload(index).forEach((currentIndex) =>
      set(
        fieldsRef.current,
        `${name}${isUndefined(currentIndex) ? '' : `.${currentIndex}`}`,
        isUndefined(currentIndex) ? [] : undefined,
      ),
    );

  const setFieldsAndNotify = (
    fieldsValues: Partial<FieldArray<TFieldValues, TFieldArrayName>>[] = [],
  ) => setFields(mapIds(fieldsValues, keyName));

  const cleanup = <T>(ref: T) =>
    !compact(get(ref, name, [])).length && unset(ref, name);

  const updateDirtyFieldsWithDefaultValues = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[],
  >(
    updatedFieldArrayValues?: T,
  ) =>
    updatedFieldArrayValues &&
    set(
      formStateRef.current.dirtyFields,
      name,
      setFieldArrayDirtyFields(
        omitKey(updatedFieldArrayValues),
        get(defaultValuesRef.current, name, []),
        get(formStateRef.current.dirtyFields, name, []),
      ),
    );

  const batchStateUpdate = <T extends Function>(
    method: T,
    args: {
      argA?: unknown;
      argB?: unknown;
    },
    updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = [],
    shouldSet = true,
  ) => {
    inFieldArrayActionRef.current = true;
    if (get(fieldsRef.current, name)) {
      const output = method(get(fieldsRef.current, name), args.argA, args.argB);
      shouldSet && set(fieldsRef.current, name, output);
    }

    if (Array.isArray(get(formStateRef.current.errors, name))) {
      const output = method(
        get(formStateRef.current.errors, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.current.errors, name, output);
      cleanup(formStateRef.current.errors);
    }

    if (
      readFormStateRef.current.touchedFields &&
      get(formStateRef.current.touchedFields, name)
    ) {
      const output = method(
        get(formStateRef.current.touchedFields, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.current.touchedFields, name, output);
      cleanup(formStateRef.current.touchedFields);
    }

    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty
    ) {
      set(
        formStateRef.current.dirtyFields,
        name,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues),
          get(defaultValuesRef.current, name, []),
          get(formStateRef.current.dirtyFields, name, []),
        ),
      );
      updateDirtyFieldsWithDefaultValues(updatedFieldArrayValues);
      cleanup(formStateRef.current.dirtyFields);
    }

    formStateSubjectRef.current.next({
      isDirty: getIsDirty(name, omitKey(updatedFieldArrayValues)),
      errors: formStateRef.current.errors as FieldErrors<TFieldValues>,
      isValid: formStateRef.current.isValid,
    });
  };

  const registerFieldArray = <T extends Object[]>(
    values: T,
    index = 0,
    parentName = '',
  ) =>
    values.forEach(
      (appendValueItem, valueIndex) =>
        !isPrimitive(appendValueItem) &&
        Object.entries(appendValueItem).forEach(([key, value]) => {
          const inputName = `${parentName || name}.${
            parentName ? valueIndex : index + valueIndex
          }.${key}`;

          Array.isArray(value)
            ? registerFieldArray(value, valueIndex, inputName)
            : set(fieldsRef.current, inputName, {
                _f: {
                  ref: {
                    name: inputName,
                  },
                  name: inputName,
                  value: isPrimitive(value) ? value : { ...value },
                },
              });
        }),
    );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(value);
    const updatedFieldArrayValues = appendAt(
      getCurrentFieldsValues(),
      appendValue,
    );
    const currentIndex = updatedFieldArrayValues.length - appendValue.length;
    setFieldsAndNotify(
      updatedFieldArrayValues as Partial<
        FieldArray<TFieldValues, TFieldArrayName>
      >[],
    );
    batchStateUpdate(
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
      false,
    );
    registerFieldArray(appendValue, currentIndex);

    focusNameRef.current = getFocusDetail(currentIndex, options);
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const prependValue = convertToArrayPayload(value);
    const updatedFieldArrayValues = prependAt(
      getCurrentFieldsValues(),
      prependValue,
    );
    setFieldsAndNotify(
      updatedFieldArrayValues as Partial<
        FieldArray<TFieldValues, TFieldArrayName>
      >[],
    );
    batchStateUpdate(
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    );
    registerFieldArray(prependValue);

    focusNameRef.current = getFocusDetail(0, options);
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(getCurrentFieldsValues(), index);
    resetFields(index);
    setFieldsAndNotify(updatedFieldArrayValues);
    batchStateUpdate(
      removeArrayAt,
      {
        argA: index,
      },
      updatedFieldArrayValues,
    );
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const insertValue = convertToArrayPayload(value);
    const updatedFieldArrayValues = insertAt(
      getCurrentFieldsValues(),
      index,
      insertValue,
    );
    setFieldsAndNotify(
      updatedFieldArrayValues as Partial<
        FieldArray<TFieldValues, TFieldArrayName>
      >[],
    );
    batchStateUpdate(
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      updatedFieldArrayValues as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    );
    registerFieldArray(insertValue, index);

    focusNameRef.current = getFocusDetail(index, options);
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getCurrentFieldsValues();
    swapArrayAt(fieldValues, indexA, indexB);
    batchStateUpdate(
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      fieldValues,
      false,
    );
    setFieldsAndNotify(fieldValues);
  };

  const move = (from: number, to: number) => {
    const fieldValues = getCurrentFieldsValues();
    moveArrayAt(fieldValues, from, to);
    setFieldsAndNotify(fieldValues);
    batchStateUpdate(
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      fieldValues,
      false,
    );
  };

  React.useEffect(() => {
    inFieldArrayActionRef.current = false;

    if (namesRef.current.watchAll) {
      formStateSubjectRef.current.next({});
    } else {
      for (const watchField of namesRef.current.watch) {
        if (name.startsWith(watchField)) {
          formStateSubjectRef.current.next({});
          break;
        }
      }
    }

    watchSubjectRef.current.next({
      name,
      formValues: getFieldsValues(fieldsRef),
    });

    focusNameRef.current &&
      focusFieldBy(
        fieldsRef.current,
        (key: string) => isString(key) && key.startsWith(focusNameRef.current),
      );

    focusNameRef.current = '';

    fieldArraySubjectRef.current.next({
      name,
      fields: omitKey([...fields]),
    });

    readFormStateRef.current.isValid && updateIsValid();
  }, [fields, name]);

  React.useEffect(() => {
    const fieldArraySubscription = fieldArraySubjectRef.current.subscribe({
      next({ name: inputFieldArrayName, fields, isReset }) {
        if (isReset) {
          unset(fieldsRef.current, inputFieldArrayName || name);

          inputFieldArrayName
            ? set(
                fieldArrayDefaultValuesRef.current,
                inputFieldArrayName,
                fields,
              )
            : (fieldArrayDefaultValuesRef.current = fields);

          setFieldsAndNotify(get(fieldArrayDefaultValuesRef.current, name));
        }
      },
    });
    !get(fieldsRef.current, name) && set(fieldsRef.current, name, []);
    isMountedRef.current = true;

    return () => {
      fieldArraySubscription.unsubscribe();
      (shouldUnmount || shouldUnregister) &&
        unregister(name as FieldPath<TFieldValues>);
    };
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [name]),
    insert: React.useCallback(insert, [name]),
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
