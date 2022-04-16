import { expectType } from 'tsd';

import {
  HasKey,
  HasPath,
  ValidPathPrefix,
} from '../../../../types/path/internal/hasPath';
import { _ } from '../../../__fixtures__';
import {
  HundredTuple,
  InfiniteType,
  NullableInfiniteType,
} from '../../__fixtures__';

/** {@link HasKey} */ {
  /** it should return true when the key exists */ {
    const actual = _ as HasKey<{ foo: string }, 'foo'>;
    expectType<true>(actual);
  }

  /** it should return false when the key doesn't exist */ {
    const actual = _ as HasKey<{ foo: string }, 'bar'>;
    expectType<false>(actual);
  }

  /** it should return false when one of the keys doesn't exist */ {
    const actual = _ as HasKey<{ foo: string }, 'foo' | 'bar'>;
    expectType<false>(actual);
  }

  /** it should return false when one key doesn't exist in one of the types */ {
    const actual = _ as HasKey<{ foo: string } | { bar: string }, 'foo'>;
    expectType<false>(actual);
  }
}

/** {@link ValidPathPrefix} */ {
  /** it should return the entire path if it is valid */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(actual);
  }

  /** it should return the entire nullable path if it is valid */ {
    const actual = _ as ValidPathPrefix<
      NullableInfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(actual);
  }

  /** it should return the longest valid prefix */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<['foo', 'bar', '0']>(actual);
  }

  /** it should return the longest common valid prefix */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string> | { foo: string },
      ['foo', 'value']
    >;
    expectType<['foo']>(actual);
  }

  /** it should return an empty tuple when the path is an empty tuple */ {
    const actual = _ as ValidPathPrefix<InfiniteType<string>, []>;
    expectType<[]>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      HundredTuple<'foo'>
    >;
    expectType<HundredTuple<'foo'>>(actual);
  }

  /** it should be distributive on path unions */ {
    const actual = _ as ValidPathPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42'] | ['foo', 'ba']
    >;
    expectType<['foo', 'bar', '0'] | ['foo']>(actual);
  }
}

/** {@link HasPath} */ {
  /** it should return true if the path exists */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<true>(actual);
  }

  /** it should return false if the path doesn't exist */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<false>(actual);
  }

  /** it should return true if the path exist in both types */ {
    const actual = _ as HasPath<
      InfiniteType<string> | { foo: { bar: string } },
      ['foo', 'bar']
    >;
    expectType<true>(actual);
  }

  /** it should return false if the path doesn't exist in both types */ {
    const actual = _ as HasPath<
      InfiniteType<string> | { foo: { bar: string } },
      ['foo', 'value']
    >;
    expectType<false>(actual);
  }

  /** it should return false if either of the paths is invalid */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'bar'] | ['foo', 'ba']
    >;
    expectType<false>(actual);
  }

  /** it should return true if both of the path are valid */ {
    const actual = _ as HasPath<
      InfiniteType<string>,
      ['foo', 'baz'] | ['foo', 'bar']
    >;
    expectType<true>(actual);
  }

  /** it should evaluate to true when any is encountered */ {
    const actual = _ as HasPath<{ foo: any }, ['foo', 'bar', 'baz']>;
    expectType<true>(actual);
  }

  /** it should evaluate to false when any is not encountered */ {
    const actual = _ as HasPath<{ foo: any }, ['bar', 'baz']>;
    expectType<false>(actual);
  }
}
