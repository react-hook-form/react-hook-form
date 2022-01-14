import { expectType } from 'tsd';

import { Branded, PathString } from '../../../types';
import {
  FieldArrayPath,
  FieldPath,
  FieldPaths,
  TypedFieldArrayPath,
  TypedFieldPath,
} from '../../../types/path/auto';
import { _, InfiniteType } from '../__fixtures__';

/** {@link TypedFieldPath} */ {
  /** it should infer branded types */ {
    const fn = <P extends PathString>(
      path: TypedFieldPath<InfiniteType<number>, P, number>,
    ): P => path as never;

    const actual = fn(
      _ as Branded.TypedFieldPath<InfiniteType<number>, number>,
    );
    expectType<Branded.TypedFieldPath<InfiniteType<number>, number>>(actual);
  }

  /** it should infer string types */ {
    const fn = <P extends PathString>(
      path: TypedFieldPath<InfiniteType<number>, P, number>,
    ): P => path as never;

    const actual = fn('foo.value');
    expectType<'foo.value'>(actual);
  }
}

/** {@link FieldPath} */ {
  /** it should infer branded types */ {
    const fn = <P extends PathString>(
      path: FieldPath<InfiniteType<number>, P>,
    ): P => path as never;

    const actual = fn(_ as Branded.FieldPath<InfiniteType<number>>);
    expectType<Branded.FieldPath<InfiniteType<number>>>(actual);
  }

  /** it should infer string types */ {
    const fn = <P extends PathString>(
      path: FieldPath<InfiniteType<number>, P>,
    ): P => path as never;

    const actual = fn('foo.value');
    expectType<'foo.value'>(actual);
  }
}

/** {@link TypedFieldArrayPath} */ {
  /** it should infer branded types */ {
    type Foo = { foo: string };
    const fn = <P extends PathString>(
      path: TypedFieldArrayPath<InfiniteType<Foo[]>, P, Foo>,
    ): P => path as never;

    const actual = fn(
      _ as Branded.TypedFieldArrayPath<InfiniteType<Foo[]>, Foo>,
    );
    expectType<Branded.TypedFieldArrayPath<InfiniteType<Foo[]>, Foo>>(actual);
  }

  /** it should infer string types */ {
    type Foo = { foo: string };
    const fn = <P extends PathString>(
      path: TypedFieldArrayPath<InfiniteType<Foo[]>, P, Foo>,
    ): P => path as never;

    const actual = fn('foo.value');
    expectType<'foo.value'>(actual);
  }
}

/** {@link FieldArrayPath} */ {
  /** it should infer branded types */ {
    type Foo = { foo: string };
    const fn = <P extends PathString>(
      path: FieldArrayPath<InfiniteType<Foo[]>, P>,
    ): P => path as never;

    const actual = fn(_ as Branded.FieldArrayPath<InfiniteType<Foo[]>>);
    expectType<Branded.FieldArrayPath<InfiniteType<Foo[]>>>(actual);
  }

  /** it should infer string types */ {
    type Foo = { foo: string };
    const fn = <P extends PathString>(
      path: FieldArrayPath<InfiniteType<Foo[]>, P>,
    ): P => path as never;

    const actual = fn('foo.value');
    expectType<'foo.value'>(actual);
  }
}

/** {@link FieldPaths} */ {
  /** it should infer branded types */ {
    const fn = <P extends ReadonlyArray<PathString>>(
      path: FieldPaths<InfiniteType<number>, P>,
    ): P => path as never;

    const actual = fn(_ as [Branded.FieldPath<InfiniteType<number>>]);
    expectType<[Branded.FieldPath<InfiniteType<number>>]>(actual);
  }

  /** it should infer string types */ {
    const fn = <P extends ReadonlyArray<PathString>>(
      path: FieldPaths<InfiniteType<number>, P>,
    ): P => path as never;

    const actual = fn(_ as ['foo.value']);
    expectType<['foo.value']>(actual);
  }
}
