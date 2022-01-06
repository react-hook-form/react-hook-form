import React from 'react';

import focusFieldBy from './logic/focusFieldBy';
import generateId from './logic/generateId';
import getFocusFieldName from './logic/getFocusFieldName';
import isWatched from './logic/isWatched';
import appendAt from './utils/append';
import cloneObject from './utils/cloneObject';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import moveArrayAt from './utils/move';
import prependAt from './utils/prepend';
import removeArrayAt from './utils/remove';
import set from './utils/set';
import swapArrayAt from './utils/swap';
import updateAt from './utils/update';
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
    control = methods.control,
    name,
    keyName = 'id' as TKeyName,
    shouldUnregister,
  } = props;
  const [fields, setFields] = React.useState<
    Partial<FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>>[]
  >(control._getFieldArray(name));
  const [ids, setIds] = React.useState<string[]>(
    control._getFieldArray(name).map(generateId),
  );
  const _fieldIds = React.useRef(fields);
  const _name = React.useRef(name);
  const _actioned = React.useRef(false);

  _name.current = name;
  _fieldIds.current = fields;
  control._names.array.add(name);

  const callback = React.useCallback(({ values, name: fieldArrayName }) => {
    if (fieldArrayName === _name.current || !fieldArrayName) {
      const fieldValues = get(values, _name.current, []);
      setFields(fieldValues);
      setIds(fieldValues.map(generateId));
    }
  }, []);

  useSubscribe({
    callback,
    subject: control._subjects.array,
  });

  const updateValues = React.useCallback(
    <
      T extends Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    >(
      updatedFieldArrayValues: T,
    ) => {
      _actioned.current = true;
      set(control._formValues, name, updatedFieldArrayValues);
      return updatedFieldArrayValues;
    },
    [control, name],
  );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = appendAt(
      control._getFieldArray(name),
      appendValue,
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValues);
    control._names.focus = getFocusFieldName(
      name,
      fieldArrayValues.length - 1,
      options,
    );

    setIds((previous) => appendAt(previous, appendValue.map(generateId)));
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      appendAt,
      {
        argA: fillEmptyArray(value),
      },
      fieldArrayValues,
    );
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const prependValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = prependAt(
      control._getFieldArray(name),
      prependValue,
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValues);
    control._names.focus = getFocusFieldName(name, 0, options);

    setIds((previous) => prependAt(previous, prependValue.map(generateId)));
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      prependAt,
      {
        argA: fillEmptyArray(value),
      },
      fieldArrayValues,
    );
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValuesWithKey: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(control._getFieldArray(name), index);
    const fieldArrayValues = updateValues(updatedFieldArrayValuesWithKey);

    setIds((previous) => {
      return removeArrayAt(previous, index);
    });
    setFields(updatedFieldArrayValuesWithKey);
    control._updateFieldArray(
      name,
      removeArrayAt,
      {
        argA: index,
      },
      fieldArrayValues,
    );
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const insertValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = insertAt(
      control._getFieldArray(name),
      index,
      insertValue,
    );
    const fieldArrayValues = updateValues(updatedFieldArrayValues);
    control._names.focus = getFocusFieldName(name, index, options);

    setIds((previous) =>
      insertAt(previous, index, insertValue.map(generateId)),
    );
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      insertAt,
      {
        argA: index,
        argB: fillEmptyArray(value),
      },
      fieldArrayValues,
    );
  };

  const swap = (indexA: number, indexB: number) => {
    const updatedFieldArrayValues = control._getFieldArray(name);
    swapArrayAt(updatedFieldArrayValues, indexA, indexB);
    const fieldArrayValues = updateValues(updatedFieldArrayValues);

    setIds((previous) => {
      swapArrayAt(previous, indexA, indexB);
      return [...previous];
    });
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      fieldArrayValues,
      false,
    );
  };

  const move = (from: number, to: number) => {
    const updatedFieldArrayValues = control._getFieldArray(name);
    moveArrayAt(updatedFieldArrayValues, from, to);
    const fieldArrayValues = updateValues(updatedFieldArrayValues);

    setIds((previous) => {
      moveArrayAt(previous, from, to);
      return [...previous];
    });
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      fieldArrayValues,
      false,
    );
  };

  const update = (
    index: number,
    value: Partial<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => {
    const updatedValues = updateAt(control._getFieldArray(name), index, value);
    const fieldArrayValues = updateValues(updatedValues);

    setFields([...updatedValues]);
    setIds((ids) => {
      return [...updatedValues].map((item, i) =>
        !item || i === index ? generateId() : ids[i],
      );
    });
    control._updateFieldArray(
      name,
      updateAt,
      {
        argA: index,
        argB: value,
      },
      fieldArrayValues,
      true,
      false,
      false,
    );
  };

  const replace = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldArrayName>>[],
  ) => {
    const updateValue = convertToArrayPayload(value);
    const fieldArrayValues = updateValues(
      updateValue as Partial<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >[],
    );

    setIds([...updateValue.map(generateId)]);
    setFields([...updateValue]);
    control._updateFieldArray(
      name,
      () => updateValue,
      {},
      fieldArrayValues,
      true,
      false,
      false,
    );
  };

  React.useEffect(() => {
    control._stateFlags.action = false;

    isWatched(name, control._names) && control._subjects.state.next({});

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
  }, [fields, name, control]);

  React.useEffect(() => {
    !get(control._formValues, name) && set(control._formValues, name, []);

    return () => {
      if (control._options.shouldUnregister || shouldUnregister) {
        control.unregister(name as FieldPath<TFieldValues>);
      }
    };
  }, [name, control, keyName, shouldUnregister]);

  return {
    swap: React.useCallback(swap, [updateValues, name, control]),
    move: React.useCallback(move, [updateValues, name, control]),
    prepend: React.useCallback(prepend, [updateValues, name, control]),
    append: React.useCallback(append, [updateValues, name, control]),
    remove: React.useCallback(remove, [updateValues, name, control]),
    insert: React.useCallback(insert, [updateValues, name, control]),
    update: React.useCallback(update, [updateValues, name, control]),
    replace: React.useCallback(replace, [updateValues, name, control]),
    fields: React.useMemo(() => {
      return fields.map((field, index) => {
        return {
          ...field,
          [keyName]: ids[index] || generateId(),
        };
      }) as FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>[];
    }, [fields, ids, keyName]),
  };
};
