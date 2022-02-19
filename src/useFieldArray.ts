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
  UnpackNestedValue,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

/**
 * A custom hook that exposes convenient methods to perform operations with a list of dynamic inputs that need to be appended, updated, removed etc.
 *
 * @remarks
 * [API](https://react-hook-form.com/api/usefieldarray) • [Demo](https://codesandbox.io/s/react-hook-form-usefieldarray-ssugn)
 *
 * @param props - useFieldArray props
 *
 * @returns methods - functions to manipulate with the Field Arrays (dynamic inputs) {@link UseFieldArrayReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, control, handleSubmit, reset, trigger, setError } = useForm({
 *     defaultValues: {
 *       test: []
 *     }
 *   });
 *   const { fields, append } = useFieldArray({
 *     control,
 *     name: "test"
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit(data => console.log(data))}>
 *       {fields.map((item, index) => (
 *          <input key={item.id} {...register(`test.${index}.firstName`)}  />
 *       ))}
 *       <button type="button" onClick={() => append({ firstName: "bill" })}>
 *         append
 *       </button>
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldArrayName extends FieldArrayPath<TFieldValues> = FieldArrayPath<TFieldValues>,
  TKeyName extends string = 'id',
>(
  props: UseFieldArrayProps<TFieldValues, TFieldArrayName, TKeyName>,
): UseFieldArrayReturn<TFieldValues, TFieldArrayName, TKeyName> {
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
  const ids = React.useRef<string[]>(
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
      ids.current = fieldValues.map(generateId);
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
      control._updateFieldArray(name, updatedFieldArrayValues);
    },
    [control, name],
  );

  const append = (
    value:
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = appendAt(
      control._getFieldArray(name),
      appendValue,
    );
    control._names.focus = getFocusFieldName(
      name,
      updatedFieldArrayValues.length - 1,
      options,
    );
    ids.current = appendAt(ids.current, appendValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, appendAt, {
      argA: fillEmptyArray(value),
    });
  };

  const prepend = (
    value:
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const prependValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = prependAt(
      control._getFieldArray(name),
      prependValue,
    );
    control._names.focus = getFocusFieldName(name, 0, options);
    ids.current = prependAt(ids.current, prependValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, prependAt, {
      argA: fillEmptyArray(value),
    });
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(control._getFieldArray(name), index);
    ids.current = removeArrayAt(ids.current, index);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, removeArrayAt, {
      argA: index,
    });
  };

  const insert = (
    index: number,
    value:
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const insertValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = insertAt(
      control._getFieldArray(name),
      index,
      insertValue,
    );
    control._names.focus = getFocusFieldName(name, index, options);
    ids.current = insertAt(ids.current, index, insertValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, insertAt, {
      argA: index,
      argB: fillEmptyArray(value),
    });
  };

  const swap = (indexA: number, indexB: number) => {
    const updatedFieldArrayValues = control._getFieldArray(name);
    swapArrayAt(updatedFieldArrayValues, indexA, indexB);
    swapArrayAt(ids.current, indexA, indexB);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      updatedFieldArrayValues,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      false,
    );
  };

  const move = (from: number, to: number) => {
    const updatedFieldArrayValues = control._getFieldArray(name);
    moveArrayAt(updatedFieldArrayValues, from, to);
    moveArrayAt(ids.current, from, to);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      updatedFieldArrayValues,
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      false,
    );
  };

  const update = (
    index: number,
    value: UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>,
  ) => {
    const updatedFieldArrayValues = updateAt(
      control._getFieldArray<
        FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>
      >(name),
      index,
      value as FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>,
    );
    ids.current = [...updatedFieldArrayValues].map((item, i) =>
      !item || i === index ? generateId() : ids.current[i],
    );
    updateValues(updatedFieldArrayValues);
    setFields([...updatedFieldArrayValues]);
    control._updateFieldArray(
      name,
      updatedFieldArrayValues,
      updateAt,
      {
        argA: index,
        argB: value,
      },
      true,
      false,
    );
  };

  const replace = (
    value:
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>
      | Partial<UnpackNestedValue<FieldArray<TFieldValues, TFieldArrayName>>>[],
  ) => {
    const updatedFieldArrayValues = convertToArrayPayload(cloneObject(value));
    ids.current = updatedFieldArrayValues.map(generateId);
    updateValues([...updatedFieldArrayValues]);
    setFields([...updatedFieldArrayValues]);
    control._updateFieldArray(
      name,
      [...updatedFieldArrayValues],
      <T>(data: T): T => data,
      {},
      true,
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
    !get(control._formValues, name) && control._updateFieldArray(name);

    return () => {
      (control._options.shouldUnregister || shouldUnregister) &&
        control.unregister(name as FieldPath<TFieldValues>);
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
    fields: React.useMemo(
      () =>
        fields.map((field, index) => ({
          ...field,
          [keyName]: ids.current[index] || generateId(),
        })) as FieldArrayWithId<TFieldValues, TFieldArrayName, TKeyName>[],
      [fields, keyName],
    ),
  };
}
