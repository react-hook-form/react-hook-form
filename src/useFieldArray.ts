import * as React from 'react';
import { useFormContext } from './useFormContext';
import { isMatchFieldArrayName } from './logic/isNameInFieldArray';
import { appendId, mapIds } from './logic/mapIds';
import getIsFieldsDifferent from './logic/getIsFieldsDifferent';
import getFieldValues from './logic/getFieldValues';
import transformToNestObject from './logic/transformToNestObject';
import get from './utils/get';
import isUndefined from './utils/isUndefined';
import { FieldValues, Control, UseFieldArrayProps, WithFieldId } from './types';

const getValues = <T, K extends keyof T>(fields: T, name: K) =>
  transformToNestObject(getFieldValues(fields))[name];

export function useFieldArray<
  FormArrayValues extends FieldValues = FieldValues,
  ControlProp extends Control = Control
>({ control, name }: UseFieldArrayProps<ControlProp>) {
  const methods = useFormContext();
  const {
    resetFieldArrayFunctionRef,
    fieldArrayNamesRef,
    fieldsRef,
    defaultValuesRef,
    unregister,
    isDirtyRef,
  } = control || methods.control;
  const memoizedDefaultValues = React.useMemo(
    () => get(defaultValuesRef.current, name, []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name],
  );
  const [fields, setField] = React.useState<
    WithFieldId<Partial<FormArrayValues>>[]
  >(mapIds(memoizedDefaultValues));

  const resetFields = (
    flagOrFields?: WithFieldId<Partial<FormArrayValues>>[],
  ) => {
    if (isDirtyRef) {
      isDirtyRef.current = isUndefined(flagOrFields)
        ? true
        : getIsFieldsDifferent(flagOrFields, memoizedDefaultValues);
    }

    for (const key in fieldsRef.current) {
      if (isMatchFieldArrayName(key, name)) {
        unregister(key);
      }
    }
  };

  const prepend = (value: WithFieldId<Partial<FormArrayValues>>) => {
    resetFields();
    setField([appendId(value), ...fields]);
  };

  const append = (value: WithFieldId<Partial<FormArrayValues>>) => {
    if (isDirtyRef) {
      isDirtyRef.current = true;
    }
    setField([...fields, appendId(value)]);
  };

  const remove = (index?: number) => {
    const fieldValues = getValues(fieldsRef.current, name);
    const data = isUndefined(index)
      ? []
      : [...fields.slice(0, index), ...fields.slice(index + 1)];
    resetFields(
      index
        ? [...fieldValues.slice(0, index), ...fieldValues.slice(index + 1)]
        : [],
    );
    setField(data);
  };

  const insert = (
    index: number,
    value: WithFieldId<Partial<FormArrayValues>>,
  ) => {
    resetFields();
    setField([
      ...fields.slice(0, index),
      appendId(value),
      ...fields.slice(index),
    ]);
  };

  const swap = (indexA: number, indexB: number) => {
    const fieldValues = getValues(fieldsRef.current, name);
    [fields[indexA], fields[indexB]] = [fields[indexB], fields[indexA]];
    [fieldValues[indexA], fieldValues[indexB]] = [
      fieldValues[indexB],
      fieldValues[indexA],
    ];
    resetFields(fieldValues);
    setField([...fields]);
  };

  const move = (from: number, to: number) => {
    const fieldValues = getValues(fieldsRef.current, name);
    fields.splice(to, 0, fields.splice(from, 1)[0]);
    fieldValues.splice(to, 0, fieldValues.splice(from, 1)[0]);
    resetFields(fieldValues);
    setField([...fields]);
  };

  const reset = (values: any) => {
    resetFields();
    setField(mapIds(get(values, name)));
  };

  React.useEffect(() => {
    const resetFunctions = resetFieldArrayFunctionRef.current;
    const fieldArrayNames = fieldArrayNamesRef.current;
    fieldArrayNames.add(name);
    resetFunctions[name] = reset;

    return () => {
      resetFields();
      delete resetFunctions[name];
      fieldArrayNames.delete(name);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  return {
    swap,
    move,
    prepend,
    append,
    remove,
    insert,
    fields,
  };
}
