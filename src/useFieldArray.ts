import * as React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import getFocusFieldName from './logic/getFocusFieldName';
import mapCurrentIds from './logic/mapCurrentIds';
import mapIds from './logic/mapId';
import appendAt from './utils/append';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import moveArrayAt from './utils/move';
import omitKeys from './utils/omitKeys';
import prependAt from './utils/prepend';
import removeArrayAt from './utils/remove';
import set from './utils/set';
import swapArrayAt from './utils/swap';
import updateAt from './utils/update';
import { CONTROL_DEFAULT } from './constants';
import {
  Control,
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
import { useSubscribe } from './useSubscribe';

export const useFieldArray = <
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> => {
  const methods = useFormContext();
  const {
    control = methods
      ? methods.control
      : (CONTROL_DEFAULT as unknown as Control<TFieldValues>),
    name,
    keyName = 'id' as TKeyName,
    shouldUnregister,
  } = props;
  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(mapIds(control._getFieldArray(name), keyName));
  const _fieldIds = React.useRef(fields);
  const _name = React.useRef(name);
  const _actioned = React.useRef(false);

  _name.current = name;
  _fieldIds.current = fields;
  control._names.array.add(name);

  useSubscribe({
    callback: ({ values, name: fieldArrayName }) => {
      if (fieldArrayName === _name.current || !fieldArrayName) {
        setFields(mapIds(get(values, _name.current), keyName));
      }
    },
    subject: control._subjects.array,
  });

  const updateValues = React.useCallback(
    <
      T extends Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    >(
      updatedFieldArrayValuesWithKey: T,
    ) => {
      const updatedFieldArrayValues = omitKeys(
        updatedFieldArrayValuesWithKey,
        keyName,
      );
      _actioned.current = true;
      set(control._formValues, name, updatedFieldArrayValues);
      return updatedFieldArrayValues;
    },
    [control, name, keyName],
  );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(value);
    const updatedFieldArrayValuesWithKey = appendAt(
      mapCurrentIds(control._getFieldArray(name), _fieldIds, keyName),
      mapIds(appendValue, keyName),
    );
    control._updateFieldArray(
      name,
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      updateValues(updatedFieldArrayValuesWithKey),
    );
    setFields(updatedFieldArrayValuesWithKey);

    control._names.focus = getFocusFieldName(
      name,
      updatedFieldArrayValuesWithKey.length - appendValue.length,
      options,
    );
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const updatedFieldArrayValuesWithKey = prependAt(
      mapCurrentIds(control._getFieldArray(name), _fieldIds, keyName),
      mapIds(convertToArrayPayload(value), keyName),
    );
    control._updateFieldArray(
      name,
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      updateValues(updatedFieldArrayValuesWithKey),
    );
    setFields(updatedFieldArrayValuesWithKey);

    control._names.focus = getFocusFieldName(name, 0, options);
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValuesWithKey: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(
      mapCurrentIds(control._getFieldArray(name), _fieldIds, keyName),
      index,
    );
    control._updateFieldArray(
      name,
      removeArrayAt,
      {
        argA: index,
      },
      updateValues(updatedFieldArrayValuesWithKey),
    );
    setFields(updatedFieldArrayValuesWithKey);
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const updatedFieldArrayValuesWithKey = insertAt(
      mapCurrentIds(control._getFieldArray(name), _fieldIds, keyName),
      index,
      mapIds(convertToArrayPayload(value), keyName),
    );
    control._updateFieldArray(
      name,
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      updateValues(updatedFieldArrayValuesWithKey),
    );
    setFields(updatedFieldArrayValuesWithKey);

    control._names.focus = getFocusFieldName(name, index, options);
  };

  const swap = (indexA: number, indexB: number) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArray(name),
      _fieldIds,
      keyName,
    );
    swapArrayAt(updatedFieldArrayValuesWithKey, indexA, indexB);
    control._updateFieldArray(
      name,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      updateValues(updatedFieldArrayValuesWithKey),
      false,
    );
    setFields(updatedFieldArrayValuesWithKey);
  };

  const move = (from: number, to: number) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArray(name),
      _fieldIds,
      keyName,
    );
    moveArrayAt(updatedFieldArrayValuesWithKey, from, to);
    control._updateFieldArray(
      name,
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      updateValues(updatedFieldArrayValuesWithKey),
      false,
    );
    setFields(updatedFieldArrayValuesWithKey);
  };

  const update = (
    index: number,
    value: Partial<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => {
    const updatedFieldArrayValuesWithKey = mapCurrentIds(
      control._getFieldArray(name),
      _fieldIds,
      keyName,
    );
    const updatedFieldArrayValues = updateAt(
      updatedFieldArrayValuesWithKey,
      index,
      value,
    );
    _fieldIds.current = mapIds(updatedFieldArrayValues, keyName);
    control._updateFieldArray(
      name,
      updateAt,
      {
        argA: index,
        argB: value,
      },
      updateValues(_fieldIds.current),
      true,
      false,
    );
    setFields(_fieldIds.current);
  };

  const replace = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  ) => {
    const updatedFieldArrayValuesWithKey: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = mapIds(convertToArrayPayload(value), keyName);
    control._updateFieldArray(
      name,
      () => updatedFieldArrayValuesWithKey,
      {},
      updateValues(updatedFieldArrayValuesWithKey),
      true,
      false,
    );
    setFields(updatedFieldArrayValuesWithKey);
  };

  React.useEffect(() => {
    control._stateFlags.action = false;

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

    if (_actioned.current) {
      control._executeSchema([name]).then((result) => {
        const error = get(result.errors, name);

        if (error && error.type && !get(control._formState.errors, name)) {
          set(control._formState.errors, name, error);
          control._subjects.state.next({
            errors: control._formState.errors as FieldErrors<TFieldValues>,
          });
        }
      });
    }

    control._subjects.watch.next({
      name,
      values: control._formValues,
    });

    control._names.focus &&
      focusFieldBy(control._fields, (key: string) =>
        key.startsWith(control._names.focus),
      );

    control._names.focus = '';

    control._proxyFormState.isValid && control._updateValid();
  }, [fields, name, control, keyName]);

  React.useEffect(() => {
    !get(control._formValues, name) && set(control._formValues, name, []);

    return () => {
      if (control._options.shouldUnregister || shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
      }
    };
  }, [name, control, keyName, shouldUnregister]);

  return {
    swap: React.useCallback(swap, [updateValues, name, control, keyName]),
    move: React.useCallback(move, [updateValues, name, control, keyName]),
    prepend: React.useCallback(prepend, [updateValues, name, control, keyName]),
    append: React.useCallback(append, [updateValues, name, control, keyName]),
    remove: React.useCallback(remove, [updateValues, name, control, keyName]),
    insert: React.useCallback(insert, [updateValues, name, control, keyName]),
    update: React.useCallback(update, [updateValues, name, control, keyName]),
    replace: React.useCallback(replace, [updateValues, name, control, keyName]),
    fields: fields as FieldArrayWithId<
      TFieldValues,
      TFieldArrayName,
      TKeyName
    >[],
  };
};
