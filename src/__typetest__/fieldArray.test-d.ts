import { FieldArray, useFieldArray } from '../index';

import type { Expect, NotEqual } from './__fixtures__';

/**
 * regression test for https://github.com/react-hook-form/react-hook-form/issues/13618
 *
 * `FieldArray` is exported both as a type (the element type of a field array)
 * and as a component. Importing both from the package root must not let one
 * shadow the other.
 */
/** {@link FieldArray} */ {
  type FormValues = { items: { name: string }[] };

  /* eslint-disable react-hooks/rules-of-hooks */
  const { update } = useFieldArray<FormValues, 'items'>({
    name: 'items',
  });

  type ArrayItem = FieldArray<FormValues, 'items'>;
  type _t1 = Expect<NotEqual<ArrayItem, never>>;

  const save = (value: unknown) => update(0, value as ArrayItem);

  const Component: typeof FieldArray = FieldArray;
}
