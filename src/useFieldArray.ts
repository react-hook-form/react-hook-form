import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
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
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> => {
  const methods = useFormContext();
  const _focusName = React.useRef('');
  const _isMounted = React.useRef(false);
  const { control = methods.control, name, keyName = 'id' as TKeyName } = props;
  const fieldArrayValues =
    (control._isMounted
      ? get(control._formValues, name)
      : get(control._defaultValues, name)) || [];

  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(mapIds(fieldArrayValues, keyName));

  control._names.array.add(name);

  const omitKey = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[],
  >(
    fields: T,
  ) =>
    fields.map((field = {}) => omit(field as Record<TKeyName, any>, keyName));

  const getCurrentFieldsValues = () =>
    mapIds<TFieldValues, TKeyName>(get(control._formValues, name, []), keyName);

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
    control._isInAction.val = true;
    if (get(control._fields, name)) {
      const output = method(get(control._fields, name), args.argA, args.argB);
      shouldSet && set(control._fields, name, output);
    }

    if (get(control._formValues, name)) {
      const output = method(
        get(control._formValues, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(control._formValues, name, output);
    }

    if (Array.isArray(get(control._formState.val.errors, name))) {
      const output = method(
        get(control._formState.val.errors, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(control._formState.val.errors, name, output);
      cleanup(control._formState.val.errors);
    }

    if (
      control._proxyFormState.touchedFields &&
      get(control._formState.val.touchedFields, name)
    ) {
      const output = method(
        get(control._formState.val.touchedFields, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(control._formState.val.touchedFields, name, output);
      cleanup(control._formState.val.touchedFields);
    }

    if (
      control._proxyFormState.dirtyFields ||
      control._proxyFormState.isDirty
    ) {
      set(
        control._formState.val.dirtyFields,
        name,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues),
          get(control._defaultValues, name, []),
          get(control._formState.val.dirtyFields, name, []),
        ),
      );
      updatedFieldArrayValues &&
        set(
          control._formState.val.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            omitKey(updatedFieldArrayValues),
            get(control._defaultValues, name, []),
            get(control._formState.val.dirtyFields, name, []),
          ),
        );
      cleanup(control._formState.val.dirtyFields);
    }

    control._subjects.state.next({
      isDirty: control._getIsDirty(name, omitKey(updatedFieldArrayValues)),
      errors: control._formState.val.errors as FieldErrors<TFieldValues>,
      isValid: control._formState.val.isValid,
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
        ? (control.register as UseFormRegister<TFieldValues>)(
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
              : (control.register as UseFormRegister<TFieldValues>)(
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
    control._setValues(
      (name + '.' + index) as FieldPath<TFieldValues>,
      value as UnpackNestedValue<
        PathValue<TFieldValues, FieldPath<TFieldValues>>
      >,
      {
        shouldValidate: !!control._proxyFormState.isValid,
        shouldDirty: !!(
          control._proxyFormState.dirtyFields || control._proxyFormState.isDirty
        ),
      },
    );

    const fieldValues = getCurrentFieldsValues();
    fieldValues[index] = value;

    setFieldsAndNotify(fieldValues);
  };

  React.useEffect(() => {
    control._isInAction.val = false;

    if (control._names.watchAll) {
      control._subjects.state.next({});
    } else {
      for (const watchField of control._names.watch) {
        if (name.startsWith(watchField)) {
          control._subjects.state.next({});
          break;
        }
      }
    }

    control._subjects.watch.next({
      name,
      values: control._formValues,
    });

    _focusName.current &&
      focusFieldBy(control._fields, (key: string) =>
        key.startsWith(_focusName.current),
      );

    _focusName.current = '';

    control._subjects.array.next({
      name,
      values: omitKey([...fields]),
    });

    control._proxyFormState.isValid && control._updateValid();
  }, [fields, name]);

  React.useEffect(() => {
    const fieldArraySubscription = control._subjects.array.subscribe({
      next({ name: inputFieldArrayName, values, isReset }) {
        if (isReset) {
          unset(control._fields, inputFieldArrayName || name);
          unset(control._formValues, inputFieldArrayName || name);

          inputFieldArrayName
            ? set(control._formValues, inputFieldArrayName, values)
            : values && (control._formValues = values);

          setFieldsAndNotify(get(control._formValues, name));
        }
      },
    });

    !get(control._formValues, name) && set(control._formValues, name, []);
    _isMounted.current = true;

    return () => {
      fieldArraySubscription.unsubscribe();
      if (control._shouldUnregister || props.shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
        unset(control._formValues, name);
      } else {
        const fieldArrayValues = get(control._formValues, name);
        fieldArrayValues && set(control._formValues, name, fieldArrayValues);
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
