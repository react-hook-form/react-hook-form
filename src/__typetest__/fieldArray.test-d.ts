import { FieldArray, type FieldArrayWithId, useFieldArray } from '../index';

import type { Equal, Expect, NotEqual } from './__fixtures__';

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

/** {@link FieldArrayWithId} row shapes */ {
  type Row = string | number | boolean;
  type FormValues = {
    items: (Row | { a: string })[];
    objects: { a: string; value?: number }[];
  };

  type _mixed = Expect<
    Equal<
      FieldArrayWithId<FormValues, 'items'>,
      (
        | { value: string }
        | { value: number }
        | { value: false }
        | { value: true }
        | { a: string }
      ) & { key: string }
    >
  >;
  type _customKey = Expect<
    Equal<
      FieldArrayWithId<{ items: string[] }, 'items', 'id'>,
      { value: string } & { id: string }
    >
  >;
  type BrandedString = string & { readonly brand: 'id' };
  type _branded = Expect<
    Equal<
      FieldArrayWithId<{ items: BrandedString[] }>,
      { value: BrandedString } & { key: string }
    >
  >;
  type _unknown = Expect<
    Equal<FieldArrayWithId<{ items: unknown[] }>, { key: string }>
  >;
  type _any = Expect<Equal<FieldArrayWithId<{ items: any[] }>, any>>;
  type _default = Expect<Equal<FieldArrayWithId, { key: string }>>;
  type _object = Expect<
    Equal<
      FieldArrayWithId<FormValues, 'objects', 'id'>,
      { a: string; value?: number } & { id: string }
    >
  >;
}
