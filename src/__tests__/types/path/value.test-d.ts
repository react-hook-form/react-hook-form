import { expectType } from 'tsd';

import { Branded } from '../../../types';
import {
  FieldPathSetValue,
  FieldPathValue,
  FieldPathValues,
} from '../../../types/path/value';
import { _ } from '../__fixtures__';

/** {@link FieldPathValue} */ {
  /** it should get the type of a branded path */ {
    const actual = _ as FieldPathValue<{}, Branded.TypedFieldPath<{}, number>>;
    expectType<number>(actual);
  }

  /** it should evaluate to unknown if the branded path is not applicable */ {
    const actual = _ as FieldPathValue<
      { foo: string },
      Branded.TypedFieldPath<{}, number>
    >;
    expectType<unknown>(actual);
  }

  /** it should get the type of a string path */ {
    const actual = _ as FieldPathValue<{ foo: number }, 'foo'>;
    expectType<number>(actual);
  }
}

/** {@link FieldPathSetValue} */ {
  /** it should get the set type of a branded path */ {
    const actual = _ as FieldPathSetValue<
      {},
      Branded.TypedFieldPath<{}, number>
    >;
    expectType<number>(actual);
  }

  /** it should evaluate to never if the branded path is not applicable */ {
    const actual = _ as FieldPathSetValue<
      { foo: string },
      Branded.TypedFieldPath<{}, number>
    >;
    expectType<never>(actual);
  }

  /** it should get the set type of a string path */ {
    const actual = _ as FieldPathSetValue<{ foo: number }, 'foo'>;
    expectType<number>(actual);
  }
}

/** {@link FieldPathValues} */ {
  /** it should resolve string paths */ {
    const actual = _ as FieldPathValues<
      { foo: string; bar: number },
      ['foo', 'bar']
    >;
    expectType<[string, number]>(actual);
  }

  /** it should resolve branded paths */ {
    const actual = _ as FieldPathValues<
      {},
      [Branded.TypedFieldPath<{}, string>, Branded.TypedFieldPath<{}, number>]
    >;
    expectType<[string, number]>(actual);
  }
}
