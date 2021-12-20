import { expectType } from 'tsd';

import { LazyArrayPath, PathString } from '../../../types';
import {
  AutoCompletePath,
  DropLastElement,
  Keys,
  SuggestChildPaths,
  SuggestParentPath,
  SuggestPaths,
  ValidKeyListPrefix,
} from '../../../types/path/lazy';
import { _, HundredTuple, InfiniteType, Nested } from '../__fixtures__';

/** {@link Keys} */ {
  /** it should return the keys of an object */ {
    const actual = _ as Keys<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of a tuple */ {
    const actual = _ as Keys<[number, string]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the keys of an array */ {
    const actual = _ as Keys<string[]>;
    expectType<`${number}`>(actual);
  }

  /** it should only return the keys of string properties */ {
    const actual = _ as Keys<{ foo: string; bar: number }, string>;
    expectType<'foo'>(actual);
  }
}

/** {@link ValidKeyListPrefix} */ {
  /** it should return the entire path if it is valid */ {
    const actual = _ as ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(actual);
  }

  /** it should return the longest valid prefix */ {
    const actual = _ as ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<['foo', 'bar', '0']>(actual);
  }

  /** it should return an empty tuple when the path is an empty tuple */ {
    const actual = _ as ValidKeyListPrefix<InfiniteType<string>, []>;
    expectType<[]>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as ValidKeyListPrefix<
      InfiniteType<string>,
      HundredTuple<'foo'>
    >;
    expectType<HundredTuple<'foo'>>(actual);
  }
}

/** {@link DropLastElement} */ {
  /** it should remove the last element from a tuple */ {
    const actual = _ as DropLastElement<[0, 1, 2]>;
    expectType<[0, 1]>(actual);
  }

  /** it should return the empty tuple when passed the empty tuple */ {
    const actual = _ as DropLastElement<[]>;
    expectType<[]>(actual);
  }
}

/** {@link SuggestParentPath} */ {
  /** it should evaluate to the parent path */ {
    const actual = _ as SuggestParentPath<['foo', 'bar', 'baz']>;
    expectType<'foo.bar'>(actual);
  }

  /** it should evaluate to the never if there is no parent path */ {
    const actual = _ as SuggestParentPath<['foo']>;
    expectType<never>(actual);
  }
}

/** {@link SuggestChildPaths} */ {
  /** it should suggest paths when the current path is empty */ {
    const actual = _ as SuggestChildPaths<InfiniteType<string>, [], unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest paths when the current path is not empty */ {
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['foo', 'foo'],
      unknown
    >;
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
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['bar'],
      unknown
    >;
    expectType<`bar.0`>(actual);
  }

  /** it should suggest paths into an array */ {
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['baz'],
      unknown
    >;
    expectType<`baz.${number}`>(actual);
  }

  /** it should evaluate to never if the path does not exist */ {
    const actual = _ as SuggestChildPaths<
      InfiniteType<string>,
      ['foobar'],
      unknown
    >;
    expectType<never>(actual);
  }
}

/** {@link SuggestPaths} */
{
  /** it should suggest all top level paths when the path is empty */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, [], unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest the sibling paths if the path is valid */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['fo'], unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should suggest the child paths if the path is valid */ {
    const actual = _ as SuggestPaths<InfiniteType<string>, ['foo'], unknown>;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the parent path */ {
    const actual = _ as SuggestPaths<
      InfiniteType<string>,
      ['foo', 'value'],
      unknown
    >;
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
    const actual = _ as AutoCompletePath<InfiniteType<string>, '', unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(actual);
  }

  /** it should not suggest the current path if it is invalid */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.foobar',
      unknown
    >;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the current path if it is valid */ {
    const actual = _ as AutoCompletePath<InfiniteType<string>, 'foo', unknown>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(actual);
  }

  /** it should suggest the current path and the parent path */ {
    const actual = _ as AutoCompletePath<
      InfiniteType<string>,
      'foo.value',
      unknown
    >;
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
      path: AutoCompletePath<InfiniteType<string>, P, unknown>,
    ) => path;

    const actual = fn('foo.bar');
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** TS should be able to infer the generic from an object property */ {
    interface FnProps<P extends PathString> {
      path: AutoCompletePath<InfiniteType<string>, P, unknown>;
    }
    const fn = <P extends PathString>({ path }: FnProps<P>) => path;

    const actual = fn({ path: 'foo.bar' });
    expectType<'foo' | 'foo.bar' | 'foo.bar.0'>(actual);
  }

  /** TS should be able to infer the generic from a nested object property */ {
    interface FnProps<P extends PathString> {
      path: AutoCompletePath<InfiniteType<string>, P, unknown>;
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