import { expectType } from 'tsd';

import {
  DropLastElement,
  Keys,
  SuggestChildPaths,
  SuggestParentPath,
  SuggestPath,
  ValidKeyListPrefix,
} from '../../../types/path/lazy';
import { HundredTuple, InfiniteType, type } from '../__fixtures__';

describe('Keys', () => {
  it('should return the keys of an object', () => {
    type Actual = Keys<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(type<Actual>());
  });

  it('should return the keys of a tuple', () => {
    type Actual = Keys<[number, string]>;
    expectType<'0' | '1'>(type<Actual>());
  });

  it('should return the keys of an array', () => {
    type Actual = Keys<string[]>;
    expectType<`${number}`>(type<Actual>());
  });

  it('should only return the keys of string properties', () => {
    type Actual = Keys<{ foo: string; bar: number }, string>;
    expectType<'foo'>(type<Actual>());
  });
});

describe('ValidKeyListPrefix', () => {
  it('should return the entire path if it is valid', () => {
    type Actual = ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    expectType<['foo', 'bar', '0', 'baz', '42']>(type<Actual>());
  });

  it('should return the longest valid prefix', () => {
    type Actual = ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    expectType<['foo', 'bar', '0']>(type<Actual>());
  });

  it('should return an empty tuple when the path is an empty tuple', () => {
    type Actual = ValidKeyListPrefix<InfiniteType<string>, []>;
    expectType<[]>(type<Actual>());
  });

  it('should be implemented tail recursively', () => {
    type Actual = ValidKeyListPrefix<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<HundredTuple<'foo'>>(type<Actual>());
  });
});

describe('DropLastElement', () => {
  it('should remove the last element from a tuple', () => {
    type Actual = DropLastElement<[0, 1, 2]>;
    expectType<[0, 1]>(type<Actual>());
  });

  it('should return the empty tuple when passed the empty tuple', () => {
    type Actual = DropLastElement<[]>;
    expectType<[]>(type<Actual>());
  });
});

describe('SuggestParentPath', () => {
  it('should evaluate to the parent path', () => {
    type Actual = SuggestParentPath<['foo', 'bar', 'baz']>;
    expectType<'foo.bar'>(type<Actual>());
  });

  it('should evaluate to the never if there is no parent path', () => {
    type Actual = SuggestParentPath<['foo']>;
    expectType<never>(type<Actual>());
  });
});

describe('SuggestChildPaths', () => {
  it('should suggest paths when the current path is empty', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, [], unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(type<Actual>());
  });

  it('should suggest paths when the current path is not empty', () => {
    type Actual = SuggestChildPaths<
      InfiniteType<string>,
      ['foo', 'foo'],
      unknown
    >;
    expectType<'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz' | 'foo.foo.value'>(
      type<Actual>(),
    );
  });

  it('should suggest only matching or traversable paths', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['foo'], number>;
    expectType<'foo.foo' | 'foo.bar' | 'foo.baz'>(type<Actual>());
  });

  it('should suggest paths into a tuple', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['bar'], unknown>;
    expectType<`bar.0`>(type<Actual>());
  });

  it('should suggest paths into an array', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['baz'], unknown>;
    expectType<`baz.${number}`>(type<Actual>());
  });

  it('should evaluate to never if the path does not exist', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['foobar'], unknown>;
    expectType<never>(type<Actual>());
  });
});

describe('SuggestPath', () => {
  it('should suggest all top level paths when the path string is empty', () => {
    type Actual = SuggestPath<InfiniteType<string>, '', unknown>;
    expectType<'foo' | 'bar' | 'baz' | 'value'>(type<Actual>());
  });

  it('should not suggest the current path if it is invalid', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.foobar', unknown>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(
      type<Actual>(),
    );
  });

  it('should suggest the current path if it is valid', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo', unknown>;
    expectType<'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value'>(
      type<Actual>(),
    );
  });

  it('should suggest the current path and the parent path', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.value', unknown>;
    expectType<'foo' | 'foo.value'>(type<Actual>());
  });

  it('should not suggest the current path if it has the wrong value', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.value', number>;
    expectType<'foo'>(type<Actual>());
  });

  it('should not suggest paths which point to the wrong type', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.foo', number>;
    expectType<'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz'>(
      type<Actual>(),
    );
  });
});
