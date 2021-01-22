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
import insertAt from './utils/insert';
import fillEmptyArray from './utils/fillEmptyArray';
import compact from './utils/compact';
import isUndefined from './utils/isUndefined';
import focusFieldBy from './logic/focusFieldBy';
import getFieldsValues from './logic/getFieldsValues';
import {
  FieldValues,
  UseFieldArrayProps,
  FieldPath,
  FieldArrayWithId,
  UseFieldArrayMethods,
  FieldArray,
  InternalFieldName,
  FieldArrayMethodsOption,
} from './types';

export const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TKeyName extends string = 'id'
>({
  control,
  name,
  keyName = 'id' as TKeyName,
}: UseFieldArrayProps<TFieldValues, TName, TKeyName>): UseFieldArrayMethods<
  TFieldValues,
  TName,
  TKeyName
> => {
  const methods = useFormContext();

  if (process.env.NODE_ENV !== 'production') {
    if (!control && !methods) {
      throw new Error(
        '📋 useFieldArray is missing `control` prop. https://react-hook-form.com/api#useFieldArray',
      );
    }
  }

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
    Partial<FieldArrayWithId<TFieldValues, TName, TKeyName>>[]
  >(
    mapIds(
      get(
        fieldArrayDefaultValuesRef.current,
        getFieldArrayParentName(name as InternalFieldName),
      )
        ? get(fieldArrayDefaultValuesRef.current, name as InternalFieldName, [])
        : get(defaultValuesRef.current, name as InternalFieldName, []),
      keyName,
    ),
  );

  set(fieldArrayDefaultValuesRef.current, name as InternalFieldName, [
    ...fields,
  ]);
  fieldArrayNamesRef.current.add(name as InternalFieldName);

  const omitKey = <
    T extends Partial<FieldArrayWithId<TFieldValues, TName, TKeyName>>[]
  >(
    fields: T,
  ) => fields.map(({ [keyName]: omitted, ...rest } = {}) => rest);

  const getCurrentFieldsValues = () => {
    const values = get(
      getFieldsValues(fieldsRef),
      name as InternalFieldName,
      [],
    );

    return mapIds<TFieldValues, TKeyName>(
      get(
        fieldArrayDefaultValuesRef.current,
        name as InternalFieldName,
        [],
      ).map((item: Partial<TFieldValues>, index: number) => ({
        ...item,
        ...values[index],
      })),
      keyName,
    );
  };

  const getFocusDetail = (
    index: number,
    options?: FieldArrayMethodsOption,
  ): string => {
    if (options) {
      if (!isUndefined(options.focusIndex)) {
        return `${name}.${options.focusIndex}`;
      }
      if (options.focusName) {
        return options.focusName;
      }
      if (!options.shouldFocus) {
        return '';
      }
    }
    return `${name}.${index}`;
  };

  const resetFields = () => unset(fieldsRef.current, name as InternalFieldName);

  const setFieldsAndNotify = (
    fieldsValues: Partial<FieldArrayWithId<TFieldValues, TName, TKeyName>>[],
  ) => {
    setFields(mapIds(fieldsValues, keyName));
    fieldArraySubjectRef.current.next({
      name,
      fields: omitKey([...fieldsValues]),
    });
  };

  const cleanup = <T>(ref: T) =>
    !compact(get(ref, name as InternalFieldName, [])).length &&
    unset(ref, name as InternalFieldName);

  const updateDirtyFieldsWithDefaultValues = <
    T extends Partial<FieldArrayWithId<TFieldValues, TName, TKeyName>>[]
  >(
    updatedFieldArrayValues?: T,
  ) =>
    updatedFieldArrayValues &&
    set(
      formStateRef.current.dirtyFields,
      name as InternalFieldName,
      setFieldArrayDirtyFields(
        omitKey(updatedFieldArrayValues),
        get(defaultValuesRef.current, name as InternalFieldName, []),
        get(formStateRef.current.dirtyFields, name as InternalFieldName, []),
      ),
    );

  const batchStateUpdate = <
    T extends Function,
    K extends Partial<FieldArrayWithId<TFieldValues, TName, TKeyName>>[]
  >(
    method: T,
    args: {
      argA?: unknown;
      argB?: unknown;
    },
    updatedFieldValues?: K,
    updatedFormValues: Partial<
      FieldArrayWithId<TFieldValues, TName, TKeyName>
    >[] = [],
    shouldSet = true,
    shouldUpdateValid = false,
  ) => {
    if (get(fieldsRef.current, name)) {
      const output = method(
        get(fieldsRef.current, name as InternalFieldName),
        args.argA,
        args.argB,
      );
      shouldSet && set(fieldsRef.current, name as InternalFieldName, output);
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
      readFormStateRef.current.touchedFields &&
      get(formStateRef.current.touchedFields, name as InternalFieldName)
    ) {
      const output = method(
        get(formStateRef.current.touchedFields, name as InternalFieldName),
        args.argA,
        args.argB,
      );
      shouldSet &&
        set(
          formStateRef.current.touchedFields,
          name as InternalFieldName,
          output,
        );
      cleanup(formStateRef.current.touchedFields);
    }

    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty
    ) {
      set(
        formStateRef.current.dirtyFields,
        name as InternalFieldName,
        setFieldArrayDirtyFields(
          omitKey(updatedFormValues),
          get(defaultValuesRef.current, name as InternalFieldName, []),
          get(formStateRef.current.dirtyFields, name as InternalFieldName, []),
        ),
      );
      updateDirtyFieldsWithDefaultValues(updatedFieldValues);
      cleanup(formStateRef.current.dirtyFields);
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
      isDirty: getFormIsDirty(
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
      | Partial<FieldArray<TFieldValues, TName>>
      | Partial<FieldArray<TFieldValues, TName>>[],
    options?: FieldArrayMethodsOption,
  ) => {
    const appendValue = Array.isArray(value) ? value : [value];
    const updatedFieldValues = [...getCurrentFieldsValues(), ...appendValue];
    setFieldsAndNotify(updatedFieldValues);

    if (
      readFormStateRef.current.dirtyFields ||
      readFormStateRef.current.isDirty
    ) {
      updateDirtyFieldsWithDefaultValues(updatedFieldValues);

      formStateSubjectRef.current.next({
        isDirty: true,
        // @ts-ignore
        dirtyFields: formStateRef.current.dirtyFields,
      });
    }

    focusNameRef.current = getFocusDetail(
      updatedFieldValues.length - 1,
      options,
    );
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TName>>
      | Partial<FieldArray<TFieldValues, TName>>[],
    options?: FieldArrayMethodsOption,
  ) => {
    const updatedFieldArrayValues = prependAt(
      getCurrentFieldsValues(),
      Array.isArray(value) ? value : [value],
    );
    setFieldsAndNotify(updatedFieldArrayValues);
    batchStateUpdate(
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues,
    );

    focusNameRef.current = getFocusDetail(0, options);
  };

  const remove = (index?: number | number[]) => {
    const fieldValues = getCurrentFieldsValues();
    const updatedFieldValues: Partial<
      FieldArrayWithId<TFieldValues, TName, TKeyName>
    >[] = removeArrayAt(fieldValues, index);
    resetFields();
    batchStateUpdate(
      removeArrayAt,
      {
        argA: index,
      },
      updatedFieldValues,
      removeArrayAt(fieldValues, index),
      true,
      true,
    );
    setFieldsAndNotify(updatedFieldValues);
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TName>>
      | Partial<FieldArray<TFieldValues, TName>>[],
    options?: FieldArrayMethodsOption,
  ) => {
    const fieldValues = getCurrentFieldsValues();
    const updatedFieldArrayValues = insertAt(
      fieldValues,
      index,
      Array.isArray(value) ? value : [value],
    );

    setFieldsAndNotify(updatedFieldArrayValues);
    batchStateUpdate(
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      updatedFieldArrayValues,
      fieldValues && insertAt(fieldValues, index),
    );

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
      undefined,
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

    watchSubjectRef.current.next({ name });

    focusNameRef.current &&
      focusFieldBy(fieldsRef.current, (key: string) =>
        key.startsWith(focusNameRef.current),
      );

    focusNameRef.current = '';
  }, [fields, name]);

  React.useEffect(() => {
    const fieldArraySubscription = fieldArraySubjectRef.current.subscribe({
      next({ name: inputName, fields, isReset }) {
        if (isReset) {
          if (inputName) {
            const value = getFieldsValues(fieldsRef);
            set(value, inputName, fields);
            set(fieldArrayDefaultValuesRef.current, name, fields);
            setFieldsAndNotify(get(value, name));
          } else {
            fieldArrayDefaultValuesRef.current = fields;
            setFieldsAndNotify(get(fields, name));
          }
        }
      },
    });

    return () => {
      fieldArraySubscription.unsubscribe();
      resetFields();
      unset(fieldArrayDefaultValuesRef.current, name as InternalFieldName);
      fieldArrayNamesRef.current.delete(name as InternalFieldName);
    };
  }, []);

  return {
    swap: React.useCallback(swap, [name]),
    move: React.useCallback(move, [name]),
    prepend: React.useCallback(prepend, [name]),
    append: React.useCallback(append, [name]),
    remove: React.useCallback(remove, [name]),
    insert: React.useCallback(insert, [name]),
    fields: fields as FieldArrayWithId<TFieldValues, TName, TKeyName>,
  };
};
