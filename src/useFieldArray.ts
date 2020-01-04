import * as React from 'react';
import { useFormContext } from './useFormContext';
import generateId from './logic/generateId';
import isUndefined from './utils/isUndefined';

export const appendId = (value: any) => ({
  ...value,
  ...(value.id ? {} : { id: generateId() }),
});

export function useFieldArray({
  control,
  name,
}: {
  control?: any;
  name: string;
}) {
  const methods = useFormContext() || {};
  const { getValues, defaultValuesRef } = control || methods.control;
  const getData = () => getValues({ nest: true })[name];
  const [fields, setField] = React.useState<object & { id: string }[]>(
    (getData() || []).map((value: any) => appendId(value)),
  );

  const prepend = (value: object) => setField([appendId(value), ...fields]);

  const append = (value: object) => setField([...fields, appendId(value)]);

  const remove = (index?: number) =>
    setField(
      isUndefined(index)
        ? []
        : [...fields.slice(0, index), ...fields.slice(index + 1)],
    );

  const insert = (index: number, value: object) => {
    setField([
      ...fields.slice(0, index),
      appendId(value),
      ...fields.slice(index),
    ]);
  };

  const swap = (indexA: number, indexB: number) => {
    [fields[indexA], fields[indexB]] = [fields[indexB], fields[indexA]];
    setField(fields);
  };

  const move = (from: number, to: number) => {
    fields.splice(to, 0, fields.splice(from, 1)[0]);
    setField(fields);
  };

  React.useEffect(() => {
    defaultValuesRef.current[name] = {};
  }, [defaultValuesRef, name]);

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
