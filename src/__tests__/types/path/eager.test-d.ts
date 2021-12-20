import { expectType } from 'tsd';

import { ArrayPath, FieldPathValues, Path, PathValue } from '../../../types';
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
    const actual = _ as Path<{ foo: [string, number] }>;
    expectType<'foo' | 'foo.0' | 'foo.1'>(actual);
  }

  /** it should include paths through arrays */ {
    const actual = _ as Path<{ foo: string[] }>;
    expectType<'foo' | `foo.${number}`>(actual);
  }
}

/** {@link ArrayPath} */ {
  /** it should evaluate to all paths to an array */ {
    const actual = _ as ArrayPath<{ foo: { bar: string[]; baz: string[] } }>;
    expectType<'foo.bar' | 'foo.baz'>(actual);
  }

  /** it should include paths through tuples */ {
    const actual = _ as ArrayPath<{ foo: [string[], number[]] }>;
    expectType<'foo' | 'foo.0' | 'foo.1'>(actual);
  }

  /** it should include paths through arrays */ {
    const actual = _ as ArrayPath<{ foo: string[][] }>;
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
