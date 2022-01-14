import { expectType } from 'tsd';

import { Branded } from '../../types';
import { joinPath } from '../../utils';
import { _ } from '../__fixtures__';

/** {@link joinPath} */ {
  /** it should join branded paths */ {
    const actual = joinPath(
      _ as Branded.TypedFieldPath<{}, { foo: string }>,
      _ as Branded.TypedFieldPath<{ foo: string }, string>,
    );
    expectType<Branded.TypedFieldPath<{}, string>>(actual);
  }

  /** it should report an error if the branded paths don't match */ {
    joinPath(
      _ as Branded.TypedFieldPath<{}, { foo: string }>,
      // @ts-expect-error this is an error if the test case fails
      _ as Branded.TypedFieldPath<{ foo: number }, string>,
    );
  }

  /** it should infer the generics of the second argument from the context */ {
    const path: Branded.TypedFieldPath<{}, string> = joinPath(
      _ as Branded.TypedFieldPath<{}, { bar: string }>,
      'bar',
    );
    path;
  }

  /** it should report the error on the argument if there is a type mismatch */ {
    const path: Branded.TypedFieldPath<{}, number> = joinPath(
      _ as Branded.TypedFieldPath<{}, { bar: string }>,
      // @ts-expect-error this is an error if the test case fails
      'bar',
    );
    path;
  }
}
