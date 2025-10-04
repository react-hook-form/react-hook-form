import { describe, expect, it } from 'tstyche';

import type { ArrayPath, FieldPathValues, Path, PathValue } from '../../types';
import type { Depth3Type } from '../__fixtures__';

describe('Path', () => {
  it('should evaluate to never for an empty object', () => {
    expect<Path<object>>().type.toBe<never>();
  });

  it('should evaluate to all paths of an object', () => {
    expect<Path<{ foo: { bar: string; baz: string } }>>().type.toBe<
      'foo' | 'foo.bar' | 'foo.baz'
    >();
  });

  it('should include paths through tuples', () => {
    expect<Path<{ foo: [string, number] }>>().type.toBe<
      'foo' | 'foo.0' | 'foo.1'
    >();
  });

  it('should include paths through arrays', () => {
    expect<Path<{ foo: string[] }>>().type.toBe<'foo' | `foo.${number}`>();
  });

  it('should be able to avoid self-referencing/recursion, not crashing on self-referencing types', () => {
    type Foo = { foo: Foo };
    expect<Path<Foo>>().type.toBe<'foo'>();
  });

  it('should not erroneously match subtypes as traversed', () => {
    type Foo = { foo?: Foo; bar?: { baz: 1 } } | Record<string, never>;
    expect<Path<Foo>>().type.toBe<'foo' | 'bar' | 'bar.baz'>();
  });
});

describe('ArrayPath', () => {
  it('should evaluate to all paths pointing to a non-primitive array', () => {
    expect<
      ArrayPath<{ foo: Array<{ bar: string[]; baz: string[] }> }>
    >().type.toBe<'foo'>();
  });

  it('should include paths through tuples', () => {
    expect<ArrayPath<{ foo: [object[], object[]] }>>().type.toBe<
      'foo' | 'foo.0' | 'foo.1'
    >();
  });

  it('should include paths through arrays', () => {
    expect<ArrayPath<{ foo: string[][][] }>>().type.toBe<
      'foo' | `foo.${number}`
    >();
  });

  it('should be able to avoid self-referencing/recursion, not crashing on self-referencing types', () => {
    type Foo = { foo: Foo[] };
    expect<ArrayPath<Foo>>().type.toBe<'foo'>();
  });

  it('should not erroneously match subtypes as traversed', () => {
    type Foo = { bar?: { baz?: 1; fooArr?: Foo[] } } | Record<string, never>;
    expect<ArrayPath<Foo>>().type.toBe<'bar.fooArr'>();
  });
});

describe('PathValue', () => {
  it('should traverse an object', () => {
    expect<
      PathValue<Depth3Type<number>, 'foo.foo.value'>
    >().type.toBe<number>();
  });

  it('should traverse a tuple', () => {
    expect<
      PathValue<Depth3Type<boolean>, 'bar.0.value'>
    >().type.toBe<boolean>();
  });

  it('should traverse an array', () => {
    expect<
      PathValue<Depth3Type<boolean>, 'baz.42.value'>
    >().type.toBe<boolean>();
  });

  it('should apply optional type for optional arrays', () => {
    expect<PathValue<Depth3Type<string[] | undefined>, 'value.1'>>().type.toBe<
      string | undefined
    >();
  });

  it('should traverse an object and apply optional type for optional arrays', () => {
    expect<
      PathValue<Depth3Type<string[] | undefined>, 'foo.foo.value.3'>
    >().type.toBe<string | undefined>();
  });

  it('should traverse a tuple and apply optional type for optional arrays', () => {
    expect<
      PathValue<Depth3Type<string[] | undefined>, 'bar.0.value.3'>
    >().type.toBe<string | undefined>();
  });

  it('should traverse an array and apply optional type for optional arrays', () => {
    expect<
      PathValue<Depth3Type<string[] | undefined>, 'baz.0.value.3'>
    >().type.toBe<string | undefined>();
  });
});

describe('FieldPathValues', () => {
  it('should resolve all paths', () => {
    expect<
      FieldPathValues<
        Depth3Type<string>,
        ['foo.foo.value', 'bar.0.value', 'baz.42.value']
      >
    >().type.toBe<[string, string, string]>();
  });
});
