import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
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
  Path,
  PathValue,
  UnpackNestedValue,
  UseFieldArrayProps,
  UseFieldArrayReturn,
  UseFormRegister,
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
    namesRef,
    fieldsRef,
    defaultValuesRef,
    formStateRef,
    subjectsRef,
    readFormStateRef,
    updateIsValid,
    fieldArrayDefaultValuesRef,
    unregister,
    shouldUnmount,
    inFieldArrayActionRef,
    setValues,
    register,
    _values,
  } = control || methods.control;

  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(
    mapIds(
      (get(fieldsRef.current, name) && isMountedRef.current
        ? get(_values.current, name)
        : get(fieldArrayDefaultValuesRef.current, getFieldArrayParentName(name))
        ? get(fieldArrayDefaultValuesRef.current, name)
        : get(defaultValuesRef.current, name)) || [],
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
    fields.map((field = {}) => omit(field as Record<TKeyName, any>, keyName));

  const getCurrentFieldsValues = () => {
    const values = get(_values.current, name, []);

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

  const getFocusFieldName = (
    index: number,
    options?: FieldArrayMethodProps,
  ): string =>
    options && !options.shouldFocus
      ? options.focusName || `${name}.${options.focusIndex}.`
      : `${name}.${index}.`;

  const setFieldsAndNotify = (
    fieldsValues: Partial<FieldArray<TFieldValues, TFieldArrayName>>[] = [],
  ) => setFields(mapIds(fieldsValues, keyName));

  const cleanup = <T>(ref: T) =>
    !compact(get(ref, name, [])).length && unset(ref, name);

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

    if (get(_values.current, name)) {
      const output = method(get(_values.current, name), args.argA, args.argB);
      shouldSet && set(_values.current, name, output);
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
      cleanup(formStateRef.current.dirtyFields);
    }

    subjectsRef.current.state.next({
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
    values.forEach((appendValueItem, valueIndex) => {
      const rootName = `${parentName || name}.${
        parentName ? valueIndex : index + valueIndex
      }`;
      isPrimitive(appendValueItem)
        ? (register as UseFormRegister<TFieldValues>)(
            rootName as Path<TFieldValues>,
            {
              value: appendValueItem as PathValue<
                TFieldValues,
                Path<TFieldValues>
              >,
            },
          )
        : Object.entries(appendValueItem).forEach(([key, value]) => {
            const inputName = rootName + '.' + key;

            Array.isArray(value)
              ? registerFieldArray(value, valueIndex, inputName)
              : (register as UseFormRegister<TFieldValues>)(
                  inputName as Path<TFieldValues>,
                  { value },
                );
          });
    });

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

    focusNameRef.current = getFocusFieldName(currentIndex, options);
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

    focusNameRef.current = getFocusFieldName(0, options);
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(getCurrentFieldsValues(), index);

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

    focusNameRef.current = getFocusFieldName(index, options);
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

  const update = (
    index: number,
    value: Partial<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => {
    setValues(
      (name + '.' + index) as FieldPath<TFieldValues>,
      value as UnpackNestedValue<
        PathValue<TFieldValues, FieldPath<TFieldValues>>
      >,
      {
        shouldValidate: !!readFormStateRef.current.isValid,
        shouldDirty: !!(
          readFormStateRef.current.dirtyFields ||
          readFormStateRef.current.isDirty
        ),
      },
    );

    const fieldValues = getCurrentFieldsValues();
    fieldValues[index] = value;

    setFieldsAndNotify(fieldValues);
  };

  React.useEffect(() => {
    inFieldArrayActionRef.current = false;

    if (namesRef.current.watchAll) {
      subjectsRef.current.state.next({});
    } else {
      for (const watchField of namesRef.current.watch) {
        if (name.startsWith(watchField)) {
          subjectsRef.current.state.next({});
          break;
        }
      }
    }

    subjectsRef.current.watch.next({
      name,
      values: _values.current,
    });

    focusNameRef.current &&
      focusFieldBy(fieldsRef.current, (key: string) =>
        key.startsWith(focusNameRef.current),
      );

    focusNameRef.current = '';

    subjectsRef.current.array.next({
      name,
      values: omitKey([...fields]),
    });

    readFormStateRef.current.isValid && updateIsValid();
  }, [fields, name]);

  React.useEffect(() => {
    const fieldArraySubscription = subjectsRef.current.array.subscribe({
      next({ name: inputFieldArrayName, values, isReset }) {
        if (isReset) {
          unset(fieldsRef.current, inputFieldArrayName || name);
          unset(_values.current, inputFieldArrayName || name);

          inputFieldArrayName
            ? set(
                fieldArrayDefaultValuesRef.current,
                inputFieldArrayName,
                values,
              )
            : (fieldArrayDefaultValuesRef.current = values);

          setFieldsAndNotify(get(fieldArrayDefaultValuesRef.current, name));
        }
      },
    });

    !get(fieldsRef.current, name) && set(fieldsRef.current, name, []);
    !get(_values.current, name) && set(_values.current, name, []);
    isMountedRef.current = true;

    return () => {
      fieldArraySubscription.unsubscribe();
      if (shouldUnmount || shouldUnregister) {
        unregister(name as FieldPath<TFieldValues>);
        unset(fieldArrayDefaultValuesRef.current, name);
      } else {
        const fieldArrayValues = get(_values.current, name);
        fieldArrayValues &&
          set(fieldArrayDefaultValuesRef.current, name, fieldArrayValues);
      }
    };
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [name]),
    insert: React.useCallback(insert, [name]),
    update: React.useCallback(update, [name]),
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
