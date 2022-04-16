import { expectType } from 'tsd';

import { Branded, Lazy, PathString } from '../../types';
import { of } from '../../utils';
import { _ } from '../__fixtures__';

/** {@link of} */ {
  /** it should be a no-op for branded paths */ {
    const actual = of(_ as Branded.TypedFieldPath<{}, string, number>);
    expectType<Branded.TypedFieldPath<{}, string, number>>(actual);
  }

  /** it should convert typed lazy paths to branded paths */ {
    const fn = <T, P extends PathString>(
      path: Lazy.TypedFieldPath<T, P, string, number>,
    ) => {
      const actual = of(path);
      expectType<Branded.TypedFieldPath<T, string, number>>(actual);
    };

    fn(_);
  }

  /** it should convert untyped lazy paths to branded paths */ {
    const fn = <T, P extends PathString>(path: Lazy.FieldPath<T, P>) => {
      return of(path);
    };

    const actual = fn<{ foo: string }, 'foo'>('foo');
    expectType<Branded.TypedFieldPath<{ foo: string }, string>>(actual);
  }

  /** it should infer the generics from the context */ {
    const path: Branded.TypedFieldPath<{ foo: string }, string> = of('foo');
    path;
  }

  /** it should report the error on the argument if there is a type mismatch */ {
    const path: Branded.TypedFieldPath<{ foo: string }, number> = of(
      // @ts-expect-error this is an error if the test case fails
      'foo',
    );
    path;
  }
}
