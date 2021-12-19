import {
  DropLastElement,
  Keys,
  SuggestChildPaths,
  SuggestParentPath,
  SuggestPath,
  ValidKeyListPrefix,
} from '../../../types/path/lazy';
import { expectTypesEqual, InfiniteType } from '../__fixtures__';

describe('Keys', () => {
  it('should return the keys of an object', () => {
    type Actual = Keys<{ foo: string; bar: number }>;
    type Expected = 'foo' | 'bar';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should return the keys of a tuple', () => {
    type Actual = Keys<[number, string]>;
    type Expected = '0' | '1';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should return the keys of an array', () => {
    type Actual = Keys<string[]>;
    type Expected = `${number}`;
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should only return the keys of string properties', () => {
    type Actual = Keys<{ foo: string; bar: number }, string>;
    type Expected = 'foo';
    expectTypesEqual<Actual, Expected>(true);
  });
});

describe('ValidKeyListPrefix', () => {
  it('should return the entire path if it is valid', () => {
    type Actual = ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'baz', '42']
    >;
    type Expected = ['foo', 'bar', '0', 'baz', '42'];
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should return the longest valid prefix', () => {
    type Actual = ValidKeyListPrefix<
      InfiniteType<string>,
      ['foo', 'bar', '0', 'ba', '42']
    >;
    type Expected = ['foo', 'bar', '0'];
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should return an empty tuple when the path is an empty tuple', () => {
    type Actual = ValidKeyListPrefix<InfiniteType<string>, []>;
    type Expected = [];
    expectTypesEqual<Actual, Expected>(true);
  });
});

describe('DropLastElement', () => {
  it('should remove the last element from a tuple', () => {
    type Actual = DropLastElement<[0, 1, 2]>;
    type Expected = [0, 1];
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should return the empty tuple when passed the empty tuple', () => {
    type Actual = DropLastElement<[]>;
    type Expected = [];
    expectTypesEqual<Actual, Expected>(true);
  });
});

describe('SuggestParentPath', () => {
  it('should evaluate to the parent path', () => {
    type Actual = SuggestParentPath<['foo', 'bar', 'baz']>;
    type Expected = 'foo.bar';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should evaluate to the never if there is no parent path', () => {
    type Actual = SuggestParentPath<['foo']>;
    type Expected = never;
    expectTypesEqual<Actual, Expected>(true);
  });
});

describe('SuggestChildPaths', () => {
  it('should suggest paths when the current path is empty', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, [], unknown>;
    type Expected = 'foo' | 'bar' | 'baz' | 'value';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should suggest paths when the current path is not empty', () => {
    type Actual = SuggestChildPaths<
      InfiniteType<string>,
      ['foo', 'foo'],
      unknown
    >;
    type Expected =
      | 'foo.foo.foo'
      | 'foo.foo.bar'
      | 'foo.foo.baz'
      | 'foo.foo.value';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should suggest only matching or traversable paths', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['foo'], number>;
    type Expected = 'foo.foo' | 'foo.bar' | 'foo.baz';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should suggest paths into a tuple', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['bar'], unknown>;
    type Expected = `bar.0`;
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should suggest paths into an array', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['baz'], unknown>;
    type Expected = `baz.${number}`;
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should evaluate to never if the path does not exist', () => {
    type Actual = SuggestChildPaths<InfiniteType<string>, ['foobar'], unknown>;
    type Expected = never;
    expectTypesEqual<Actual, Expected>(true);
  });
});

describe('SuggestPath', () => {
  it('should suggest all top level paths when the path string is empty', () => {
    type Actual = SuggestPath<InfiniteType<string>, '', unknown>;
    type Expected = 'foo' | 'bar' | 'baz' | 'value';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should not suggest the current path if it is invalid', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.foobar', unknown>;
    type Expected = 'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should suggest the current path if it is valid', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo', unknown>;
    type Expected = 'foo' | 'foo.foo' | 'foo.bar' | 'foo.baz' | 'foo.value';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should suggest the current path and the parent path', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.value', unknown>;
    type Expected = 'foo' | 'foo.value';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should not suggest the current path if it has the wrong value', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.value', number>;
    type Expected = 'foo';
    expectTypesEqual<Actual, Expected>(true);
  });

  it('should not suggest paths which point to the wrong type', () => {
    type Actual = SuggestPath<InfiniteType<string>, 'foo.foo', number>;
    type Expected = 'foo' | 'foo.foo.foo' | 'foo.foo.bar' | 'foo.foo.baz';
    expectTypesEqual<Actual, Expected>(true);
  });
});
