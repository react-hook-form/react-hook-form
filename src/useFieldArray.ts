import * as React from 'react';
import generateId from './logic/generateId';
import isUndefined from './utils/isUndefined';

const appendId = (value: any) => ({
  ...value,
  ...(value.id ? {} : { id: generateId() }),
});

export function useFieldArray({
  getValues,
  name,
}: {
  getValues: (payload: { nest: boolean }) => any;
  name: string;
}) {
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

  const update = (index: number, value: any) => {
    const data = getData();
    data[index] = appendId(value);
    setField([...data]);
  };

  const insert = (index: number, value: any) => {
    setField([...fields.slice(0, index), value, ...fields.slice(index)]);
  };

  return {
    prepend,
    append,
    remove,
    update,
    insert,
    fields,
  };
}
