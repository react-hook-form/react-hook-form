import { expectType } from 'tsd';

import {
  ArrayKey,
  AsKey,
  AsPathTuple,
  EvaluateKey,
  EvaluatePath,
  IsTuple,
  JoinPathTuple,
  SplitPathString,
  ToKey,
  TupleKey,
} from '../../../types/path/common';
import {
  _,
  HundredPathString,
  HundredTuple,
  InfiniteType,
  Nested,
} from '../__fixtures__';

/** {@link IsTuple} */ {
  /** it should evaluate to true if it's a tuple */ {
    const actual = _ as IsTuple<[string, number]>;
    expectType<true>(actual);
  }

  /** it should evaluate to false if it's not a tuple */ {
    const actual = _ as IsTuple<string[]>;
    expectType<false>(actual);
  }
}

/** {@link TupleKey} */ {
  /** it should evaluate to the own keys of the tuple */ {
    const actual = _ as TupleKey<[string, number]>;
    expectType<'0' | '1'>(actual);
  }

  /** it should evaluate to never if an array type is passed */ {
    const actual = _ as TupleKey<string[]>;
    expectType<never>(actual);
  }
}

/** {@link AsKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    const actual = _ as AsKey<'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never if not a Key is passed */ {
    const actual = _ as AsKey<boolean>;
    expectType<never>(actual);
  }
}

/** {@link ToKey} */ {
  /** it should behave like a noop type when a Key is passed */ {
    const actual = _ as ToKey<'foo'>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never if not a Key or ArrayKey is passed */ {
    const actual = _ as ToKey<boolean>;
    expectType<never>(actual);
  }

  /** it should convert an ArrayKey to a template literal type */ {
    const actual = _ as ToKey<ArrayKey>;
    expectType<`${ArrayKey}`>(actual);
  }
}

/** {@link AsPathTuple} */ {
  /** it should behave like a noop type when a PathTuple is passed */ {
    const actual = _ as AsPathTuple<['foo']>;
    expectType<['foo']>(actual);
  }

  /** it should evaluate to never if not a PathTuple is passed */ {
    const actual = _ as AsPathTuple<[42]>;
    expectType<never>(actual);
  }
}

/** {@link SplitPathString} */ {
  /** it should split the PathString */ {
    const actual = _ as SplitPathString<'foo.bar.0.baz'>;
    expectType<['foo', 'bar', '0', 'baz']>(actual);
  }

  /** it should split a PathString which does not contain a "." */ {
    const actual = _ as SplitPathString<'foo'>;
    expectType<['foo']>(actual);
  }

  /** it should split a PathString containing only a "." */ {
    const actual = _ as SplitPathString<'.'>;
    expectType<['', '']>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as SplitPathString<HundredPathString<'foo'>>;
    expectType<HundredTuple<'foo'>>(actual);
  }

  /** it should work on unions */ {
    const actual = _ as SplitPathString<'foo.bar' | 'bar.foo'>;
    expectType<['foo', 'bar'] | ['bar', 'foo']>(actual);
  }
}

/** {@link JoinPathTuple} */ {
  /** it should join the PathTuple */ {
    const actual = _ as JoinPathTuple<['foo', 'bar', '0', 'baz']>;
    expectType<'foo.bar.0.baz'>(actual);
  }

  /** it should join a PathTuple of length 1 */ {
    const actual = _ as JoinPathTuple<['foo']>;
    expectType<'foo'>(actual);
  }

  /** it should evaluate to never when passed an empty PathTuple */ {
    const actual = _ as JoinPathTuple<[]>;
    expectType<never>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as JoinPathTuple<HundredTuple<'foo'>>;
    expectType<HundredPathString<'foo'>>(actual);
  }

  /** it should work on unions */ {
    const actual = _ as JoinPathTuple<['foo', 'bar'] | ['bar', 'foo']>;
    expectType<'foo.bar' | 'bar.foo'>(actual);
  }
}

/** {@link EvaluateKey} */ {
  /** it should traverse an object */ {
    const actual = _ as EvaluateKey<{ foo: number; bar: string }, 'foo'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as EvaluateKey<[boolean, string], '1'>;
    expectType<string>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as EvaluateKey<boolean[], '42'>;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the key is not valid */ {
    const actual = _ as EvaluateKey<{ foo: string }, 'foobar'>;
    expectType<undefined>(actual);
  }

  /** it should evaluate to never if the key is out of bounds */ {
    const actual = _ as EvaluateKey<[string], '1'>;
    expectType<undefined>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as EvaluateKey<
      { foo: number; bar: string },
      'foo' | 'bar'
    >;
    expectType<number | string>(actual);
  }

  /** it should evaluate to never if one of the keys doesn't exist */ {
    const actual = _ as EvaluateKey<{ foo: number }, 'foo' | 'bar'>;
    expectType<number | undefined>(actual);
  }

  /** it should work on type unions */ {
    const actual = _ as EvaluateKey<{ foo: number } | { foo: string }, 'foo'>;
    expectType<number | string>(actual);
  }

  /** it should evaluate to never if the key doesn't exist in one of the types */ {
    const actual = _ as EvaluateKey<{ foo: number } | { bar: string }, 'foo'>;
    expectType<number | undefined>(actual);
  }

  /** it should evaluate to never if the key is out of bounds in one of the types */ {
    const actual = _ as EvaluateKey<[] | [number], '0'>;
    expectType<number | undefined>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as EvaluateKey<any, string>;
    expectType<any>(actual);
  }
}

/** {@link EvaluatePath} */ {
  /** it should traverse an object */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number>,
      ['foo', 'foo', 'value']
    >;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as EvaluatePath<
      InfiniteType<boolean>,
      ['bar', '0', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as EvaluatePath<
      InfiniteType<boolean>,
      ['baz', '42', 'value']
    >;
    expectType<boolean>(actual);
  }

  /** it should evaluate to never if the path is not valid */ {
    const actual = _ as EvaluatePath<InfiniteType<string>, ['foobar']>;
    expectType<undefined>(actual);
  }

  /** it should be implemented tail recursively */ {
    const actual = _ as EvaluatePath<InfiniteType<string>, HundredTuple<'foo'>>;
    expectType<InfiniteType<string>>(actual);
  }

  /** it should work on path unions */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number>,
      ['foo', 'foo'] | ['foo', 'value']
    >;
    expectType<number | InfiniteType<number>>(actual);
  }

  /** it should evaluate to never if one of the paths doesn't exist */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number>,
      ['foo', 'value'] | ['foo', 'foobar']
    >;
    expectType<number | undefined>(actual);
  }

  /** it should work on type unions */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number> | InfiniteType<string>,
      ['foo', 'value']
    >;
    expectType<number | string>(actual);
  }

  /** it should evaluate to never if the path doesn't exist in one of the types */ {
    const actual = _ as EvaluatePath<
      InfiniteType<number> | Nested<string>,
      ['foo', 'value']
    >;
    expectType<number | undefined>(actual);
  }

  /** it should evaluate to any if the type is any */ {
    const actual = _ as EvaluatePath<any, [string]>;
    expectType<any>(actual);
  }
}
