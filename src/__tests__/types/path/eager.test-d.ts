import { expectType } from 'tsd';

import { ArrayPath, FieldPathValues, Path, PathValue } from '../../../types';
import { Key } from '../../../types/path/common';
import { _, Depth3Type } from '../__fixtures__';

/** {@link Path} */ {
  /** it should evaluate to never for an empty object */ {
    const actual = _ as Path<{}>;
    expectType<never>(actual);
  }

  /** it should evaluate to all paths of an object */ {
    const actual = _ as Path<{ foo: { bar: string; baz: string } }>;
    expectType<'foo' | 'foo.bar' | 'foo.baz'>(actual);
  }

  /** it should include paths through tuples */ {
    const actual = _ as Path<{ foo: [string, { bar: string }] }>;
    expectType<'foo' | 'foo.0' | 'foo.1' | 'foo.1.bar'>(actual);
  }

  /** it should include paths through arrays */ {
    const actual = _ as Path<{ foo: Array<{ bar: string }> }>;
    expectType<'foo' | `foo.${number}` | `foo.${number}.bar`>(actual);
  }

  /** it should include index signatures */ {
    const actual = _ as Path<{ foo: Record<string, { bar: string }> }>;
    expectType<'foo' | `foo.${string}` | `foo.${string}.bar`>(actual);
  }

  /** it should include numeric index signatures */ {
    const actual = _ as Path<{ foo: Record<number, { bar: string }> }>;
    expectType<'foo' | `foo.${number}` | `foo.${number}.bar`>(actual);
  }

  /** it should not include keys containing dots */ {
    const actual = _ as Path<{ foo: { 'foo.bar': string } }>;
    expectType<'foo'>(actual);
  }

  /** it should not include blank keys */ {
    const actual = _ as Path<{ foo: { '': string } }>;
    expectType<'foo'>(actual);
  }

  /** it should accept string when any is encountered */ {
    const actual = _ as Path<{ foo: any }>;
    expectType<'foo' | `foo.${string}`>(actual);
  }

  /** it should accept string when the type is any */ {
    const actual = _ as Path<any>;
    expectType<string>(actual);
  }

  /** it should return the numeric keys of an array */ {
    const actual = _ as Path<number[]>;
    expectType<`${number}`>(actual);
  }

  /** it should return the numeric keys of a tuple */ {
    const actual = _ as Path<[string, number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the overlapping numeric keys of a tuple and array */ {
    const actual = _ as Path<[number, string] | number[]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the overlapping numeric keys of an object and array */ {
    const actual = _ as Path<{ 0: string; '1': string } | number[]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the overlapping numeric keys of an object and tuple */ {
    const actual = _ as Path<{ 1: string } | [number, string]>;
    expectType<'1'>(actual);
  }

  /** it should return the keys of an object */ {
    const actual = _ as Path<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should not return keys which contain dots */ {
    const actual = _ as Path<{ foo: string; 'foo.bar': number }>;
    expectType<'foo'>(actual);
  }

  /** it should not return blank keys */ {
    const actual = _ as Path<{ foo: string; '': number }>;
    expectType<'foo'>(actual);
  }

  /** it should return the keys of an object */ {
    const actual = _ as Path<{ foo: string; bar: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of a tuple */ {
    const actual = _ as Path<[number, string]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the keys of an array */ {
    const actual = _ as Path<string[]>;
    expectType<`${number}`>(actual);
  }

  /** it should return the optional keys of an object */ {
    const actual = _ as Path<{ foo?: string; bar?: number }>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of a nullable type */ {
    const actual = _ as Path<{ foo: string; bar: number } | null>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the keys of an undefinable type */ {
    const actual = _ as Path<{ foo: string; bar: number } | undefined>;
    expectType<'foo' | 'bar'>(actual);
  }

  /** it should return the optional keys of a tuple */ {
    const actual = _ as Path<[foo?: string, bar?: number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should return the optional keys of a union of tuple and object */ {
    const actual = _ as Path<[foo?: string] | { 0?: string; 1?: string }>;
    expectType<'0'>(actual);
  }

  /** it should return the overlapping keys of a union of objects */ {
    const actual = _ as Path<
      { foo: string; bar: number } | { bar: number; baz: string }
    >;
    expectType<'bar'>(actual);
  }

  /** it should return the overlapping keys when given a tuple and an object */ {
    const actual = _ as Path<{ foo: string } | [number]>;
    expectType<never>(actual);
  }

  /** it should return the numeric keys when given an array and an object */ {
    const actual = _ as Path<{ 0: string; foo: number } | number[]>;
    expectType<'0'>(actual);
  }

  /** it should return {@link Key} when given any */ {
    const actual = _ as Path<any>;
    expectType<Key>(actual);
  }

  /** it should return {@link Key} when given never */ {
    const actual = _ as Path<never>;
    expectType<Key>(actual);
  }

  /** it should return never when given unknown */ {
    const actual = _ as Path<unknown>;
    expectType<never>(actual);
  }

  /** it should return never when given a string */ {
    const actual = _ as Path<string>;
    expectType<never>(actual);
  }

  /** it should return never when given undefined */ {
    const actual = _ as Path<undefined>;
    expectType<never>(actual);
  }

  /** it should return never when given null */ {
    const actual = _ as Path<null>;
    expectType<never>(actual);
  }
}

/** {@link ArrayPath} */ {
  /** it should evaluate to all paths pointing to a non-primitive array */ {
    const actual = _ as ArrayPath<{
      foo: Array<{ bar: string[]; baz: string[] }>;
    }>;
    expectType<'foo'>(actual);
  }

  /** it should include paths through tuples */ {
    const actual = _ as ArrayPath<{ foo: [object[], object[]] }>;
    expectType<'foo' | 'foo.0' | 'foo.1'>(actual);
  }

  /** it should include paths through arrays */ {
    const actual = _ as ArrayPath<{ foo: string[][][] }>;
    expectType<'foo' | `foo.${number}`>(actual);
  }
}

/** {@link PathValue} */ {
  /** it should traverse an object */ {
    const actual = _ as PathValue<Depth3Type<number>, 'foo.foo.value'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as PathValue<Depth3Type<boolean>, 'bar.0.value'>;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as PathValue<Depth3Type<boolean>, 'baz.42.value'>;
    expectType<boolean>(actual);
  }
}

/** {@link FieldPathValues} */ {
  /** it should resolve all paths */ {
    const actual = _ as FieldPathValues<
      Depth3Type<string>,
      ['foo.foo.value', 'bar.0.value', 'baz.42.value']
    >;
    expectType<[string, string, string]>(actual);
  }
}
