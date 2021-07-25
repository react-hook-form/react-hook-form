import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFocusFieldName from './logic/getFocusFieldName';
import mapIds from './logic/mapId';
import appendAt from './utils/append';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import moveArrayAt from './utils/move';
import omitKey from './utils/omitKeys';
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
  FieldPath,
  FieldValues,
  PathValue,
  UnpackNestedValue,
  UseFieldArrayProps,
  UseFieldArrayReturn,
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
  const {
    control = methods.control,
    name,
    keyName = 'id' as TKeyName,
    shouldUnregister,
  } = props;
  const _focusName = React.useRef('');
  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(mapIds(control._getFieldArrayValue(name), keyName));

  control._names.array.add(name);

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(value);
    const updatedFieldArrayValues = appendAt(
      control._getFieldArrayValue(name),
      appendValue,
    );
    setFields(
      mapIds(
        updatedFieldArrayValues as Partial<
          FieldArray<TFieldValues, TFieldArrayName>
        >[],
        keyName,
      ),
    );
    control._bathFieldArrayUpdate(
      keyName,
      name,
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
      false,
    );

    _focusName.current = getFocusFieldName(
      name,
      updatedFieldArrayValues.length - appendValue.length,
      options,
    );
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const updatedFieldArrayValues = prependAt(
      control._getFieldArrayValue(name),
      convertToArrayPayload(value),
    );
    setFields(
      mapIds(
        updatedFieldArrayValues as Partial<
          FieldArray<TFieldValues, TFieldArrayName>
        >[],
        keyName,
      ),
    );
    control._bathFieldArrayUpdate(
      keyName,
      name,
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      updatedFieldArrayValues as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    );

    _focusName.current = getFocusFieldName(name, 0, options);
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(control._getFieldArrayValue(name), index);

    setFields(mapIds(updatedFieldArrayValues, keyName));

    control._bathFieldArrayUpdate(
      keyName,
      name,
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
    const updatedFieldArrayValues = insertAt(
      control._getFieldArrayValue(name),
      index,
      convertToArrayPayload(value),
    );
    setFields(
      mapIds(
        updatedFieldArrayValues as Partial<
          FieldArray<TFieldValues, TFieldArrayName>
        >[],
        keyName,
      ),
    );
    control._bathFieldArrayUpdate(
      keyName,
      name,
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      updatedFieldArrayValues as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    );

    _focusName.current = getFocusFieldName(name, index, options);
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = control._getFieldArrayValue(name);
    swapArrayAt(fieldValues, indexA, indexB);
    control._bathFieldArrayUpdate(
      keyName,
      name,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      fieldValues,
      false,
    );
    setFields(mapIds(fieldValues, keyName));
  };

  const move = (from: number, to: number) => {
    const fieldValues = control._getFieldArrayValue(name);
    moveArrayAt(fieldValues, from, to);
    setFields(mapIds(fieldValues, keyName));
    control._bathFieldArrayUpdate(
      keyName,
      name,
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

    const fieldValues = control._getFieldArrayValue(name);
    fieldValues[index] = value;

    setFields(mapIds(fieldValues, keyName));
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
      values: omitKey([...fields], keyName),
    });

    control._proxyFormState.isValid && control._updateValid();
  }, [fields, name, control, keyName]);

  React.useEffect(() => {
    const fieldArraySubscription = control._subjects.array.subscribe({
      next(payload) {
        if (payload.isReset) {
          unset(control._fields, payload.name || name);
          unset(control._formValues, payload.name || name);

          payload.name
            ? set(control._formValues, payload.name, payload.values)
            : payload.values && (control._formValues = payload.values);

          setFields(mapIds(get(control._formValues, name), keyName));
        }
      },
    });

    !get(control._formValues, name) && set(control._formValues, name, []);

    return () => {
      fieldArraySubscription.unsubscribe();
      if (control._shouldUnregister || shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
        unset(control._formValues, name);
      } else {
        const fieldArrayValues = get(control._formValues, name);
        fieldArrayValues && set(control._formValues, name, fieldArrayValues);
      }
    };
  }, [name, control, keyName, shouldUnregister]);

  return {
    swap: React.useCallback(swap, [name, control, keyName]),
    move: React.useCallback(move, [name, control, keyName]),
    prepend: React.useCallback(prepend, [name, control, keyName]),
    append: React.useCallback(append, [name, control, keyName]),
    remove: React.useCallback(remove, [name, control, keyName]),
    insert: React.useCallback(insert, [name, control, keyName]),
    update: React.useCallback(update, [name, control, keyName]),
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
