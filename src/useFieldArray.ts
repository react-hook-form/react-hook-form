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
  const _focusName = React.useRef('');
  const {
    _getIsDirty,
    unregister,
    _shouldUnregister,
    _updateValid,
    _setValues,
    register,
    _names,
    _fields,
    _defaultValues,
    _formState,
    _subjects,
    _proxyFormState,
    _fieldArrayDefaultValues,
    _isDuringAction,
    _formValues,
    _isMounted,
  } = control || methods.control;

  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(
    mapIds(
      (get(_formValues.val, name) && _isMounted.val
        ? get(_formValues.val, name)
        : get(_fieldArrayDefaultValues.val, getFieldArrayParentName(name))
        ? get(_fieldArrayDefaultValues.val, name)
        : get(_defaultValues.val, name)) || [],
      keyName,
    ),
  );

  set(_fieldArrayDefaultValues.val, name, [...fields]);
  _names.val.array.add(name);

  const omitKey = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[],
  >(
    fields: T,
  ) =>
    fields.map((field = {}) => omit(field as Record<TKeyName, any>, keyName));

  const getCurrentFieldsValues = () => {
    const values = get(_formValues.val, name, []);

    return mapIds<TFieldValues, TKeyName>(
      get(_fieldArrayDefaultValues.val, name, []).map(
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
    _isDuringAction.val = true;
    if (get(_fields.val, name)) {
      const output = method(get(_fields.val, name), args.argA, args.argB);
      shouldSet && set(_fields.val, name, output);
    }

    if (get(_formValues.val, name)) {
      const output = method(get(_formValues.val, name), args.argA, args.argB);
      shouldSet && set(_formValues.val, name, output);
    }

    if (Array.isArray(get(_formState.val.errors, name))) {
      const output = method(
        get(_formState.val.errors, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(_formState.val.errors, name, output);
      cleanup(_formState.val.errors);
    }

    if (
      _proxyFormState.val.touchedFields &&
      get(_formState.val.touchedFields, name)
    ) {
      const output = method(
        get(_formState.val.touchedFields, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(_formState.val.touchedFields, name, output);
      cleanup(_formState.val.touchedFields);
    }

    if (_proxyFormState.val.dirtyFields || _proxyFormState.val.isDirty) {
      set(
        _formState.val.dirtyFields,
        name,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues),
          get(_defaultValues.val, name, []),
          get(_formState.val.dirtyFields, name, []),
        ),
      );
      updatedFieldArrayValues &&
        set(
          _formState.val.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            omitKey(updatedFieldArrayValues),
            get(_defaultValues.val, name, []),
            get(_formState.val.dirtyFields, name, []),
          ),
        );
      cleanup(_formState.val.dirtyFields);
    }

    _subjects.state.next({
      isDirty: _getIsDirty(name, omitKey(updatedFieldArrayValues)),
      errors: _formState.val.errors as FieldErrors<TFieldValues>,
      isValid: _formState.val.isValid,
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

    _focusName.current = getFocusFieldName(currentIndex, options);
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

    _focusName.current = getFocusFieldName(0, options);
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

    _focusName.current = getFocusFieldName(index, options);
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
    _setValues(
      (name + '.' + index) as FieldPath<TFieldValues>,
      value as UnpackNestedValue<
        PathValue<TFieldValues, FieldPath<TFieldValues>>
      >,
      {
        shouldValidate: !!_proxyFormState.val.isValid,
        shouldDirty: !!(
          _proxyFormState.val.dirtyFields || _proxyFormState.val.isDirty
        ),
      },
    );

    const fieldValues = getCurrentFieldsValues();
    fieldValues[index] = value;

    setFieldsAndNotify(fieldValues);
  };

  React.useEffect(() => {
    _isDuringAction.val = false;

    if (_names.val.watchAll) {
      _subjects.state.next({});
    } else {
      for (const watchField of _names.val.watch) {
        if (name.startsWith(watchField)) {
          _subjects.state.next({});
          break;
        }
      }
    }

    _subjects.watch.next({
      name,
      values: _formValues.val,
    });

    _focusName.current &&
      focusFieldBy(_fields.val, (key: string) =>
        key.startsWith(_focusName.current),
      );

    _focusName.current = '';

    _subjects.array.next({
      name,
      values: omitKey([...fields]),
    });

    _proxyFormState.val.isValid && _updateValid();
  }, [fields, name]);

  React.useEffect(() => {
    const fieldArraySubscription = _subjects.array.subscribe({
      next({ name: inputFieldArrayName, values, isReset }) {
        if (isReset) {
          unset(_fields.val, inputFieldArrayName || name);
          unset(_formValues.val, inputFieldArrayName || name);

          inputFieldArrayName
            ? set(_fieldArrayDefaultValues.val, inputFieldArrayName, values)
            : values && (_fieldArrayDefaultValues.val = values);

          setFieldsAndNotify(get(_fieldArrayDefaultValues.val, name));
        }
      },
    });

    !get(_formValues.val, name) && set(_formValues.val, name, []);
    _isMounted.val = true;

    return () => {
      fieldArraySubscription.unsubscribe();
      if (_shouldUnregister || shouldUnregister) {
        unregister(name as FieldPath<TFieldValues>);
        unset(_fieldArrayDefaultValues.val, name);
      } else {
        const fieldArrayValues = get(_formValues.val, name);
        fieldArrayValues &&
          set(_fieldArrayDefaultValues.val, name, fieldArrayValues);
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
