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
  const methods = useFormContext<TFieldValues>();
  const {
    control = methods.control,
    name,
    keyName = 'id' as TKeyName,
    shouldUnregister,
  } = props;
  const focusNameRef = React.useRef('');
  const isMountedRef = React.useRef(false);

  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(
    mapIds(
      (get(control.fieldsRef, name) && isMountedRef.current
        ? get(getFieldsValues(control.fieldsRef), name)
        : get(control.fieldArrayDefaultValuesRef, getFieldArrayParentName(name))
        ? get(control.fieldArrayDefaultValuesRef, name)
        : get(control.defaultValuesRef, name)) || [],
      keyName,
    ),
  );

  set(control.fieldArrayDefaultValuesRef, name, [...fields]);
  control.namesRef.array.add(name);

  const omitKey = <
    T extends Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[],
  >(
    fields: T,
  ) =>
    fields.map((field = {}) => omit(field as Record<TKeyName, any>, keyName));

  const getCurrentFieldsValues = () => {
    const values = get(getFieldsValues(control.fieldsRef), name, []);

    return mapIds<TFieldValues, TKeyName>(
      get(control.fieldArrayDefaultValuesRef, name, []).map(
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
    control.inFieldArrayActionRef = true;
    const { fieldsRef, formStateRef } = control;
    if (get(fieldsRef, name)) {
      const output = method(get(fieldsRef, name), args.argA, args.argB);
      shouldSet && set(fieldsRef, name, output);
    }

    if (Array.isArray(get(formStateRef.errors, name))) {
      const output = method(
        get(formStateRef.errors, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.errors, name, output);
      cleanup(formStateRef.errors);
    }

    if (
      control.readFormStateRef.touchedFields &&
      get(formStateRef.touchedFields, name)
    ) {
      const output = method(
        get(formStateRef.touchedFields, name),
        args.argA,
        args.argB,
      );
      shouldSet && set(formStateRef.touchedFields, name, output);
      cleanup(formStateRef.touchedFields);
    }

    if (
      control.readFormStateRef.dirtyFields ||
      control.readFormStateRef.isDirty
    ) {
      const defaultValuesRef = control.defaultValuesRef;
      set(
        formStateRef.dirtyFields,
        name,
        setFieldArrayDirtyFields(
          omitKey(updatedFieldArrayValues),
          get(defaultValuesRef, name, []),
          get(formStateRef.dirtyFields, name, []),
        ),
      );
      updatedFieldArrayValues &&
        set(
          formStateRef.dirtyFields,
          name,
          setFieldArrayDirtyFields(
            omitKey(updatedFieldArrayValues),
            get(defaultValuesRef, name, []),
            get(formStateRef.dirtyFields, name, []),
          ),
        );
      cleanup(formStateRef.dirtyFields);
    }

    control.subjectsRef.state.next({
      isDirty: control.getIsDirty(name, omitKey(updatedFieldArrayValues)),
      errors: formStateRef.errors as FieldErrors<TFieldValues>,
      isValid: formStateRef.isValid,
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
                  { value: isPrimitive(value) ? value : { ...value } },
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

  React.useEffect(() => {
    control.inFieldArrayActionRef = false;
    const { namesRef, subjectsRef, fieldsRef } = control;

    if (namesRef.watchAll) {
      subjectsRef.state.next({});
    } else {
      for (const watchField of namesRef.watch) {
        if (name.startsWith(watchField)) {
          subjectsRef.state.next({});
          break;
        }
      }
    }

    subjectsRef.watch.next({
      name,
      values: getFieldsValues(fieldsRef),
    });

    focusNameRef.current &&
      focusFieldBy(fieldsRef, (key: string) =>
        key.startsWith(focusNameRef.current),
      );

    focusNameRef.current = '';

    subjectsRef.array.next({
      name,
      values: omitKey([...fields]),
    });

    control.readFormStateRef.isValid && control.updateIsValid();
  }, [fields, name]);

  React.useEffect(() => {
    const { subjectsRef } = control;
    const fieldArraySubscription = subjectsRef.array.subscribe({
      next({ name: inputFieldArrayName, values, isReset }) {
        if (isReset) {
          unset(control.fieldsRef, inputFieldArrayName || name);

          inputFieldArrayName
            ? set(
                control.fieldArrayDefaultValuesRef,
                inputFieldArrayName,
                values,
              )
            : (control.fieldArrayDefaultValuesRef = values!);

          setFieldsAndNotify(get(control.fieldArrayDefaultValuesRef, name));
        }
      },
    });
    !get(control.fieldsRef, name) && set(control.fieldsRef, name, []);
    isMountedRef.current = true;

    return () => {
      fieldArraySubscription.unsubscribe();
      if (control.shouldUnmount || shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
        unset(control.fieldArrayDefaultValuesRef, name);
      } else {
        const fieldArrayValues = get(getFieldsValues(control.fieldsRef), name);
        fieldArrayValues &&
          set(control.fieldArrayDefaultValuesRef, name, fieldArrayValues);
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
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
