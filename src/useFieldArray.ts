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
  const [fields, setField] = React.useState<any[]>(
    (getData() || []).map((value: any) => appendId(value)),
  );

  const prepend = (value: any) => setField([appendId(value), ...fields]);

  const append = (value: any) => setField([...fields, appendId(value)]);

  const remove = (index?: number) =>
    setField(
      isUndefined(index)
        ? []
        : [...fields.slice(0, index), ...fields.slice(index + 1)],
    );

  const insert = (index: number, value: any) => {
    setField([
      ...fields.slice(0, index),
      appendId(value),
      ...fields.slice(index),
    ]);
  };

  React.useEffect(() => {
    defaultValuesRef.current[name] = {};
  }, [defaultValuesRef, name]);

  return {
    prepend,
    append,
    remove,
    insert,
    fields,
  };
}
