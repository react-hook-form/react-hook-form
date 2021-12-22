import { expectType } from 'tsd';

import { LazyArrayPath, PathString } from '../../../types';
import {
  AutoCompletePath,
  SuggestChildPaths,
  SuggestParentPath,
  SuggestPaths,
} from '../../../types/path/lazy';
import { _, InfiniteType, Nested } from '../__fixtures__';

/** {@link SuggestParentPath} */ {
  /** it should evaluate to the parent path */ {
    const actual = _ as SuggestParentPath<['foo', 'bar', 'baz']>;
    expectType<'foo.bar'>(actual);
  }

  /** it should evaluate to never if there is no parent path */ {
    const actual = _ as SuggestParentPath<['foo']>;
    expectType<never>(actual);
  }

  /** it should be distributive on unions */ {
    const actual = _ as SuggestParentPath<
      ['foo', 'bar', 'baz'] | ['foo', 'baz', 'bar', '42']
    >;
    expectType<'foo.bar' | 'foo.baz.bar'>(actual);
  }
}

/** {@link SuggestChildPaths} */ {
  /** it should suggest paths when the current path is empty */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, []>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest paths when the current path is not empty */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['foo', 'foo']>;
    expectType<'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'>(
      actual,
    );
  }

  /** it should suggest only matching or traversable paths */ {
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['foo'],
      number
    >;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz'>(actual);
  }

  /** it should suggest paths into a tuple */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['bar']>;
    expectType<`bar.0`>(actual);
  }

  /** it should suggest paths into an array */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['baz']>;
    expectType<`baz.${number}`>(actual);
  }

  /** it should evaluate to never if the path does not exist */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, ['foobar']>;
    expectType<never>(actual);
  }
}

/** {@link SuggestPaths} */
{
  /** it should suggest all top level paths when the path is empty */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, []>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest the sibling paths if the path is valid */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['fo']>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest the child paths if the path is valid */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['foo']>;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the parent path */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['foo', 'value']>;
    expectType<'foo'>(actual);
  }

  /** it should not suggest paths which point to the wrong type */ {
    const actual = _ as SuggestPaths<
      InfiniteType<string>,
      ['foo', 'foo'],
      number
    >;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(actual);
  }
}

/** {@link AutoCompletePath} */ {
  /** it should suggest all top level paths when the path is empty */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, ''>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should not suggest the current path if it is invalid */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo.foobar'>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the current path if it is valid */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo'>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the current path and the parent path */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo.value'>;
    expectType<'foo' | 'foo.value'>(actual);
  }

  /** it should not suggest the current path if it has the wrong value */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.value',
      number
    >;
    expectType<'foo'>(actual);
  }

  /** it should suggest paths which point to the correct type */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.foo',
      string
    >;
    expectType<
      'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'
    >(actual);
  }

  /** it should not suggest paths which point to the wrong type */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.foo',
      number
    >;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(actual);
  }

  /** TS should be able to infer the generic */ {
    const fn = <P extends PathString>(
      path: AutoCompletePath<InfiniteType<string>, P>,
    ) => path;

    const actual = fn('foo.bar');
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** TS should be able to infer the generic from an object property */ {
    interface FnProps<P extends PathString> {
      path: AutoCompletePath<InfiniteType<string>, P>;
    }
    const fn = <P extends PathString>({ path }: FnProps<P>) => path;

    const actual = fn({ path: 'foo.bar' });
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** TS should be able to infer the generic from a nested object property */ {
    interface FnProps<P extends PathString> {
      path: AutoCompletePath<InfiniteType<string>, P>;
    }
    const fn = <P extends PathString>({
      nested: { path },
    }: Nested<FnProps<P>>) => path;

    const actual = fn({ nested: { path: 'foo.bar' } });
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }
}

/** {@link LazyArrayPath} */ {
  /** it should not accept primitive arrays */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.value'>;
    expectType<'foo'>(actual);
  }

  /** it should accept non-primitive arrays */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.baz'>;
    expectType<'foo' | 'foo.baz' | `foo.baz.${number}`>(actual);
  }

  /** it should not accept primitive tuples */ {
    const actual = _ as LazyArrayPath<InfiniteType<[number]>, 'foo.value'>;
    expectType<'foo'>(actual);
  }

  /** it should accept non-primitive tuples */ {
    const actual = _ as LazyArrayPath<InfiniteType<number[]>, 'foo.bar'>;
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }
}
