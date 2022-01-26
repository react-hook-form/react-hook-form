import { expectType } from 'tsd';

import {
  Branded,
  FieldPathSetValue,
  FieldPathValue,
  FieldPathValues,
} from '../../../types';
import { _ } from '../../__fixtures__';

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

  /** it should evaluate to unknown if the path is never */ {
    const actual = _ as FieldPathValue<{ foo: number }, never>;
    expectType<unknown>(actual);
  }

  /** it should evaluate to any if the path is any */ {
    const actual = _ as FieldPathValue<{ foo: number }, any>;
    expectType<any>(actual);
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

  /** it should evaluate to never if the path is never */ {
    const actual = _ as FieldPathSetValue<{ foo: number }, never>;
    expectType<never>(actual);
  }

  /** it should evaluate to any if the path is any */ {
    const actual = _ as FieldPathSetValue<{ foo: number }, any>;
    expectType<any>(actual);
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

  /** it should evaluate to unknown if a path is never */ {
    const actual = _ as FieldPathValues<{ foo: number }, [never]>;
    expectType<[unknown]>(actual);
  }

  /** it should evaluate to any if a path is any */ {
    const actual = _ as FieldPathValues<{ foo: number }, [any]>;
    expectType<[any]>(actual);
  }

  /** it should evaluate to unknown[] if paths is never */ {
    const actual = _ as FieldPathValues<{ foo: number }, never>;
    expectType<unknown[]>(actual);
  }

  /** it should evaluate to any[] if a path is any */ {
    const actual = _ as FieldPathValues<{ foo: number }, any>;
    expectType<any[]>(actual);
  }
}
