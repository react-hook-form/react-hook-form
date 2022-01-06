import { expectType } from 'tsd';

import { LazyArrayPath } from '../../../types';
import { _, InfiniteType } from '../__fixtures__';

/** {@link LazyArrayPath} */ {
  /** it should not accept primitive arrays */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.value'>;
    expectType<'foo'>(actual);
  }

  /** it should accept non-primitive arrays */ {
    const actual = _ as LazyArrayPath<{ foo: { bar: object[] } }, 'foo.bar'>;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept non-primitive readonly arrays */ {
    const actual = _ as LazyArrayPath<
      { foo: { bar: readonly object[] } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept tuples */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.bar'>;
    expectType<'foo' | 'foo.bar.0'>(actual);
  }

  /** it should accept non-primitive nullable arrays */ {
    const actual = _ as LazyArrayPath<
      { foo: { bar: object[] | null | undefined } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept non-primitive arrays with nullable values */ {
    const actual = _ as LazyArrayPath<
      { foo: { bar: Array<object | null | undefined> } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar.${number}`>(actual);
  }
}
