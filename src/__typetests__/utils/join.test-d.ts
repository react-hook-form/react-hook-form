import { expectType } from 'tsd';

import { Branded, Lazy, PathString } from '../../types';
import { join } from '../../utils';
import { _ } from '../__fixtures__';

/** {@link join} */ {
  /** it should join branded paths */ {
    const actual = join(
      _ as Branded.TypedFieldPath<{}, { foo: string }>,
      _ as Branded.TypedFieldPath<{ foo: string }, string>,
    );
    expectType<Branded.TypedFieldPath<{}, string>>(actual);
  }

  /** it should report an error if the branded paths don't match */ {
    join(
      _ as Branded.TypedFieldPath<{}, { foo: string }>,
      // @ts-expect-error this is an error if the test case fails
      _ as Branded.TypedFieldPath<{ foo: number }, string>,
    );
  }

  /** it should join lazy paths */ {
    const fn = <T1, P1 extends PathString, T2, P2 extends PathString>(
      path: Lazy.TypedFieldPath<T1, P1, T2>,
      childPath: Lazy.TypedFieldPath<T2, P2, string>,
    ) => {
      const actual = join(path, childPath);
      expectType<Branded.TypedFieldPath<T1, string>>(actual);
    };

    fn(_, _);
  }

  /** it should report an error if the lazy paths don't match */ {
    const fn = <T, P1 extends PathString, P2 extends PathString>(
      path: Lazy.TypedFieldPath<T, P1, { bar: number }>,
      childPath: Lazy.FieldPath<{ foo: number }, P2>,
    ) => join(path, childPath);

    const path: Branded.TypedFieldPath<{ foo: { bar: number } }, number> = fn(
      'foo',
      // @ts-expect-error this is an error if the test case fails
      // Ideally, the error would be reported on `join`, but this is good enough
      'bar',
    );
    path;
  }

  /** it should join a lazy path and a string literal */ {
    const fn = <T, P extends PathString>(
      path: Lazy.TypedFieldPath<T, P, { foo: string }>,
    ) => {
      const actual = join(path, 'foo');
      expectType<Branded.TypedFieldPath<T, string>>(actual);
    };

    fn(_);
  }

  /** it should work when the intermediary type can be undefined or null */ {
    const fn = <T, P extends PathString>(
      path: Lazy.TypedFieldPath<T, P, { foo: string } | undefined | null>,
    ) => {
      const actual = join(path, 'foo');
      expectType<Branded.TypedFieldPath<T, string | undefined | null, string>>(
        actual,
      );
    };

    fn(_);
  }

  /** it should infer the generics of the second argument from the context */ {
    const path: Branded.TypedFieldPath<{}, string> = join(
      _ as Branded.TypedFieldPath<{}, { bar: string }>,
      'bar',
    );
    path;
  }

  /** it should report the error on the argument if there is a type mismatch */ {
    const path: Branded.TypedFieldPath<{}, number> = join(
      _ as Branded.TypedFieldPath<{}, { bar: string }>,
      // @ts-expect-error this is an error if the test case fails
      'bar',
    );
    path;
  }
}
