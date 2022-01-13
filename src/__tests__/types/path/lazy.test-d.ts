import { expectType } from 'tsd';

import { Branded } from '../../../types';
import { FieldArrayPath, FieldPath } from '../../../types/path/lazy';
import { _, InfiniteType } from '../__fixtures__';

/** {@link FieldPath} */ {
  /** it should evaluate to never for branded paths */ {
    const actual = _ as FieldPath<
      { foo: string },
      Branded.FieldPath<{ foo: string }>
    >;
    expectType<never>(actual);
  }
}

/** {@link FieldArrayPath} */ {
  /** it should not accept primitive arrays */ {
    const actual = _ as FieldArrayPath<InfiniteType<number[]>, 'foo.value'>;
    expectType<'foo'>(actual);
  }

  /** it should accept non-primitive arrays */ {
    const actual = _ as FieldArrayPath<{ foo: { bar: object[] } }, 'foo.bar'>;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept non-primitive readonly arrays */ {
    const actual = _ as FieldArrayPath<
      { foo: { bar: readonly object[] } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept tuples */ {
    const actual = _ as FieldArrayPath<InfiniteType<number[]>, 'foo.bar'>;
    expectType<'foo' | 'foo.bar.0'>(actual);
  }

  /** it should accept non-primitive nullable arrays */ {
    const actual = _ as FieldArrayPath<
      { foo: { bar: object[] | null | undefined } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar` | `foo.bar.${number}`>(actual);
  }

  /** it should not accept non-primitive arrays with nullable values */ {
    const actual = _ as FieldArrayPath<
      { foo: { bar: Array<object | null | undefined> } },
      'foo.bar'
    >;
    expectType<'foo' | `foo.bar.${number}`>(actual);
  }
}
