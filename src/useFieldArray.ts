import * as React from 'react';
import { useFormContext } from './useFormContext';
import setFieldArrayDirtyFields from './logic/setFieldArrayDirtyFields';
import mapIds from './logic/mapId';
import getFieldArrayParentName from './logic/getNodeParentName';
import get from './utils/get';
import set from './utils/set';
import removeArrayAt from './utils/remove';
import unset from './utils/unset';
import moveArrayAt from './utils/move';
import swapArrayAt from './utils/swap';
import prependAt from './utils/prepend';
import appendAt from './utils/append';
import insertAt from './utils/insert';
import fillEmptyArray from './utils/fillEmptyArray';
import compact from './utils/compact';
import isUndefined from './utils/isUndefined';
import focusFieldBy from './logic/focusFieldBy';
import getFieldsValues from './logic/getFieldsValues';
import omit from './utils/omit';
import {
  FieldValues,
  UseFieldArrayProps,
  FieldArrayWithId,
  UseFieldArrayReturn,
  FieldArray,
  FieldArrayMethodProps,
  FieldErrors,
  FieldArrayPath,
} from './types';

export const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id'
>({
  control,
  name,
  keyName = 'id' as TKeyName,
}: UseFieldArrayProps<
  TFieldValues,
  TFieldArrayName,
  TKeyName
>): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> => {
  const methods = useFormContext();
  const focusNameRef = React.useRef('');
  const {
    isWatchAllRef,
    watchFieldsRef,
    getFormIsDirty,
    watchSubjectRef,
    fieldArraySubjectRef,
    fieldArrayNamesRef,
    fieldsRef,
    defaultValuesRef,
    formStateRef,
    formStateSubjectRef,
    readFormStateRef,
    validFieldsRef,
    fieldsWithValidationRef,
    fieldArrayDefaultValuesRef,
  } = control || methods.control;

  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(
    mapIds(
      get(fieldArrayDefaultValuesRef.current, getFieldArrayParentName(name))
        ? get(fieldArrayDefaultValuesRef.current, name, [])
        : get(defaultValuesRef.current, name, []),
      keyName,
    ),
  );

  set(fieldArrayDefaultValuesRef.current, name, [...fields]);
  fieldArrayNamesRef.current.add(name);

  const omitKey = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[]
  >(
    fields: T,
  ) =>
    fields.map((field) =>
      omit((field || {}) as Record<TKeyName, any>, keyName),
    );

  const getCurrentFieldsValues = () => {
    const values = get(getFieldsValues(fieldsRef, defaultValuesRef), name, []);

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
    (Array.isArray(index) ? index : [index]).forEach((currentIndex) =>
      set(
        fieldsRef.current,
        `${name}${isUndefined(currentIndex) ? '' : `.${currentIndex}`}`,
        isUndefined(currentIndex) ? [] : undefined,
      ),
    );

  const setFieldsAndNotify = (
    fieldsValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = [],
  ) => setFields(mapIds(fieldsValues, keyName));

  const cleanup = <T>(ref: T) =>
    !compact(get(ref, name, [])).length && unset(ref, name);

  const updateDirtyFieldsWithDefaultValues = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[]
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

    if (readFormStateRef.current.isValid) {
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

    formStateSubjectRef.current.next({
      isDirty: getFormIsDirty(name, omitKey(updatedFieldArrayValues)),
      errors: formStateRef.current.errors as FieldErrors<TFieldValues>,
      isValid: formStateRef.current.isValid,
    });
  };

  const registerFieldArray = <T extends Object[]>(
    values: T,
    index = 0,
    parentName = '',
  ) =>
    values.forEach((appendValueItem, valueIndex) =>
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
                value,
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
    const appendValue = Array.isArray(value) ? value : [value];
    const updatedFieldArrayValues = appendAt(
      getCurrentFieldsValues(),
      appendValue,
    );
    const currentIndex = updatedFieldArrayValues.length - appendValue.length;
    setFieldsAndNotify(updatedFieldArrayValues);
    batchStateUpdate(
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues,
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
    const prependValue = Array.isArray(value) ? value : [value];
    const updatedFieldArrayValues = prependAt(
      getCurrentFieldsValues(),
      prependValue,
    );
    setFieldsAndNotify(updatedFieldArrayValues);
    batchStateUpdate(
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues,
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
    const insertValue = Array.isArray(value) ? value : [value];
    const updatedFieldArrayValues = insertAt(
      getCurrentFieldsValues(),
      index,
      insertValue,
    );
    setFieldsAndNotify(updatedFieldArrayValues);
    batchStateUpdate(
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      updatedFieldArrayValues,
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
    if (isWatchAllRef.current) {
      formStateSubjectRef.current.next({});
    } else {
      for (const watchField of watchFieldsRef.current) {
        if (name.startsWith(watchField)) {
          formStateSubjectRef.current.next({});
          break;
        }
      }
    }

    watchSubjectRef.current.next({
      name,
      value: get(getFieldsValues(fieldsRef, defaultValuesRef), name, []),
    });

    focusNameRef.current &&
      focusFieldBy(fieldsRef.current, (key: string) =>
        key.startsWith(focusNameRef.current),
      );

    focusNameRef.current = '';

    fieldArraySubjectRef.current.next({
      name,
      fields: omitKey([...fields]),
    });
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

    return () => {
      fieldArrayDefaultValuesRef.current = getFieldsValues(fieldsRef);
      fieldArraySubscription.unsubscribe();
    };
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [name]),
    insert: React.useCallback(insert, [name]),
    fields: fields as FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>,
  };
};
